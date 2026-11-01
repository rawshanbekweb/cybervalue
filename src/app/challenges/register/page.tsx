import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminTranslator } from "@/lib/i18n/server";
import { getPlayerSession } from "@/lib/challenges/session";
import { RegisterForm } from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Sign up") };
}

export default async function RegisterPage() {
  if (await getPlayerSession()) redirect("/challenges");
  const t = await getAdminTranslator();
  return (
    <div className="ctf-auth">
      <p className="ctf-eyebrow">{t("New player")}</p>
      <h1 className="ctf-h2">{t("Create an account")}</h1>
      <RegisterForm />
      <p className="ctf-muted ctf-small">
        {t("Already have an account?")}{" "}
        <Link href="/challenges/login">{t("Sign in")}</Link>
      </p>
    </div>
  );
}
