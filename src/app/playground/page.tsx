import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Code2,
  ShieldCheck,
} from "lucide-react";
import { LearningCatalog } from "@/components/learning-catalog";
import { MissionGateway } from "@/components/mission-gateway";
import { StudioGateway } from "@/components/studio-gateway";
import { CtfGateway } from "@/components/ctf-gateway";
import { getLearningTracks } from "@/lib/learning";
import { metadata as buildMetadata } from "@/lib/seo";
import "@/components/learning.css";

export const generateMetadata = () =>
  buildMetadata(
    "Playground",
    "Practice HTML and web application security with 48 interactive lessons, searchable learning tracks, and progress saved in your browser.",
    "/playground",
  );

export default function PlaygroundPage() {
  const tracks = getLearningTracks();
  return (
    <div className="container page-content">
      <header className="page-header learning-header">
        <span className="eyebrow">
          <span className="status-dot" /> THE INTERACTIVE WORKSPACE
        </span>
        <h1>
          Learn it. Build it.
          <br />
          <span>Make it yours.</span>
        </h1>
        <p>
          A place to experiment, make mistakes, and understand what happens
          next. Start with HTML or follow a request all the way through a web
          application.
        </p>
        <div className="learning-highlights">
          <span>
            <BookOpen size={16} />
            {tracks.reduce(
              (count, track) => count + track.lessons.length,
              0,
            )}{" "}
            practical lessons
          </span>
          <span>
            <Code2 size={16} /> Code & live exercises
          </span>
          <span>
            <ShieldCheck size={16} /> Isolated security sandbox
          </span>
        </div>
      </header>
      <CtfGateway />
      <MissionGateway />
      <StudioGateway />
      <section aria-labelledby="tracks-title">
        <h2 id="tracks-title" className="learning-section-title">
          Choose your learning track
        </h2>
        <LearningCatalog tracks={tracks} />
      </section>
      <section className="learning-assessment">
        <span className="learn-icon">
          <ClipboardCheck size={25} />
        </span>
        <div>
          <span className="eyebrow">READY FOR THE NEXT STEP?</span>
          <h2>Put your HTML skills to the test.</h2>
          <p>
            A timed assessment with automatic grading. You’ll need an access
            code from your teacher.
          </p>
        </div>
        <Link
          className="button button-secondary"
          href="/playground/html-basics/assessment"
        >
          Open assessment <ArrowRight size={16} />
        </Link>
      </section>
      <section className="learning-faq" aria-labelledby="learning-faq-title">
        <h2 id="learning-faq-title">Before you begin</h2>
        <details>
          <summary>Where should I start?</summary>
          <p>
            New to building websites? Start with HTML foundations. If you
            already understand basic page structure, the security track begins
            with architecture and works toward HTTP, identity, and
            vulnerabilities.
          </p>
        </details>
        <details>
          <summary>Will my progress be saved?</summary>
          <p>
            Lesson progress and your practice work are saved in this browser.
            Return on the same browser to continue. Clearing browser data
            removes this progress, and it does not sync between devices.
          </p>
        </details>
        <details>
          <summary>Do I need an account or special software?</summary>
          <p>
            No account is needed for the practice tracks. The HTML editor works
            in your browser. Security exercises use the site’s prepared lab
            backend. The separate graded assessment requires a teacher-issued
            code.
          </p>
        </details>
      </section>
    </div>
  );
}
