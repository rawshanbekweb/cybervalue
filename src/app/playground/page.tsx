import Link from "next/link";
import { ShieldCheck, Code2, ArrowUpRight, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "Playground",
    "Interaktiv o‘quv laboratoriyalari: 36-bo‘limli Web Application Security lab va 12-bo‘limli HTML amaliyoti — to‘g‘ridan-to‘g‘ri brauzerda ishlaydi.",
    "/playground",
  );

const TOOLS = [
  {
    href: "/playground/web-security-lab",
    eyebrow: "36 bo‘lim · o‘zbek tilida",
    title: "Web Security Lab",
    description:
      "Browserdan databasegacha bo‘lgan yo‘lni o‘rganing: haqiqiy HTTP so‘rovlar, authentication, JWT, va SQLi/XSS/IDOR’ning aynan qanday ishlashini xavfsiz sandboxda ko‘ring.",
    link: "Laboratoriyani ochish",
    icon: ShieldCheck,
  },
  {
    href: "/playground/html-basics",
    eyebrow: "12 qisqa amaliyot",
    title: "HTML Basics",
    description:
      "Kod muharriri va jonli ko‘rinish yonma-yon: har bir dars uchun aniq vazifa, avtomatik tekshiruv va namunaviy yechim bilan HTML asoslarini mustahkamlang.",
    link: "Darslarni boshlash",
    icon: Code2,
  },
];

export default function PlaygroundPage() {
  return (
    <div className="container">
      <section className="section">
        <SectionHeading number="◆" title="Playground" />
        <p style={{ color: "var(--muted)", maxWidth: "62ch", marginTop: -8, marginBottom: 28 }}>
          Ikkita o‘z-o‘zidan ishlaydigan interaktiv o‘quv vositasi — to‘liq shu portfolio ichida, real
          backend bilan. Ular xavfsizlik ta’limi uchun qurilgan kichik laboratoriyalar: har bir zaiflik
          faqat ataylab tayyorlangan, ajratilgan sandbox ma’lumotlar ustida namoyish etiladi.
        </p>
        <div className="playground-grid">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} className="archive-tile" href={tool.href}>
                <div className="tile-top">
                  <Icon size={24} strokeWidth={1.4} />
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <span className="eyebrow">{tool.eyebrow}</span>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <span className="tile-link">
                  {tool.link}
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
