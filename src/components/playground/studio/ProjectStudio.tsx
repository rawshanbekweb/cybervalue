"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  Download,
  Play,
  RotateCcw,
} from "lucide-react";
import { STUDIO_PROJECTS, type StudioProject } from "@/lib/studio/projects";
import { checkProject, type StudioCheck } from "@/lib/studio/checks";
import { buildPreview } from "@/lib/studio/preview";
import {
  restoreDraft,
  HTML_LIMIT,
  CSS_LIMIT,
  NOTES_LIMIT,
  type StudioDraft,
} from "@/lib/studio/draft";
import { useLocalStorageState } from "../useLocalStorageState";
import { downloadText } from "../security-lab/storage";
import "./studio.css";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
function selectedProject() {
  return (
    STUDIO_PROJECTS.find(
      (project) => window.location.hash === `#project/${project.id}`,
    )?.id ?? "incident"
  );
}

export function ProjectStudio() {
  const selected = useSyncExternalStore(
    subscribe,
    selectedProject,
    () => "incident",
  );
  const project =
    STUDIO_PROJECTS.find((item) => item.id === selected) ?? STUDIO_PROJECTS[0];
  return (
    <div className="studio-root container">
      <header className="studio-header">
        <Link href="/playground" className="studio-back">
          <ArrowLeft size={15} /> Playground
        </Link>
        <span className="eyebrow">
          <span className="status-dot" /> THE PROJECT STUDIO
        </span>
        <h1>
          A brief. A blank canvas.
          <br />
          <span>Your next build.</span>
        </h1>
        <p>
          Make something useful with HTML and CSS. Test the structure. Refine
          the experience.
        </p>
      </header>
      <nav className="studio-projects" aria-label="Choose a project">
        {STUDIO_PROJECTS.map((item, index) => (
          <a
            key={item.id}
            href={`#project/${item.id}`}
            aria-current={item.id === selected ? "page" : undefined}
          >
            <span className="eyebrow">
              0{index + 1} / {item.level}
            </span>
            <strong>{item.title}</strong>
            <span>
              {item.client} <ArrowUpRight size={15} />
            </span>
          </a>
        ))}
      </nav>
      <Workspace key={project.id} project={project} />
    </div>
  );
}

function Workspace({ project }: { project: StudioProject }) {
  const [stored, setStored] = useLocalStorageState<unknown>(
    `cybervalue:studio:${project.id}:v1`,
    null,
  );
  const draft = useMemo(() => restoreDraft(stored, project), [stored, project]);
  const [editor, setEditor] = useState<"html" | "css">("html");
  const [width, setWidth] = useState("100%");
  const [checked, setChecked] = useState<{
    html: string;
    css: string;
    results: StudioCheck[];
  } | null>(null);
  const [notice, setNotice] = useState("");
  const deferredHtml = useDeferredValue(draft.html);
  const deferredCss = useDeferredValue(draft.css);
  const preview = useMemo(
    () => buildPreview(deferredHtml, deferredCss),
    [deferredHtml, deferredCss],
  );
  const results =
    checked?.html === draft.html && checked.css === draft.css
      ? checked.results
      : null;
  const passed = results?.filter((result) => result.passed).length ?? 0;
  const update = (change: Partial<StudioDraft>) => {
    setStored({ ...draft, ...change });
    setNotice("");
  };

  return (
    <div className="studio-workspace">
      <aside className="studio-brief" aria-labelledby="studio-brief-title">
        <span className="eyebrow">YOUR CLIENT BRIEF / FICTIONAL PROJECT</span>
        <h2 id="studio-brief-title">{project.title}</h2>
        <p>{project.brief}</p>
        <h3>What to deliver</h3>
        <ol>
          {project.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <details className="studio-hints">
          <summary>Need a starting point?</summary>
          <ul>
            {project.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </details>
        <Link href="/playground/html-basics" className="studio-back">
          Review HTML foundations <ArrowUpRight size={15} />
        </Link>
      </aside>
      <div className="studio-bench">
        <section className="studio-panel" aria-label="Code editor">
          <div className="studio-toolbar">
            <div role="group" aria-label="Choose editor">
              <button
                aria-pressed={editor === "html"}
                onClick={() => setEditor("html")}
              >
                <Code2 size={15} /> HTML
              </button>
              <button
                aria-pressed={editor === "css"}
                onClick={() => setEditor("css")}
              >
                CSS
              </button>
            </div>
            <span className="studio-caption">
              {draft[editor].length.toLocaleString()} /{" "}
              {(editor === "html" ? HTML_LIMIT : CSS_LIMIT).toLocaleString()}{" "}
              characters
            </span>
          </div>
          <label className="sr-only" htmlFor="studio-code">
            {editor === "html" ? "HTML source" : "CSS source"}
          </label>
          <textarea
            id="studio-code"
            className="studio-code"
            value={draft[editor]}
            maxLength={editor === "html" ? HTML_LIMIT : CSS_LIMIT}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={(event) => update({ [editor]: event.target.value })}
          />
          <div className="studio-toolbar studio-actions">
            <button
              className="button button-primary"
              onClick={() => {
                setChecked({
                  html: draft.html,
                  css: draft.css,
                  results: checkProject(project.id, draft.html),
                });
              }}
            >
              <Play size={15} /> Check structure
            </button>
            <button
              onClick={() => {
                downloadText(
                  `${project.id}.html`,
                  buildPreview(draft.html, draft.css),
                  "text/html",
                );
                setNotice(
                  "Exported your preview as an HTML file with embedded CSS.",
                );
              }}
            >
              <Download size={15} /> Export HTML
            </button>
            <button
              onClick={() => {
                if (
                  !window.confirm(
                    "Reset this project's HTML, CSS, and notes to the starter? Your current draft will be removed.",
                  )
                )
                  return;
                setStored(null);
                setChecked(null);
                setNotice("Starter restored for this project.");
              }}
            >
              <RotateCcw size={15} /> Reset project
            </button>
          </div>
          <p className="studio-storage">
            Drafts are kept in this browser when storage is available. Export a
            copy to keep your work.
          </p>
          <p role="status" className="studio-notice">
            {notice}
          </p>
        </section>

        <section
          className="studio-panel"
          aria-labelledby="studio-preview-title"
        >
          <div className="studio-toolbar">
            <h2 id="studio-preview-title">Live preview</h2>
            <div role="group" aria-label="Preview width">
              {[
                { label: "Phone", value: "320px" },
                { label: "Tablet", value: "768px" },
                { label: "Fit", value: "100%" },
              ].map((size) => (
                <button
                  key={size.value}
                  aria-pressed={width === size.value}
                  onClick={() => setWidth(size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="studio-preview-viewport">
            <iframe
              title="Project preview"
              sandbox=""
              srcDoc={preview}
              style={{ width }}
            />
          </div>
          <p className="studio-storage">
            Phone: 320px. Tablet: 768px; scroll the preview area if needed.
            Scripts, external resources, and form submissions are disabled in
            preview and export.
          </p>
        </section>

        <section
          className="studio-panel studio-review"
          aria-labelledby="studio-review-title"
        >
          <span className="eyebrow">REVIEW YOUR BUILD</span>
          <h2 id="studio-review-title">Structure is the first check.</h2>
          <p>
            These checks inspect HTML structure. Review appearance, keyboard
            use, and readability yourself before calling the project finished.
          </p>
          <p role="status" className="studio-check-summary">
            {results
              ? `${passed} of ${results.length} structural checks passed.${passed === results.length ? " Ready for your manual review." : " Use the feedback below to revise your page."}`
              : checked
                ? "Your code changed. Run the checks again."
                : "Run Check structure to get feedback on your page."}
          </p>
          {results && (
            <ul className="studio-checks">
              {results.map((result) => (
                <li key={result.id} data-passed={result.passed}>
                  <strong>
                    {result.passed ? (
                      <Check size={16} aria-label="Passed" />
                    ) : (
                      <span className="studio-check-marker">To do</span>
                    )}{" "}
                    {result.label}
                  </strong>
                  {!result.passed && <p>{result.detail}</p>}
                </li>
              ))}
            </ul>
          )}
          <h3>Try it as a visitor</h3>
          <ul>
            {project.review.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label htmlFor="studio-notes">Design notes & review findings</label>
          <textarea
            id="studio-notes"
            value={draft.notes}
            maxLength={NOTES_LIMIT}
            rows={4}
            placeholder="What did you change, test, and learn?"
            onChange={(event) => update({ notes: event.target.value })}
          />
          <button
            className="studio-report"
            onClick={() => {
              const current = checkProject(project.id, draft.html);
              downloadText(
                `${project.id}-review.md`,
                `# ${project.title}\n\n## Structural checks\n\n${current.map((result) => `- [${result.passed ? "x" : " "}] ${result.label}${result.passed ? "" : `: ${result.detail}`}`).join("\n")}\n\n## Manual review prompts\n\n${project.review.map((item) => `- ${item}`).join("\n")}\n\n## Notes\n\n${draft.notes || "No notes yet."}\n\nStructural checks are learning feedback, not a complete accessibility or visual audit.\n`,
              );
              setNotice(
                "Exported your current structural checks and review notes.",
              );
            }}
          >
            <Download size={15} /> Export review notes
          </button>
        </section>
      </div>
    </div>
  );
}
