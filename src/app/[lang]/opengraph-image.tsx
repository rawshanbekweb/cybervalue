import { ogImage } from "@/lib/og";
export const alt = "CyberValue — Cybersecurity × Software Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
import { locales } from "@/lib/i18n";
export const revalidate = 3600;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
export default function Image() {
  return ogImage("Think like an attacker. Build like a developer.");
}
