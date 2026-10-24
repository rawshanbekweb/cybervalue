import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { LAB_META, LAB_PROGRESS } from "../lab-progress";
import { CHECKPOINT_META } from "../checkpoints/meta";
import { opensIntermediate, visibleAtLevel } from "./levels";
import {
  assignmentStatus,
  completedAt,
  parseTarget,
  type AssignmentStatus,
  type Completion,
  type Target,
} from "./assignments";
import { withoutReturned } from "./xp";

type Who = {
  id: string;
  name: string;
  group: string;
  level: string;
  createdAt: Date;
};

export type AssignmentRow = {
  id: string;
  title: string;
  note: string;
  group: string;
  dueAt: Date;
  target: Target;
  // Title and slug of a material target; null when it was deleted.
  material: {
    title: string;
    slug: string;
    kind: string;
    published: boolean;
    groups: string[];
    levels: string[];
  } | null;
};

// Assignments with parsed targets and their materials. A target that no
// longer parses is dropped.
export async function loadAssignments(
  db: PrismaClient,
  where: { groups?: string[]; since?: Date } = {},
): Promise<AssignmentRow[]> {
  const rows = await db.studentAssignment.findMany({
    where: {
      ...(where.groups ? { group: { in: where.groups } } : {}),
      ...(where.since ? { dueAt: { gte: where.since } } : {}),
    },
    orderBy: { dueAt: "asc" },
    take: 500,
  });
  const parsed = rows.flatMap((row) => {
    const target = parseTarget(row.target);
    return target ? [{ ...row, target }] : [];
  });
  const ids = parsed.flatMap((r) =>
    r.target.kind === "material" ? [r.target.id] : [],
  );
  const materials = ids.length
    ? await db.studentMaterial.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          title: true,
          slug: true,
          kind: true,
          published: true,
          groups: true,
          levels: true,
        },
      })
    : [];
  return parsed.map((row) => ({
    id: row.id,
    title: row.title,
    note: row.note,
    group: row.group,
    dueAt: row.dueAt,
    target: row.target,
    material:
      row.target.kind === "material"
        ? (materials.find((m) => m.id === row.target.id) ?? null)
        : null,
  }));
}

async function loadCompletion(
  db: PrismaClient,
  assignments: AssignmentRow[],
  studentIds: string[],
): Promise<Completion> {
  const of = (kind: Target["kind"]) => [
    ...new Set(
      assignments.flatMap((a) => (a.target.kind === kind ? [a.target.id] : [])),
    ),
  ];
  const [materialIds, checkpoints, labs] = [
    of("material"),
    of("checkpoint"),
    of("lab"),
  ];
  const students = { studentId: { in: studentIds } };
  const [progress, submissions, attempts, labRows] = await Promise.all([
    materialIds.length
      ? db.studentProgress.findMany({
          where: { ...students, materialId: { in: materialIds } },
          select: { studentId: true, materialId: true, completedAt: true },
        })
      : [],
    materialIds.length
      ? db.studentSubmission.findMany({
          where: {
            ...students,
            materialId: { in: materialIds },
            // A personal lab only counts once solved, which records progress.
            material: { kind: { not: "CHALLENGE" } },
          },
          select: {
            studentId: true,
            materialId: true,
            createdAt: true,
            returned: true,
          },
        })
      : [],
    checkpoints.length
      ? db.studentCheckpoint.findMany({
          where: { ...students, checkpoint: { in: checkpoints } },
          select: {
            studentId: true,
            checkpoint: true,
            score: true,
            total: true,
            createdAt: true,
          },
        })
      : [],
    labs.length
      ? db.studentLabProgress.findMany({
          where: { ...students, lab: { in: labs } },
          select: {
            studentId: true,
            lab: true,
            lessons: true,
            updatedAt: true,
          },
        })
      : [],
  ]);
  return {
    materials: [
      ...progress.map((p) => ({
        id: p.materialId,
        studentId: p.studentId,
        at: p.completedAt,
      })),
      // A practice returned for rework is not done until handed in again.
      ...withoutReturned(submissions).map((s) => ({
        id: s.materialId,
        studentId: s.studentId,
        at: s.createdAt,
      })),
    ],
    checkpoints: attempts,
    labs: labRows,
  };
}

/**
 * Whether an assignment is the student's: their group (or everyone), set
 * after they joined, and on something they can open — an Intermediate lab or
 * checkpoint needs that level, a material must be visible to them.
 */
function appliesTo(assignment: AssignmentRow, student: Who) {
  if (assignment.group && assignment.group !== student.group) return false;
  if (student.createdAt > assignment.dueAt) return false;
  const { target, material } = assignment;
  if (target.kind === "lab" || target.kind === "checkpoint") {
    const intermediate =
      target.kind === "lab"
        ? LAB_META.find((l) => l.id === target.id)?.intermediate
        : CHECKPOINT_META.find((c) => c.id === target.id)?.level ===
          "intermediate";
    return !intermediate || opensIntermediate(student.level);
  }
  return (
    !material ||
    (material.published &&
      (material.groups.length === 0 ||
        material.groups.includes(student.group)) &&
      visibleAtLevel(material.levels, student.level))
  );
}

export type AssignmentResult = AssignmentRow & {
  students: (Who & { status: AssignmentStatus; at: Date | null })[];
};

// Every assignment with the status of each student it applies to.
export async function assignmentResults(
  db: PrismaClient,
  assignments: AssignmentRow[],
  students: Who[],
  now = Date.now(),
): Promise<AssignmentResult[]> {
  const data = await loadCompletion(
    db,
    assignments,
    students.map((s) => s.id),
  );
  const total = (lab: keyof typeof LAB_PROGRESS) => LAB_PROGRESS[lab].total;
  return assignments.map((assignment) => ({
    ...assignment,
    students: students
      .filter((s) => appliesTo(assignment, s))
      .map((s) => {
        const at = completedAt(assignment.target, s.id, data, total);
        return {
          ...s,
          at,
          status: assignmentStatus(at, assignment.dueAt, now),
        };
      }),
  }));
}

// One student's assignments: still open, or due in the window.
export async function studentAssignments(
  db: PrismaClient,
  student: Who,
  since: Date,
  now = Date.now(),
) {
  const assignments = await loadAssignments(db, {
    groups: student.group ? ["", student.group] : [""],
    since,
  });
  const results = await assignmentResults(db, assignments, [student], now);
  return results.map(({ students, ...a }) => ({
    ...a,
    status: students[0].status,
    at: students[0].at,
  }));
}
