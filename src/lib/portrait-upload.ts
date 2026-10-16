import { MAX_PORTRAIT_UPLOAD_BYTES, type PortraitData } from "./portrait-data";
import { PortraitError, portraitFromImage } from "./portrait";

export type PortraitFormState =
  { error?: string; success?: string } | undefined;

// Reads the "photo" field of a portrait form and turns it into particle points.
export async function portraitFromForm(
  formData: FormData,
): Promise<{ data: PortraitData } | { error: string }> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0)
    return { error: "Choose a photo first." };
  if (photo.size > MAX_PORTRAIT_UPLOAD_BYTES)
    return { error: "This photo is too large. Use one under 1 MB." };
  try {
    return {
      data: await portraitFromImage(Buffer.from(await photo.arrayBuffer())),
    };
  } catch (error) {
    return {
      error:
        error instanceof PortraitError
          ? error.message
          : "The portrait could not be made. Try another photo.",
    };
  }
}
