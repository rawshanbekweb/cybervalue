import type {
  PrismaClient,
  Prisma,
  ContentKind,
  PublicationStatus,
} from "@/generated/prisma/client";
import { include } from "./content-shared";
import type { ContentInput } from "./validation";

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
) {
  return db.$transaction(async (tx) => {
    const existing = await tx.content.findUnique({
      where: { slug: input.slug },
    });
    if (existing && existing.kind !== input.kind)
      throw new Error("An existing slug cannot change content type");
    const related = await tx.content.findMany({
      where: { slug: { in: input.relatedSlugs } },
      select: { id: true },
    });
    if (related.length !== new Set(input.relatedSlugs).size)
      throw new Error("Related entries must exist before referencing them");
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

export async function getAdminEntries(db: PrismaClient, kind?: ContentKind) {
  return db.content.findMany({
    where: kind ? { kind } : undefined,
    include,
    orderBy: [{ updatedAt: "desc" }],
  });
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
) {
  const existing = await db.content.findUniqueOrThrow({ where: { id } });
  return db.content.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : existing.publishedAt,
    },
  });
}

export async function deleteContent(db: PrismaClient, id: string) {
  return db.content.delete({ where: { id } });
}
