import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatIp,
  parseCidr,
  parseIp,
  prefixForHosts,
  sameSubnet,
  subnet,
} from "../src/lib/network/ip";
import { frames, MAC, PUBLIC_IP } from "../src/lib/network/packets";
import { networkWorks, ping } from "../src/lib/network/sim";
import {
  bitsExercise,
  classifyExercise,
  compareExercise,
  ipv6Exercise,
  maskExercise,
  nextExercise,
  random,
  rangeExercise,
  subnetExercise,
} from "../src/lib/network/practice";
import { classify } from "../src/lib/network/ip";
import { probe, ROUTE, slowestLink } from "../src/lib/network/traceroute";
import { attempt, exposed, SERVICES } from "../src/lib/network/ports";
import {
  compress,
  expand,
  isCanonical,
  parseIpv6,
  review,
} from "../src/lib/network/ipv6";
import { LESSONS } from "../src/lib/network/curriculum";

const good = {
  ip: "192.168.1.10",
  mask: "255.255.255.0",
  gateway: "192.168.1.1",
};

test("frames show ARP for the gateway and the router's MAC with the final IP", () => {
  const list = frames(good, "internet");
  assert.deepEqual(
    list.map((f) => `${f.kind}:${f.from}>${f.to}`),
    [
      "ARP:pc>all",
      "ARP:router>pc",
      "ICMP:pc>router",
      "ICMP:router>internet",
      "ICMP:internet>router",
      "ICMP:router>pc",
    ],
  );
  assert.equal(list[0].eth.dst, MAC.broadcast);
  assert.equal(list[0].arp!.values.wanted, "192.168.1.1");
  // Handed to the router by MAC, addressed to 8.8.8.8 by IP.
  assert.equal(list[2].eth.dst, MAC.routerLan);
  assert.equal(list[2].ip!.dst, "8.8.8.8");
  assert.equal(list[2].ip!.ttl, 64);
  assert.equal(list[3].ip!.src, PUBLIC_IP);
  assert.equal(list[3].ip!.ttl, 63);
  assert.equal(list[5].ip!.dst, "192.168.1.10");
  assert.ok(list.every((f) => !f.stop));
});

test("frames for direct delivery skip the router and keep TTL", () => {
  const list = frames(good, "printer");
  assert.deepEqual(
    list.map((f) => `${f.kind}:${f.from}>${f.to}`),
    ["ARP:pc>all", "ARP:printer>pc", "ICMP:pc>printer", "ICMP:printer>pc"],
  );
  assert.ok(list.filter((f) => f.ip).every((f) => f.ip!.ttl === 64));
});

test("frames stop where the ping fails, and agree with ping", () => {
  const cases = [
    { ...good, gateway: "" },
    { ...good, gateway: "10.0.0.1" },
    { ...good, gateway: "192.168.1.254" },
    { ...good, ip: "192.168.1.50" },
    { ...good, ip: "192.168.1.1" },
    { ...good, mask: "/1" },
    { ...good, mask: "/8", gateway: "" },
    { ...good, mask: "255.255.255.252", gateway: "192.168.1.9" },
    { ip: "192.168.1.2", mask: "/30", gateway: "192.168.1.1" },
    { ip: "192.168.2.10", mask: "/16", gateway: "192.168.1.1" },
    { ip: "192.168.2.10", mask: "/24", gateway: "192.168.2.1" },
    good,
  ];
  for (const config of cases)
    for (const target of ["printer", "internet"] as const) {
      const result = ping(config, target);
      const list = frames(config, target);
      const label = `${JSON.stringify(config)} → ${target}`;
      if (result.hops.length === 1) {
        assert.deepEqual(list, [], label);
        continue;
      }
      assert.ok(list.length > 0, label);
      const stopped = list.some((f) => f.stop);
      assert.equal(stopped, !result.ok, label);
      if (stopped) assert.ok(list.at(-1)!.stop, label);
    }
  assert.deepEqual(
    frames({ ...good, gateway: "192.168.1.254" }, "internet").map(
      (f) => f.stop,
    ),
    [true],
  );
  const conflict = frames({ ...good, ip: "192.168.1.50" }, "printer");
  assert.equal(conflict.length, 2);
  assert.equal(conflict[1].eth.src, MAC.printer);
});

test("generated exercises are valid and their answers match the lessons' maths", () => {
  for (let seed = 1; seed <= 400; seed++) {
    const r = random(seed);
    const bits = parseIp(bitsExercise(r))!;
    assert.equal(classify(bits), "private");

    const mask = maskExercise(r);
    assert.equal(mask.prefix, prefixForHosts(mask.hosts));
    assert.ok(mask.prefix >= 8 && mask.prefix <= 30);

    const range = rangeExercise(r);
    const cidr = parseCidr(range.cidr)!;
    const s = subnet(cidr.ip, cidr.prefix);
    assert.equal(formatIp(s.network), range.network);
    assert.equal(formatIp(s.broadcast), range.broadcast);
    assert.equal(s.hosts, range.hosts);

    const compare = compareExercise(r);
    assert.equal(compare.devices.length, 5);
    assert.equal(new Set(compare.devices).size, 5);
    assert.ok(!compare.devices.includes(compare.pc));
    assert.ok(
      compare.same.length >= 1 && compare.same.length <= 4,
      `seed ${seed}`,
    );
    for (const d of compare.devices)
      assert.equal(
        compare.same.includes(d),
        sameSubnet(parseIp(d)!, parseIp(compare.pc)!, compare.prefix),
      );

    const kinds = classifyExercise(r).map((a) => classify(parseIp(a)!));
    assert.equal(kinds.length, 8);
    for (const kind of ["private", "public", "loopback", "link-local"])
      assert.ok(kinds.includes(kind as never), `seed ${seed} ${kind}`);

    const sub = subnetExercise(r);
    const fitting = [24, 25, 26, 27, 28, 29, 30].filter(
      (p) => 2 ** (p - 24) >= sub.departments && 2 ** (32 - p) - 2 >= sub.hosts,
    );
    assert.deepEqual(fitting, [sub.prefix], `seed ${seed}`);
    assert.ok(sub.ask >= 2 && sub.ask <= sub.departments);
    assert.equal(
      sub.answer,
      formatIp(parseIp(sub.base)! + (sub.ask - 1) * 2 ** (32 - sub.prefix)),
    );

    const v6 = ipv6Exercise(r);
    assert.ok(parseIpv6(v6), v6);
    assert.match(compress(parseIpv6(v6)!), /::/);
  }
  // The same seed gives the same exercise.
  assert.deepEqual(rangeExercise(random(7)), rangeExercise(random(7)));
});

test("lessons with practice offer new examples; fixed scenarios do not", () => {
  const r = random(3);
  const practice = LESSONS.filter((l) => nextExercise(l.widget, r)).map(
    (l) => l.widget.type,
  );
  assert.deepEqual(practice, [
    "bits",
    "mask",
    "range",
    "compare",
    "classify",
    "subnetting",
    "ipv6",
  ]);
  for (const lesson of LESSONS) {
    const next = nextExercise(lesson.widget, r);
    if (next) assert.equal(next.type, lesson.widget.type);
  }
  // The fixed subnetting lesson has a single right mask too.
  const fixed = LESSONS.find((l) => l.widget.type === "subnetting")!.widget;
  assert.ok(fixed.type === "subnetting" && fixed.departments === 4);
});

test("traceroute probes stop one hop per TTL and expose the slow link", () => {
  assert.equal(probe(1).hop, 0);
  assert.ok(!probe(1).reached);
  assert.equal(probe(3).hop, 2);
  assert.equal(probe(3).steps.length, 3);
  assert.match(probe(3).steps.at(-1)!.text.en, /time exceeded/);
  assert.ok(probe(ROUTE.length).reached);
  assert.ok(probe(8).reached);
  assert.equal(probe(8).hop, ROUTE.length - 1);
  assert.equal(ROUTE[slowestLink()].ip, "198.51.100.77");
  assert.throws(() => probe(0));
  assert.throws(() => probe(9));
});

test("ports answer with a handshake, a reset or silence behind the firewall", () => {
  assert.equal(attempt(443, false).state, "open");
  assert.equal(attempt(443, false).steps.length, 3);
  assert.equal(attempt(53, false).state, "closed");
  assert.equal(attempt(3306, false).state, "open");
  assert.equal(attempt(3306, true).state, "filtered");
  assert.equal(attempt(22, true).state, "filtered");
  assert.equal(attempt(80, true).state, "open");
  assert.equal(attempt(8080, false).state, "closed");
  assert.deepEqual(exposed(), [22, 3306]);
  assert.equal(new Set(SERVICES.map((s) => s.name)).size, SERVICES.length);
  assert.throws(() => attempt(0, false));
});

test("IPv6 parses, expands and compresses by RFC 5952", () => {
  const full = "2001:0db8:0000:0000:0000:ff00:0042:8329";
  assert.equal(compress(parseIpv6(full)!), "2001:db8::ff00:42:8329");
  assert.equal(
    expand(parseIpv6("::1")!),
    "0000:0000:0000:0000:0000:0000:0000:0001",
  );
  assert.equal(compress(parseIpv6("0:0:0:0:0:0:0:0")!), "::");
  assert.equal(compress(parseIpv6("2001:db8:0:1:0:0:0:1")!), "2001:db8:0:1::1");
  // A single zero group stays; the first of equal runs is compressed.
  assert.equal(
    compress(parseIpv6("2001:db8:0:1:2:3:4:5")!),
    "2001:db8:0:1:2:3:4:5",
  );
  assert.equal(compress(parseIpv6("1:0:0:2:3:0:0:4")!), "1::2:3:0:0:4");
  for (const bad of [
    "1:::2",
    "1::2::3",
    "12345::",
    "g::1",
    "1:2:3:4:5:6:7",
    "1:2:3:4:5:6:7:8:9",
    "::1:2:3:4:5:6:7:8",
  ])
    assert.equal(parseIpv6(bad), null, bad);
  assert.ok(isCanonical(full, "2001:db8::ff00:42:8329"));
  assert.ok(!isCanonical(full, "2001:DB8::FF00:42:8329"));
  const verdict = (answer: string) =>
    Object.fromEntries(review(full, answer).map((c) => [c.rule, c.ok]));
  assert.deepEqual(verdict("2001:0db8::ff00:0042:8329"), {
    valid: true,
    same: true,
    zeros: false,
    run: true,
    case: true,
  });
  assert.equal(verdict("2001:db8:0:0:0:ff00:42:8329").run, false);
  assert.equal(verdict("2001:db8::ff00:42:8328").same, false);
  assert.equal(verdict("2001:db8::ff00:42:8329").run, true);
});

test("the deeper lessons are wired with stable ids", () => {
  assert.deepEqual(
    LESSONS.filter((l) =>
      ["subnetting", "traceroute", "ports", "ipv6"].includes(l.widget.type),
    ).map((l) => l.id),
    [12, 13, 14, 15],
  );
  assert.ok(networkWorks(good));
});
