import type { PrismaClient } from "@/generated/prisma/client";

// The Users page and its CSV export: students, Academy Junior and Academy
// Kids members in one list, filtered, sorted and cut into pages the same way.

export const KINDS = ["all", "student", "junior", "kids"] as const;
export const STATUSES = [
  "all",
  "active",
  "blocked",
  "never",
  "inactive",
] as const;
export const SORTS = ["name", "kind", "group", "last", "status"] as const;
export const PAGE_SIZE = 50;
/** "Inactive" means nothing at all for this long: candidates for clean-up. */
export const INACTIVE_DAYS = 60;
const DAY = 86_400_000;

export type UserFilters = {
  q: string;
  kind: (typeof KINDS)[number];
  status: (typeof STATUSES)[number];
  group: string;
  sort: (typeof SORTS)[number];
  dir: "asc" | "desc";
  page: number;
};

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export function readFilters(params: Params): UserFilters {
  return {
    q: one(params.q).trim().slice(0, 80),
    kind: KINDS.find((k) => k === params.kind) ?? "all",
    status: STATUSES.find((s) => s === params.status) ?? "all",
    group: one(params.group).slice(0, 40),
    sort: SORTS.find((s) => s === params.sort) ?? "name",
    dir: params.dir === "desc" ? "desc" : "asc",
    page: Math.max(1, Math.min(10_000, Math.floor(Number(params.page)) || 1)),
  };
}

/** The query string for these filters, with some values changed. */
export function filtersQuery(
  filters: UserFilters,
  change: Partial<UserFilters> = {},
) {
  const next = { ...filters, ...change };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.kind !== "all") params.set("kind", next.kind);
  if (next.status !== "all") params.set("status", next.status);
  if (next.group) params.set("group", next.group);
  if (next.sort !== "name") params.set("sort", next.sort);
  if (next.dir !== "asc") params.set("dir", next.dir);
  if (next.page > 1) params.set("page", String(next.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export type ListedUser = {
  key: string;
  id: string;
  kind: "student" | "junior" | "kids";
  name: string;
  group: string;
  status: "active" | "blocked" | "expired";
  level: string;
  xp: number | null;
  done: number | null;
  submissions: number | null;
  last: Date | null;
  createdAt: Date;
};

const STATUS_ORDER = { active: 0, expired: 1, blocked: 2 };
const KIND_ORDER = { student: 0, junior: 1, kids: 2 };

export function sortUsers(
  rows: ListedUser[],
  sort: UserFilters["sort"],
  dir: UserFilters["dir"],
) {
  const byName = (a: ListedUser, b: ListedUser) =>
    a.name.localeCompare(b.name, "uz", { sensitivity: "base" });
  const compare: Record<
    UserFilters["sort"],
    (a: ListedUser, b: ListedUser) => number
  > = {
    name: byName,
    kind: (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
    group: (a, b) => a.group.localeCompare(b.group, "uz", { numeric: true }),
    // Never-active people sort as the oldest.
    last: (a, b) => (a.last?.getTime() ?? 0) - (b.last?.getTime() ?? 0),
    status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  };
  const sign = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => sign * compare[sort](a, b) || byName(a, b));
}

const MAX_PER_KIND = 5000;

/** Every user matching the filters, sorted (not yet cut into pages). */
export async function listUsers(
  db: PrismaClient,
  filters: UserFilters,
  now = Date.now(),
) {
  const { q, kind, status, group } = filters;
  const cutoff = new Date(now - INACTIVE_DAYS * DAY);
  const base = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(group ? { group } : {}),
    ...(status === "active" || status === "blocked"
      ? { active: status === "active" }
      : {}),
  };
  // Students only record sign-ins; members also record activity.
  const where = {
    ...base,
    ...(status === "never" ? { lastLoginAt: null } : {}),
    ...(status === "inactive"
      ? {
          createdAt: { lt: cutoff },
          OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }],
        }
      : {}),
  };
  const memberWhere = {
    ...base,
    ...(status === "never" ? { lastLoginAt: null } : {}),
    ...(status === "inactive"
      ? {
          createdAt: { lt: cutoff },
          AND: [
            { OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }] },
            {
              OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }],
            },
          ],
        }
      : {}),
  };
  const [students, juniors, kids] = await Promise.all([
    kind === "junior" || kind === "kids"
      ? []
      : db.student.findMany({
          where,
          take: MAX_PER_KIND,
          select: {
            id: true,
            name: true,
            group: true,
            level: true,
            active: true,
            expiresAt: true,
            lastLoginAt: true,
            createdAt: true,
            _count: { select: { progress: true, submissions: true } },
          },
        }),
    kind === "student" || kind === "kids"
      ? []
      : db.juniorMember.findMany({
          where: memberWhere,
          take: MAX_PER_KIND,
          select: {
            id: true,
            name: true,
            group: true,
            active: true,
            expiresAt: true,
            xp: true,
            lastActiveAt: true,
            lastLoginAt: true,
            createdAt: true,
          },
        }),
    kind === "student" || kind === "junior"
      ? []
      : db.kidsMember.findMany({
          where: memberWhere,
          take: MAX_PER_KIND,
          select: {
            id: true,
            name: true,
            group: true,
            active: true,
            xp: true,
            lastActiveAt: true,
            lastLoginAt: true,
            createdAt: true,
          },
        }),
  ]);
  const statusOf = (u: { active: boolean; expiresAt?: Date | null }) =>
    !u.active
      ? ("blocked" as const)
      : u.expiresAt && u.expiresAt.getTime() <= now
        ? ("expired" as const)
        : ("active" as const);
  const rows: ListedUser[] = [
    ...students.map((s) => ({
      key: `s:${s.id}`,
      id: s.id,
      kind: "student" as const,
      name: s.name,
      group: s.group,
      status: statusOf(s),
      level: s.level,
      xp: null,
      done: s._count.progress,
      submissions: s._count.submissions,
      last: s.lastLoginAt,
      createdAt: s.createdAt,
    })),
    ...juniors.map((j) => ({
      key: `j:${j.id}`,
      id: j.id,
      kind: "junior" as const,
      name: j.name,
      group: j.group,
      status: statusOf(j),
      level: "",
      xp: j.xp,
      done: null,
      submissions: null,
      last: j.lastActiveAt ?? j.lastLoginAt,
      createdAt: j.createdAt,
    })),
    ...kids.map((k) => ({
      key: `k:${k.id}`,
      id: k.id,
      kind: "kids" as const,
      name: k.name,
      group: k.group,
      status: statusOf(k),
      level: "",
      xp: k.xp,
      done: null,
      submissions: null,
      last: k.lastActiveAt ?? k.lastLoginAt,
      createdAt: k.createdAt,
    })),
  ];
  return sortUsers(rows, filters.sort, filters.dir);
}

export async function listGroupNames(db: PrismaClient) {
  const rows = await Promise.all([
    db.student.findMany({ distinct: ["group"], select: { group: true } }),
    db.juniorMember.findMany({ distinct: ["group"], select: { group: true } }),
    db.kidsMember.findMany({ distinct: ["group"], select: { group: true } }),
  ]);
  return [
    ...new Set(
      rows
        .flat()
        .map((r) => r.group)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "uz", { numeric: true }));
}
