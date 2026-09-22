"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import type { ContentKind } from "@/generated/prisma/client";
import { subtypeFields, type FieldConfig } from "@/lib/admin-fields";
import type { Collection } from "@/lib/site";
import { saveContentAction } from "@/app/admin/(cms)/[collection]/actions";
import type { ResourceFile } from "@/lib/resource-files";
import { FileUpload, type UploadedFile } from "./file-upload";
import { ImageEditor, type EditorImage } from "./image-editor";

type SubtypeData = Record<string, unknown> | null | undefined;
type EntryLike = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  category: { name: string } | null;
  tags: { name: string }[];
  related?: { slug: string }[];
  images: { path: string; alt: string; width: number; height: number }[];
} & Record<string, unknown>;

function toDatetimeLocal(value: Date | null | undefined) {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function SubtypeField({
  field,
  value,
}: {
  field: FieldConfig;
  value: unknown;
}) {
  const id = `field-${field.name}`;
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={id}
          name={field.name}
          required={field.required}
          defaultValue={(value as string) ?? ""}
          className="admin-input admin-textarea"
          rows={5}
        />
      );
    case "list":
      return (
        <input
          id={id}
          name={field.name}
          defaultValue={Array.isArray(value) ? value.join(", ") : ""}
          className="admin-input"
        />
      );
    case "checkbox":
      return (
        <input
          id={id}
          name={field.name}
          type="checkbox"
          defaultChecked={Boolean(value)}
          className="admin-checkbox"
        />
      );
    case "select":
      return (
        <select
          id={id}
          name={field.name}
          required={field.required}
          defaultValue={(value as string) ?? field.options?.[0] ?? ""}
          className="admin-input"
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "datetime":
      return (
        <input
          id={id}
          name={field.name}
          type="datetime-local"
          required={field.required}
          defaultValue={
            value instanceof Date
              ? toDatetimeLocal(value)
              : typeof value === "string"
                ? value.slice(0, 16)
                : ""
          }
          className="admin-input"
        />
      );
    default:
      return (
        <input
          id={id}
          name={field.name}
          type={field.type === "url" ? "url" : "text"}
          required={field.required}
          defaultValue={(value as string) ?? ""}
          className="admin-input"
        />
      );
  }
}

export function ContentForm({
  collection,
  kind,
  entry,
  resourceFiles: initialResourceFiles = [],
  availableImages = [],
}: {
  collection: Collection;
  kind: ContentKind;
  entry?: EntryLike | null;
  resourceFiles?: ResourceFile[];
  availableImages?: UploadedFile[];
}) {
  const action = saveContentAction.bind(null, collection, entry?.id ?? null);
  const [state, formAction, pending] = useActionState(action, undefined);
  const fields = subtypeFields[kind];
  const subtypeData = (entry?.[kind.toLowerCase()] as SubtypeData) ?? null;
  const [resourceFiles, setResourceFiles] = useState(initialResourceFiles);
  const [filePath, setFilePath] = useState(String(subtypeData?.filePath ?? ""));
  const [images, setImages] = useState<EditorImage[]>(
    (entry?.images ?? []).map(({ path, alt, width, height }) => ({
      path,
      alt,
      width,
      height,
    })),
  );
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const busy = pending || uploadingFile || uploadingImage;

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          required
          readOnly={!!entry}
          defaultValue={entry?.slug ?? ""}
          className="admin-input"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
        {entry && (
          <span className="admin-help">
            Slugs are permanent. Archive and create a new entry to rename.
          </span>
        )}
      </div>
      <div className="admin-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={entry?.title ?? ""}
          className="admin-input"
        />
      </div>
      <div className="admin-field">
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={2}
          defaultValue={entry?.summary ?? ""}
          className="admin-input admin-textarea"
        />
      </div>
      <div className="admin-field">
        <label htmlFor="body">Body (Markdown)</label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          defaultValue={entry?.body ?? ""}
          className="admin-input admin-textarea"
        />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={entry?.status ?? "DRAFT"}
            className="admin-input"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="publishedAt">Published at</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(entry?.publishedAt)}
            className="admin-input"
          />
        </div>
        <div className="admin-field admin-field-checkbox">
          <label htmlFor="featured">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={entry?.featured ?? false}
              className="admin-checkbox"
            />
            Featured
          </label>
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            defaultValue={entry?.category?.name ?? ""}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            defaultValue={entry?.tags.map((tag) => tag.name).join(", ") ?? ""}
            className="admin-input"
            placeholder="Comma-separated"
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="relatedSlugs">Related slugs</label>
        <input
          id="relatedSlugs"
          name="relatedSlugs"
          defaultValue={entry?.related?.map((r) => r.slug).join(", ") ?? ""}
          className="admin-input"
          placeholder="Comma-separated, must already exist"
        />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="seoTitle">SEO title</label>
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={entry?.seoTitle ?? ""}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="seoDescription">SEO description</label>
          <input
            id="seoDescription"
            name="seoDescription"
            defaultValue={entry?.seoDescription ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      <hr className="admin-divider" />

      {fields.map((field) => (
        <div
          key={field.name}
          className={
            field.type === "checkbox"
              ? "admin-field admin-field-checkbox"
              : "admin-field"
          }
        >
          <label htmlFor={`field-${field.name}`}>
            {field.type === "checkbox" ? null : field.label}
          </label>
          {kind === "RESOURCE" && field.name === "filePath" ? (
            <>
              <select
                id="field-filePath"
                name="filePath"
                required
                className="admin-input"
                value={filePath}
                onChange={(event) => setFilePath(event.target.value)}
              >
                <option value="">Choose a resource file</option>
                {!!subtypeData?.filePath &&
                  !resourceFiles.some(
                    (file) => file.path === subtypeData.filePath,
                  ) && (
                    <option value={String(subtypeData.filePath)}>
                      {String(subtypeData.filePath)} — missing
                    </option>
                  )}
                {resourceFiles.map((file) => (
                  <option
                    key={file.path}
                    value={file.path}
                    disabled={
                      file.status !== "Available" &&
                      file.path !== subtypeData?.filePath
                    }
                  >
                    {file.name ?? file.path.slice("/downloads/".length)} —{" "}
                    {file.status === "Available"
                      ? `${((file.size ?? 0) / 1024).toFixed(1)} KB`
                      : file.status}
                  </option>
                ))}
              </select>
              {resourceFiles.length === 0 && (
                <span className="admin-help">
                  No files available yet. Upload a file below.
                </span>
              )}
              <FileUpload
                kind="RESOURCE"
                onBusy={setUploadingFile}
                disabled={busy}
                onUploaded={(file) => {
                  setResourceFiles((current) => [
                    {
                      path: file.path,
                      name: file.name,
                      size: file.size,
                      status: "Available",
                    },
                    ...current,
                  ]);
                  setFilePath(file.path);
                }}
              />
            </>
          ) : (
            <SubtypeField field={field} value={subtypeData?.[field.name]} />
          )}
          {field.type === "checkbox" && <span>{field.label}</span>}
          {field.help && <span className="admin-help">{field.help}</span>}
        </div>
      ))}

      <ImageEditor
        images={images}
        onChange={setImages}
        busy={busy}
        onBusy={setUploadingImage}
        available={availableImages}
      />

      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={busy} className="button button-primary">
        {pending ? "Saving…" : "Save"}
      </button>
      <Link href={`/admin/${collection}`} className="button button-secondary">
        Back to list
      </Link>
    </form>
  );
}
