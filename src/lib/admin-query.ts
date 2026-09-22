import { z } from "zod";
import type { ContentKind, Prisma } from "@/generated/prisma/client";

export const publicationStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
const querySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  status: z.enum(["", "DRAFT", "PUBLISHED", "ARCHIVED"]).catch(""),
  sort: z.enum(["updated", "oldest", "title"]).catch("updated"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});
export type AdminQuery = z.infer<typeof querySchema>;
export const ADMIN_PAGE_SIZE = 20;

export function parseAdminQuery(
  input: Record<string, string | string[] | undefined>,
) {
  return querySchema.parse(input);
}

export function adminWhere(
  kind: ContentKind,
  query: AdminQuery,
): Prisma.ContentWhereInput {
  return {
    kind,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            { summary: { contains: query.q, mode: "insensitive" } },
            ...(kind === "RESOURCE"
              ? [
                  {
                    resource: {
                      is: {
                        topic: {
                          contains: query.q,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  },
                  {
                    resource: {
                      is: {
                        type: {
                          contains: query.q,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  },
                ]
              : []),
          ],
        }
      : {}),
  };
}

export function adminPageHref(
  collection: string,
  query: AdminQuery,
  page: number,
) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.sort !== "updated") params.set("sort", query.sort);
  params.set("page", String(page));
  return `/admin/${collection}?${params}`;
}
