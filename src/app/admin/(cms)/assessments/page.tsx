import { getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CreateExamForm } from "@/components/admin/assessment-forms";
import "@/components/playground/html-assessment/assessment.css";

export default async function AssessmentsPage() {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/assessments");
  const db = getDb();
  const exams = db
    ? await db.htmlExam.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { _count: { select: { candidates: true } } },
      })
    : [];
  return (
    <div className="exam-admin">
      <h1>{t("HTML baholash")}</h1>
      <p>
        {t(
          "HTML Basics’ning 12 mavzusi: 30 ball test, 60 ball amaliy ish, 10 ball izoh. Uchta variant, server vaqti va har o‘quvchiga bir martalik kod.",
        )}
      </p>
      <CreateExamForm />
      <h2>{t("Sinovlar")}</h2>
      {!exams.length && <p>{t("Hali sinov yaratilmagan.")}</p>}
      <ul className="exam-list">
        {exams.map((exam) => (
          <li key={exam.id}>
            <Link href={`/admin/assessments/${exam.id}`}>{exam.title}</Link>
            <span>
              {t("{minutes} min · {pupils} pupils · {status}", {
                minutes: exam.minutes,
                pupils: exam._count.candidates,
                status: t(exam.closed ? "Kirish yopiq" : "Kirish ochiq"),
              })}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted">
        {t(
          "Cheklovlar mustaqil ishlashga yordam beradi, lekin boshqa qurilma yoki tashqi yordamni to‘liq aniqlamaydi. Sinovni o‘qituvchi nazoratida o‘tkazing. Tab va nusxa joylash qaydlari tekshiruv uchun; ular o‘z-o‘zidan ayb isboti emas.",
        )}
      </p>
    </div>
  );
}
