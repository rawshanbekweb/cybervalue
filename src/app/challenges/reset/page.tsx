import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";

import { isLinkToken } from "@/lib/challenges/account";
import { tokenIsLive } from "@/lib/challenges/tokens";
import { ResetForm } from "@/components/challenges/forms";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("Set a new password"), referrer: "no-referrer" };
}

export default async function ResetPage({
  searchParams,
}: PageProps<"/challenges/reset">) {
  const t = await getCtfTranslator();
  const { token } = await searchParams;
  const live = isLinkToken(token) && (await tokenIsLive(token, "RESET"));
  return (
    <div className="ctf-auth">
      <h1 className="ctf-h2">{t("Set a new password")}</h1>
      {live ? (
        <ResetForm token={token} />
      ) : (
        <div className="ctf-panel">
          <p className="ctf-error">
            {t("This link is not valid or has expired.")}
          </p>
          <Link href="/challenges/forgot" className="ctf-button is-ghost">
            {t("Ask for a new link")}
          </Link>
        </div>
      )}
    </div>
  );
}
