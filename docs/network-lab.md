# IP addressing lab

Route: `/playground/network-basics`, linked from Labs, the learning catalog on the
home page and Playground, and the open labs on the student page. Supports Uzbek
and English through the site's locale. No account or database is required.

The lab teaches IP addresses, subnet masks and the default gateway, then
where addresses come from and how traffic moves, in seventeen lessons. Each lesson has a picture from everyday life, a short explanation and
one interactive exercise that decides when its task is solved:

| #   | Lesson                       | Exercise                                                             |
| --- | ---------------------------- | -------------------------------------------------------------------- |
| 1   | An IP address                | Click 32 bits to build `192.168.1.10`                                |
| 2   | Subnet mask                  | Slide the prefix; pick the smallest mask for 40 computers (`/26`)    |
| 3   | Network, broadcast and hosts | Explore any block; answer for `172.16.5.130/25`                      |
| 4   | Same network? AND            | Bitwise AND shown per device; tick neighbours of `10.0.0.25/28`      |
| 5   | Gateway                      | Network simulator: add the missing gateway                           |
| 6   | Find the fault               | Network simulator: fix an IP conflict and a gateway with no router   |
| 7   | Private, public and special  | Classify eight addresses; links to the private IPv4 lesson           |
| 8   | Reading `ipconfig`           | Diagnose an APIPA address from real-looking output                   |
| 9   | DHCP                         | Connect six devices; watch DORA, widen the pool, see APIPA           |
| 10  | DNS                          | Open sites by name; follow root → TLD → authoritative, see the cache |
| 11  | NAT                          | Open a site from home devices; read the NAT table and the site log   |
| 12  | Subnetting                   | Split a /24 for departments; both fit checks must turn green         |
| 13  | Traceroute                   | Send probes with any TTL, see where they expire, read `tracert`      |
| 14  | Ports                        | Probe ports (SYN-ACK / RST / silence), name services, add a firewall |
| 15  | IPv6                         | Shorten an address to its canonical form with live rule checks       |
| 16  | Opening a site               | DNS → TCP → TLS → HTTP as packets, timeline, eavesdropper’s view     |
| 17  | HTTP by hand                 | Build requests; collect 200, 301, 302, 401, 403 and 404              |

Lessons 1–4, 7, 12 and 15 have a **New example** button that generates a
fresh, solvable exercise (`src/lib/network/practice.ts`, seeded so tests can
replay any of them) and counts the examples solved in the visit. In lessons 5
and 6 every ping can be stepped **frame by frame** (`src/lib/network/packets.ts`):
ARP requests and replies, Ethernet MACs, IP addresses and TTL at each hop,
including the key fact that a packet for the internet carries the router's
MAC but the final IP.

Two **checkpoint tests** at the end of the lab (lessons 1–6 and 7–12) are generated per attempt and graded on the server; see `docs/students.md`.

A separate **subnet calculator** accepts any address with a dotted mask or
`/prefix` and shows the block, both bit strips and every derived address.

## Code

- `src/lib/network/ip.ts`: IPv4 parsing (strict decimal, no leading zeros),
  masks and prefixes, subnet ranges, `/31` and `/32` host counts and address
  kinds (private, loopback, APIPA, shared/multicast/reserved as "special").
- `src/lib/network/sim.ts`: one LAN (`192.168.1.0/24`, router `.1`, printer
  `.50`) and `8.8.8.8` behind the router. `ping` follows a host's real decision —
  same subnet goes across the switch, anything else to the default gateway —
  and explains each step. It reports malformed input, network/broadcast
  addresses, IP conflicts, a missing or off-subnet gateway, a gateway with no
  router, a mask so wide the internet looks local, and replies that cannot
  return. `networkWorks` passes only when the printer answers directly and the
  internet through the gateway.
- `src/lib/network/dhcp.ts`: a pool on the router, DISCOVER → OFFER →
  REQUEST → ACK, renewals, a full pool, pools that would swallow the printer's
  static address, and a stable 169.254.x.x fallback when the server is off.
- `src/lib/network/dns.ts`: names under the reserved `.example` zone with
  documentation-range addresses, so no real site is imitated. Lookups go cache
  → resolver → root → TLD → authoritative, answers are cached with a TTL,
  missing names return NXDOMAIN at the right server, and `imitates` flags names
  such as `bank.example.hisob-tekshiruv.example` that borrow another domain.
- `src/lib/network/nat.ts`: three home devices behind `203.0.113.7`; each
  connection gets its own public port, even when two devices share an inner one.
- `src/lib/network/traceroute.ts`, `ports.ts`, `ipv6.ts`: TTL probes along a
  fixed path, TCP handshake/reset/filtered answers behind an optional
  firewall, and IPv6 parsing with RFC 5952 compression and rule-by-rule review.
- `src/lib/network/web.ts`: a page load as DNS (UDP 53), TCP, TLS (SNI,
  certificate) and HTTP packets with timings and what an eavesdropper on the
  same Wi-Fi can read with and without HTTPS; and a small HTTP server with
  redirects, a sign-in that sets a cookie, 401 versus 403, 404 and 405,
  printed as raw HTTP text.
- `src/lib/network/curriculum.ts`: the bilingual lessons and progress restore.
- `src/components/playground/network-lab/`: the page component and styles.
  Violet marks the network part of an address and amber the host part.

## Persistence

Progress is stored in `cybervalue:network:progress:v1` as `{ "<lesson id>": true }`
and restored defensively: unknown ids and non-`true` values are dropped. Exercise
state is not stored; each lesson starts fresh.

## Verification

- `npx tsx --test tests/network.test.ts`: arithmetic, ranges, address kinds,
  every simulator fault, and that every lesson's start state fails while its
  answer passes.
- `npx playwright test tests/e2e/network.spec.ts`: catalog and Labs links, a
  lesson completed through the bits and kept after reload, the simulator's
  explanations, the calculator, small screens and an axe audit.
