import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getAdminTranslator } from "@/lib/i18n/server";
import { getPlayerSession } from "@/lib/challenges/session";
import { logoutAction } from "@/app/challenges/actions";

export async function ChallengesNav() {
  const t = await getAdminTranslator();
  const session = await getPlayerSession();
  return (
    <header className="ctf-nav">
      <Link href="/challenges" className="ctf-logo">
        <span className="ctf-logo-mark" aria-hidden="true">
          CTF
        </span>
        Cybervalue
      </Link>
      <nav className="ctf-nav-links" aria-label={t("CTF Challenges")}>
        <Link href="/challenges/rules">{t("Rules")}</Link>
        {session ? (
          <>
            <Link href="/challenges/account">{session.player.username}</Link>
            <form action={logoutAction}>
              <button type="submit" className="ctf-link-button">
                {t("Sign out")}
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/challenges/login">{t("Sign in")}</Link>
            <Link href="/challenges/register">{t("Sign up")}</Link>
          </>
        )}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
