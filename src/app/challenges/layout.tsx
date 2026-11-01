import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { ChallengesMessages } from "@/components/i18n/challenges-messages";
import { ChallengesNav } from "@/components/challenges/nav";
import { createTranslator } from "@/lib/i18n";
import { getAdminLocale } from "@/lib/i18n/server";
import { requireSection } from "@/lib/site-config-server";
import "./challenges.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(await getAdminLocale());
  return {
    title: {
      absolute: `${t("CTF Challenges")} | Cybervalue`,
      template: `%s · ${t("CTF Challenges")} | Cybervalue`,
    },
    description: t(
      "Cybersecurity competitions in Uzbek: sign up, build a team and capture the flags.",
    ),
  };
}
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Its own root layout, like the student area: it follows the language cookie
// and has its own design. A switched-off section answers 404.
export default async function ChallengesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSection("challenges");
  const locale = await getAdminLocale();
  const t = createTranslator(locale);
  return (
    <html lang={locale}>
      <body className="ctf-root">
        <LocaleProvider locale={locale}>
          <ChallengesMessages>
            <a href="#ctf-main" className="ctf-skip">
              {t("Skip to content")}
            </a>
            <div className="ctf-shell">
              <ChallengesNav />
              <main id="ctf-main">{children}</main>
            </div>
          </ChallengesMessages>
        </LocaleProvider>
      </body>
    </html>
  );
}
