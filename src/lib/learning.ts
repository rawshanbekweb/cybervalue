import "server-only";
import { LAB_PROGRESS } from "@/lib/lab-progress";
import { LESSONS as LINUX_LESSONS } from "@/lib/linux/curriculum";
import { LESSONS as NETWORK_LESSONS } from "@/lib/network/curriculum";
import { HTML_LESSONS } from "@/components/playground/html-basics/lessons.data";
import { LESSONS as HTTP_LESSONS } from "@/lib/http/curriculum";
import { LESSONS as INPUT_LESSONS } from "@/lib/untrusted-input/curriculum";
import { LESSONS as BROWSER_LESSONS } from "@/lib/browser-risks/curriculum";
import { LESSONS as SCAM_LESSONS } from "@/lib/scams/curriculum";
import { LESSONS as HTTP_BASICS_LESSONS } from "@/lib/http-basics/curriculum";
import { LESSONS as HTTPS_LESSONS } from "@/lib/https-basics/curriculum";
import { LESSONS as BASH_LESSONS } from "@/lib/bash-basics/curriculum";
import { LESSONS as CRYPTO_LESSONS } from "@/lib/crypto-basics/curriculum";
import { LESSONS as SSH_LESSONS } from "@/lib/ssh-basics/curriculum";
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
    {
      id: "httpbasics",
      title: "HTTP basics",
      category: "Web foundations",
      description:
        "Watch the browser and the server talk: requests and responses, GET and POST, headers and every family of status codes, in animated lessons.",
      href: "/akademiya/http-basics",
      progressKey: LAB_PROGRESS.httpbasics.key,
      level: "Beginner",
      lessons: HTTP_BASICS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: HTTP_BASICS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "https",
      title: "HTTPS and TLS",
      category: "Web foundations",
      description:
        "See what the padlock protects: eavesdropping on café Wi-Fi, encryption keys, the TLS handshake, certificates and the chain of trust, in animated lessons.",
      href: "/akademiya/https",
      progressKey: LAB_PROGRESS.https.key,
      level: "Beginner",
      lessons: HTTPS_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: HTTPS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "crypto",
      title: "Cryptography basics",
      category: "Security",
      description:
        "Encoding, hashing and encryption told apart: forge a Base64 cookie, watch one letter scramble a hash, salt a leaked table, run a dictionary attack, flip XOR bits and sign a message.",
      href: "/akademiya/crypto",
      progressKey: LAB_PROGRESS.crypto.key,
      level: "Beginner",
      lessons: CRYPTO_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: CRYPTO_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "bash",
      title: "Bash basics",
      category: "Linux & terminal",
      description:
        "Variables, loops and your first scripts in a safe terminal that runs in the browser: watch a loop turn by turn, fix an endless loop and scan a login log.",
      href: "/akademiya/bash",
      progressKey: LAB_PROGRESS.bash.key,
      level: "Beginner",
      lessons: BASH_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: BASH_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "ssh",
      title: "SSH: remote access",
      category: "Linux & terminal",
      description:
        "How remote connection works: an encrypted SSH session step by step, a practice server, host keys, and switching from passwords to key pairs.",
      href: "/akademiya/ssh",
      progressKey: LAB_PROGRESS.ssh.key,
      level: "Beginner",
      lessons: SSH_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: SSH_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "scams",
      title: "Scam simulator",
      category: "Security",
      description:
        "Eight everyday scams on a pretend phone — a call from “the bank”, a prize, a friend asking for money, a job, an app, a buyer, an investment — and one safe message. Decide what to do, then find every red flag.",
      href: "/firibgarlik",
      progressKey: LAB_PROGRESS.scams.key,
      level: "Beginner",
      lessons: SCAM_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: SCAM_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "http",
      title: "HTTP in depth",
      category: "Intermediate · Web security",
      description:
        "Write raw requests to a training server, follow redirects, sign in with cookies, and learn the same-origin policy, CORS and security headers.",
      href: "/intermediate/http",
      progressKey: LAB_PROGRESS.http.key,
      level: "Intermediate",
      lessons: HTTP_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: HTTP_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "input",
      title: "Untrusted input",
      category: "Intermediate · Web security",
      description:
        "Break a login query with one quote, fix it with parameters, check file paths, write an allowlist and encode output for its context.",
      href: "/intermediate/input",
      progressKey: LAB_PROGRESS.input.key,
      level: "Intermediate",
      lessons: INPUT_LESSONS.map(({ id, title }) => ({ id, title: title.en })),
      modules: INPUT_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "browser",
      title: "Browser-side risks",
      category: "Intermediate · Web security",
      description:
        "See what a comment becomes when it is read as HTML, check link addresses, build a Content-Security-Policy, and stop a foreign site from sending a bank transfer in your name.",
      href: "/intermediate/browser",
      progressKey: LAB_PROGRESS.browser.key,
      level: "Intermediate",
      lessons: BROWSER_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: BROWSER_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
  ];
}

export type LearningTrack = ReturnType<typeof getLearningTracks>[number];
