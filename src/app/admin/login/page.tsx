import { getAdminTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPendingChallenge } from "@/lib/mfa";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; changed?: string }>;
}) {
  const t = await getAdminTranslator();
  const session = await getSession();
  if (session) redirect("/admin");
  const { next, changed } = await searchParams;
  return (
    <div className="container admin-auth-page">
      <span className="eyebrow">{t("CyberValue admin")}</span>
      <h1>{t("Sign in")}</h1>
      <p className="muted">{t("Private area. Not for public use.")}</p>
      {changed === "1" && (
        <p role="status">
          {t("Password changed. Sign in with your new password.")}
        </p>
      )}
      <LoginForm next={next} pendingCode={await hasPendingChallenge()} />
    </div>
  );
}
