"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StoredFileInfo } from "@/lib/stored-files";
import { FileUpload } from "./file-upload";
import { ConfirmButton } from "./confirm-button";
import { deleteStoredFileAction } from "@/app/admin/(cms)/files/actions";

function DeleteFile({ file }: { file: StoredFileInfo }) {
  const [state, action, pending] = useActionState(
    deleteStoredFileAction.bind(null, file.id),
    undefined,
  );
  return (
    <form action={action}>
      <ConfirmButton
        type="submit"
        disabled={pending}
        message={`Delete unused file "${file.name}" permanently?`}
        className="button button-secondary"
      >
        {pending ? "Deleting…" : "Delete file"}
      </ConfirmButton>
      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function FileLibrary({ files }: { files: StoredFileInfo[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="admin-field-row">
        <FileUpload
          kind="RESOURCE"
          disabled={busy}
          onBusy={setBusy}
          onUploaded={() => router.refresh()}
        />
        <FileUpload
          kind="IMAGE"
          disabled={busy}
          onBusy={setBusy}
          onUploaded={() => router.refresh()}
        />
      </div>
      <div className="admin-file-grid">
        {files.map((file) => (
          <article className="admin-file-card" key={file.id}>
            {file.kind === "IMAGE" && (
              <Image
                src={`/admin/file?path=${encodeURIComponent(file.path)}`}
                alt={file.name}
                width={240}
                height={150}
                unoptimized
                className="admin-image-preview"
              />
            )}
            <strong>{file.name}</strong>
            <span className="muted">
              {file.kind === "IMAGE" ? "Image" : "Resource"} ·{" "}
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <a
              className="button button-secondary"
              href={`/admin/file?path=${encodeURIComponent(file.path)}`}
            >
              View file
            </a>
            <DeleteFile file={file} />
          </article>
        ))}
      </div>
      {files.length === 0 && (
        <p className="muted">
          No uploaded files match this view. Upload a file to get started.
        </p>
      )}
    </>
  );
}
