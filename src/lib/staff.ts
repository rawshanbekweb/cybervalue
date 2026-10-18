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
