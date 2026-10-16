import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FlaskConical,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Translator } from "@/lib/i18n";
import type { SiteConfig } from "@/lib/site-config";
import "./directions.css";

type Direction = {
  id: "junior" | "academy";
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  lead: string;
  points: string[];
  href: string;
  action: string;
  extra?: { href: string; label: string };
};

// The site's two directions, side by side: who each is for, what is inside
// and one clear way in. Shown on the home page; sections an admin switched
// off are left out.
export function Directions({
  t,
  config,
  headingLevel = 2,
}: {
  t: Translator;
  config: SiteConfig;
  headingLevel?: 2 | 3;
}) {
  const directions: Direction[] = [
    {
      id: "junior",
      icon: GraduationCap,
      eyebrow: t("FOR SCHOOL STUDENTS · AGES 10–14"),
      title: t("Cybervalue Academy Junior"),
      lead: t(
        "The first step into cybersecurity. No experience and no coding needed.",
      ),
      points: [
        t("6 missions and a mystery case to solve"),
        t("A cipher room from Caesar to Enigma"),
        t("Homework, ranks and a group ranking"),
      ],
      href: "/junior",
      action: t("Enter Junior"),
    },
    {
      id: "academy",
      icon: FlaskConical,
      eyebrow: t("FOR STUDENTS AND BEGINNERS · 15+"),
      title: t("Cybervalue Academy"),
      lead: t(
        "Hands-on labs in the browser: networks, Linux, the web and security.",
      ),
      points: [
        t("Interactive labs with checkpoint tests"),
        t("CTF investigations and a build-and-defend arena"),
        t("A student portal with tests, XP and certificates"),
      ],
      href: "/akademiya",
      action: t("Open the labs"),
      ...(config.sections.studentArea
        ? { extra: { href: "/student", label: t("Student portal") } }
        : {}),
    },
  ];
  const open = directions.filter((d) => config.sections[d.id]);
  if (!open.length) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={`directions directions-${open.length}`}>
      {open.map((d) => (
        <section
          key={d.id}
          className={`direction direction-${d.id}`}
          aria-labelledby={`direction-${d.id}`}
        >
          <span className="direction-ring" aria-hidden="true">
            <d.icon size={22} />
          </span>
          <span className="eyebrow">{d.eyebrow}</span>
          <Heading id={`direction-${d.id}`}>{d.title}</Heading>
          <p>{d.lead}</p>
          <ul>
            {d.points.map((point) => (
              <li key={point}>
                <Check size={15} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <div className="direction-actions">
            <Link href={d.href} className="button button-primary">
              {d.action}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            {d.extra && (
              <Link href={d.extra.href} className="direction-link">
                {d.extra.label}
              </Link>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
