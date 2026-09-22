"use client";
import Image from "next/image";
import { FileUpload, type UploadedFile } from "./file-upload";
export type EditorImage = {
  path: string;
  alt: string;
  width: number;
  height: number;
};

export function ImageEditor({
  images,
  onChange,
  busy,
  onBusy,
  available,
}: {
  images: EditorImage[];
  onChange: (images: EditorImage[]) => void;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  available: UploadedFile[];
}) {
  function attach(file: UploadedFile) {
    if (
      !file.width ||
      !file.height ||
      images.length >= 12 ||
      images.some((item) => item.path === file.path)
    )
      return;
    onChange([
      ...images,
      {
        path: file.path,
        alt: file.name.replace(/\.[^.]+$/, "").slice(0, 100),
        width: file.width,
        height: file.height,
      },
    ]);
  }
  function move(index: number, direction: number) {
    const next = [...images];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  }
  return (
    <section className="admin-image-editor" aria-label="Content images">
      <h2>Images</h2>
      <p className="admin-help">
        Up to 12 images. Add a description for each image; changes take effect
        when you save the entry.
      </p>
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      {images.map((image, index) => (
        <div key={image.path} className="admin-image-item">
          <Image
            src={
              image.path.startsWith("/media/")
                ? `/admin/file?path=${encodeURIComponent(image.path)}`
                : image.path
            }
            alt={image.alt}
            width={160}
            height={100}
            unoptimized
            className="admin-image-preview"
          />
          <div className="admin-field">
            <label htmlFor={`image-alt-${index}`}>
              Image {index + 1} description
            </label>
            <input
              id={`image-alt-${index}`}
              className="admin-input"
              required
              maxLength={100}
              value={image.alt}
              disabled={busy}
              onChange={(event) =>
                onChange(
                  images.map((item, position) =>
                    position === index
                      ? { ...item, alt: event.target.value }
                      : item,
                  ),
                )
              }
            />
            <div className="admin-row-actions">
              <button
                type="button"
                className="button button-secondary"
                disabled={busy || index === 0}
                onClick={() => move(index, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="button button-secondary"
                disabled={busy || index === images.length - 1}
                onClick={() => move(index, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={() =>
                  onChange(images.filter((_, position) => position !== index))
                }
              >
                Remove image {index + 1}
              </button>
            </div>
          </div>
        </div>
      ))}
      {images.length < 12 && (
        <>
          <FileUpload
            kind="IMAGE"
            onUploaded={attach}
            onBusy={onBusy}
            disabled={busy}
          />
          {available.length > 0 && (
            <div className="admin-field">
              <label htmlFor="existing-image">Add from image library</label>
              <select
                id="existing-image"
                className="admin-input"
                value=""
                disabled={busy}
                onChange={(event) => {
                  const file = available.find(
                    (item) => item.path === event.target.value,
                  );
                  if (file) attach(file);
                }}
              >
                <option value="">Choose an uploaded image</option>
                {available
                  .filter(
                    (file) => !images.some((item) => item.path === file.path),
                  )
                  .map((file) => (
                    <option key={file.path} value={file.path}>
                      {file.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </>
      )}
    </section>
  );
}
