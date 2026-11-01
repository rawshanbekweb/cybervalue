"use server";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientKey } from "@/lib/rate-limit";
import { limit, resetLimit } from "@/lib/rate-limit-db";
import { Prisma } from "@/generated/prisma/client";
import {
  emailSchema,
  hashToken,
  isChallengesNext,
  isLinkToken,
  passwordMessage,
  passwordProblem,
  usernameKey,
  usernameSchema,
} from "@/lib/challenges/account";
import {
  createPlayerSession,
  destroyPlayerSession,
  requirePlayer,
} from "@/lib/challenges/session";
import {
  consumeToken,
  sendAlreadyRegistered,
  sendReset,
  sendVerification,
} from "@/lib/challenges/tokens";

export type FormState =
  | { error?: string; success?: string; values?: Record<string, string> }
  | undefined;

const RATE_ERROR = "Too many attempts. Try again in a few minutes.";
const LOGIN_ERROR = "Wrong email or password.";
const OFFLINE = "CTF Challenges is not available right now.";
// Compared when the email is unknown, so both cases take about as long.
const DUMMY_HASH = hashPassword(randomBytes(32).toString("hex"));

const text = (formData: FormData, name: string, max = 300) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.slice(0, max) : "";
};
const client = async () => clientKey((await headers()).get("x-forwarded-for"));

export async function registerAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    email: text(formData, "email"),
    username: text(formData, "username", 60),
  };
  // A field people never see: bots that fill every input give themselves away.
  if (text(formData, "website")) return { success: "check-email" };
  // A whole classroom often shares one address, so the per-client budget is
  // generous; the global ceiling stops a flood.
  const ip = await client();
  if (
    !(await limit(`ctf-register:${ip}`, 40, 60 * 60_000)) ||
    !(await limit("ctf-register:global", 300, 60 * 60_000))
  )
    return { error: RATE_ERROR, values };
  const email = emailSchema.safeParse(values.email);
  if (!email.success) return { error: "Enter a valid email address.", values };
  const username = usernameSchema.safeParse(values.username);
  if (!username.success)
    return {
      error:
        "Username: 3 to 24 Latin letters, digits, dot, dash or underscore, starting with a letter or digit.",
      values,
    };
  const password = text(formData, "password", 400);
  if (password !== text(formData, "confirm", 400))
    return { error: "The two passwords do not match.", values };
  const problem = passwordProblem(password, email.data, username.data);
  if (problem) return { error: passwordMessage(problem), values };
  if (formData.get("rules") !== "on")
    return { error: "Accept the rules to sign up.", values };
  const db = getDb();
  if (!db) return { error: OFFLINE, values };

  const existing = await db.ctfPlayer.findUnique({
    where: { email: email.data },
    select: { id: true, email: true, username: true },
  });
  // The same answer whether or not the address is taken, so the form does not
  // reveal who plays; the owner of the address is told by email instead.
  if (existing) {
    if (await limit(`ctf-mail:${existing.id}`, 3, 60 * 60_000))
      await sendAlreadyRegistered(existing);
    return { success: "check-email" };
  }
  try {
    const player = await db.ctfPlayer.create({
      data: {
        email: email.data,
        username: username.data,
        usernameKey: usernameKey(username.data),
        passwordHash: hashPassword(password),
      },
      select: { id: true, email: true, username: true },
    });
    await sendVerification(player);
    await createPlayerSession(player.id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");
      if (target.includes("username"))
        return { error: "This username is taken. Choose another one.", values };
      return { success: "check-email" };
    }
    throw error;
  }
  redirect("/challenges?welcome=1");
}

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const ip = await client();
  const email = emailSchema.safeParse(values.email);
  const who = email.success ? email.data : "invalid";
  if (
    !(await limit(`ctf-login:${ip}`, 30, 10 * 60_000)) ||
    !(await limit(`ctf-login-email:${who}`, 10, 10 * 60_000))
  )
    return { error: RATE_ERROR, values };
  const db = getDb();
  if (!db) return { error: OFFLINE, values };
  const player = email.success
    ? await db.ctfPlayer.findUnique({
        where: { email: email.data },
        select: { id: true, passwordHash: true, active: true },
      })
    : null;
  const ok = verifyPassword(
    text(formData, "password", 400),
    player?.passwordHash ?? DUMMY_HASH,
  );
  if (!player || !ok) return { error: LOGIN_ERROR, values };
  if (!player.active)
    return {
      error: "This account is blocked. Contact the organisers.",
      values,
    };
  await resetLimit(`ctf-login-email:${who}`);
  await createPlayerSession(player.id);
  const next = formData.get("next");
  redirect(isChallengesNext(next) ? next : "/challenges");
}

export async function logoutAction() {
  await destroyPlayerSession();
  redirect("/challenges");
}

export async function resendVerificationAction(): Promise<FormState> {
  const player = await requirePlayer();
  if (player.emailVerifiedAt) return { success: "Your email is confirmed." };
  if (!(await limit(`ctf-mail:${player.id}`, 3, 60 * 60_000)))
    return { error: RATE_ERROR };
  const sent = await sendVerification(player);
  return sent
    ? {
        success:
          "We sent a new confirmation link. Check your inbox and spam folder.",
      }
    : { error: "The email could not be sent. Try again later." };
}

export async function verifyEmailAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = formData.get("token");
  if (!(await limit(`ctf-token:${await client()}`, 30, 10 * 60_000)))
    return { error: RATE_ERROR };
  const playerId = isLinkToken(token)
    ? await consumeToken(token, "VERIFY")
    : null;
  if (!playerId)
    return {
      error:
        "This link is not valid or has expired. Sign in and ask for a new one.",
    };
  await getDb()!.ctfPlayer.updateMany({
    where: { id: playerId, emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });
  revalidatePath("/challenges", "layout");
  return { success: "verified" };
}

export async function forgotAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const email = emailSchema.safeParse(values.email);
  if (!email.success) return { error: "Enter a valid email address.", values };
  if (
    !(await limit(`ctf-forgot:${await client()}`, 6, 60 * 60_000)) ||
    !(await limit(`ctf-forgot-email:${email.data}`, 3, 60 * 60_000))
  )
    return { error: RATE_ERROR, values };
  const db = getDb();
  if (!db) return { error: OFFLINE, values };
  const player = await db.ctfPlayer.findUnique({
    where: { email: email.data },
    select: { id: true, email: true, username: true, active: true },
  });
  if (player?.active) await sendReset(player);
  // Same reply for unknown addresses: the form does not reveal who plays.
  return { success: "check-email" };
}

export async function resetPasswordAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = formData.get("token");
  if (!(await limit(`ctf-token:${await client()}`, 30, 10 * 60_000)))
    return { error: RATE_ERROR };
  const password = text(formData, "password", 400);
  if (password !== text(formData, "confirm", 400))
    return { error: "The two passwords do not match." };
  if (!isLinkToken(token))
    return { error: "This link is not valid or has expired." };
  const db = getDb();
  if (!db) return { error: OFFLINE };
  // Check the password before spending the link, so a typo does not burn it.
  const owner = await db.ctfToken.findFirst({
    where: { tokenHash: hashToken(token), kind: "RESET" },
    select: { player: { select: { email: true, username: true } } },
  });
  if (!owner) return { error: "This link is not valid or has expired." };
  const problem = passwordProblem(
    password,
    owner.player.email,
    owner.player.username,
  );
  if (problem) return { error: passwordMessage(problem) };
  const playerId = await consumeToken(token, "RESET");
  if (!playerId) return { error: "This link is not valid or has expired." };
  // A new password signs out every device; opening the link proves the email.
  await db.$transaction([
    db.ctfPlayer.update({
      where: { id: playerId },
      data: {
        passwordHash: hashPassword(password),
        emailVerifiedAt: new Date(),
      },
    }),
    db.ctfSession.deleteMany({ where: { playerId } }),
  ]);
  return { success: "reset" };
}

export async function changePasswordAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const player = await requirePlayer("/challenges/account");
  if (!(await limit(`ctf-account:${player.id}`, 10, 10 * 60_000)))
    return { error: RATE_ERROR };
  const db = getDb()!;
  const row = await db.ctfPlayer.findUniqueOrThrow({
    where: { id: player.id },
    select: { passwordHash: true },
  });
  if (!verifyPassword(text(formData, "current", 400), row.passwordHash))
    return { error: "The current password is wrong." };
  const password = text(formData, "password", 400);
  if (password !== text(formData, "confirm", 400))
    return { error: "The two passwords do not match." };
  const problem = passwordProblem(password, player.email, player.username);
  if (problem) return { error: passwordMessage(problem) };
  await db.$transaction([
    db.ctfPlayer.update({
      where: { id: player.id },
      data: { passwordHash: hashPassword(password) },
    }),
    db.ctfSession.deleteMany({ where: { playerId: player.id } }),
  ]);
  // Every other device is signed out; this one starts a fresh session.
  await createPlayerSession(player.id);
  return { success: "Password changed. Other devices were signed out." };
}

export async function changeUsernameAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const player = await requirePlayer("/challenges/account");
  if (!(await limit(`ctf-account:${player.id}`, 10, 10 * 60_000)))
    return { error: RATE_ERROR };
  const username = usernameSchema.safeParse(text(formData, "username", 60));
  if (!username.success)
    return {
      error:
        "Username: 3 to 24 Latin letters, digits, dot, dash or underscore, starting with a letter or digit.",
    };
  try {
    await getDb()!.ctfPlayer.update({
      where: { id: player.id },
      data: {
        username: username.data,
        usernameKey: usernameKey(username.data),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { error: "This username is taken. Choose another one." };
    throw error;
  }
  revalidatePath("/challenges", "layout");
  return { success: "Username saved." };
}

export async function deleteAccountAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const player = await requirePlayer("/challenges/account");
  if (!(await limit(`ctf-account:${player.id}`, 10, 10 * 60_000)))
    return { error: RATE_ERROR };
  const db = getDb()!;
  const row = await db.ctfPlayer.findUniqueOrThrow({
    where: { id: player.id },
    select: { passwordHash: true },
  });
  if (!verifyPassword(text(formData, "current", 400), row.passwordHash))
    return { error: "The current password is wrong." };
  await db.ctfPlayer.delete({ where: { id: player.id } });
  await destroyPlayerSession();
  redirect("/challenges?deleted=1");
}
