import type {
  PrismaClient,
  Prisma,
  ContentKind,
  PublicationStatus,
} from "@/generated/prisma/client";
import { include } from "./content-shared";
import type { ContentInput } from "./validation";
import {
  ADMIN_PAGE_SIZE,
  adminWhere,
  type AdminQuery,
  publicationStatusSchema,
} from "./admin-query";
import { lockFileChanges, resourceFileInfo } from "./stored-files";

export class ContentWriteError extends Error {}

type WriteMode = { mode: "create" } | { mode: "edit"; id: string };

function details(input: ContentInput) {
  switch (input.kind) {
    case "PROJECT":
      return {
        project: {
          upsert: {
            create: input.project,
            update: {
              ...input.project,
              repositoryUrl: input.project.repositoryUrl ?? null,
              liveUrl: input.project.liveUrl ?? null,
            },
          },
        },
      };
    case "LAB":
      return { lab: { upsert: { create: input.lab, update: input.lab } } };
    case "RESEARCH":
      return {
        research: {
          upsert: { create: input.research, update: input.research },
        },
      };
    case "CTF": {
      const value = {
        ...input.ctf,
        eventDate: new Date(input.ctf.eventDate),
        location: input.ctf.location ?? null,
        placement: input.ctf.placement ?? null,
      };
      return { ctf: { upsert: { create: value, update: value } } };
    }
    case "RESOURCE":
      return {
        resource: {
          upsert: { create: input.resource, update: input.resource },
        },
      };
  }
}

export async function writeContent(
  db: PrismaClient,
  input: ContentInput,
  authorId: string,
  options?: WriteMode,
) {
  return db.$transaction(async (tx) => {
    const existing = await tx.content.findUnique({
      where: { slug: input.slug },
    });
    if (options?.mode === "create" && existing)
      throw new ContentWriteError(
        "This slug already exists. Choose another slug or edit the existing entry.",
      );
    if (options?.mode === "edit" && (!existing || existing.id !== options.id))
      throw new ContentWriteError(
        "This entry no longer exists or its slug has changed. Reload the page.",
      );
    if (existing && existing.kind !== input.kind)
      throw new ContentWriteError(
        "An existing slug cannot change content type",
      );
    await lockFileChanges(tx);
    if (options && input.kind === "RESOURCE" && input.status === "PUBLISHED") {
      const file = await resourceFileInfo(tx, input.resource.filePath);
      if (file.status !== "Available")
        throw new ContentWriteError(
          `Cannot publish: resource file is ${file.status.toLowerCase()}. Choose an available file.`,
        );
    }
    for (const image of input.images.filter((item) =>
      item.path.startsWith("/media/"),
    )) {
      const stored = await tx.storedFile.findUnique({
        where: { path: image.path },
        select: { kind: true, width: true, height: true },
      });
      if (
        !stored ||
        stored.kind !== "IMAGE" ||
        image.width !== stored.width ||
        image.height !== stored.height
      )
        throw new ContentWriteError(
          "An attached image is unavailable. Remove it and upload it again.",
        );
    }
    const related = await tx.content.findMany({
      where: { slug: { in: input.relatedSlugs } },
      select: { id: true },
    });
    if (related.length !== new Set(input.relatedSlugs).size)
      throw new ContentWriteError(
        "Related entries must exist before referencing them",
      );
    const category = input.category
      ? await tx.category.upsert({
          where: { slug: input.category.slug },
          create: input.category,
          update: { name: input.category.name },
        })
      : null;
    const tags = [];
    for (const tag of input.tags)
      tags.push(
        await tx.tag.upsert({
          where: { slug: tag.slug },
          create: tag,
          update: { name: tag.name },
        }),
      );
    const base = {
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      body: input.body,
      status: input.status,
      featured: input.featured,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    };
    const record = existing
      ? await tx.content.update({
          where: { id: existing.id },
          data: { ...base, categoryId: category?.id ?? null },
        })
      : await tx.content.create({
          data: {
            ...base,
            slug: input.slug,
            authorId,
            categoryId: category?.id,
          },
        });
    const update: Prisma.ContentUpdateInput = {
      ...details(input),
      tags: { set: tags.map((tag) => ({ id: tag.id })) },
      related: { set: related },
      images: {
        deleteMany: {},
        create: input.images.map((image, position) => ({
          ...image,
          position,
        })),
      },
    };
    await tx.content.update({ where: { id: record.id }, data: update });
    return tx.content.findUniqueOrThrow({ where: { id: record.id }, include });
  });
}

const adminInclude = {
  ...include,
  related: { select: { slug: true } },
} satisfies Prisma.ContentInclude;

export async function getAdminEntries(
  db: PrismaClient,
  kind: ContentKind,
  query: AdminQuery,
) {
  const where = adminWhere(kind, query);
  const total = await db.content.count({ where });
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const entries = await db.content.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      publishedAt: true,
      resource: true,
    },
    orderBy:
      query.sort === "title"
        ? [{ title: "asc" }, { id: "asc" }]
        : [
            { updatedAt: query.sort === "oldest" ? "asc" : "desc" },
            { id: "asc" },
          ],
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });
  return { entries, total, pages, page };
}

export async function getAdminEntryBySlug(
  db: PrismaClient,
  kind: ContentKind,
  slug: string,
) {
  return db.content.findFirst({
    where: { kind, slug },
    include: adminInclude,
  });
}

export async function setContentStatus(
  db: PrismaClient,
  id: string,
  status: PublicationStatus,
  kind: ContentKind,
) {
  publicationStatusSchema.parse(status);
  const existing = await db.content.findUniqueOrThrow({
    where: { id, kind },
    include: { resource: true, lab: true },
  });
  if (status === "PUBLISHED") {
    if (kind === "LAB" && !existing.lab?.authorized)
      throw new ContentWriteError("Only authorized labs can be published.");
    if (kind === "RESOURCE") {
      const file =
        existing.resource &&
        (await resourceFileInfo(db, existing.resource.filePath));
      if (!file || file.status !== "Available")
        throw new ContentWriteError(
          "Cannot publish: choose an available resource file (maximum 20 MiB) in the editor first.",
        );
    }
  }
  return db.content.update({
    where: { id, kind, updatedAt: existing.updatedAt },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : existing.publishedAt,
    },
  });
}

export async function deleteContent(
  db: PrismaClient,
  id: string,
  kind: ContentKind,
) {
  return db.content.delete({ where: { id, kind } });
}
