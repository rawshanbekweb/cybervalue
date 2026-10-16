// Particle targets for an animated portrait: { aspect, points } where points is
// a flat list of x, y (0–999, top-left origin) and tone (0–9) triples. Shared
// by the server (which computes them from a photo) and the canvas that draws them.
export type PortraitData = { aspect: number; points: number[] };

export const MAX_PORTRAIT_POINTS = 4000;
// Browsers shrink the photo before sending it, so it fits well inside the
// 1 MB Server Action body limit with room for the multipart overhead.
export const MAX_PORTRAIT_UPLOAD_BYTES = 900 * 1024;

// Stored portraits come back from the database as untyped JSON, and the home
// portrait is fetched over the network, so both are checked before drawing.
export function isPortraitData(value: unknown): value is PortraitData {
  if (!value || typeof value !== "object") return false;
  const { aspect, points } = value as Record<string, unknown>;
  return (
    typeof aspect === "number" &&
    aspect > 0.2 &&
    aspect < 5 &&
    Array.isArray(points) &&
    points.length >= 3 &&
    points.length % 3 === 0 &&
    points.length <= MAX_PORTRAIT_POINTS * 3 &&
    points.every(
      (n) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < 1000,
    )
  );
}
