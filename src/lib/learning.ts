import "server-only";
import { LAB_PROGRESS } from "@/lib/lab-progress";
import { LESSONS as LINUX_LESSONS } from "@/lib/linux/curriculum";
import { LESSONS as NETWORK_LESSONS } from "@/lib/network/curriculum";
import { HTML_LESSONS } from "@/components/playground/html-basics/lessons.data";
import {
  GROUPS,
  LESSONS,
} from "@/components/playground/security-lab/lessons.data";

// Send catalog metadata to the browser, never the lesson implementations.
export function getLearningTracks() {
  return [
    {
      id: "linux",
      title: "Linux foundations lab",
      category: "Linux & terminal",
      description:
        "Learn Linux with 16 practical lessons, a browser terminal, virtual files, command explanations and automatically checked tasks.",
      href: "/akademiya/linux-basics",
      progressKey: LAB_PROGRESS.linux.key,
      level: "Beginner",
      lessons: LINUX_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: [
        "Linux, terminal and shell",
        "Text and streams",
        "Users and permissions",
      ],
    },
    {
      id: "network",
      title: "IP addressing lab",
      category: "Networking",
      description:
        "Learn IP addresses, subnet masks and gateways, then watch DHCP hand out addresses, DNS find a site’s IP and NAT share one public address, with a network simulator and a subnet calculator.",
      href: "/akademiya/network-basics",
      progressKey: LAB_PROGRESS.network.key,
      level: "Beginner",
      lessons: NETWORK_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: NETWORK_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "html",
      title: "HTML foundations",
      category: "Development",
      description:
        "Build the web from the first tag. Write real HTML, see it render, and check your work as you go.",
      href: "/akademiya/html-basics",
      progressKey: LAB_PROGRESS.html.key,
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
      href: "/akademiya/web-security-lab",
      progressKey: LAB_PROGRESS.security.key,
      level: "Beginner → intermediate",
      lessons: LESSONS.map(({ id, title }) => ({ id, title })),
      modules: GROUPS.map(({ title }) => title.replace(/^\d+ · /, "")),
    },
  ];
}

export type LearningTrack = ReturnType<typeof getLearningTracks>[number];
