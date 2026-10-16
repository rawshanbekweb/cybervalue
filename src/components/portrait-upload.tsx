"use client";
import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useTranslator } from "@/components/locale-provider";
import { MAX_PORTRAIT_UPLOAD_BYTES } from "@/lib/portrait-data";
import type { PortraitFormState } from "@/lib/portrait-upload";

// The portrait needs a few hundred pixels at most, so the browser shrinks the
// photo before sending it. That keeps uploads small and under the Server
// Action body limit, and drops the photo's metadata (location, camera) on the way.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  // A cut-out keeps its transparent background, which marks the silhouette.
  const type =
    file.type === "image/png" || file.type === "image/webp"
      ? "image/webp"
      : "image/jpeg";
  try {
    for (const side of [720, 560, 420]) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas
        .getContext("2d")
        ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, 0.9),
      );
      if (blob && blob.size <= MAX_PORTRAIT_UPLOAD_BYTES) return blob;
    }
  } finally {
    bitmap.close();
  }
  throw new Error("Photo is too large");
}

export function PortraitUploadForm({
  action,
  variant,
  label,
}: {
  action: (
    state: PortraitFormState,
    formData: FormData,
  ) => Promise<PortraitFormState>;
  variant: "admin" | "student";
  label: string;
}) {
  const t = useTranslator();
  const input = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const busy = pending || preparing;
  const error = localError ?? state?.error;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = input.current?.files?.[0];
    if (!file) return setLocalError("Choose a photo first.");
    setLocalError(undefined);
    setPreparing(true);
    try {
      const form = new FormData();
      form.set("photo", await shrink(file), "photo");
      startTransition(() => formAction(form));
      if (input.current) input.current.value = "";
    } catch {
      setLocalError(
        "This image could not be read. Use a PNG, JPG or WebP photo.",
      );
    } finally {
      setPreparing(false);
    }
  }

  const admin = variant === "admin";
  return (
    <form
      onSubmit={submit}
      className={
        admin ? "admin-form portrait-form" : "student-form portrait-form"
      }
    >
      <label
        htmlFor={`portrait-photo-${variant}`}
        className={admin ? undefined : "student-field-label"}
      >
        {label}
      </label>
      <input
        ref={input}
        id={`portrait-photo-${variant}`}
        name="photo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        required
        disabled={busy}
        className={admin ? "admin-input" : "student-input"}
      />
      <p className={admin ? "admin-help" : "student-portrait-hint"}>
        {t(
          "A head-and-shoulders photo against a plain background works best. Only the particle points are kept, not the photo.",
        )}
      </p>
      {error && (
        <p className={admin ? "admin-error" : "student-error"} role="alert">
          {t(error)}
        </p>
      )}
      {!error && state?.success && (
        <p className={admin ? undefined : "student-success"} role="status">
          {t(state.success)}
        </p>
      )}
      <button
        type="submit"
        className={admin ? "button button-primary" : "student-button"}
        disabled={busy}
      >
        {busy ? t("Building the portrait…") : t("Upload photo")}
      </button>
    </form>
  );
}
