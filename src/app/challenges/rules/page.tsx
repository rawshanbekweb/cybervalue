import { getAdminTranslator } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Rules") };
}

const RULES = [
  "One person, one account. Do not share your account or create extra ones.",
  "Attack only the tasks and addresses given in the competition. The Cybervalue site, its servers and other players are off limits.",
  "Do not share flags, solutions or hints with other teams while a competition runs.",
  "Do not try to brute-force the flag form: the number of attempts is limited.",
  "Be respectful in team names, usernames and messages.",
  "Organisers may block accounts or teams that break the rules and remove their results.",
  "After the competition you are welcome to publish write-ups.",
];

export default async function RulesPage() {
  const t = await getAdminTranslator();
  return (
    <article className="ctf-rules" style={{ maxWidth: "70ch" }}>
      <p className="ctf-eyebrow">{t("Fair play")}</p>
      <h1 className="ctf-title">{t("Rules")}</h1>
      <ol>
        {RULES.map((rule) => (
          <li key={rule}>{t(rule)}</li>
        ))}
      </ol>
      <p className="ctf-muted">
        {t(
          "Each competition may add its own rules on its page. Your account data is used only to run the competitions.",
        )}
      </p>
    </article>
  );
}
