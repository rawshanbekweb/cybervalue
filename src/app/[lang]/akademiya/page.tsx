import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Code2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { LearningCatalog } from "@/components/learning-catalog";
import { MissionGateway } from "@/components/mission-gateway";
import { StudioGateway } from "@/components/studio-gateway";
import { CtfGateway } from "@/components/ctf-gateway";
import { DefendGateway } from "@/components/defend-gateway";
import { getLearningTracks } from "@/lib/learning";
import { metadata as buildMetadata } from "@/lib/seo";
import { getSiteConfig, requireSection } from "@/lib/site-config-server";
import type { SectionId } from "@/lib/site-config";
import "@/components/learning.css";

export const generateMetadata = () =>
  buildMetadata(
    "Cybervalue Academy",
    "Hands-on labs in the browser: networks, Linux, HTML and web security, with checkpoint tests, CTF investigations and a student portal.",
    "/akademiya",
  );

export default async function PlaygroundPage() {
  await requireSection("academy");
  const t = await getTranslator();
  const { sections } = await getSiteConfig();
  const tracks = getLearningTracks().filter(
    (track) => sections[track.id as SectionId] !== false,
  );
  const gateways = [
    { id: "ctf", node: <CtfGateway key="ctf" /> },
    { id: "missions", node: <MissionGateway key="missions" /> },
    { id: "studio", node: <StudioGateway key="studio" /> },
    { id: "defend", node: <DefendGateway key="defend" /> },
  ].filter((g) => sections[g.id as SectionId]);
  return (
    <div className="container page-content">
      <header className="page-header learning-header">
        <span className="eyebrow">
          <span className="status-dot" /> {t("CYBERVALUE ACADEMY")}
        </span>
        <h1>
          {t("Academy labs.")}
          <br />
          <span>{t("Learn by doing.")}</span>
        </h1>
        <p>
          {t(
            "Pick a lab, work through short lessons and prove what you learned with a checkpoint test. Signed-in students see every result on their own page.",
          )}
        </p>
        <div className="learning-highlights">
          <span>
            <BookOpen size={16} />
            {tracks.reduce(
              (count, track) => count + track.lessons.length,
              0,
            )}{" "}
            {t("practical lessons")}
          </span>
          <span>
            <Code2 size={16} /> {t("Code & live exercises")}
          </span>
          <span>
            <ShieldCheck size={16} /> {t("Isolated security sandbox")}
          </span>
        </div>
      </header>
      {tracks.length > 0 && (
        <section aria-labelledby="tracks-title">
          <h2 id="tracks-title" className="learning-section-title">
            {t("Choose your learning track")}
          </h2>
          <LearningCatalog tracks={tracks} />
        </section>
      )}
      {gateways.length > 0 && (
        <section aria-labelledby="practice-title">
          <h2 id="practice-title" className="learning-section-title">
            {t("Investigations and projects")}
          </h2>
          <div className="gateway-grid">{gateways.map((g) => g.node)}</div>
        </section>
      )}
      <section className="learning-assessment">
        <span className="learn-icon">
          <Layers size={25} />
        </span>
        <div>
          <span className="eyebrow">ACADEMY INTERMEDIATE</span>
          <h2>{t("The next level is on its way.")}</h2>
          <p>
            {t(
              "See the Intermediate roadmap: web application security, cryptography, network security, forensics, steganography, OSINT and more.",
            )}
          </p>
        </div>
        <Link className="button button-secondary" href="/intermediate">
          {t("Open the roadmap")}
          <ArrowRight size={16} />
        </Link>
      </section>
      <section className="learning-assessment">
        <span className="learn-icon">
          <ClipboardCheck size={25} />
        </span>
        <div>
          <span className="eyebrow">{t("TESTS AND EXAMS")}</span>
          <h2>{t("Every test in one place.")}</h2>
          <p>
            {t(
              "Your teacher’s tests, lab checkpoints, the HTML exam and the resources exam are all listed in the student portal, with your scores.",
            )}
          </p>
        </div>
        <Link className="button button-secondary" href="/student">
          {t("Open the student portal")}
          <ArrowRight size={16} />
        </Link>
      </section>
      <section className="learning-faq" aria-labelledby="learning-faq-title">
        <h2 id="learning-faq-title">{t("Before you begin")}</h2>
        <details>
          <summary>{t("Where should I start?")}</summary>
          <p>
            {t(
              "School students start with Cybervalue Academy Junior. Everyone else: start with the IP addressing or Linux lab, then HTML foundations, then the web security track. Each lab ends with a checkpoint test.",
            )}
          </p>
        </details>
        <details>
          <summary>{t("Will my progress be saved?")}</summary>
          <p>
            {t(
              "Lesson progress and your practice work are saved in this browser. Return on the same browser to continue. Clearing browser data removes this progress, and it does not sync between devices.",
            )}
          </p>
        </details>
        <details>
          <summary>{t("Do I need an account or special software?")}</summary>
          <p>
            {t(
              "No account is needed for the practice tracks. The HTML editor works in your browser. Security exercises use the site’s prepared lab backend. The separate graded assessment requires a teacher-issued code.",
            )}
          </p>
        </details>
      </section>
    </div>
  );
}
