import { HackerLogin } from "@/components/concept/HackerLogin";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "Concept: Security Console Login",
    "A hacker-themed login screen concept with a boot sequence, terminal styling, and a simulated authentication flow.",
    "/concept/login",
    true,
  );

export default function ConceptLoginPage() {
  return <HackerLogin />;
}
