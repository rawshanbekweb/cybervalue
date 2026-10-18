import type { Prisma, PrismaClient } from "@/generated/prisma/client";

// The trash: deleting a learner, material, assignment or site entry stores a
// snapshot of it (and of everything deleted with it) for TRASH_DAYS days.
// Restoring writes the same rows back with the same ids, so links, reports
// and certificates keep working. The live tables stay free of soft-delete
// flags, so no other query has to know about the trash.

export const TRASH_DAYS = 30;
const DAY = 86_400_000;

export type TrashKind =
  "student" | "junior" | "kids" | "material" | "assignment" | "content";

export const TRASH_KINDS: TrashKind[] = [
  "student",
  "junior",
  "kids",
  "material",
  "assignment",
  "content",
];

export const isTrashKind = (value: unknown): value is TrashKind =>
  TRASH_KINDS.includes(value as TrashKind);

type Tx = Prisma.TransactionClient;
type Row = Record<string, unknown>;

/** Who may see and restore an item: owners all, teachers their groups. */
export function trashWhere(scope: { owner: boolean; groups: string[] }) {
  if (scope.owner) return {};
  return {
    OR: [
      {
        kind: { in: ["student", "junior", "kids", "assignment"] },
        group: { in: scope.groups },
      },
      { kind: "material" },
    ],
  };
}

export function mayRestore(
  scope: { owner: boolean; groups: string[] },
  item: { kind: string; group: string },
) {
  if (scope.owner) return true;
  if (item.kind === "material") return true;
  if (item.kind === "content") return false;
  return scope.groups.includes(item.group);
}

export const trashExpiry = (deletedAt: Date) =>
  new Date(deletedAt.getTime() + TRASH_DAYS * DAY);

// Snapshots go through JSON, so dates become strings (Prisma accepts them
// back) and null JSON columns must be left out on the way back in.
const json = <T>(value: T) => JSON.parse(JSON.stringify(value)) as Row;
const clean = (row: Row) =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null));
const omit = (row: Row, ...keys: string[]) =>
  Object.fromEntries(Object.entries(row).filter(([k]) => !keys.includes(k)));

const chatSubjects = (kind: "student" | "junior" | "kids", id: string) =>
  kind === "student"
    ? [`student:${id}`, `parent:student:${id}`]
    : [`parent:${kind}:${id}`];

async function trashMembers(
  tx: Tx,
  kind: "student" | "junior" | "kids",
  ids: string[],
  actorId: string | null,
) {
  if (!ids.length) return 0;
  const rows: Row[] =
    kind === "student"
      ? await tx.student.findMany({
          where: { id: { in: ids } },
          include: {
            submissions: true,
            progress: true,
            checkpoints: true,
            labProgress: true,
            certificates: { select: { id: true } },
          },
        })
      : kind === "junior"
        ? await tx.juniorMember.findMany({ where: { id: { in: ids } } })
        : await tx.kidsMember.findMany({ where: { id: { in: ids } } });
  const subjects = rows.flatMap((r) => chatSubjects(kind, r.id as string));
  const chats = await tx.telegramChat.findMany({
    where: { subject: { in: subjects } },
  });
  await tx.trashItem.createMany({
    data: rows.map((row) => {
      const mine = new Set(chatSubjects(kind, row.id as string));
      return {
        kind,
        label: row.name as string,
        group: (row.group as string) ?? "",
        deletedById: actorId,
        data: json({
          ...row,
          certificates: ((row.certificates as { id: string }[]) ?? []).map(
            (c) => c.id,
          ),
          chats: chats.filter((c) => mine.has(c.subject)),
        }) as Prisma.InputJsonValue,
      };
    }),
  });
  const found = rows.map((r) => r.id as string);
  await tx.telegramChat.deleteMany({ where: { subject: { in: subjects } } });
  if (kind === "student")
    await tx.student.deleteMany({ where: { id: { in: found } } });
  else if (kind === "junior")
    await tx.juniorMember.deleteMany({ where: { id: { in: found } } });
  else await tx.kidsMember.deleteMany({ where: { id: { in: found } } });
  return found.length;
}

/** Moves learners to the trash; returns how many were moved. */
export async function trashPeople(
  db: PrismaClient,
  people: { students?: string[]; junior?: string[]; kids?: string[] },
  actorId: string | null,
) {
  return db.$transaction(
    async (tx) =>
      (await trashMembers(tx, "student", people.students ?? [], actorId)) +
      (await trashMembers(tx, "junior", people.junior ?? [], actorId)) +
      (await trashMembers(tx, "kids", people.kids ?? [], actorId)),
    { timeout: 30_000 },
  );
}

export async function trashMaterial(
  db: PrismaClient,
  id: string,
  actorId: string | null,
) {
  return db.$transaction(async (tx) => {
    const row = await tx.studentMaterial.findUnique({
      where: { id },
      include: { submissions: true, progress: true },
    });
    if (!row) return null;
    await tx.trashItem.create({
      data: {
        kind: "material",
        label: row.title,
        deletedById: actorId,
        data: json(row) as Prisma.InputJsonValue,
      },
    });
    await tx.studentMaterial.delete({ where: { id } });
    return row;
  });
}

export async function trashAssignment(
  db: PrismaClient,
  id: string,
  actorId: string | null,
) {
  return db.$transaction(async (tx) => {
    const row = await tx.studentAssignment.findUnique({ where: { id } });
    if (!row) return null;
    await tx.trashItem.create({
      data: {
        kind: "assignment",
        label: row.title,
        group: row.group,
        deletedById: actorId,
        data: json(row) as Prisma.InputJsonValue,
      },
    });
    await tx.studentAssignment.delete({ where: { id } });
    return row;
  });
}

const CONTENT_PARTS = [
  "project",
  "lab",
  "research",
  "ctf",
  "resource",
] as const;

export async function trashContent(
  db: PrismaClient,
  where: Prisma.ContentWhereUniqueInput,
  actorId: string | null,
) {
  return db.$transaction(async (tx) => {
    const row = await tx.content.findUnique({
      where,
      include: {
        project: true,
        lab: true,
        research: true,
        ctf: true,
        resource: true,
        images: true,
        tags: { select: { id: true } },
        related: { select: { id: true } },
        relatedFrom: { select: { id: true } },
      },
    });
    if (!row) return null;
    const files = [
      ...row.images.map((i) => i.path),
      ...(row.resource?.filePath ? [row.resource.filePath] : []),
    ];
    await tx.trashItem.create({
      data: {
        kind: "content",
        label: row.title,
        files,
        deletedById: actorId,
        data: json(row) as Prisma.InputJsonValue,
      },
    });
    await tx.content.delete({ where: { id: row.id } });
    return row;
  });
}

export class RestoreError extends Error {}

async function restoreMember(tx: Tx, kind: TrashKind, data: Row) {
  const { chats, ...rest } = data as Row & { chats?: Row[] };
  if (kind === "student") {
    const {
      submissions = [],
      progress = [],
      checkpoints = [],
      labProgress = [],
      certificates = [],
      ...student
    } = rest as Row & Record<string, Row[] | string[]>;
    await tx.student.create({ data: clean(student) as never });
    // Answers to materials deleted since then cannot come back.
    const materials = new Set(
      (
        await tx.studentMaterial.findMany({
          where: {
            id: {
              in: [...(submissions as Row[]), ...(progress as Row[])].map(
                (r) => r.materialId as string,
              ),
            },
          },
          select: { id: true },
        })
      ).map((m) => m.id),
    );
    const keep = (rows: Row[]) =>
      rows.filter((r) => materials.has(r.materialId as string)).map(clean);
    await tx.studentSubmission.createMany({
      data: keep(submissions as Row[]) as never,
    });
    await tx.studentProgress.createMany({
      data: keep(progress as Row[]) as never,
    });
    await tx.studentCheckpoint.createMany({
      data: (checkpoints as Row[]).map(clean) as never,
      skipDuplicates: true,
    });
    await tx.studentLabProgress.createMany({
      data: (labProgress as Row[]).map(clean) as never,
      skipDuplicates: true,
    });
    if ((certificates as string[]).length)
      await tx.studentCertificate.updateMany({
        where: { id: { in: certificates as string[] }, studentId: null },
        data: { studentId: student.id as unknown as string },
      });
  } else if (kind === "junior") {
    await tx.juniorMember.create({ data: clean(rest) as never });
  } else {
    await tx.kidsMember.create({ data: clean(rest) as never });
  }
  if (chats?.length)
    await tx.telegramChat.createMany({
      data: chats.map(clean) as never,
      skipDuplicates: true,
    });
}

async function restoreMaterial(tx: Tx, data: Row) {
  const {
    submissions = [],
    progress = [],
    ...material
  } = data as Row & Record<string, Row[]>;
  await tx.studentMaterial.create({ data: clean(material) as never });
  const students = new Set(
    (
      await tx.student.findMany({
        where: {
          id: {
            in: [...submissions, ...progress].map((r) => r.studentId as string),
          },
        },
        select: { id: true },
      })
    ).map((s) => s.id),
  );
  const keep = (rows: Row[]) =>
    rows.filter((r) => students.has(r.studentId as string)).map(clean);
  await tx.studentSubmission.createMany({ data: keep(submissions) as never });
  await tx.studentProgress.createMany({ data: keep(progress) as never });
}

async function restoreContent(tx: Tx, data: Row, actorId: string) {
  const {
    images = [],
    tags = [],
    related = [],
    relatedFrom = [],
    ...rest
  } = data as Row & Record<string, Row[]>;
  const content = omit(rest, ...CONTENT_PARTS);
  const ids = (rows: Row[]) => rows.map((r) => r.id as string);
  const [author, tagRows, relatedRows] = await Promise.all([
    tx.user.findUnique({
      where: { id: content.authorId as string },
      select: { id: true },
    }),
    tx.tag.findMany({ where: { id: { in: ids(tags) } }, select: { id: true } }),
    tx.content.findMany({
      where: { id: { in: [...ids(related), ...ids(relatedFrom)] } },
      select: { id: true },
    }),
  ]);
  const alive = new Set(relatedRows.map((r) => r.id));
  const connect = (rows: Row[]) =>
    ids(rows)
      .filter((id) => alive.has(id))
      .map((id) => ({ id }));
  const parts = Object.fromEntries(
    CONTENT_PARTS.filter((key) => rest[key]).map((key) => [
      key,
      { create: clean(omit(rest[key] as unknown as Row, "contentId")) },
    ]),
  );
  const { categoryId, ...scalars } = clean(content);
  const category = categoryId
    ? await tx.category.findUnique({
        where: { id: categoryId as string },
        select: { id: true },
      })
    : null;
  await tx.content.create({
    data: {
      ...omit(scalars, "authorId"),
      author: { connect: { id: author?.id ?? actorId } },
      ...(category ? { category: { connect: { id: category.id } } } : {}),
      ...parts,
      images: { create: images.map((i) => clean(omit(i, "contentId"))) },
      tags: { connect: tagRows.map((t) => ({ id: t.id })) },
      related: { connect: connect(related) },
      relatedFrom: { connect: connect(relatedFrom) },
    } as never,
  });
}

/** Writes an item back and removes it from the trash. */
export async function restoreTrashItem(
  db: PrismaClient,
  id: string,
  actorId: string,
) {
  try {
    return await db.$transaction(async (tx) => {
      const item = await tx.trashItem.findUnique({ where: { id } });
      if (!item) return null;
      const data = item.data as Row;
      if (
        item.kind === "student" ||
        item.kind === "junior" ||
        item.kind === "kids"
      )
        await restoreMember(tx, item.kind, data);
      else if (item.kind === "material") await restoreMaterial(tx, data);
      else if (item.kind === "assignment")
        await tx.studentAssignment.create({ data: clean(data) as never });
      else if (item.kind === "content") await restoreContent(tx, data, actorId);
      await tx.trashItem.delete({ where: { id } });
      return item;
    });
  } catch (error) {
    // A unique field (address, slug, link) is now used by something else.
    if ((error as { code?: string }).code === "P2002")
      throw new RestoreError(
        "Cannot restore: something else now uses the same address or link.",
      );
    throw error;
  }
}

/** Removes items whose 30 days have passed. */
export async function purgeExpiredTrash(db: PrismaClient, now = Date.now()) {
  const { count } = await db.trashItem.deleteMany({
    where: { deletedAt: { lt: new Date(now - TRASH_DAYS * DAY) } },
  });
  return count;
}
