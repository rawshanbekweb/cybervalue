// Shared pieces of the CTF admin pages: the outcome message from ?ok= or
// ?error=, and the competition and challenge form fields.
import { getAdminTranslator } from "@/lib/i18n/server";
import { CATEGORIES, tashkentInput } from "@/lib/challenges/scoring";

export async function Outcome({
  query,
}: {
  query: Record<string, string | string[] | undefined>;
}) {
  const t = await getAdminTranslator();
  const ok = typeof query.ok === "string" ? query.ok.slice(0, 200) : "";
  const error =
    typeof query.error === "string" ? query.error.slice(0, 200) : "";
  if (error)
    return (
      <p className="admin-error" role="alert">
        {t(error)}
      </p>
    );
  if (ok)
    return (
      <p className="admin-notice" role="status">
        {t(ok)}
      </p>
    );
  return null;
}

type EventValues = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  registrationEndsAt: Date | null;
  freezeAt: Date | null;
  maxTeamSize: number;
  allowSolo: boolean;
  published: boolean;
};

export async function EventFields({ event }: { event?: EventValues }) {
  const t = await getAdminTranslator();
  const time = (d: Date | null | undefined) => (d ? tashkentInput(d) : "");
  return (
    <>
      <div className="admin-field">
        <label htmlFor="ctf-title">{t("Title")}</label>
        <input
          id="ctf-title"
          name="title"
          className="admin-input"
          required
          maxLength={120}
          defaultValue={event?.title}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="ctf-slug">{t("Address")} (/challenges/…)</label>
        <input
          id="ctf-slug"
          name="slug"
          className="admin-input"
          required
          maxLength={60}
          pattern="[a-z0-9][a-z0-9\-]+[a-z0-9]"
          defaultValue={event?.slug}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="ctf-summary">{t("Short description")}</label>
        <input
          id="ctf-summary"
          name="summary"
          className="admin-input"
          maxLength={300}
          defaultValue={event?.summary}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="ctf-description">
          {t("Description and rules (Markdown)")}
        </label>
        <textarea
          id="ctf-description"
          name="description"
          className="admin-input"
          rows={8}
          maxLength={20000}
          defaultValue={event?.description}
        />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="ctf-starts">{t("Starts (Tashkent time)")}</label>
          <input
            id="ctf-starts"
            name="startsAt"
            type="datetime-local"
            className="admin-input"
            required
            defaultValue={time(event?.startsAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ctf-ends">{t("Ends (Tashkent time)")}</label>
          <input
            id="ctf-ends"
            name="endsAt"
            type="datetime-local"
            className="admin-input"
            required
            defaultValue={time(event?.endsAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ctf-reg">{t("Registration closes (optional)")}</label>
          <input
            id="ctf-reg"
            name="registrationEndsAt"
            type="datetime-local"
            className="admin-input"
            defaultValue={time(event?.registrationEndsAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ctf-freeze">
            {t("Freeze the scoreboard at (optional)")}
          </label>
          <input
            id="ctf-freeze"
            name="freezeAt"
            type="datetime-local"
            className="admin-input"
            defaultValue={time(event?.freezeAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ctf-size">{t("Team size (1–10)")}</label>
          <input
            id="ctf-size"
            name="maxTeamSize"
            type="number"
            min={1}
            max={10}
            className="admin-input"
            required
            defaultValue={event?.maxTeamSize ?? 4}
          />
        </div>
      </div>
      <div className="admin-field admin-field-checkbox">
        <label>
          <input
            type="checkbox"
            name="allowSolo"
            defaultChecked={event?.allowSolo ?? true}
          />{" "}
          {t("Players may also take part on their own")}
        </label>
      </div>
      <div className="admin-field admin-field-checkbox">
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={event?.published ?? false}
          />{" "}
          {t("Published: visible at /challenges")}
        </label>
      </div>
    </>
  );
}

type ChallengeValues = {
  id: string;
  title: string;
  category: string;
  description: string;
  releaseAt: Date | null;
  requiresId: string | null;
  maxAttempts: number;
  initialPoints: number;
  minimumPoints: number;
  decay: number;
  visible: boolean;
  position: number;
};

export async function ChallengeFields({
  challenge,
  others = [],
}: {
  challenge?: ChallengeValues;
  // The competition's other challenges, for "opens after".
  others?: { id: string; title: string }[];
}) {
  const t = await getAdminTranslator();
  return (
    <>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="ch-title">{t("Title")}</label>
          <input
            id="ch-title"
            name="title"
            className="admin-input"
            required
            maxLength={100}
            defaultValue={challenge?.title}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ch-category">{t("Category")}</label>
          <select
            id="ch-category"
            name="category"
            className="admin-input"
            defaultValue={challenge?.category ?? "Crypto"}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="ch-description">{t("Task (Markdown)")}</label>
        <textarea
          id="ch-description"
          name="description"
          className="admin-input"
          rows={8}
          maxLength={20000}
          defaultValue={challenge?.description}
        />
      </div>
      {!challenge && (
        <>
          <div className="admin-field">
            <label htmlFor="ch-flag">{t("Flag")}</label>
            <input
              id="ch-flag"
              name="flag"
              className="admin-input"
              maxLength={200}
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="CV{...}"
            />
            <p className="admin-help">
              {t(
                "Only a salted digest is stored; the flag cannot be shown again. More flags can be added on the challenge page.",
              )}
            </p>
          </div>
          <div className="admin-field admin-field-checkbox">
            <label>
              <input type="checkbox" name="caseInsensitive" />{" "}
              {t("Accept the flag in any letter case")}
            </label>
          </div>
        </>
      )}
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="ch-release">
            {t("Opens at (Tashkent time, optional)")}
          </label>
          <input
            id="ch-release"
            name="releaseAt"
            type="datetime-local"
            className="admin-input"
            defaultValue={
              challenge?.releaseAt ? tashkentInput(challenge.releaseAt) : ""
            }
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ch-requires">{t("Opens after solving")}</label>
          <select
            id="ch-requires"
            name="requiresId"
            className="admin-input"
            defaultValue={challenge?.requiresId ?? ""}
          >
            <option value="">{t("— nothing, open at once —")}</option>
            {others
              .filter((o) => o.id !== challenge?.id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="ch-attempts">
            {t("Wrong answers allowed (0: unlimited)")}
          </label>
          <input
            id="ch-attempts"
            name="maxAttempts"
            type="number"
            min={0}
            max={1000}
            className="admin-input"
            defaultValue={challenge?.maxAttempts ?? 0}
          />
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="ch-initial">{t("Starting value")}</label>
          <input
            id="ch-initial"
            name="initialPoints"
            type="number"
            min={0}
            max={10000}
            className="admin-input"
            required
            defaultValue={challenge?.initialPoints ?? 500}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ch-minimum">{t("Minimum value")}</label>
          <input
            id="ch-minimum"
            name="minimumPoints"
            type="number"
            min={0}
            max={10000}
            className="admin-input"
            required
            defaultValue={challenge?.minimumPoints ?? 100}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ch-decay">{t("Solves to reach the minimum")}</label>
          <input
            id="ch-decay"
            name="decay"
            type="number"
            min={1}
            max={1000}
            className="admin-input"
            required
            defaultValue={challenge?.decay ?? 20}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="ch-position">{t("Order")}</label>
          <input
            id="ch-position"
            name="position"
            type="number"
            className="admin-input"
            defaultValue={challenge?.position ?? 0}
          />
        </div>
      </div>
      <div className="admin-field admin-field-checkbox">
        <label>
          <input
            type="checkbox"
            name="visible"
            defaultChecked={challenge?.visible ?? true}
          />{" "}
          {t("Visible to players")}
        </label>
      </div>
    </>
  );
}
