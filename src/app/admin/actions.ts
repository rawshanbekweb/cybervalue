"use server";
import { redirect } from "next/navigation";
import {
  destroySession,
  getSession,
  homeOf,
  isStaffPath,
  moveSessionCookie,
} from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function logoutAction() {
  const session = await getSession();
  await destroySession();
  if (session) await audit("logout", session.user.id);
  redirect("/admin/login");
}

/** "Continue" on the sign-in page for someone already signed in. */
export async function continueSessionAction(form: FormData) {
  const session = await moveSessionCookie();
  if (!session) redirect("/admin/login");
  const next = form.get("next");
  redirect(
    typeof next === "string" && isStaffPath(next) ? next : homeOf(session.user),
  );
}
