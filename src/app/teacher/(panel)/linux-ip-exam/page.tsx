import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  CHOICES,
  MAX_TOTAL,
  OPENS,
  type LipResult,
} from "@/lib/linux-ip-exam/content";
import { applyReview } from "@/lib/linux-ip-exam/grading";
import { finalizeIfOver, overridesOf } from "@/lib/linux-ip-exam/attempts";
import { retakeLinuxIpAction, reviewLinuxIpAction } from "./actions";
import "@/components/playground/html-assessment/assessment.css";

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : String(n).replace(".", ",");
const when = (d: Date | null) =>
  d ? d.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—";

// Results of the Linux and IP exam (/resources/linux-ip-exam). Students see
// their result only after it is approved here.
export default async function LinuxIpExamResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string }>;
}) {
  const t = await getAdminTranslator();
  const { scope } = await requireStaff("/teacher/linux-ip-exam");
  const db = getDb();
  if (!db) return <p>{t("Ma’lumotlar bazasi ulanmagan.")}</p>;
  const raw = await db.linuxIpAttempt.findMany({
    where: { student: groupWhere(scope) },
    include: { student: { select: { name: true, group: true } } },
    orderBy: { startedAt: "desc" },
    take: 500,
  });
  // Attempts whose time ran out are graded with what was saved.
  const attempts = await Promise.all(
    raw.map(async (a) =>
      a.submittedAt
        ? a
        : { ...(await finalizeIfOver(db, a)), student: a.student },
    ),
  );
  const { attempt: picked } = await searchParams;
  const selected = attempts.find((a) => a.id === picked);
  const grading = selected?.grading as LipResult | null | undefined;
  const reviewed =
    selected && grading ? applyReview(grading, overridesOf(selected)) : null;
  const byId = new Map(reviewed?.items.map((item) => [item.id, item]));
  const status = (a: (typeof attempts)[number]) =>
    a.approvedAt
      ? t("Tasdiqlangan")
      : a.submittedAt
        ? a.finishReason === "timeout"
          ? t("Vaqt tugagan · tekshirish kutilmoqda")
          : t("Tekshirish kutilmoqda")
        : t("Ishlamoqda");

  return (
    <div className="exam-admin">
      <h1>{t("Linux va IP imtihoni")}</h1>
      <p className="muted">
        {t(
          "O‘quvchi natijasini siz tasdiqlaganingizdan keyin ko‘radi. Ochiq savollar balini o‘zgartirishingiz, izoh yozishingiz yoki qayta topshirishga ruxsat berishingiz mumkin.",
        )}
      </p>
      <div className="exam-table-wrap">
        <table className="exam-table">
          <caption>{t("Urinishlar")}</caption>
          <thead>
            <tr>
              <th>{t("O‘quvchi")}</th>
              <th>{t("Guruh")}</th>
              <th>Holat</th>
              <th>{t("Avtomatik")}</th>
              <th>{t("Yakuniy /{max}", { max: MAX_TOTAL })}</th>
              <th>{t("Oynadan chiqish")}</th>
              <th>{t("Topshirilgan")}</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 && (
              <tr>
                <td colSpan={7}>{t("Hali hech kim boshlamagan.")}</td>
              </tr>
            )}
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`?attempt=${a.id}`}>{a.student.name}</Link>
                </td>
                <td>{a.student.group || "—"}</td>
                <td>{status(a)}</td>
                <td>{fmt(a.autoScore)}</td>
                <td>{fmt(a.finalScore)}</td>
                <td>{a.leaves}</td>
                <td>{when(a.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <section className="exam-card" aria-labelledby="lip-review-title">
          <h2 id="lip-review-title">
            {selected.student.name} · {status(selected)}
          </h2>
          <p>
            {t("Boshlangan:")} {when(selected.startedAt)}
            <br />
            {t("Muddat:")} {when(selected.deadline)}
            <br />
            {t("Topshirilgan:")} {when(selected.submittedAt)}
            <br />
            {t("Oynadan chiqish: {count} marta", { count: selected.leaves })}
          </p>
          {!reviewed && (
            <p>
              {t("O‘quvchi hali ishlamoqda. Natija topshirilgach chiqadi.")}
            </p>
          )}
          {reviewed && (
            <form action={reviewLinuxIpAction.bind(null, selected.id)}>
              <h3>
                {t("Jami:")} {fmt(reviewed.total)}/{fmt(reviewed.max)} · test{" "}
                {fmt(reviewed.test.score)}/{fmt(reviewed.test.max)} ·{" "}
                {t("ochiq")} {fmt(reviewed.open.score)}/{fmt(reviewed.open.max)}
              </h3>
              <h3>{t("Ochiq savollar")}</h3>
              <ol start={CHOICES.length + 1}>
                {OPENS.map((open) => {
                  const item = byId.get(open.id);
                  return (
                    <li key={open.id}>
                      <p>{t(open.prompt)}</p>
                      {open.scene && <pre>{open.scene}</pre>}
                      <p>
                        {t("Javob:")}{" "}
                        <code>{item?.answer || t("Javob berilmagan")}</code>
                        <br />
                        {t("Namuna javob:")} <code>{item?.expected}</code>
                      </p>
                      <label>
                        {t("Ball (0–{max}), avtomatik: {auto}", {
                          max: fmt(open.points),
                          auto: fmt(
                            grading?.items.find((i) => i.id === open.id)?.score,
                          ),
                        })}{" "}
                        <input
                          name={`score-${open.id}`}
                          type="number"
                          min={0}
                          max={open.points}
                          step={0.1}
                          defaultValue={
                            item?.reviewed ? String(item.score) : undefined
                          }
                          placeholder={fmt(item?.score)}
                        />
                      </label>
                    </li>
                  );
                })}
              </ol>
              <h3>{t("Test javoblari")}</h3>
              <ol>
                {CHOICES.map((choice) => {
                  const item = byId.get(choice.id);
                  return (
                    <li key={choice.id}>
                      {item && item.score > 0 ? "✓" : "✗"} {t(choice.prompt)} —{" "}
                      {item?.answer ? t(item.answer) : t("Javob berilmagan")}
                      {item && !item.score && (
                        <>
                          {" "}
                          ({t("to‘g‘ri:")} {t(item.expected)})
                        </>
                      )}{" "}
                      · {fmt(item?.score)}/{fmt(choice.points)}
                    </li>
                  );
                })}
              </ol>
              <label>
                {t("O‘quvchiga izoh")}
                <textarea
                  name="note"
                  rows={3}
                  maxLength={3000}
                  defaultValue={selected.note}
                />
              </label>
              <div className="exam-actions">
                <button
                  className="button button-primary"
                  name="decision"
                  value="approve"
                >
                  {selected.approvedAt
                    ? t("Saqlash")
                    : t("Tasdiqlash va o‘quvchiga ko‘rsatish")}
                </button>
                {selected.approvedAt ? (
                  <button
                    className="button button-secondary"
                    name="decision"
                    value="hide"
                  >
                    {t("O‘quvchidan yashirish")}
                  </button>
                ) : (
                  <button
                    className="button button-secondary"
                    name="decision"
                    value="save"
                  >
                    {t("Tasdiqlamasdan saqlash")}
                  </button>
                )}
              </div>
            </form>
          )}
          <form action={retakeLinuxIpAction.bind(null, selected.id)}>
            <button className="button button-secondary">
              {t("Urinishni o‘chirish va qayta topshirishga ruxsat berish")}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
