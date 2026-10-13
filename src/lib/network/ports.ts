// Ports on one server: the IP finds the building, the port finds the door.
// A TCP connection attempt shows the handshake for open ports, a reset for
// closed ones and silence where a firewall filters the port.
import type { Text } from "./ip";
import type { Step } from "./sim";

export const SERVER_IP = "203.0.113.10";

export type Service = {
  port: number;
  name: string;
  what: Text;
  listening: boolean;
  // Should the whole internet be able to reach it?
  public: boolean;
};

export const SERVICES: Service[] = [
  {
    port: 22,
    name: "SSH",
    what: {
      uz: "serverni masofadan boshqarish",
      en: "remote administration",
    },
    listening: true,
    public: false,
  },
  {
    port: 53,
    name: "DNS",
    what: { uz: "nomlarni IP’ga aylantirish", en: "turning names into IPs" },
    listening: false,
    public: false,
  },
  {
    port: 80,
    name: "HTTP",
    what: {
      uz: "veb-sahifa (shifrsiz) — HTTPS’ga yo‘naltiradi",
      en: "web page (unencrypted), redirects to HTTPS",
    },
    listening: true,
    public: true,
  },
  {
    port: 443,
    name: "HTTPS",
    what: { uz: "veb-sahifa (shifrlangan)", en: "web page (encrypted)" },
    listening: true,
    public: true,
  },
  {
    port: 3306,
    name: "MySQL",
    what: { uz: "ma’lumotlar bazasi", en: "database" },
    listening: true,
    public: false,
  },
];

export type PortState = "open" | "closed" | "filtered";
export type Attempt = { port: number; state: PortState; steps: Step[] };

// With the firewall on, only services meant for everyone are reachable.
export function attempt(port: number, firewall: boolean): Attempt {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new RangeError("port must be 1–65535");
  const service = SERVICES.find((s) => s.port === port);
  const values = {
    port: String(port),
    ip: SERVER_IP,
    name: service?.name ?? "?",
  };
  const syn: Step = {
    text: {
      uz: "Kompyuter → {ip}:{port}: SYN (“ulanmoqchiman”).",
      en: "Computer → {ip}:{port}: SYN (“I want to connect”).",
    },
    values,
  };
  if (firewall && !service?.public)
    return {
      port,
      state: "filtered",
      steps: [
        syn,
        {
          text: {
            uz: "Firewall paketni jimgina tashladi — javob yo‘q. Tashqaridan bu port bor-yo‘qligini ham bilib bo‘lmaydi (filtered).",
            en: "The firewall silently dropped the packet: no answer. From outside you cannot even tell whether the port exists (filtered).",
          },
          values,
        },
      ],
    };
  if (!service?.listening)
    return {
      port,
      state: "closed",
      steps: [
        syn,
        {
          text: {
            uz: "Server: RST (“bu eshik yopiq, bu yerda hech kim tinglamayapti”).",
            en: "Server: RST (“this door is closed; nobody is listening here”).",
          },
          values,
        },
      ],
    };
  return {
    port,
    state: "open",
    steps: [
      syn,
      {
        text: {
          uz: "Server: SYN-ACK (“marhamat”).",
          en: "Server: SYN-ACK (“come in”).",
        },
        values,
      },
      {
        text: {
          uz: "Kompyuter: ACK. Uch qadamli “qo‘l siqish” tugadi — {name} xizmati bilan ulanish ochiq.",
          en: "Computer: ACK. The three-way handshake is done: the connection to {name} is open.",
        },
        values,
      },
    ],
  };
}

// Services listening but not meant for the public: what a firewall must hide.
export const exposed = () =>
  SERVICES.filter((s) => s.listening && !s.public).map((s) => s.port);
