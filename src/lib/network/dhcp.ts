// DHCP on the lab's LAN: the router hands out addresses from a pool with the
// four-message exchange DISCOVER → OFFER → REQUEST → ACK. Without a server a
// device falls back to a 169.254.x.x (APIPA) address.
import type { Text } from "./ip";
import { ROUTER_IP, type Step } from "./sim";

export type DhcpMessage = Step & {
  name: "DISCOVER" | "OFFER" | "REQUEST" | "ACK";
  from: string;
  to: string;
};
export type Device = { id: string; name: Text; mac: string };
export type DhcpConfig = { enabled: boolean; start: number; end: number };
// Device id → address it holds.
export type Leases = Record<string, string>;
export type ConnectResult = {
  ip: string | null;
  kind: "lease" | "renew" | "apipa" | "full" | "invalid";
  messages: DhcpMessage[];
  note: Step;
};

export const LAN = "192.168.1.";
const PRINTER_HOST = 50;
const BROADCAST = "255.255.255.255";
const NOBODY = "0.0.0.0";

export const DEVICES: Device[] = [
  {
    id: "laptop",
    name: { uz: "Noutbuk", en: "Laptop" },
    mac: "3c:22:fb:10:4a:01",
  },
  {
    id: "phone",
    name: { uz: "Telefon", en: "Phone" },
    mac: "a4:83:e7:2b:91:02",
  },
  { id: "tv", name: { uz: "Televizor", en: "TV" }, mac: "f0:1d:bc:5e:03:03" },
  {
    id: "tablet",
    name: { uz: "Planshet", en: "Tablet" },
    mac: "8c:85:90:7c:11:04",
  },
  {
    id: "console",
    name: { uz: "O‘yin konsoli", en: "Game console" },
    mac: "00:d9:d1:6a:27:05",
  },
  {
    id: "camera",
    name: { uz: "Kamera", en: "Camera" },
    mac: "b8:27:eb:4d:5f:06",
  },
];

// Errors in the pool settings, or null when the router can serve it.
export function poolProblem(config: DhcpConfig): Text | null {
  const { start, end } = config;
  if (![start, end].every((n) => Number.isInteger(n) && n >= 2 && n <= 254))
    return {
      uz: "Hovuz chegaralari 2 dan 254 gacha bo‘lishi kerak (.0 tarmoq, .255 broadcast, .1 router).",
      en: "Pool limits must be 2 to 254 (.0 is the network, .255 the broadcast, .1 the router).",
    };
  if (start > end)
    return {
      uz: "Hovuz boshi oxiridan katta bo‘lmasligi kerak.",
      en: "The pool cannot start after it ends.",
    };
  if (start <= PRINTER_HOST && PRINTER_HOST <= end)
    return {
      uz: "Printerning statik manzili 192.168.1.50 hovuz ichida qolgan: DHCP uni boshqa qurilmaga berib, to‘qnashuv keltirib chiqaradi.",
      en: "The printer’s static address 192.168.1.50 is inside the pool: DHCP would hand it to another device and cause a conflict.",
    };
  return null;
}

export const poolAddresses = (config: DhcpConfig) =>
  poolProblem(config)
    ? []
    : Array.from(
        { length: config.end - config.start + 1 },
        (_, i) => `${LAN}${config.start + i}`,
      );

// The same device always picks the same self-assigned address.
export function apipaFor(device: Device) {
  const sum = [...device.mac].reduce((total, c) => total + c.charCodeAt(0), 0);
  return `169.254.${(sum % 250) + 1}.${((sum * 7) % 250) + 2}`;
}

const discover = (device: Device): DhcpMessage => ({
  name: "DISCOVER",
  from: NOBODY,
  to: BROADCAST,
  text: {
    uz: "Hammaga: “Men {mac}, menga IP manzil kerak. DHCP server bormi?” Hali manzili yo‘q, shuning uchun 0.0.0.0 dan, hammaga (broadcast) yuboradi.",
    en: "To everyone: “I am {mac} and I need an IP address. Is there a DHCP server?” It has no address yet, so it sends from 0.0.0.0 to everyone (broadcast).",
  },
  values: { mac: device.mac },
});

export function connect(
  device: Device,
  config: DhcpConfig,
  leases: Leases,
): ConnectResult {
  if (!config.enabled) {
    const ip = apipaFor(device);
    return {
      ip,
      kind: "apipa",
      messages: [discover(device), discover(device), discover(device)],
      note: {
        text: {
          uz: "Javob kelmadi: DHCP server o‘chiq. Qurilma o‘ziga {ip} (APIPA) manzilini berdi — u bilan internetga chiqib bo‘lmaydi, gateway yo‘q.",
          en: "No answer: the DHCP server is off. The device gave itself {ip} (APIPA). It cannot reach the internet: there is no gateway.",
        },
        values: { ip },
      },
    };
  }
  const problem = poolProblem(config);
  if (problem)
    return {
      ip: null,
      kind: "invalid",
      messages: [discover(device)],
      note: { text: problem },
    };
  const held = leases[device.id];
  const free = poolAddresses(config).find(
    (ip) => !Object.values(leases).includes(ip),
  );
  const ip = held && poolAddresses(config).includes(held) ? held : free;
  if (!ip)
    return {
      ip: null,
      kind: "full",
      messages: [discover(device)],
      note: {
        text: {
          uz: "Router javob bermadi: hovuzda bo‘sh manzil qolmadi. Hovuzni kengaytiring yoki boshqa qurilmani uzing.",
          en: "The router stayed silent: the pool has no free address left. Widen the pool or disconnect another device.",
        },
      },
    };
  const values = {
    ip,
    mac: device.mac,
    router: ROUTER_IP,
  };
  return {
    ip,
    kind: ip === held ? "renew" : "lease",
    messages: [
      discover(device),
      {
        name: "OFFER",
        from: ROUTER_IP,
        to: BROADCAST,
        text: {
          uz: "Router: “{mac}, senga {ip} ni taklif qilaman. Mask 255.255.255.0, gateway {router}, DNS {router}, muddat 24 soat.”",
          en: "Router: “{mac}, I offer you {ip}. Mask 255.255.255.0, gateway {router}, DNS {router}, lease 24 hours.”",
        },
        values,
      },
      {
        name: "REQUEST",
        from: NOBODY,
        to: BROADCAST,
        text: {
          uz: "Qurilma: “{ip} ni olaman.” Hammaga aytadi — agar boshqa server ham taklif bergan bo‘lsa, u bilib qo‘yadi.",
          en: "Device: “I’ll take {ip}.” It tells everyone, so any other server that made an offer knows.",
        },
        values,
      },
      {
        name: "ACK",
        from: ROUTER_IP,
        to: ip,
        text: {
          uz: "Router: “Tasdiqlandi. {ip} 24 soatga seniki.” Endi qurilmada IP, mask, gateway va DNS bor.",
          en: "Router: “Confirmed. {ip} is yours for 24 hours.” The device now has an IP, mask, gateway and DNS.",
        },
        values,
      },
    ],
    note: {
      text:
        ip === held
          ? {
              uz: "Qurilma o‘sha {ip} manzilini qayta oldi: router uni eslab qolgan.",
              en: "The device got the same {ip} back: the router remembered it.",
            }
          : {
              uz: "Qurilma {ip} manzilini oldi. Uni hech kim qo‘lda yozmadi.",
              en: "The device received {ip}. Nobody typed it by hand.",
            },
      values,
    },
  };
}

// Lesson 9 is solved when every device holds a real LAN lease.
export const allConnected = (config: DhcpConfig, leases: Leases) =>
  config.enabled &&
  !poolProblem(config) &&
  DEVICES.every((d) => poolAddresses(config).includes(leases[d.id] ?? ""));
