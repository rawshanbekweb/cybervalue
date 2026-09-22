import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_STORAGE_BYTES = 250 * 1024 * 1024;
export class UploadError extends Error {}

export async function readUploadBody(request: Request) {
  const size = Number(request.headers.get("content-length"));
  if (size > MAX_UPLOAD_BYTES)
    throw new UploadError("Files must be 4 MiB or smaller.");
  if (!request.body) throw new UploadError("Choose a file to upload.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_UPLOAD_BYTES) {
        await reader.cancel();
        throw new UploadError("Files must be 4 MiB or smaller.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!length) throw new UploadError("Empty files cannot be uploaded.");
  return Buffer.concat(chunks);
}

export async function prepareUpload(name: string, kind: string, bytes: Buffer) {
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES)
    throw new UploadError("Choose a non-empty file up to 4 MiB.");
  const extension = extname(name).toLowerCase();
  const displayName = name.replace(/[\\/\x00-\x1f\x7f]/g, "_").slice(0, 160);
  if (kind === "IMAGE") {
    if (![".png", ".jpg", ".jpeg", ".webp", ".avif"].includes(extension))
      throw new UploadError("Use a PNG, JPG, WebP or AVIF image.");
    try {
      const source = sharp(bytes, {
        limitInputPixels: 32_000_000,
        failOn: "warning",
      });
      const metadata = await source.metadata();
      if (
        !["png", "jpeg", "webp", "avif", "heif"].includes(
          metadata.format ?? "",
        ) ||
        (metadata.pages ?? 1) > 1
      )
        throw new Error("Unsupported image");
      const { data, info } = await source
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
      if (data.length > MAX_UPLOAD_BYTES) throw new Error("Image is too large");
      return {
        path: `/media/${randomUUID()}.webp`,
        name: displayName,
        kind,
        mimeType: "image/webp",
        size: data.length,
        width: info.width,
        height: info.height,
        data,
      };
    } catch {
      throw new UploadError(
        "This image could not be processed. Use a valid, non-animated image under 32 megapixels.",
      );
    }
  }
  if (kind !== "RESOURCE") throw new UploadError("Unknown upload type.");
  const types: Record<string, string> = {
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
  };
  const mimeType = types[extension];
  if (!mimeType) throw new UploadError("Use a PDF, TXT, MD, CSV or ZIP file.");
  if (extension === ".pdf" && bytes.subarray(0, 5).toString() !== "%PDF-")
    throw new UploadError("The file is not a valid PDF.");
  if (
    extension === ".zip" &&
    !["504b0304", "504b0506", "504b0708"].includes(
      bytes.subarray(0, 4).toString("hex"),
    )
  )
    throw new UploadError("The file is not a valid ZIP archive.");
  if ([".txt", ".md", ".csv"].includes(extension)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new UploadError("Text files must use UTF-8 encoding.");
    }
    if (bytes.includes(0))
      throw new UploadError("Binary content is not allowed in text files.");
  }
  return {
    path: `/downloads/${randomUUID()}${extension}`,
    name: displayName,
    kind,
    mimeType,
    size: bytes.length,
    width: null,
    height: null,
    data: Buffer.from(bytes),
  };
}
