import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { MaterialForm } from "@/components/admin/student-forms";

export default async function NewMaterialPage({
  searchParams,
}: PageProps<"/teacher/materials/new">) {
  const t = await getAdminTranslator();
  await requireAdmin("/teacher/materials/new");
  const { kind } = await searchParams;
  const quiz = kind === "QUIZ";
  return (
    <div className="admin-page">
      <Link href="/teacher/materials" className="muted">
        ← {t("Student materials")}
      </Link>
      <h1>{quiz ? t("New test") : t("New material")}</h1>
      <MaterialForm
        id={null}
        defaults={{
          slug: "",
          kind: quiz ? "QUIZ" : "LESSON",
          title: "",
          summary: "",
          body: "",
          quizText: "",
          artifact: "",
          artifactName: "",
          explanation: "",
          maxAttempts: 3,
          timeLimit: 0,
          groups: "",
          levels: [],
          position: 0,
          published: false,
        }}
      />
    </div>
  );
}
