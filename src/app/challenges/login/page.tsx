import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlayerSession } from "@/lib/challenges/session";
import { isChallengesNext } from "@/lib/challenges/account";
import { LoginForm } from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("Sign in") };
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/challenges/login">) {
  const asked = (await searchParams).next;
  const next = isChallengesNext(asked) ? asked : undefined;
  if (await getPlayerSession()) redirect(next ?? "/challenges");
  const t = await getCtfTranslator();
  return (
    <div className="ctf-auth">
      <p className="ctf-eyebrow">{t("Player")}</p>
      <h1 className="ctf-h2">{t("Sign in")}</h1>
      <LoginForm next={next} />
      <p className="ctf-muted ctf-small">
        <Link href="/challenges/forgot">{t("Forgot your password?")}</Link>
        {" · "}
        <Link href="/challenges/register">{t("Create an account")}</Link>
      </p>
    </div>
  );
}
