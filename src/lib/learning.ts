import "server-only";
import { HTML_LESSONS } from "@/components/playground/html-basics/lessons.data";
import {
  GROUPS,
  LESSONS,
} from "@/components/playground/security-lab/lessons.data";

// Send catalog metadata to the browser, never the lesson implementations.
export function getLearningTracks() {
  return [
    {
      id: "html",
      title: "HTML foundations",
      category: "Development",
      description:
        "Build the web from the first tag. Write real HTML, see it render, and check your work as you go.",
      href: "/playground/html-basics",
      progressKey: "htmldars:progress:v1",
      level: "Beginner",
      lessons: HTML_LESSONS.map(({ id, title }) => ({ id, title })),
      modules: [
        "Structure & semantics",
        "Links, images & lists",
        "Forms & page layout",
      ],
    },
    {
      id: "security",
      title: "Web application security",
      category: "Security",
      description:
        "Follow a request from browser to database. Explore authentication, investigate vulnerabilities, and understand the fix.",
      href: "/playground/web-security-lab",
      progressKey: "sabaq:progress:v1",
      level: "Beginner → intermediate",
      lessons: LESSONS.map(({ id, title }) => ({ id, title })),
      modules: GROUPS.map(({ title }) => title.replace(/^\d+ · /, "")),
    },
  ];
}

export type LearningTrack = ReturnType<typeof getLearningTracks>[number];
