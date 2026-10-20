// The pretend SSH client of the SSH basics lab: one laptop, one server
// (server.uz / 203.0.113.10) and the steps of a real connection — the host
// key question, the password, key pairs and a remote shell. A pure state
// machine: every input returns the next state and the lines to print.

export const HOST = "server.uz";
export const HOST_IP = "203.0.113.10";
export const USER = "ali";
export const PASSWORD = "kalit-2026";
export const FINGERPRINT = "SHA256:Xq3f9Lm2Rk7tNb4Wp8Zs1Yc6Hd0Gv5Ju3Ae2Ko9Pi4";
const KEY_FINGERPRINT = "SHA256:Tz8Nq2Vb6Lm4Rc1Xs7Pk3Gh9Fd5Wj0Ya2Ue8Io6Hb1";

export type Line = {
  text: string;
  kind: "cmd" | "out" | "err" | "warn" | "ok";
};

export type Mode =
  | { kind: "local" }
  | { kind: "confirm"; user: string; then: "login" | "copy" }
  | { kind: "password"; user: string; tries: number; then: "login" | "copy" }
  | { kind: "remote"; user: string };

export type Sim = {
  mode: Mode;
  /** Hosts whose key was accepted, as in ~/.ssh/known_hosts. */
  known: boolean;
  /** Whether ~/.ssh/id_ed25519 exists, and whether the server trusts it. */
  key: boolean;
  copied: boolean;
  /** What happened, for the lesson goals. */
  events: string[];
};

export const startSim = (): Sim => ({
  mode: { kind: "local" },
  known: false,
  key: false,
  copied: false,
  events: [],
});

export function prompt(sim: Sim) {
  switch (sim.mode.kind) {
    case "local":
      return "student@laptop:~$";
    case "confirm":
      return "(yes/no)?";
    case "password":
      return `${sim.mode.user}@${HOST}'s password:`;
    case "remote":
      return `${sim.mode.user}@web-1:~$`;
  }
}

/** Whether the next input should be hidden like a password. */
export const secret = (sim: Sim) => sim.mode.kind === "password";

const out = (text: string): Line => ({ text, kind: "out" });
const err = (text: string): Line => ({ text, kind: "err" });

const welcome = (): Line[] => [
  { text: "Welcome to Ubuntu 24.04 LTS (web-1)", kind: "ok" },
  out(`Last login: Mon Oct 19 09:12:44 2026 from 198.51.100.7`),
];

function parseTarget(args: string[]) {
  let port = "22";
  let target = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p") port = args[++i] ?? "";
    else if (args[i] === "-i") i++;
    else if (!args[i].startsWith("-")) target = args[i];
  }
  const at = target.lastIndexOf("@");
  return {
    port,
    user: at >= 0 ? target.slice(0, at) : "student",
    host: at >= 0 ? target.slice(at + 1) : target,
  };
}

const knownHost = (host: string) => host === HOST || host === HOST_IP;

export function step(sim: Sim, raw: string): { sim: Sim; lines: Line[] } {
  const input = raw.trim();
  const mode = sim.mode;
  const event = (name: string): Sim => ({
    ...sim,
    events: [...sim.events, name],
  });

  if (mode.kind === "confirm") {
    const echo: Line = { text: `${prompt(sim)} ${input}`, kind: "cmd" };
    if (input !== "yes") {
      return {
        sim: { ...event("refused-host"), mode: { kind: "local" } },
        lines: [echo, err("Host key verification failed.")],
      };
    }
    const next: Sim = {
      ...event("accepted-host"),
      known: true,
      mode: { kind: "password", user: mode.user, tries: 0, then: mode.then },
    };
    const lines: Line[] = [
      echo,
      {
        text: `Warning: Permanently added '${HOST}' (ED25519) to the list of known hosts.`,
        kind: "warn",
      },
    ];
    if (mode.then === "login" && sim.copied && mode.user === USER)
      return {
        sim: {
          ...next,
          events: [...next.events, "login", "key-login"],
          mode: { kind: "remote", user: mode.user },
        },
        lines: [...lines, ...welcome()],
      };
    return { sim: next, lines };
  }

  if (mode.kind === "password") {
    const echo: Line = { text: prompt(sim), kind: "cmd" };
    if (input === PASSWORD && mode.user === USER) {
      if (mode.then === "copy")
        return {
          sim: {
            ...event("copied-key"),
            copied: true,
            mode: { kind: "local" },
          },
          lines: [
            echo,
            out("Number of key(s) added: 1"),
            {
              text: `Now try logging into the machine, with: "ssh ${USER}@${HOST}"`,
              kind: "ok",
            },
          ],
        };
      return {
        sim: { ...event("login"), mode: { kind: "remote", user: mode.user } },
        lines: [echo, ...welcome()],
      };
    }
    const tries = mode.tries + 1;
    if (tries >= 3)
      return {
        sim: { ...event("denied"), mode: { kind: "local" } },
        lines: [
          echo,
          err(`${mode.user}@${HOST}: Permission denied (publickey,password).`),
        ],
      };
    return {
      sim: { ...sim, mode: { ...mode, tries } },
      lines: [echo, err("Permission denied, please try again.")],
    };
  }

  const [name, ...args] = input.split(/\s+/);

  if (mode.kind === "remote") {
    const echo: Line = { text: `${prompt(sim)} ${input}`, kind: "cmd" };
    const remote = (lines: Line[]) => ({
      sim: input ? event(`remote:${name}`) : sim,
      lines: [echo, ...lines],
    });
    switch (name) {
      case "":
        return { sim, lines: [echo] };
      case "whoami":
        return remote([out(mode.user)]);
      case "hostname":
        return remote([out("web-1")]);
      case "pwd":
        return remote([out(`/home/${mode.user}`)]);
      case "ls":
        return remote([out("backup.sh  logs  site")]);
      case "uptime":
        return remote([
          out(
            " 10:42:07 up 12 days,  3:41,  1 user,  load average: 0.08, 0.05, 0.01",
          ),
        ]);
      case "exit":
      case "logout":
        return {
          sim: { ...event("logout"), mode: { kind: "local" } },
          lines: [echo, out("logout"), out(`Connection to ${HOST} closed.`)],
        };
      default:
        return remote([err(`${name}: command not found`)]);
    }
  }

  // On the laptop.
  const echo: Line = { text: `${prompt(sim)} ${input}`, kind: "cmd" };
  switch (name) {
    case "":
      return { sim, lines: [echo] };
    case "ssh": {
      const { port, user, host } = parseTarget(args);
      if (!host)
        return {
          sim,
          lines: [
            echo,
            err("usage: ssh [-p port] [-i identity_file] user@host"),
          ],
        };
      if (!knownHost(host))
        return {
          sim,
          lines: [
            echo,
            err(
              `ssh: Could not resolve hostname ${host}: Name or service not known`,
            ),
          ],
        };
      if (port !== "22")
        return {
          sim,
          lines: [
            echo,
            err(
              `ssh: connect to host ${host} port ${port}: Connection refused`,
            ),
          ],
        };
      if (!sim.known)
        return {
          sim: {
            ...event("asked-host"),
            mode: { kind: "confirm", user, then: "login" },
          },
          lines: [
            echo,
            out(
              `The authenticity of host '${HOST} (${HOST_IP})' can't be established.`,
            ),
            out(`ED25519 key fingerprint is ${FINGERPRINT}.`),
            out("This key is not known by any other names."),
            out(
              "Are you sure you want to continue connecting (yes/no/[fingerprint])?",
            ),
          ],
        };
      if (sim.copied && user === USER)
        return {
          sim: {
            ...event("login"),
            events: [...sim.events, "login", "key-login"],
            mode: { kind: "remote", user },
          },
          lines: [echo, ...welcome()],
        };
      return {
        sim: {
          ...sim,
          mode: { kind: "password", user, tries: 0, then: "login" },
        },
        lines: [echo],
      };
    }
    case "ssh-keygen": {
      if (sim.key)
        return {
          sim,
          lines: [echo, err("/home/student/.ssh/id_ed25519 already exists.")],
        };
      return {
        sim: { ...event("keygen"), key: true },
        lines: [
          echo,
          out("Generating public/private ed25519 key pair."),
          out(
            "Enter passphrase (empty for no passphrase): [skipped in this lab]",
          ),
          {
            text: "Your identification has been saved in /home/student/.ssh/id_ed25519",
            kind: "warn",
          },
          {
            text: "Your public key has been saved in /home/student/.ssh/id_ed25519.pub",
            kind: "ok",
          },
          out(`The key fingerprint is: ${KEY_FINGERPRINT} student@laptop`),
        ],
      };
    }
    case "ssh-copy-id": {
      const { user, host } = parseTarget(args);
      if (!sim.key)
        return {
          sim,
          lines: [
            echo,
            err(
              "ssh-copy-id: ERROR: no identities found — run ssh-keygen first",
            ),
          ],
        };
      if (!knownHost(host))
        return {
          sim,
          lines: [
            echo,
            err(
              `ssh: Could not resolve hostname ${host}: Name or service not known`,
            ),
          ],
        };
      const lines: Line[] = [
        echo,
        out(
          '/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/student/.ssh/id_ed25519.pub"',
        ),
      ];
      if (!sim.known)
        return {
          sim: { ...sim, mode: { kind: "confirm", user, then: "copy" } },
          lines: [
            ...lines,
            out(`ED25519 key fingerprint is ${FINGERPRINT}.`),
            out(
              "Are you sure you want to continue connecting (yes/no/[fingerprint])?",
            ),
          ],
        };
      return {
        sim: {
          ...sim,
          mode: { kind: "password", user, tries: 0, then: "copy" },
        },
        lines,
      };
    }
    case "ls": {
      const files = [
        ...(sim.known ? ["known_hosts"] : []),
        ...(sim.key ? ["id_ed25519", "id_ed25519.pub"] : []),
      ];
      return {
        sim,
        lines: [echo, files.length ? out(files.join("  ")) : out("")],
      };
    }
    case "cat": {
      const file = (args[0] ?? "")
        .replace(/^~?\/?\.ssh\//, "")
        .replace(/^\.ssh\//, "");
      if (file === "id_ed25519.pub" && sim.key)
        return {
          sim,
          lines: [
            echo,
            out(
              "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK8vQm3Lr2xYp0sT7nBf student@laptop",
            ),
          ],
        };
      if (file === "id_ed25519" && sim.key)
        return {
          sim: event("read-private"),
          lines: [
            echo,
            { text: "-----BEGIN OPENSSH PRIVATE KEY-----", kind: "warn" },
            {
              text: "(hidden in this lab — never show or send this file to anyone)",
              kind: "warn",
            },
            { text: "-----END OPENSSH PRIVATE KEY-----", kind: "warn" },
          ],
        };
      if (file === "known_hosts" && sim.known)
        return {
          sim,
          lines: [
            echo,
            out(`${HOST} ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMn4…`),
          ],
        };
      return {
        sim,
        lines: [echo, err(`cat: ${args[0] ?? ""}: No such file or directory`)],
      };
    }
    default:
      return { sim, lines: [echo, err(`${name}: command not found`)] };
  }
}
