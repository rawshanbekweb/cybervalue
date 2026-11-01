import { getAdminTranslator } from "@/lib/i18n/server";
import { ForgotForm } from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Reset password") };
}

export default async function ForgotPage() {
  const t = await getAdminTranslator();
  return (
    <div className="ctf-auth">
      <h1 className="ctf-h2">{t("Reset password")}</h1>
      <p className="ctf-muted">
        {t("Enter your email and we will send a link to set a new password.")}
      </p>
      <ForgotForm />
    </div>
  );
}
