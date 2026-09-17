import type { ContentKind } from "@/generated/prisma/client";
import { collections, type Collection } from "./site";
import { subtypeFields, type FieldConfig } from "./admin-fields";
import { imagePath } from "./validation";

function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
function optionalStr(formData: FormData, name: string) {
  const value = str(formData, name);
  return value === "" ? undefined : value;
}
function list(formData: FormData, name: string) {
  return str(formData, name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function toIsoWithOffset(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
function subtypeValue(formData: FormData, field: FieldConfig): unknown {
  switch (field.type) {
    case "list":
      return list(formData, field.name);
    case "checkbox":
      return formData.get(field.name) === "on";
    case "datetime":
      return toIsoWithOffset(str(formData, field.name));
    default:
      return optionalStr(formData, field.name);
  }
}

// Admin forms have no upload UI (see docs/security.md — audited upload
// boundary is deferred). Existing images travel through as an opaque hidden
// field so editing an entry never silently deletes its screenshots; new
// entries simply have none until `content:import` attaches them.
function existingImages(formData: FormData) {
  const raw = str(formData, "imagesJson");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            imagePath.safeParse(item.path).success,
        )
      : [];
  } catch {
    return [];
  }
}

export function formDataToContentInput(
  collection: Collection,
  formData: FormData,
) {
  const kind = collections[collection].kind as ContentKind;
  const categoryName = optionalStr(formData, "category");
  const base = {
    kind,
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    body: str(formData, "body"),
    seoTitle: optionalStr(formData, "seoTitle"),
    seoDescription: optionalStr(formData, "seoDescription"),
    status: optionalStr(formData, "status") ?? "DRAFT",
    featured: formData.get("featured") === "on",
    publishedAt: toIsoWithOffset(str(formData, "publishedAt")),
    category: categoryName
      ? { name: categoryName, slug: slugify(categoryName) }
      : undefined,
    tags: list(formData, "tags").map((name) => ({ name, slug: slugify(name) })),
    relatedSlugs: list(formData, "relatedSlugs"),
    images: existingImages(formData),
  };
  const subtype: Record<string, unknown> = {};
  for (const field of subtypeFields[kind])
    subtype[field.name] = subtypeValue(formData, field);
  return { ...base, [kind.toLowerCase()]: subtype };
}
