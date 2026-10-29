import "server-only";
import { LAB_PROGRESS } from "@/lib/lab-progress";
import { LESSONS as LINUX_LESSONS } from "@/lib/linux/curriculum";
import { LESSONS as NETWORK_LESSONS } from "@/lib/network/curriculum";
import { HTML_LESSONS } from "@/components/playground/html-basics/lessons.data";
import { LESSONS as HTTP_LESSONS } from "@/lib/http/curriculum";
import { LESSONS as INPUT_LESSONS } from "@/lib/untrusted-input/curriculum";
import { LESSONS as BROWSER_LESSONS } from "@/lib/browser-risks/curriculum";
import { LESSONS as ACCESS_LESSONS } from "@/lib/access-control/curriculum";
import { LESSONS as API_LESSONS } from "@/lib/api-security/curriculum";
import { LESSONS as CLASSIC_LESSONS } from "@/lib/classical-ciphers/curriculum";
import { LESSONS as SYMMETRIC_LESSONS } from "@/lib/symmetric/curriculum";
import { LESSONS as HASHES_LESSONS } from "@/lib/hashes/curriculum";
import { LESSONS as PUBKEY_LESSONS } from "@/lib/public-key/curriculum";
import { LESSONS as TLS_LESSONS } from "@/lib/tls/curriculum";
import { LESSONS as TCPIP_LESSONS } from "@/lib/tcpip/curriculum";
import { LESSONS as TRAFFIC_LESSONS } from "@/lib/traffic/curriculum";
import { LESSONS as FIREWALL_LESSONS } from "@/lib/firewall/curriculum";
import { LESSONS as CONNECTIONS_LESSONS } from "@/lib/connections/curriculum";
import { LESSONS as IDS_LESSONS } from "@/lib/ids/curriculum";
import { LESSONS as EVIDENCE_LESSONS } from "@/lib/evidence/curriculum";
import { LESSONS as FILESYSTEM_LESSONS } from "@/lib/filesystem/curriculum";
import { LESSONS as LOGS_LESSONS } from "@/lib/logs/curriculum";
import { LESSONS as RESPONSE_LESSONS } from "@/lib/response/curriculum";
import { LESSONS as REPORT_LESSONS } from "@/lib/report/curriculum";
import { LESSONS as STEGO_LESSONS } from "@/lib/stego/curriculum";
import { LESSONS as LSB_LESSONS } from "@/lib/lsb/curriculum";
import { LESSONS as METADATA_LESSONS } from "@/lib/metadata/curriculum";
import { LESSONS as FORMATS_LESSONS } from "@/lib/formats/curriculum";
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
    {
      id: "access",
      title: "Access control",
      category: "Intermediate · Web security",
      description:
        "Open someone else’s order by changing a number and close the gap, forge a JWT and set the server up to refuse it, and choose a second factor that stops a fake sign-in page.",
      href: "/intermediate/access",
      progressKey: LAB_PROGRESS.access.key,
      level: "Intermediate",
      lessons: ACCESS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: ACCESS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "api",
      title: "API security",
      category: "Intermediate · Web security",
      description:
        "Trim a reply that says too much, stop a request that makes itself an admin, check bodies against a schema, set a rate limit that stops a botnet but not a real user, and review an API against a checklist.",
      href: "/intermediate/api",
      progressKey: LAB_PROGRESS.api.key,
      level: "Intermediate",
      lessons: API_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: API_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "classic",
      title: "Classical ciphers",
      category: "Intermediate · Cryptography",
      description:
        "Break a Caesar message by trying every key and then by counting letters, read a Vigenère message from its first word, and see what makes the one-time pad perfect and what breaks it.",
      href: "/intermediate/classic",
      progressKey: LAB_PROGRESS.classic.key,
      level: "Intermediate",
      lessons: CLASSIC_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: CLASSIC_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "symmetric",
      title: "Symmetric encryption",
      category: "Intermediate · Cryptography",
      description:
        "See a padlock picture show through ECB and vanish under CBC and CTR, read a secret message because a nonce was used twice, and stop a changed payment with an authentication tag.",
      href: "/intermediate/symmetric",
      progressKey: LAB_PROGRESS.symmetric.key,
      level: "Intermediate",
      lessons: SYMMETRIC_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: SYMMETRIC_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "hashes",
      title: "Hashes and passwords",
      category: "Intermediate · Cryptography",
      description:
        "Crack a leaked password table with a ready-made list and stop it with a salt, pick a bcrypt cost that slows a graphics card for years but not a user, and stop a forged payment webhook with HMAC.",
      href: "/intermediate/hashes",
      progressKey: LAB_PROGRESS.hashes.key,
      level: "Intermediate",
      lessons: HASHES_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: HASHES_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "pubkey",
      title: "Public-key cryptography",
      category: "Intermediate · Cryptography",
      description:
        "Agree a key with Diffie–Hellman while Eve listens, build an RSA key from two primes and see it factored, and stop a man in the middle with a signed public value.",
      href: "/intermediate/pubkey",
      progressKey: LAB_PROGRESS.pubkey.key,
      level: "Intermediate",
      lessons: PUBKEY_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: PUBKEY_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "tls",
      title: "TLS and certificates",
      category: "Intermediate · Cryptography",
      description:
        "Fix a server until the browser trusts its certificate, raise a TLS setup to an A+, and stop SSL stripping on a café Wi-Fi with HSTS and the preload list.",
      href: "/intermediate/tls",
      progressKey: LAB_PROGRESS.tls.key,
      level: "Intermediate",
      lessons: TLS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: TLS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "tcpip",
      title: "TCP/IP in depth",
      category: "Intermediate · Network security",
      description:
        "Work out the sequence and acknowledgement numbers of a TCP handshake, read a port scan, see how ICMP and SYN floods work, and push the odds of poisoning a DNS cache below one in a thousand.",
      href: "/intermediate/tcpip",
      progressKey: LAB_PROGRESS.tcpip.key,
      level: "Intermediate",
      lessons: TCPIP_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: TCPIP_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "traffic",
      title: "Traffic analysis",
      category: "Intermediate · Network security",
      description:
        "Read a capture line by line, write Wireshark display filters that pick out a port scan, pull a password out of a plain-HTTP stream, and find the infected host by its regular check-ins.",
      href: "/intermediate/traffic",
      progressKey: LAB_PROGRESS.traffic.key,
      level: "Intermediate",
      lessons: TRAFFIC_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: TRAFFIC_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "firewall",
      title: "Firewalls and segmentation",
      category: "Intermediate · Network security",
      description:
        "Read an iptables rule, put a rule list in the right order with a default deny, see why replies need a stateful firewall, narrow a rule to one flow, and split a company network into zones.",
      href: "/intermediate/firewall",
      progressKey: LAB_PROGRESS.firewall.key,
      level: "Intermediate",
      lessons: FIREWALL_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: FIREWALL_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "connections",
      title: "Secure connections",
      category: "Intermediate · Network security",
      description:
        "See how long a recorded Wi-Fi handshake holds out under WEP, WPA2 and WPA3, close every leak a VPN can have on café Wi-Fi, and decide when an SSH host key fingerprint should stop you.",
      href: "/intermediate/connections",
      progressKey: LAB_PROGRESS.connections.key,
      level: "Intermediate",
      lessons: CONNECTIONS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: CONNECTIONS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "ids",
      title: "Intrusion detection",
      category: "Intermediate · Network security",
      description:
        "Read a Suricata rule, make a content match catch encoded path traversal, tune a brute-force threshold for a slow bot, triage alerts, and see why a tiny false-positive rate buries real attacks.",
      href: "/intermediate/ids",
      progressKey: LAB_PROGRESS.ids.key,
      level: "Intermediate",
      lessons: IDS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: IDS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "evidence",
      title: "Handling evidence",
      category: "Intermediate · Digital forensics",
      description:
        "Collect the most volatile evidence first, take a disk image that stands up in court, check copies against the acquisition hash, and find the gap in a chain of custody.",
      href: "/intermediate/evidence",
      progressKey: LAB_PROGRESS.evidence.key,
      level: "Intermediate",
      lessons: EVIDENCE_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: EVIDENCE_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "filesystem",
      title: "File systems",
      category: "Intermediate · Digital forensics",
      description:
        "Read stat output, work out which MACB timestamps an action changes, see why deleted files survive, recognise files by their first bytes, and build an attack timeline from sources in different time zones.",
      href: "/intermediate/filesystem",
      progressKey: LAB_PROGRESS.filesystem.key,
      level: "Intermediate",
      lessons: FILESYSTEM_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: FILESYSTEM_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "logs",
      title: "Logs and artefacts",
      category: "Intermediate · Digital forensics",
      description:
        "Read and grep a Linux auth.log until the break-in and the back door show, sort Windows event IDs and browser and system artefacts, and turn raw epoch numbers into one moment.",
      href: "/intermediate/logs",
      progressKey: LAB_PROGRESS.logs.key,
      level: "Intermediate",
      lessons: LOGS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: LOGS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "response",
      title: "Incident response",
      category: "Intermediate · Digital forensics",
      description:
        "Sort the work of the NIST lifecycle, rank incidents by impact and urgency, contain ransomware without destroying evidence or tipping off the attacker, and run a blameless lessons-learned review.",
      href: "/intermediate/response",
      progressKey: LAB_PROGRESS.response.key,
      level: "Intermediate",
      lessons: RESPONSE_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: RESPONSE_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "report",
      title: "Writing the report",
      category: "Intermediate · Digital forensics",
      description:
        "Give every reader the section they need, put a report in order, tell fact from opinion, build a finding with evidence and impact but no guesses or secrets, write recommendations people can act on, and hand the report over safely.",
      href: "/intermediate/report",
      progressKey: LAB_PROGRESS.report.key,
      level: "Intermediate",
      lessons: REPORT_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: REPORT_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "stego",
      title: "Steganography: the idea",
      category: "Intermediate · Steganography",
      description:
        "Tell hiding from encrypting, read a word out of a poem’s first letters, find a secret tucked into a chat message as invisible characters, read a steghide command, and see where hiding is used for good and for harm.",
      href: "/intermediate/stego",
      progressKey: LAB_PROGRESS.stego.key,
      level: "Intermediate",
      lessons: STEGO_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: STEGO_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "lsb",
      title: "Inside images",
      category: "Intermediate · Steganography",
      description:
        "See which bit of a colour can change unseen, read a message out of the red LSBs of a row of pixels, work out how much a picture can carry, and find a word in an image by looking at one bit plane at a time.",
      href: "/intermediate/lsb",
      progressKey: LAB_PROGRESS.lsb.key,
      level: "Intermediate",
      lessons: LSB_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: LSB_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "metadata",
      title: "Metadata",
      category: "Intermediate · Steganography",
      description:
        "See what EXIF gives away, find the city a photo was taken in from its GPS tags, read a document’s author and template path, and strip the personal fields before publishing without breaking the picture.",
      href: "/intermediate/metadata",
      progressKey: LAB_PROGRESS.metadata.key,
      level: "Intermediate",
      lessons: METADATA_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: METADATA_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
    {
      id: "formats",
      title: "Audio and file formats",
      category: "Intermediate · Steganography",
      description:
        "Read binwalk output, find where a JPEG ends and the ZIP glued after it begins, see why polyglot files slip past filters, find a word drawn into a sound’s spectrogram, and pick the right tool for each search.",
      href: "/intermediate/formats",
      progressKey: LAB_PROGRESS.formats.key,
      level: "Intermediate",
      lessons: FORMATS_LESSONS.map(({ id, title }) => ({
        id,
        title: title.en,
      })),
      modules: FORMATS_LESSONS.map(({ group }) => group.en).filter(
        (group, i, all) => all.indexOf(group) === i,
      ),
    },
  ];
}

export type LearningTrack = ReturnType<typeof getLearningTracks>[number];
