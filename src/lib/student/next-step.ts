// The one thing a student should do next, shown at the top of their page so
// nobody has to scroll to find where to start. In order: an open assignment
// (the nearest deadline), the entrance exam, the teacher's materials, a lab
// already started, then a new lab.
import { LAB_META, LAB_PROGRESS, type LabId } from "../lab-progress";
import { targetHref, type Target } from "./assignments";

export type NextStep =
  | {
      kind: "assignment";
      title: string;
      href: string;
      dueAt: Date;
    }
  | { kind: "entrance"; title: string; href: string }
  | { kind: "material"; title: string; href: string }
  | {
      kind: "lab";
      lab: LabId;
      href: string;
      done: number;
      total: number;
    }
  | { kind: "done" };

type Assignment = {
  title: string;
  dueAt: Date;
  status: string;
  target: Target;
  material: { slug: string } | null;
};
type Material = { id: string; slug: string; title: string };

export function nextStep({
  assignments,
  entrance,
  materials,
  done,
  labs,
}: {
  assignments: Assignment[];
  entrance: Material[];
  materials: Material[];
  done: Set<string>;
  /** Lessons finished per lab. */
  labs: Partial<Record<LabId, number>>;
}): NextStep {
  const open = assignments
    .filter((a) => a.status === "open")
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())[0];
  if (open)
    return {
      kind: "assignment",
      title: open.title,
      href: targetHref(open.target, open.material?.slug),
      dueAt: open.dueAt,
    };
  const exam = entrance.find((m) => !done.has(m.id));
  if (exam)
    return {
      kind: "entrance",
      title: exam.title,
      href: `/student/m/${exam.slug}`,
    };
  const material = materials.find((m) => !done.has(m.id));
  if (material)
    return {
      kind: "material",
      title: material.title,
      href: `/student/m/${material.slug}`,
    };
  const lab = (id: LabId) => ({
    kind: "lab" as const,
    lab: id,
    href: LAB_META.find((l) => l.id === id)!.href,
    done: labs[id] ?? 0,
    total: LAB_PROGRESS[id].total,
  });
  const started = LAB_META.find(
    (l) =>
      (labs[l.id] ?? 0) > 0 && (labs[l.id] ?? 0) < LAB_PROGRESS[l.id].total,
  );
  if (started) return lab(started.id);
  const fresh = LAB_META.find(
    (l) => (labs[l.id] ?? 0) < LAB_PROGRESS[l.id].total,
  );
  return fresh ? lab(fresh.id) : { kind: "done" };
}
