import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { MaterialForm } from "@/components/admin/student-forms";

export default async function NewMaterialPage() {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/materials/new");
  return (
    <div className="admin-page">
      <Link href="/admin/materials" className="muted">
        ← {t("Student materials")}
      </Link>
      <h1>{t("New material")}</h1>
      <MaterialForm
        id={null}
        defaults={{
          slug: "",
          kind: "LESSON",
          title: "",
          summary: "",
          body: "",
          quizText: "",
          artifact: "",
          artifactName: "",
          explanation: "",
          maxAttempts: 1,
          groups: "",
          position: 0,
          published: false,
        }}
      />
    </div>
  );
}
