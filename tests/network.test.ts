import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classify,
  formatIp,
  maskToPrefix,
  parseCidr,
  parseIp,
  parseMask,
  prefixForHosts,
  prefixToMask,
  sameSubnet,
  subnet,
  toBinary,
} from "../src/lib/network/ip";
import { networkWorks, ping } from "../src/lib/network/sim";
import { LESSONS, restoreProgress } from "../src/lib/network/curriculum";

test("IPv4 addresses parse strictly and round-trip", () => {
  assert.equal(formatIp(parseIp("192.168.1.10")!), "192.168.1.10");
  assert.equal(formatIp(parseIp("255.255.255.255")!), "255.255.255.255");
  for (const bad of [
    "256.1.1.1",
    "1.2.3",
    "1.2.3.4.5",
    "01.2.3.4",
    "a.b.c.d",
    " ",
    "-1.2.3.4",
  ])
    assert.equal(parseIp(bad), null, bad);
  assert.equal(
    toBinary(parseIp("192.168.1.10")!),
    "11000000.10101000.00000001.00001010",
  );
});

test("masks convert between prefix and dotted form and reject gaps", () => {
  assert.equal(formatIp(prefixToMask(24)), "255.255.255.0");
  assert.equal(formatIp(prefixToMask(26)), "255.255.255.192");
  assert.equal(formatIp(prefixToMask(0)), "0.0.0.0");
  assert.equal(formatIp(prefixToMask(32)), "255.255.255.255");
  assert.equal(maskToPrefix(parseIp("255.255.240.0")!), 20);
  assert.equal(maskToPrefix(parseIp("255.0.255.0")!), null);
  assert.equal(parseMask("/27"), 27);
  assert.equal(parseMask("255.255.255.128"), 25);
  assert.equal(parseMask("33"), null);
});

test("subnet ranges, host counts and membership", () => {
  const s = subnet(parseIp("192.168.1.77")!, 26);
  assert.equal(formatIp(s.network), "192.168.1.64");
  assert.equal(formatIp(s.broadcast), "192.168.1.127");
  assert.equal(formatIp(s.firstHost), "192.168.1.65");
  assert.equal(formatIp(s.lastHost), "192.168.1.126");
  assert.equal(s.hosts, 62);
  assert.equal(formatIp(s.wildcard), "0.0.0.63");
  assert.equal(subnet(0, 31).hosts, 2);
  assert.equal(subnet(0, 32).hosts, 1);
  assert.equal(
    formatIp(subnet(parseIp("200.1.2.3")!, 1).broadcast),
    "255.255.255.255",
  );
  assert.ok(sameSubnet(parseIp("10.0.0.17")!, parseIp("10.0.0.30")!, 28));
  assert.ok(!sameSubnet(parseIp("10.0.0.17")!, parseIp("10.0.0.33")!, 28));
  assert.deepEqual(parseCidr("10.1.2.3/8"), {
    ip: parseIp("10.1.2.3"),
    prefix: 8,
  });
  assert.equal(parseCidr("10.1.2.3"), null);
  assert.equal(parseCidr("10.1.2.3/40"), null);
  assert.equal(prefixForHosts(40), 26);
  assert.equal(prefixForHosts(254), 24);
  assert.equal(prefixForHosts(2), 30);
});

test("address kinds follow the RFC ranges", () => {
  const kind = (ip: string) => classify(parseIp(ip)!);
  assert.equal(kind("172.31.255.1"), "private");
  assert.equal(kind("172.32.0.1"), "public");
  assert.equal(kind("127.0.0.1"), "loopback");
  assert.equal(kind("169.254.12.7"), "link-local");
  assert.equal(kind("100.64.0.1"), "special");
  assert.equal(kind("8.8.8.8"), "public");
});

test("the simulator explains each fault and passes a correct setup", () => {
  const good = {
    ip: "192.168.1.10",
    mask: "255.255.255.0",
    gateway: "192.168.1.1",
  };
  assert.ok(networkWorks(good));
  assert.deepEqual(ping(good, "internet").hops, [
    "pc",
    "switch",
    "router",
    "internet",
  ]);
  assert.deepEqual(ping(good, "printer").hops, ["pc", "switch", "printer"]);

  const noGateway = { ...good, gateway: "" };
  assert.ok(ping(noGateway, "printer").ok);
  assert.ok(!ping(noGateway, "internet").ok);

  const conflict = { ...good, ip: "192.168.1.50" };
  assert.deepEqual(ping(conflict, "printer").hops, ["pc", "switch"]);
  assert.match(ping(conflict, "printer").log.at(-1)!.text.en, /conflict/);

  const wrongRouter = { ...good, gateway: "192.168.1.254" };
  assert.match(ping(wrongRouter, "internet").log.at(-1)!.text.en, /no router/);

  const offNet = { ...good, gateway: "10.0.0.1" };
  assert.match(
    ping(offNet, "internet").log.at(-1)!.text.en,
    /not on my network/,
  );

  const otherNet = {
    ip: "192.168.2.10",
    mask: "255.255.255.0",
    gateway: "192.168.2.1",
  };
  assert.ok(!ping(otherNet, "printer").ok);
  assert.ok(!ping(otherNet, "internet").ok);

  // A /16 still reaches the printer directly; a /30 sends it through the router.
  assert.ok(networkWorks({ ...good, mask: "255.255.0.0" }));
  assert.ok(
    !networkWorks({ ...good, mask: "255.255.255.252", gateway: "192.168.1.9" }),
  );
  const viaRouter = ping(
    { ip: "192.168.1.2", mask: "/30", gateway: "192.168.1.1" },
    "printer",
  );
  assert.ok(viaRouter.ok && viaRouter.hops.includes("router"));
  assert.ok(
    !networkWorks({ ip: "192.168.1.2", mask: "/30", gateway: "192.168.1.1" }),
  );

  for (const config of [
    { ...good, ip: "192.168.1.0" },
    { ...good, ip: "192.168.1.255" },
    { ...good, ip: "300.1.1.1" },
    { ...good, mask: "255.0.255.0" },
    { ...good, mask: "/31" },
    { ...good, mask: "/1" },
    { ...good, gateway: "x" },
  ])
    assert.ok(!networkWorks(config), JSON.stringify(config));
});

test("every lesson task is solvable and its starting state is not", () => {
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "mask") assert.equal(prefixForHosts(w.hosts), 26);
    if (w.type === "range") {
      const cidr = parseCidr(w.cidr)!;
      const s = subnet(cidr.ip, cidr.prefix);
      assert.equal(formatIp(s.network), w.network);
      assert.equal(formatIp(s.broadcast), w.broadcast);
      assert.equal(s.hosts, w.hosts);
    }
    if (w.type === "compare") {
      const pc = parseIp(w.pc)!;
      const same = w.devices.filter((d) =>
        sameSubnet(parseIp(d)!, pc, w.prefix),
      );
      assert.deepEqual(same, ["10.0.0.17", "10.0.0.30"]);
    }
    if (w.type === "network")
      assert.ok(!networkWorks(w.start), `lesson ${lesson.id}`);
    if (w.type === "classify")
      for (const a of w.addresses) assert.notEqual(parseIp(a), null, a);
    if (w.type === "ipconfig") assert.ok(w.answer < w.options.length);
    if (w.type === "bits") assert.notEqual(parseIp(w.target), null);
    for (const text of [
      lesson.title,
      lesson.intro,
      lesson.analogy,
      lesson.task,
      lesson.hint,
      ...lesson.theory,
    ])
      assert.ok(
        text.uz && text.en && text.uz !== text.en,
        `lesson ${lesson.id}`,
      );
  }
  assert.deepEqual(
    LESSONS.map((l) => l.id),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("stored progress keeps only real lesson ids marked true", () => {
  assert.deepEqual(
    restoreProgress({ 1: true, 2: "yes", 9: true, x: true, 8: true }),
    { 1: true, 8: true },
  );
  assert.deepEqual(restoreProgress(null), {});
  assert.deepEqual(restoreProgress([true]), {});
});
