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
import { useLocale, useTranslator } from "@/components/locale-provider";
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
  const t = useTranslator();
  return (
    <div className="studio-root container">
      <header className="studio-header">
        <Link href="/playground" className="studio-back">
          <ArrowLeft size={15} /> {t("Playground")}
        </Link>
        <span className="eyebrow">
          <span className="status-dot" /> {t("THE PROJECT STUDIO")}
        </span>
        <h1>
          {t("A brief. A blank canvas.")}
          <br />
          <span>{t("Your next build.")}</span>
        </h1>
        <p>
          {t(
            "Make something useful with HTML and CSS. Test the structure. Refine the experience.",
          )}
        </p>
      </header>
      <nav className="studio-projects" aria-label={t("Choose a project")}>
        {STUDIO_PROJECTS.map((item, index) => (
          <a
            key={item.id}
            href={`#project/${item.id}`}
            aria-current={item.id === selected ? "page" : undefined}
          >
            <span className="eyebrow">
              0{index + 1} / {t(item.level)}
            </span>
            <strong>{t(item.title)}</strong>
            <span>
              {t(item.client)} <ArrowUpRight size={15} />
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
  const t = useTranslator();
  const numberLocale = useLocale() === "uz" ? "uz-UZ" : "en-US";
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
        <span className="eyebrow">
          {t("YOUR CLIENT BRIEF / FICTIONAL PROJECT")}
        </span>
        <h2 id="studio-brief-title">{t(project.title)}</h2>
        <p>{t(project.brief)}</p>
        <h3>{t("What to deliver")}</h3>
        <ol>
          {project.requirements.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ol>
        <details className="studio-hints">
          <summary>{t("Need a starting point?")}</summary>
          <ul>
            {project.hints.map((hint) => (
              <li key={hint}>{t(hint)}</li>
            ))}
          </ul>
        </details>
        <Link href="/playground/html-basics" className="studio-back">
          {t("Review HTML foundations")} <ArrowUpRight size={15} />
        </Link>
      </aside>
      <div className="studio-bench">
        <section className="studio-panel" aria-label={t("Code editor")}>
          <div className="studio-toolbar">
            <div role="group" aria-label={t("Choose editor")}>
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
              {t("{count} / {limit} characters", {
                count: draft[editor].length.toLocaleString(numberLocale),
                limit: (editor === "html"
                  ? HTML_LIMIT
                  : CSS_LIMIT
                ).toLocaleString(numberLocale),
              })}
            </span>
          </div>
          <label className="sr-only" htmlFor="studio-code">
            {t(editor === "html" ? "HTML source" : "CSS source")}
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
              <Play size={15} /> {t("Check structure")}
            </button>
            <button
              onClick={() => {
                downloadText(
                  `${project.id}.html`,
                  buildPreview(draft.html, draft.css),
                  "text/html",
                );
                setNotice(
                  t("Exported your preview as an HTML file with embedded CSS."),
                );
              }}
            >
              <Download size={15} /> {t("Export HTML")}
            </button>
            <button
              onClick={() => {
                if (
                  !window.confirm(
                    t(
                      "Reset this project's HTML, CSS, and notes to the starter? Your current draft will be removed.",
                    ),
                  )
                )
                  return;
                setStored(null);
                setChecked(null);
                setNotice(t("Starter restored for this project."));
              }}
            >
              <RotateCcw size={15} /> {t("Reset project")}
            </button>
          </div>
          <p className="studio-storage">
            {t(
              "Drafts are kept in this browser when storage is available. Export a copy to keep your work.",
            )}
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
            <h2 id="studio-preview-title">{t("Live preview")}</h2>
            <div role="group" aria-label={t("Preview width")}>
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
                  {t(size.label)}
                </button>
              ))}
            </div>
          </div>
          <div className="studio-preview-viewport">
            <iframe
              title={t("Project preview")}
              sandbox=""
              srcDoc={preview}
              style={{ width }}
            />
          </div>
          <p className="studio-storage">
            {t(
              "Phone: 320px. Tablet: 768px; scroll the preview area if needed. Scripts, external resources, and form submissions are disabled in preview and export.",
            )}
          </p>
        </section>

        <section
          className="studio-panel studio-review"
          aria-labelledby="studio-review-title"
        >
          <span className="eyebrow">{t("REVIEW YOUR BUILD")}</span>
          <h2 id="studio-review-title">{t("Structure is the first check.")}</h2>
          <p>
            {t(
              "These checks inspect HTML structure. Review appearance, keyboard use, and readability yourself before calling the project finished.",
            )}
          </p>
          <p role="status" className="studio-check-summary">
            {results
              ? `${t("{passed} of {total} structural checks passed.", { passed, total: results.length })} ${t(passed === results.length ? "Ready for your manual review." : "Use the feedback below to revise your page.")}`
              : t(
                  checked
                    ? "Your code changed. Run the checks again."
                    : "Run Check structure to get feedback on your page.",
                )}
          </p>
          {results && (
            <ul className="studio-checks">
              {results.map((result) => (
                <li key={result.id} data-passed={result.passed}>
                  <strong>
                    {result.passed ? (
                      <Check size={16} aria-label={t("Passed")} />
                    ) : (
                      <span className="studio-check-marker">{t("To do")}</span>
                    )}{" "}
                    {t(result.label)}
                  </strong>
                  {!result.passed && <p>{t(result.detail, result.values)}</p>}
                </li>
              ))}
            </ul>
          )}
          <h3>{t("Try it as a visitor")}</h3>
          <ul>
            {project.review.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
          <label htmlFor="studio-notes">
            {t("Design notes & review findings")}
          </label>
          <textarea
            id="studio-notes"
            value={draft.notes}
            maxLength={NOTES_LIMIT}
            rows={4}
            placeholder={t("What did you change, test, and learn?")}
            onChange={(event) => update({ notes: event.target.value })}
          />
          <button
            className="studio-report"
            onClick={() => {
              const current = checkProject(project.id, draft.html);
              downloadText(
                `${project.id}-review.md`,
                `# ${t(project.title)}\n\n## ${t("Structural checks")}\n\n${current.map((result) => `- [${result.passed ? "x" : " "}] ${t(result.label)}${result.passed ? "" : `: ${t(result.detail, result.values)}`}`).join("\n")}\n\n## ${t("Manual review prompts")}\n\n${project.review.map((item) => `- ${t(item)}`).join("\n")}\n\n## ${t("Notes")}\n\n${draft.notes || t("No notes yet.")}\n\n${t("Structural checks are learning feedback, not a complete accessibility or visual audit.")}\n`,
              );
              setNotice(
                t("Exported your current structural checks and review notes."),
              );
            }}
          >
            <Download size={15} /> {t("Export review notes")}
          </button>
        </section>
      </div>
    </div>
  );
}
