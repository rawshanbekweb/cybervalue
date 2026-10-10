import { getStudentSession } from "@/lib/student/session";
import { materialForStudent } from "@/lib/student/materials";
import { renderArtifact } from "@/lib/student/challenge";

export const dynamic = "force-dynamic";

// The student's personal copy of a lab artifact. Always a download in an
// opaque type, so an HTML or script artifact never runs on this origin.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/student/m/[slug]/artifact">,
) {
  const session = await getStudentSession();
  if (!session) return new Response("Sign in required", { status: 401 });
  const { slug } = await params;
  const material = await materialForStudent(session.student, slug);
  if (!material || material.kind !== "CHALLENGE" || !material.secret)
    return new Response("Not found", { status: 404 });
  const { text } = renderArtifact(
    material.artifact,
    material.secret,
    session.student,
  );
  return new Response(text, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${material.artifactName}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
