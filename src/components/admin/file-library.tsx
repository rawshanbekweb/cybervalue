"use client";
import { useTranslator } from "@/components/locale-provider";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StoredFileInfo } from "@/lib/stored-files";
import { FileUpload } from "./file-upload";
import { ConfirmButton } from "./confirm-button";
import { deleteStoredFileAction } from "@/app/admin/(cms)/files/actions";

function DeleteFile({ file }: { file: StoredFileInfo }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    deleteStoredFileAction.bind(null, file.id),
    undefined,
  );
  return (
    <form action={action}>
      <ConfirmButton
        type="submit"
        disabled={pending}
        message={t("Delete unused file “{name}” permanently?", {
          name: file.name,
        })}
        className="button button-danger"
      >
        {pending ? t("Deleting…") : t("Delete file")}
      </ConfirmButton>
      {state?.error && (
        <p role="alert" className="admin-error">
          {t(state.error)}
        </p>
      )}
    </form>
  );
}

export function FileLibrary({ files }: { files: StoredFileInfo[] }) {
  const t = useTranslator();
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
              {file.kind === "IMAGE" ? t("Image") : t("Resource")} ·{" "}
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <div className="admin-file-actions">
              <a
                className="button button-secondary"
                href={`/admin/file?path=${encodeURIComponent(file.path)}`}
              >
                {t("View file")}
              </a>
              <DeleteFile file={file} />
            </div>
          </article>
        ))}
      </div>
      {files.length === 0 && (
        <p className="muted">
          {t(
            "No uploaded files match this view. Upload a file to get started.",
          )}
        </p>
      )}
    </>
  );
}
