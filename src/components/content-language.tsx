import type { Locale } from "@/lib/i18n";
import { getLocale, getTranslator } from "@/lib/i18n/server";

// Some authored courses have one source language. Make that explicit instead of
// presenting their source text as a completed translation of the selected UI.
export async function ContentLanguage({
  language,
  children,
}: {
  language: Locale;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslator();
  return (
    <>
      {locale !== language && (
        <p className="container content-language-note">
          {t(
            language === "en"
              ? "This module’s lessons and controls are currently available in English."
              : "This module’s lessons and controls are currently available in Uzbek.",
          )}
        </p>
      )}
      <div lang={language}>{children}</div>
    </>
  );
}
