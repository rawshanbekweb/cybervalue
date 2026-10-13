// Frame-by-frame view of a ping: the ARP lookups and ICMP packets a real host
// would put on the wire, with Ethernet and IP header fields. The outcome comes
// from `ping`, so the frames always agree with the explanation.
import { formatIp, parseIp, parseMask, sameSubnet, type Text } from "./ip";
import {
  INTERNET_IP,
  LAN_PREFIX,
  ping,
  PRINTER_IP,
  ROUTER_IP,
  type Node,
  type PcConfig,
  type Step,
  type Target,
} from "./sim";

export const MAC = {
  pc: "3c:22:fb:10:4a:01",
  printer: "00:1b:a9:50:50:50",
  routerLan: "00:11:22:33:44:01",
  routerWan: "00:11:22:33:44:02",
  isp: "9c:7f:1e:00:00:fe",
  broadcast: "ff:ff:ff:ff:ff:ff",
  unknown: "00:00:00:00:00:00",
};
export const PUBLIC_IP = "203.0.113.7";

export type Frame = {
  from: Node;
  // "all" is an Ethernet broadcast: the switch floods it to every port.
  to: Node | "all";
  kind: "ARP" | "ICMP";
  eth: { src: string; dst: string };
  arp?: { op: "request" | "reply"; text: Text; values: Record<string, string> };
  ip?: { src: string; dst: string; ttl: number; type: "request" | "reply" };
  note: Step;
  // The last frame of a failed ping: nothing answers after it.
  stop?: boolean;
};

const arpRequest = (
  asker: string,
  wanted: string,
  mac = MAC.pc,
  from: Node = "pc",
): Frame => ({
  from,
  to: "all",
  kind: "ARP",
  eth: { src: mac, dst: MAC.broadcast },
  arp: {
    op: "request",
    text: {
      uz: "{wanted} kimda? {asker} ga ayting.",
      en: "Who has {wanted}? Tell {asker}.",
    },
    values: { wanted, asker },
  },
  note: {
    text: {
      uz: "IP’ni bilamiz, lekin Ethernet MAC manzil bilan ishlaydi. Kompyuter {wanted} ning MAC’ini hammadan so‘raydi: qabul qiluvchi ff:ff:ff:ff:ff:ff — switch kadrni barcha portlarga tarqatadi.",
      en: "We know the IP, but Ethernet delivers by MAC. The computer asks everyone for {wanted}’s MAC: the destination ff:ff:ff:ff:ff:ff makes the switch flood the frame to every port.",
    },
    values: { wanted },
  },
});

const arpReply = (who: Node, ip: string, mac: string): Frame => ({
  from: who,
  to: "pc",
  kind: "ARP",
  eth: { src: mac, dst: MAC.pc },
  arp: {
    op: "reply",
    text: { uz: "{ip} — {mac} da.", en: "{ip} is at {mac}." },
    values: { ip, mac },
  },
  note: {
    text: {
      uz: "Faqat {ip} egasi javob beradi, endi faqat kompyuterga (unicast). Kompyuter buni ARP jadvaliga yozib qo‘yadi.",
      en: "Only the owner of {ip} answers, now to the computer alone (unicast). The computer stores it in its ARP table.",
    },
    values: { ip },
  },
});

export function frames(config: PcConfig, target: Target): Frame[] {
  const result = ping(config, target);
  const ip = parseIp(config.ip);
  const prefix = parseMask(config.mask);
  // Errors caught on the computer itself never reach the wire.
  if (result.hops.length === 1 || ip === null || prefix === null) return [];
  const me = formatIp(ip);
  const destination = target === "printer" ? PRINTER_IP : INTERNET_IP;
  const values = { me, destination };

  if (me === ROUTER_IP || me === PRINTER_IP)
    return [
      {
        ...arpRequest(me, me),
        note: {
          text: {
            uz: "Ulanishdan oldin kompyuter o‘z manzilini tekshiradi (gratuitous ARP): “{me} kimda?”",
            en: "Before using its address the computer checks it (gratuitous ARP): “Who has {me}?”",
          },
          values,
        },
      },
      {
        ...arpReply(
          me === ROUTER_IP ? "router" : "printer",
          me,
          me === ROUTER_IP ? MAC.routerLan : MAC.printer,
        ),
        stop: true,
        note: {
          text: {
            uz: "Boshqa qurilma javob berdi: {me} band. Bu — IP to‘qnashuvi, kompyuter bu manzildan foydalana olmaydi.",
            en: "Another device answered: {me} is taken. That is an IP conflict; the computer cannot use the address.",
          },
          values,
        },
      },
    ];

  const echo = (
    from: Node,
    to: Node,
    eth: { src: string; dst: string },
    src: string,
    dst: string,
    ttl: number,
    type: "request" | "reply",
    note: Step,
    stop = false,
  ): Frame => ({
    from,
    to,
    kind: "ICMP",
    eth,
    ip: { src, dst, ttl, type },
    note,
    stop,
  });

  // Same network: ARP for the destination itself, then the echo.
  if (sameSubnet(ip, parseIp(destination)!, prefix)) {
    if (target === "internet")
      return [
        {
          ...arpRequest(me, destination),
          stop: true,
          note: {
            text: {
              uz: "Hech kim javob bermaydi: {destination} bu xonada yo‘q. Mask juda katta bo‘lgani uchun kompyuter internetni ham “qo‘shni” deb o‘ylab, ARP bilan qidiryapti.",
              en: "Nobody answers: {destination} is not in this room. With such a wide mask the computer thinks the internet is a neighbour and looks for it with ARP.",
            },
            values,
          },
        },
      ];
    const out: Frame[] = [
      arpRequest(me, destination),
      arpReply("printer", PRINTER_IP, MAC.printer),
      echo(
        "pc",
        "printer",
        { src: MAC.pc, dst: MAC.printer },
        me,
        PRINTER_IP,
        64,
        "request",
        {
          text: {
            uz: "ICMP echo request (ping). MAC ham, IP ham printerniki — router ishtirok etmaydi. TTL 64 dan boshlanadi.",
            en: "ICMP echo request (ping). Both MAC and IP belong to the printer; the router is not involved. TTL starts at 64.",
          },
        },
      ),
    ];
    if (!sameSubnet(parseIp(PRINTER_IP)!, ip, LAN_PREFIX))
      return [
        ...out,
        echo(
          "printer",
          "printer",
          { src: MAC.printer, dst: MAC.unknown },
          PRINTER_IP,
          me,
          64,
          "reply",
          {
            text: {
              uz: "Printer javob yozdi, lekin uning maski /24: {me} uning tarmog‘ida emas, demak javobni gateway’ga berishi kerak — printerda esa gateway yo‘q. Javob jo‘natilmaydi.",
              en: "The printer wrote a reply, but its mask is /24: {me} is outside its network, so the reply must go to a gateway, and the printer has none. Nothing is sent.",
            },
            values,
          },
          true,
        ),
      ];
    return [
      ...out,
      echo(
        "printer",
        "pc",
        { src: MAC.printer, dst: MAC.pc },
        PRINTER_IP,
        me,
        64,
        "reply",
        {
          text: {
            uz: "ICMP echo reply. Printer MAC’ni ARP’dan biladi, javob to‘g‘ridan-to‘g‘ri qaytadi. TTL o‘zgarmadi — paket hech qanday routerdan o‘tmadi.",
            en: "ICMP echo reply. The printer knows the MAC from ARP and answers directly. TTL is unchanged: the packet crossed no router.",
          },
        },
      ),
    ];
  }

  // Another network: ARP for the gateway, then hand it the packet.
  const gateway = formatIp(parseIp(config.gateway)!);
  const out: Frame[] = [arpRequest(me, gateway)];
  if (gateway !== ROUTER_IP)
    return [
      {
        ...out[0],
        stop: true,
        note: {
          text: {
            uz: "ARP so‘rovi tarqatildi, ammo {gateway} manzilida hech qanday qurilma yo‘q — javob kelmaydi. Paket yuborilmaydi.",
            en: "The ARP request went out, but no device has {gateway}, so no answer comes. The packet is never sent.",
          },
          values: { gateway },
        },
      },
    ];
  out.push(arpReply("router", ROUTER_IP, MAC.routerLan));
  out.push(
    echo(
      "pc",
      "router",
      { src: MAC.pc, dst: MAC.routerLan },
      me,
      destination,
      64,
      "request",
      {
        text: {
          uz: "Asosiy sir: kadrning MAC manzili — routerniki, IP manzili esa {destination} niki. Kompyuter paketni “eshik”ka beradi, manzil esa o‘zgarmaydi.",
          en: "The key idea: the frame’s MAC is the router’s, but its IP destination is still {destination}. The computer hands the packet to the door; the address stays the same.",
        },
        values,
      },
    ),
  );
  if (!sameSubnet(ip, parseIp(ROUTER_IP)!, LAN_PREFIX))
    return [
      ...out,
      echo(
        "router",
        "router",
        { src: MAC.routerLan, dst: MAC.unknown },
        destination,
        me,
        63,
        "reply",
        {
          text: {
            uz: "Router paketni uzatdi, javob ham keldi, lekin {me} uning LAN tarmog‘ida (192.168.1.0/24) emas — javobni qayerga berishni bilmaydi.",
            en: "The router forwarded the packet and a reply came, but {me} is not on its LAN (192.168.1.0/24), so it does not know where to deliver it.",
          },
          values,
        },
        true,
      ),
    ];
  if (target === "printer")
    return [
      ...out,
      echo(
        "router",
        "printer",
        { src: MAC.routerLan, dst: MAC.printer },
        me,
        PRINTER_IP,
        63,
        "request",
        {
          text: {
            uz: "Router paketni printerga uzatadi. Har bir router TTL’ni 1 ga kamaytiradi: 64 → 63.",
            en: "The router forwards the packet to the printer. Every router lowers TTL by 1: 64 → 63.",
          },
        },
      ),
      echo(
        "printer",
        "pc",
        { src: MAC.printer, dst: MAC.pc },
        PRINTER_IP,
        me,
        64,
        "reply",
        {
          text: {
            uz: "Printer kompyuterni o‘z tarmog‘ida ko‘radi va javobni routersiz, to‘g‘ridan-to‘g‘ri qaytaradi. Borish va qaytish yo‘li har xil — bu noto‘g‘ri maskning belgisi.",
            en: "The printer sees the computer on its own network and replies directly, skipping the router. Different paths there and back are a sign of a wrong mask.",
          },
        },
      ),
    ];
  return [
    ...out,
    echo(
      "router",
      "internet",
      { src: MAC.routerWan, dst: MAC.isp },
      PUBLIC_IP,
      destination,
      63,
      "request",
      {
        text: {
          uz: "Router: TTL 64 → 63, NAT bilan manba manzilini {public} ga almashtiradi, MAC’larni esa tashqi tarmoq uchun yangilaydi. IP manzil — o‘sha {destination}.",
          en: "The router lowers TTL 64 → 63, rewrites the source to {public} with NAT, and uses new MACs for the outside link. The destination IP is still {destination}.",
        },
        values: { ...values, public: PUBLIC_IP },
      },
    ),
    echo(
      "internet",
      "router",
      { src: MAC.isp, dst: MAC.routerWan },
      destination,
      PUBLIC_IP,
      57,
      "reply",
      {
        text: {
          uz: "{destination} javob berdi. TTL 57 ga tushgan: javob yo‘lda yana bir nechta routerdan o‘tgan.",
          en: "{destination} replied. TTL is down to 57: the reply crossed several more routers on the way.",
        },
        values,
      },
    ),
    echo(
      "router",
      "pc",
      { src: MAC.routerLan, dst: MAC.pc },
      destination,
      me,
      56,
      "reply",
      {
        text: {
          uz: "Router NAT jadvalidan {me} ni topadi, manzilni qaytarib almashtiradi va javobni kompyuterga beradi.",
          en: "The router finds {me} in its NAT table, swaps the address back and hands the reply to the computer.",
        },
        values,
      },
    ),
  ];
}
