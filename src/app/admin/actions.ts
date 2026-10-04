"use server";
import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function logoutAction() {
  const session = await getSession();
  await destroySession();
  if (session) await audit("logout", session.user.id);
  redirect("/admin/login");
}
