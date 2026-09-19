import { HtmlBasics } from "@/components/playground/html-basics/HtmlBasics";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "HTML Basics",
    "12 qisqa amaliyotdan iborat HTML darslari: kod muharriri va jonli ko‘rinish bilan bevosita brauzerda mashq qiling.",
    "/playground/html-basics",
  );

export default function HtmlBasicsPage() {
  return <HtmlBasics />;
}
