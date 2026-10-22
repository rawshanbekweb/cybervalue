import "server-only";
import { getSession } from "@/lib/auth";
import { getStudentSession } from "@/lib/student/session";
import { opensIntermediate } from "@/lib/student/levels";

export type IntermediateAccess =
  | { open: true; who: "student"; name: string }
  | { open: true; who: "staff" }
  | { open: false; reason: "signed-out" | "level" };

/**
 * Who may use the Intermediate labs: students placed at the Intermediate or
 * Advanced level, and staff (to prepare lessons). The roadmap stays public.
 */
export async function intermediateAccess(): Promise<IntermediateAccess> {
  const student = (await getStudentSession())?.student;
  if (student && opensIntermediate(student.level))
    return { open: true, who: "student", name: student.name };
  if (await getSession()) return { open: true, who: "staff" };
  return { open: false, reason: student ? "level" : "signed-out" };
}
