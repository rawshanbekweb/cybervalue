// NAT on the home router: private addresses leave the house as the router's
// one public address, and a table of ports sends each reply back to the right
// device. The site only ever sees the public address.
import type { Text } from "./ip";
import type { Step } from "./sim";

export const PUBLIC_IP = "203.0.113.7";
export const SITE = { name: "kutubxona.example", ip: "203.0.113.10" };

export type HomeDevice = { id: string; name: Text; ip: string; port: number };
export type NatEntry = {
  device: string;
  inside: string;
  outside: string;
};
export type Visit = {
  entry: NatEntry;
  before: { src: string; dst: string };
  after: { src: string; dst: string };
  steps: Step[];
};

export const HOME: HomeDevice[] = [
  {
    id: "laptop",
    name: { uz: "Noutbuk", en: "Laptop" },
    ip: "192.168.1.100",
    port: 51514,
  },
  {
    id: "phone",
    name: { uz: "Telefon", en: "Phone" },
    ip: "192.168.1.101",
    port: 49822,
  },
  {
    id: "tv",
    name: { uz: "Televizor", en: "TV" },
    ip: "192.168.1.102",
    port: 51514,
  },
];

// Each new connection gets the next free public port.
export function visit(device: HomeDevice, table: NatEntry[]): Visit {
  const inside = `${device.ip}:${device.port}`;
  const known = table.find((e) => e.inside === inside);
  const outside = known?.outside ?? `${PUBLIC_IP}:${40001 + table.length}`;
  const entry = { device: device.id, inside, outside };
  const site = `${SITE.ip}:443`;
  const values = { inside, outside, site, name: SITE.name, public: PUBLIC_IP };
  return {
    entry,
    before: { src: inside, dst: site },
    after: { src: outside, dst: site },
    steps: [
      {
        text: {
          uz: "Qurilma paket yuboradi: kimdan {inside} → kimga {site} ({name}).",
          en: "The device sends a packet: from {inside} → to {site} ({name}).",
        },
        values,
      },
      {
        text: {
          uz: "Router private manzilni internetga chiqara olmaydi, shuning uchun “kimdan” qismini {outside} ga almashtiradi va buni jadvalga yozadi.",
          en: "Private addresses cannot travel the internet, so the router rewrites the sender to {outside} and writes it in its table.",
        },
        values,
      },
      {
        text: {
          uz: "Sayt serveri so‘rovni {public} dan kelgan deb ko‘radi va javobni {outside} ga yuboradi.",
          en: "The site sees the request as coming from {public} and replies to {outside}.",
        },
        values,
      },
      {
        text: {
          uz: "Router jadvalga qaraydi: {outside} → {inside}. Javobni aynan shu qurilmaga uzatadi.",
          en: "The router checks its table: {outside} → {inside}, and passes the reply to that device.",
        },
        values,
      },
    ],
  };
}

export const record = (table: NatEntry[], v: Visit) =>
  table.some((e) => e.inside === v.entry.inside) ? table : [...table, v.entry];
