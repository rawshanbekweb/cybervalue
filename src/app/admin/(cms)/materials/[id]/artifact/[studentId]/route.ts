import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { renderArtifact } from "@/lib/student/challenge";

export const dynamic = "force-dynamic";

// Lets the teacher open exactly what a student downloaded. The results table
// on the material page shows that student's flag and variant.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/admin/materials/[id]/artifact/[studentId]">,
) {
  if (!(await getSession()))
    return new Response("Sign in required", { status: 401 });
  const { id, studentId } = await params;
  const db = getDb();
  const [material, student] = db
    ? await Promise.all([
        db.studentMaterial.findUnique({ where: { id } }),
        db.student.findUnique({ where: { id: studentId } }),
      ])
    : [null, null];
  if (!material?.secret || material.kind !== "CHALLENGE" || !student)
    return new Response("Not found", { status: 404 });
  const { text } = renderArtifact(material.artifact, material.secret, student);
  return new Response(text, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${material.artifactName}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
