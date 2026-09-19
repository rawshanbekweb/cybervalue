import { SecurityLab } from "@/components/playground/security-lab/SecurityLab";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "Web Security Lab",
    "36-bo‘limli interaktiv Web Application Security laboratoriyasi: real HTTP so‘rovlar, SQLi, XSS va IDOR namoyishi.",
    "/playground/web-security-lab",
  );

export default function WebSecurityLabPage() {
  return <SecurityLab />;
}
