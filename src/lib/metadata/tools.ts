// Academy Intermediate · Metadata: what a photo's EXIF gives away (where and
// with what it was taken), turning its GPS degrees-minutes-seconds into a
// place, and which tags to strip before publishing without breaking the
// picture. Simplified, but the tag names are exiftool's.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- GPS -----------------------------------------------------------------------------------

export type Dms = {
  deg: number;
  min: number;
  sec: number;
  ref: "N" | "S" | "E" | "W";
};

export function toDecimal(d: Dms) {
  const v = d.deg + d.min / 60 + d.sec / 3600;
  return d.ref === "S" || d.ref === "W" ? -v : v;
}

export const dmsText = (d: Dms) =>
  `${d.deg} deg ${d.min}' ${d.sec.toFixed(1)}" ${d.ref}`;

export const LAT: Dms = { deg: 39, min: 39, sec: 17.4, ref: "N" };
export const LON: Dms = { deg: 66, min: 58, sec: 32.1, ref: "E" };

export type City = { id: string; name: Text; lat: number; lon: number };

export const CITIES: City[] = [
  {
    id: "tashkent",
    name: t("Toshkent", "Tashkent"),
    lat: 41.3111,
    lon: 69.2797,
  },
  {
    id: "samarkand",
    name: t("Samarqand", "Samarkand"),
    lat: 39.6542,
    lon: 66.9597,
  },
  { id: "bukhara", name: t("Buxoro", "Bukhara"), lat: 39.7747, lon: 64.4286 },
  { id: "khiva", name: t("Xiva", "Khiva"), lat: 41.3783, lon: 60.3639 },
];

/** Rough distance in km between two points (equirectangular, fine nearby). */
export function km(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const x = (bLon - aLon) * rad * Math.cos(((aLat + bLat) / 2) * rad);
  const y = (bLat - aLat) * rad;
  return Math.sqrt(x * x + y * y) * 6371;
}

/** The city nearest to where the photo was taken. */
export function nearest() {
  const lat = toDecimal(LAT);
  const lon = toDecimal(LON);
  return [...CITIES].sort(
    (a, b) => km(lat, lon, a.lat, a.lon) - km(lat, lon, b.lat, b.lon),
  )[0];
}

/** The photo's EXIF as exiftool would list it. */
export const EXIF: [string, string][] = [
  ["File Name", "IMG_4417.jpg"],
  ["Make", "Apple"],
  ["Camera Model Name", "iPhone 14"],
  ["Lens Serial Number", "F4N2K8Q1"],
  ["Date/Time Original", "2026:09:14 18:42:07"],
  ["Offset Time Original", "+05:00"],
  ["Image Width", "4032"],
  ["Image Height", "3024"],
  ["Orientation", "Rotate 90 CW"],
  ["GPS Latitude", dmsText(LAT)],
  ["GPS Longitude", dmsText(LON)],
  ["Artist", "Aziza Karimova"],
];

// --- Stripping -------------------------------------------------------------------------------

export type Tag = {
  name: string;
  /** The exiftool option that deletes it. */
  flag: string;
  /** Reveals who, where, when or with which device. */
  private: boolean;
  /** Needed to display the picture correctly. */
  display: boolean;
};

export const TAGS: Tag[] = [
  {
    name: "GPS Latitude / GPS Longitude",
    flag: "-gps:all=",
    private: true,
    display: false,
  },
  { name: "Artist", flag: "-Artist=", private: true, display: false },
  {
    name: "Lens Serial Number",
    flag: "-LensSerialNumber=",
    private: true,
    display: false,
  },
  {
    name: "Date/Time Original",
    flag: "-DateTimeOriginal=",
    private: true,
    display: false,
  },
  { name: "Orientation", flag: "-Orientation=", private: false, display: true },
  {
    name: "Color Space (sRGB)",
    flag: "-ColorSpace=",
    private: false,
    display: true,
  },
];

/** Remove every private tag; keep the ones the picture needs to show right. */
export const stripSolved = (removed: string[]) =>
  TAGS.every((tag) => removed.includes(tag.name) === tag.private);
