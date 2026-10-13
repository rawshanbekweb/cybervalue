# IP addressing lab

Route: `/playground/network-basics`, linked from Labs, the learning catalog on the
home page and Playground, and the open labs on the student page. Supports Uzbek
and English through the site's locale. No account or database is required.

The lab teaches IP addresses, subnet masks and the default gateway in eight
lessons. Each lesson has a picture from everyday life, a short explanation and
one interactive exercise that decides when its task is solved:

| #   | Lesson                       | Exercise                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------ |
| 1   | An IP address                | Click 32 bits to build `192.168.1.10`                              |
| 2   | Subnet mask                  | Slide the prefix; pick the smallest mask for 40 computers (`/26`)  |
| 3   | Network, broadcast and hosts | Explore any block; answer for `172.16.5.130/25`                    |
| 4   | Same network? AND            | Bitwise AND shown per device; tick neighbours of `10.0.0.25/28`    |
| 5   | Gateway                      | Network simulator: add the missing gateway                         |
| 6   | Find the fault               | Network simulator: fix an IP conflict and a gateway with no router |
| 7   | Private, public and special  | Classify eight addresses; links to the private IPv4 lesson         |
| 8   | Reading `ipconfig`           | Diagnose an APIPA address from real-looking output                 |

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
