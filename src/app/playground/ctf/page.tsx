import { SignalCTF } from "@/components/playground/ctf/SignalCTF";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "00:17 — So‘nggi signal | CTF",
    "NOVA stansiyasidagi sirni oching: web, kriptografiya, arxiv va loglar bo‘yicha beshta CTF topshirig‘i. Flaglarni toping va so‘nggi signalni tiklang.",
    "/playground/ctf",
  );

export default function CTFPage() {
  return <SignalCTF />;
}
