// Traceroute on a fixed path from home to kutubxona.example. Each probe leaves
// with a TTL; every router lowers it by one and the router that takes it to
// zero answers "time exceeded". Raising the TTL one step at a time reveals the
// path. Addresses are in documentation and shared ranges.
import type { Text } from "./ip";
import type { Step } from "./sim";

export type Hop = { ip: string; name: Text; ms: [number, number, number] };

export const ROUTE: Hop[] = [
  {
    ip: "192.168.1.1",
    name: { uz: "Uy routeri", en: "Home router" },
    ms: [1, 1, 2],
  },
  {
    ip: "100.64.0.1",
    name: { uz: "Provayder (ISP)", en: "Internet provider (ISP)" },
    ms: [8, 9, 8],
  },
  {
    ip: "198.51.100.1",
    name: { uz: "Shahar tuguni", en: "City exchange" },
    ms: [12, 11, 13],
  },
  {
    ip: "198.51.100.77",
    name: { uz: "Xalqaro kanal", en: "International link" },
    ms: [64, 63, 66],
  },
  {
    ip: "203.0.113.10",
    name: { uz: "kutubxona.example", en: "kutubxona.example" },
    ms: [65, 66, 64],
  },
];
export const DESTINATION = ROUTE[ROUTE.length - 1];
export const MAX_TTL = 8;

export type Probe = {
  ttl: number;
  // Index in ROUTE of the router that answered.
  hop: number;
  reached: boolean;
  steps: Step[];
};

export function probe(ttl: number): Probe {
  if (!Number.isInteger(ttl) || ttl < 1 || ttl > MAX_TTL)
    throw new RangeError(`TTL must be 1–${MAX_TTL}`);
  const hop = Math.min(ttl, ROUTE.length) - 1;
  const reached = ttl >= ROUTE.length;
  const steps: Step[] = [];
  for (let i = 0; i <= hop; i++) {
    const left = ttl - i - 1;
    const values = {
      ip: ROUTE[i].ip,
      before: String(ttl - i),
      after: String(left),
      ttl: String(ttl),
    };
    if (i === ROUTE.length - 1)
      steps.push({
        text: {
          uz: "{ip} — manzilning o‘zi. U TTL’ga qaramay javob beradi: “echo reply”. Iz tugadi.",
          en: "{ip} is the destination itself. It answers whatever the TTL: “echo reply”. The trace is done.",
        },
        values,
      });
    else if (left === 0)
      steps.push({
        text: {
          uz: "{ip}: TTL {before} → {after}. Nolga tushdi — router paketni tashlaydi va yuboruvchiga “ICMP time exceeded” qaytaradi. Shu javobdan biz uning manzilini bilib olamiz.",
          en: "{ip}: TTL {before} → {after}. It hit zero, so the router drops the packet and sends “ICMP time exceeded” back. That reply reveals the router’s address.",
        },
        values,
      });
    else
      steps.push({
        text: {
          uz: "{ip}: TTL {before} → {after}, paket keyingi routerga uzatiladi.",
          en: "{ip}: TTL {before} → {after}; the packet moves on to the next router.",
        },
        values,
      });
  }
  return { ttl, hop, reached, steps };
}

// The hop where latency jumps most compared with the one before it.
export function slowestLink() {
  let worst = 1;
  for (let i = 1; i < ROUTE.length; i++) {
    const jump = (h: Hop, prev: Hop) => avg(h) - avg(prev);
    if (jump(ROUTE[i], ROUTE[i - 1]) > jump(ROUTE[worst], ROUTE[worst - 1]))
      worst = i;
  }
  return worst;
}
const avg = (hop: Hop) => hop.ms.reduce((a, b) => a + b, 0) / hop.ms.length;
