"use client";
import { useId, useRef, useState } from "react";

export type UploadedFile = {
  id: string;
  path: string;
  name: string;
  kind: string;
  size: number;
  width: number | null;
  height: number | null;
};

export function FileUpload({
  kind,
  onUploaded,
  onBusy,
  disabled = false,
}: {
  kind: "RESOURCE" | "IMAGE";
  onUploaded: (file: UploadedFile) => void;
  onBusy?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function upload(file: File) {
    setError("");
    setMessage("");
    if (!file.size || file.size > 4 * 1024 * 1024) {
      setError("Choose a non-empty file up to 4 MiB.");
      return;
    }
    setBusy(true);
    onBusy?.(true);
    try {
      const response = await fetch("/admin/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
          "X-File-Kind": kind,
        },
        body: file,
      });
      if (!response.headers.get("content-type")?.includes("application/json"))
        throw new Error(
          "Upload failed. Check the server upload limit and try a smaller file.",
        );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Upload failed.");
      onUploaded(result.file);
      setMessage(`${file.name} uploaded.`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Upload failed.");
    } finally {
      setBusy(false);
      onBusy?.(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="admin-upload">
      <label htmlFor={id}>
        {kind === "IMAGE" ? "Upload image" : "Upload resource file"}
      </label>
      <input
        ref={input}
        id={id}
        type="file"
        disabled={disabled || busy}
        accept={
          kind === "IMAGE"
            ? ".png,.jpg,.jpeg,.webp,.avif"
            : ".pdf,.txt,.md,.csv,.zip"
        }
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <span className="admin-help">
        Up to 4 MiB.{" "}
        {kind === "IMAGE"
          ? "PNG, JPG, WebP or AVIF. Images are optimized automatically."
          : "PDF, TXT, MD, CSV or ZIP."}
      </span>
      {busy && <span role="status">Uploading…</span>}
      {message && (
        <span role="status" className="admin-help">
          {message}
        </span>
      )}
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
    </div>
  );
}
