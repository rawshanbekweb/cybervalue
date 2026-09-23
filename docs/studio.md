# HTML & CSS project studio

Open `/playground/studio` from the home page or playground. Three fictional projects extend the HTML foundations lessons: an incident intake form, service status page, and product launch page. Direct links use `#project/incident`, `#project/status`, and `#project/launch`.

Each project includes starter HTML/CSS, requirements, optional hints, structural feedback, and manual review prompts. The live preview supports a 320px phone width, 768px tablet width, and the available workspace width. Wider previews scroll inside their panel on smaller screens.

Draft HTML, CSS, and notes are saved independently in browser storage under `cybervalue:studio:<id>:v1`. Missing, malformed, or oversized fields fall back to starter values. Storage is optional; export work to keep a separate copy. Reset asks before clearing the current project's draft. HTML export embeds the current CSS; Markdown export includes current structural results and review notes.

Checks parse HTML with parse5 and inspect document structure, semantic relationships, labels, values, and project requirements. Editing either source invalidates displayed results. Checks are educational feedback, not a comprehensive accessibility audit or a credential. They do not evaluate CSS visibility, visual quality, or keyboard usability; manual review remains necessary.

Preview and HTML export remove scripts, embedded documents, external resource elements, event handlers, external links, and form actions. A restrictive content security policy blocks scripts, network resources, and submissions; the live iframe also uses an empty sandbox. The source draft stays intact. Raster data images and local fragment links are allowed. This is a frontend prototype workspace with no JavaScript execution or backend connection.

Implementation: `src/lib/studio/` and `src/components/playground/studio/`. Unit coverage is in `tests/studio.test.ts`; browser workflows, responsive layout, and studio accessibility are in `tests/e2e/studio.spec.ts`.
