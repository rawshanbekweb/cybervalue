import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { moveStudentCookie } from "@/lib/student/session";
import { isStudentNext } from "@/lib/student/levels";

// The way from /student to Intermediate. A browser may hold the session
// cookie scoped to /student only; this route sits under /student so it gets
// that cookie, re-issues it for the whole site and goes on. Signed-out
// visitors sign in first and come back.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const asked = request.nextUrl.searchParams.get("to");
  const to = isStudentNext(asked) ? asked : "/student";
  if (await moveStudentCookie()) redirect(to);
  redirect(`/student/login?next=${encodeURIComponent(to)}`);
}
