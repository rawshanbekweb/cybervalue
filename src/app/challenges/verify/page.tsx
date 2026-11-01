import { getCtfTranslator } from "@/lib/challenges/view";

import { isLinkToken } from "@/lib/challenges/account";
import { VerifyForm } from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("Confirm email"), referrer: "no-referrer" };
}

// The link only opens this page; the button spends it. Mail scanners that
// fetch links ahead of the reader therefore cannot confirm an address.
export default async function VerifyPage({
  searchParams,
}: PageProps<"/challenges/verify">) {
  const t = await getCtfTranslator();
  const { token } = await searchParams;
  return (
    <div className="ctf-auth">
      <h1 className="ctf-h2">{t("Confirm email")}</h1>
      {isLinkToken(token) ? (
        <>
          <p className="ctf-muted">
            {t("Press the button to confirm the address for CTF Challenges.")}
          </p>
          <VerifyForm token={token} />
        </>
      ) : (
        <p className="ctf-error">
          {t(
            "This link is not valid or has expired. Sign in and ask for a new one.",
          )}
        </p>
      )}
    </div>
  );
}
