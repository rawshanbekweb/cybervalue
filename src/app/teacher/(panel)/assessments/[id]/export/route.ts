import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { candidateDraft, finalizeExpired } from "@/lib/html-assessment/service";

export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!(await getSession()))
    return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const { id } = await params;
  await finalizeExpired(db, id);
  const exam = await db.htmlExam.findUnique({
    where: { id },
    include: { candidates: { orderBy: { studentId: "asc" } } },
  });
  if (!exam) return new Response("Not found", { status: 404, headers });
  const cell = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows: unknown[][] = [
    [
      "ID",
      "Ism",
      "Holat",
      "Avtomatik /90",
      "Izoh /10",
      "Jami /100",
      "Tab",
      "Paste",
      "Boshlangan UTC",
      "Topshirilgan UTC",
      "O‘qituvchi izohi",
    ],
  ];
  for (const c of exam.candidates) {
    const signals = candidateDraft(c).signals;
    rows.push([
      c.studentId,
      c.name,
      c.finishReason ?? (c.startedAt ? "active" : "waiting"),
      c.autoScore,
      c.reviewScore,
      c.autoScore !== null && c.reviewScore !== null
        ? c.autoScore + c.reviewScore
        : "",
      signals.hidden,
      signals.paste,
      c.startedAt?.toISOString(),
      c.submittedAt?.toISOString(),
      c.reviewNote,
    ]);
  }
  return new Response(
    "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
    {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="html-results.csv"',
      },
    },
  );
}
