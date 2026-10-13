// A one-LAN teaching network: the student's PC, a switch, a printer, a router
// and one server on the internet. `ping` decides, the way a real host does,
// whether a packet goes straight across the switch or to the default gateway,
// and explains every step in plain words.
import {
  formatIp,
  parseIp,
  parseMask,
  sameSubnet,
  subnet,
  type Text,
} from "./ip";

export type Node = "pc" | "switch" | "printer" | "router" | "internet";
export type Target = "printer" | "internet";
export type PcConfig = { ip: string; mask: string; gateway: string };

export const LAN_PREFIX = 24;
export const ROUTER_IP = "192.168.1.1";
export const PRINTER_IP = "192.168.1.50";
export const INTERNET_IP = "8.8.8.8";
const ROUTER = parseIp(ROUTER_IP)!;
const PRINTER = parseIp(PRINTER_IP)!;
const TARGET_IP: Record<Target, number> = {
  printer: PRINTER,
  internet: parseIp(INTERNET_IP)!,
};

export type Step = { text: Text; values?: Record<string, string> };
export type PingResult = {
  ok: boolean;
  // Nodes the packet reached, in order; the last one is where it stopped.
  hops: Node[];
  log: Step[];
};

export const fill = (step: Step, locale: "uz" | "en") =>
  step.text[locale].replace(/\{(\w+)\}/g, (m, key: string) =>
    step.values && Object.hasOwn(step.values, key) ? step.values[key] : m,
  );

const fail = (hops: Node[], log: Step[], step: Step): PingResult => ({
  ok: false,
  hops,
  log: [...log, step],
});

export function ping(config: PcConfig, target: Target): PingResult {
  const log: Step[] = [];
  const ip = parseIp(config.ip);
  if (ip === null)
    return fail(["pc"], log, {
      text: {
        uz: "IP manzil noto‘g‘ri yozilgan. U nuqta bilan ajratilgan 4 ta sondan iborat, har biri 0–255.",
        en: "The IP address is malformed. It is four numbers 0–255 separated by dots.",
      },
    });
  const prefix = parseMask(config.mask);
  if (prefix === null)
    return fail(["pc"], log, {
      text: {
        uz: "Subnet mask noto‘g‘ri: ikkilikda birlar chapdan uzluksiz kelishi kerak (masalan 255.255.255.0).",
        en: "Invalid subnet mask: its ones must run unbroken from the left (for example 255.255.255.0).",
      },
    });
  if (prefix < 8 || prefix > 30)
    return fail(["pc"], log, {
      text: {
        uz: "Bu laboratoriyada mask /8 dan /30 gacha bo‘lishi kerak.",
        en: "In this lab the mask must be between /8 and /30.",
      },
    });
  const own = subnet(ip, prefix);
  const values = {
    ip: formatIp(ip),
    prefix: String(prefix),
    network: formatIp(own.network),
    broadcast: formatIp(own.broadcast),
    target: formatIp(TARGET_IP[target]),
  };
  if (ip === own.network || ip === own.broadcast)
    return fail(["pc"], log, {
      text: {
        uz: "{ip} — bu tarmoqning {kind} manzili, uni kompyuterga berib bo‘lmaydi.",
        en: "{ip} is the {kind} address of the network and cannot be given to a computer.",
      },
      values: {
        ...values,
        kind: ip === own.network ? "network" : "broadcast",
      },
    });
  log.push({
    text: {
      uz: "Kompyuter: men {ip}/{prefix}, mening tarmog‘im {network}.",
      en: "PC: I am {ip}/{prefix}; my network is {network}.",
    },
    values,
  });
  if (ip === ROUTER || ip === PRINTER)
    return fail(["pc", "switch"], log, {
      text: {
        uz: "IP to‘qnashuvi: {ip} manzili allaqachon {device}da. Bitta tarmoqda ikki qurilmaga bir xil manzil berib bo‘lmaydi.",
        en: "IP conflict: {ip} already belongs to the {device}. Two devices on one network cannot share an address.",
      },
      values: { ...values, device: ip === ROUTER ? "router" : "printer" },
    });

  const destination = TARGET_IP[target];
  if (sameSubnet(ip, destination, prefix)) {
    log.push({
      text: {
        uz: "{target} mening tarmog‘imda → paketni switch orqali to‘g‘ridan-to‘g‘ri yuboraman (ARP bilan MAC manzilini so‘rayman).",
        en: "{target} is on my network → I send the packet straight across the switch (asking for its MAC with ARP).",
      },
      values,
    });
    if (target !== "printer")
      return fail(["pc", "switch"], log, {
        text: {
          uz: "ARP so‘roviga hech kim javob bermadi: {target} bu xonada emas. Mask juda katta — kompyuter internetni o‘z tarmog‘i deb o‘ylayapti.",
          en: "Nobody answered the ARP request: {target} is not in this room. The mask is too wide, so the PC thinks the internet is its own network.",
        },
        values,
      });
    if (!sameSubnet(PRINTER, ip, LAN_PREFIX))
      return fail(["pc", "switch", "printer"], log, {
        text: {
          uz: "Printer so‘rovni oldi, lekin javob bera olmaydi: uning nazarida {ip} boshqa tarmoqda.",
          en: "The printer received the request but cannot reply: to it, {ip} is on another network.",
        },
        values,
      });
    return {
      ok: true,
      hops: ["pc", "switch", "printer"],
      log: [
        ...log,
        {
          text: {
            uz: "Printer javob berdi. Gateway kerak bo‘lmadi — ikkalasi bir tarmoqda.",
            en: "The printer replied. No gateway was needed: both are on one network.",
          },
        },
      ],
    };
  }

  log.push({
    text: {
      uz: "{target} boshqa tarmoqda → paketni default gateway’ga beraman.",
      en: "{target} is on another network → I hand the packet to the default gateway.",
    },
    values,
  });
  if (!config.gateway.trim())
    return fail(["pc"], log, {
      text: {
        uz: "Default gateway yozilmagan: kompyuter o‘z tarmog‘idan tashqariga yo‘lni bilmaydi.",
        en: "No default gateway is set: the PC does not know the way out of its network.",
      },
    });
  const gateway = parseIp(config.gateway);
  if (gateway === null)
    return fail(["pc"], log, {
      text: {
        uz: "Gateway manzili noto‘g‘ri yozilgan.",
        en: "The gateway address is malformed.",
      },
    });
  const gw = { ...values, gateway: formatIp(gateway) };
  if (!sameSubnet(gateway, ip, prefix))
    return fail(["pc"], log, {
      text: {
        uz: "Gateway {gateway} mening tarmog‘imda ({network}) emas — unga to‘g‘ridan-to‘g‘ri yetib bo‘lmaydi. Gateway doim kompyuter bilan bir tarmoqda bo‘ladi.",
        en: "Gateway {gateway} is not on my network ({network}), so I cannot reach it directly. A gateway is always on the same network as the PC.",
      },
      values: gw,
    });
  if (gateway !== ROUTER)
    return fail(["pc", "switch"], log, {
      text: {
        uz: "ARP: {gateway} manziliga hech kim javob bermadi — bu manzilda router yo‘q.",
        en: "ARP: nobody answered at {gateway}. There is no router at that address.",
      },
      values: gw,
    });
  log.push({
    text: {
      uz: "Router ({gateway}) paketni oldi va manzilga qarab yo‘naltiradi.",
      en: "The router ({gateway}) took the packet and forwards it toward the destination.",
    },
    values: gw,
  });
  if (!sameSubnet(ip, ROUTER, LAN_PREFIX))
    return fail(["pc", "switch", "router"], log, {
      text: {
        uz: "Javob qaytmadi: router {ip} ni o‘zining LAN tarmog‘ida (192.168.1.0/24) ko‘rmaydi.",
        en: "No reply came back: the router does not see {ip} on its LAN (192.168.1.0/24).",
      },
      values,
    });
  if (target === "printer")
    return {
      ok: true,
      hops: ["pc", "switch", "router", "printer"],
      log: [
        ...log,
        {
          text: {
            uz: "Printer router orqali javob berdi. Ishladi, lekin mask noto‘g‘ri: bir xonadagi qurilmalar router orqali gaplashmasligi kerak.",
            en: "The printer replied through the router. It works, but the mask is wrong: devices in one room should not talk through the router.",
          },
        },
      ],
    };
  return {
    ok: true,
    hops: ["pc", "switch", "router", "internet"],
    log: [
      ...log,
      {
        text: {
          uz: "Router paketni internetga uzatdi (NAT bilan), {target} javob berdi.",
          en: "The router sent the packet to the internet (with NAT) and {target} replied.",
        },
        values,
      },
    ],
  };
}

// A lesson's network task passes when both destinations answer cleanly: the
// printer directly, the internet through the gateway.
export const networkWorks = (config: PcConfig) => {
  const printer = ping(config, "printer");
  return (
    printer.ok &&
    !printer.hops.includes("router") &&
    ping(config, "internet").ok
  );
};
