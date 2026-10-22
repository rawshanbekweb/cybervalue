/**
 * Staff roles. "owner" and "admin" run the whole site; only an owner manages
 * other owners and admins. "teacher" works in /teacher with their own groups.
 */
export const STAFF_ROLES = ["owner", "admin", "teacher"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const roleOf = (user: { role: string }): StaffRole =>
  user.role === "teacher" || user.role === "admin" ? user.role : "owner";

/** The panel a person lands on after signing in. */
export const homeOf = (user: { role: string }) =>
  roleOf(user) === "teacher" ? "/teacher" : "/admin";

/** Whether a path may be the destination after signing in. */
export const isStaffPath = (path: string) =>
  /^\/(admin|teacher)(\/|\?|$)/.test(path);

/** Admins manage teachers; owners manage everyone. */
export function mayManage(actor: { role: string }, ...roles: StaffRole[]) {
  const role = roleOf(actor);
  return (
    role === "owner" ||
    (role === "admin" && roles.every((r) => r === "teacher"))
  );
}

// Group choices on pages that list people. Owners can pick one group or all
// of them ("" ); a teacher picks one of their own groups, and "" means all of
// their groups, never everyone.

export type GroupPick = string | string[];

/** The groups a person may choose from, and what was chosen. */
export function pickGroup(
  scope: { owner: boolean; groups: string[] },
  available: string[],
  requested: unknown,
) {
  const value = typeof requested === "string" ? requested : "";
  const groups = scope.owner
    ? available
    : available.filter((g) => scope.groups.includes(g));
  if (groups.includes(value)) return { groups, group: value as GroupPick };
  return { groups, group: (scope.owner ? "" : groups) as GroupPick };
}

/** The Prisma condition for a pick: nothing, one group or a list. */
export function groupCondition(group: GroupPick) {
  if (Array.isArray(group)) return { group: { in: group } };
  return group ? { group } : {};
}

/** A short label for file names and headings. */
export const groupLabel = (group: GroupPick) =>
  Array.isArray(group) ? "" : group;
