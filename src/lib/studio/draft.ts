import type { StudioProject } from "./projects";

export const HTML_LIMIT = 30000;
export const CSS_LIMIT = 20000;
export const NOTES_LIMIT = 5000;
export type StudioDraft = { html: string; css: string; notes: string };

export function restoreDraft(
  value: unknown,
  project: StudioProject,
): StudioDraft {
  const fallback = { html: project.html, css: project.css, notes: "" };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fallback;
  const draft = value as Record<string, unknown>;
  return {
    html:
      typeof draft.html === "string" && draft.html.length <= HTML_LIMIT
        ? draft.html
        : fallback.html,
    css:
      typeof draft.css === "string" && draft.css.length <= CSS_LIMIT
        ? draft.css
        : fallback.css,
    notes:
      typeof draft.notes === "string" && draft.notes.length <= NOTES_LIMIT
        ? draft.notes
        : "",
  };
}
