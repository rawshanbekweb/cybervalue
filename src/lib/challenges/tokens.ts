import "server-only";
import { getDb } from "../db";
import { site } from "../site";
import { getAdminLocale } from "../i18n/server";
import {
  hashToken,
  newLinkToken,
  RESET_TTL_MS,
  VERIFY_TTL_MS,
} from "./account";
import { buildMail } from "./emails";
import { sendMail } from "./mail";

export type TokenKind = "VERIFY" | "RESET";
const TTL: Record<TokenKind, number> = {
  VERIFY: VERIFY_TTL_MS,
  RESET: RESET_TTL_MS,
};
const PAGE: Record<TokenKind, string> = {
  VERIFY: "/challenges/verify",
  RESET: "/challenges/reset",
};

/** A new one-time link; earlier unused links of the same kind stop working. */
async function issueToken(playerId: string, kind: TokenKind) {
  const db = getDb()!;
  const token = newLinkToken();
  await db.$transaction([
    db.ctfToken.deleteMany({ where: { playerId, kind, usedAt: null } }),
    db.ctfToken.create({
      data: {
        playerId,
        kind,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TTL[kind]),
      },
    }),
  ]);
  return `${site.url}${PAGE[kind]}?token=${token}`;
}

type Player = { id: string; email: string; username: string };

export async function sendVerification(player: Player) {
  const link = await issueToken(player.id, "VERIFY");
  return sendMail(
    buildMail(
      "verify",
      await getAdminLocale(),
      player.email,
      player.username,
      link,
    ),
  );
}

export async function sendReset(player: Player) {
  const link = await issueToken(player.id, "RESET");
  return sendMail(
    buildMail(
      "reset",
      await getAdminLocale(),
      player.email,
      player.username,
      link,
    ),
  );
}

/** Tells the owner of an address that it already has an account. */
export async function sendAlreadyRegistered(player: Player) {
  const link = await issueToken(player.id, "RESET");
  return sendMail(
    buildMail(
      "exists",
      await getAdminLocale(),
      player.email,
      player.username,
      link,
    ),
  );
}

/**
 * Uses a link once: returns the player it belongs to, or null when the link
 * is unknown, expired or already used. The conditional update makes two
 * concurrent clicks spend it only once.
 */
export async function consumeToken(token: string, kind: TokenKind) {
  const db = getDb();
  if (!db) return null;
  const now = new Date();
  const row = await db.ctfToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, playerId: true, kind: true },
  });
  if (!row || row.kind !== kind) return null;
  const spent = await db.ctfToken.updateMany({
    where: { id: row.id, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  return spent.count === 1 ? row.playerId : null;
}

/** Whether a link is still usable, without spending it (for the reset form). */
export async function tokenIsLive(token: string, kind: TokenKind) {
  const row = await getDb()?.ctfToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { kind: true, usedAt: true, expiresAt: true },
  });
  return Boolean(
    row && row.kind === kind && !row.usedAt && row.expiresAt > new Date(),
  );
}
