import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { getDb } from "@/lib/db";
import {
  flagFor,
  splitVariants,
  variantFor,
  type FlagVerdict,
} from "@/lib/student/challenge";

type Material = {
  id: string;
  secret: string | null;
  artifact: string;
  groups: string[];
};
type Attempt = {
  studentId: string;
  score: number | null;
  answers: unknown;
  body: string;
  createdAt: Date;
};

const stamp = (date: Date) =>
  date.toISOString().slice(0, 16).replace("T", " ") + " UTC";

// One row per student who can see the lab: their variant and flag, how they
// did, and warnings when they handed in a decoy or a classmate's flag.
export async function ChallengeResults({
  material,
  attempts,
}: {
  material: Material;
  attempts: Attempt[];
}) {
  const t = await getAdminTranslator();
  const db = getDb();
  if (!db || !material.secret) return null;
  const secret = material.secret;
  const students = await db.student.findMany({
    where: material.groups.length ? { group: { in: material.groups } } : {},
    orderBy: [{ group: "asc" }, { name: "asc" }],
    select: { id: true, name: true, group: true },
  });
  const names = new Map(
    (await db.student.findMany({ select: { id: true, name: true } })).map(
      (s) => [s.id, s.name],
    ),
  );
  const variants = splitVariants(material.artifact).length || 1;
  const byStudent = Map.groupBy(attempts, (a) => a.studentId);
  // Whose flag leaked: owner id -> students who submitted it.
  const leaked = new Map<string, string[]>();
  for (const a of attempts) {
    const verdict = a.answers as FlagVerdict | null;
    if (verdict?.result === "shared")
      leaked.set(verdict.owner, [
        ...(leaked.get(verdict.owner) ?? []),
        a.studentId,
      ]);
  }
  const solved = students.filter((s) =>
    byStudent.get(s.id)?.some((a) => a.score === 1),
  ).length;

  return (
    <>
      <p>
        {t("{solved} of {total} students solved it.", {
          solved,
          total: students.length,
        })}
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t("Student")}</th>
              <th scope="col">{t("Variant")}</th>
              <th scope="col">{t("Flag")}</th>
              <th scope="col">Status</th>
              <th scope="col">{t("Warnings")}</th>
              <th scope="col">{t("File")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const tries = byStudent.get(student.id) ?? [];
              const win = tries.find((a) => a.score === 1);
              const warnings = tries.flatMap((a) => {
                const verdict = a.answers as FlagVerdict | null;
                if (verdict?.result === "decoy")
                  return [t("Sent a decoy flag")];
                if (verdict?.result === "shared")
                  return [
                    t("Sent the flag of {name}", {
                      name: names.get(verdict.owner) ?? "?",
                    }),
                  ];
                return [];
              });
              for (const taker of leaked.get(student.id) ?? [])
                warnings.push(
                  t("Their flag was sent by {name}", {
                    name: names.get(taker) ?? "?",
                  }),
                );
              return (
                <tr key={student.id}>
                  <td>
                    <Link href={`/admin/students/${student.id}`}>
                      {student.name}
                    </Link>
                    {student.group && (
                      <span className="muted"> · {student.group}</span>
                    )}
                  </td>
                  <td>
                    {variantFor(secret, student.id, variants) + 1}/{variants}
                  </td>
                  <td>
                    <code className="student-code">
                      {flagFor(secret, student.id)}
                    </code>
                  </td>
                  <td>
                    {win
                      ? t("Solved {date} · {count} attempts", {
                          date: stamp(win.createdAt),
                          count: tries.length,
                        })
                      : tries.length
                        ? t("{count} wrong attempts", { count: tries.length })
                        : t("Not started")}
                  </td>
                  <td>
                    {warnings.length
                      ? [...new Set(warnings)].map((w) => (
                          <span key={w} className="admin-warn student-warning">
                            {w}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td>
                    <a
                      href={`/admin/materials/${material.id}/artifact/${student.id}`}
                    >
                      {t("Download")}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {attempts.some((a) => a.score === 0) && (
        <>
          <h3>{t("Wrong answers")}</h3>
          <ul className="student-wrong-list">
            {attempts
              .filter((a) => a.score === 0)
              .slice(0, 100)
              .map((a, i) => (
                <li key={i}>
                  <strong>{names.get(a.studentId) ?? "?"}</strong>{" "}
                  <code>{a.body}</code>{" "}
                  <span className="muted">{stamp(a.createdAt)}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </>
  );
}
