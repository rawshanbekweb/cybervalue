import { ogImage } from "@/lib/og";
export const alt = "CyberValue — Cybersecurity × Software Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return ogImage("Think like an attacker. Build like a developer.");
}
