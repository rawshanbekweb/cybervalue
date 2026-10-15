import { JuniorAcademy } from "@/components/playground/junior/JuniorAcademy";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Cybervalue Academy Junior",
    "A first step into cybersecurity for beginners: six short missions on passwords, phishing, ciphers, digital footprint, your first CTF and ethical hacking rules.",
    "/playground/junior",
  );

export default function JuniorPage() {
  return <JuniorAcademy />;
}
