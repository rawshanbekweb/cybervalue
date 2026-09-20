import Link from "next/link";
import { ShieldCheck, Code2, ArrowUpRight, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "Playground",
    "Interactive learning labs: a 36-lesson Web Application Security lab and a 12-lesson HTML practice tool — both running directly in the browser.",
    "/playground",
  );

const TOOLS = [
  {
    href: "/playground/web-security-lab",
    eyebrow: "36 lessons",
    title: "Web Security Lab",
    description:
      "Learn the path from browser to database: real HTTP requests, authentication, JWTs, and a hands-on look at exactly how SQLi, XSS, and IDOR work, inside a safe sandbox.",
    link: "Open the lab",
    icon: ShieldCheck,
  },
  {
    href: "/playground/html-basics",
    eyebrow: "12 short exercises",
    title: "HTML Basics",
    description:
      "A code editor and live preview side by side: reinforce HTML fundamentals with a clear task, automatic checks, and a sample solution for every lesson.",
    link: "Start the lessons",
    icon: Code2,
  },
];

export default function PlaygroundPage() {
  return (
    <div className="container">
      <section className="section">
        <SectionHeading number="◆" title="Playground" />
        <p style={{ color: "var(--muted)", maxWidth: "62ch", marginTop: -8, marginBottom: 28 }}>
          Two self-contained interactive learning tools — built entirely into this portfolio, with a real
          backend behind them. Both are small labs built for security education: every vulnerability is
          demonstrated only against deliberately prepared, isolated sandbox data.
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
