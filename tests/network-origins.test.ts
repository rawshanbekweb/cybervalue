import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allConnected,
  apipaFor,
  connect,
  DEVICES,
  poolAddresses,
  poolProblem,
  type Leases,
} from "../src/lib/network/dhcp";
import {
  imitates,
  normalizeName,
  remember,
  resolve,
  SUGGESTED,
  type CacheEntry,
} from "../src/lib/network/dns";
import { HOME, PUBLIC_IP, record, visit } from "../src/lib/network/nat";
import { LESSONS } from "../src/lib/network/curriculum";

function connectAll(config: Parameters<typeof connect>[1]) {
  let leases: Leases = {};
  const results = DEVICES.map((device) => {
    const result = connect(device, config, leases);
    if (result.ip) leases = { ...leases, [device.id]: result.ip };
    return result;
  });
  return { leases, results };
}

test("DHCP leases go out with DORA in pool order and run out", () => {
  const small = { enabled: true, start: 100, end: 103 };
  const { leases, results } = connectAll(small);
  assert.deepEqual(
    results.map((r) => r.kind),
    ["lease", "lease", "lease", "lease", "full", "full"],
  );
  assert.deepEqual(
    results[0].messages.map((m) => m.name),
    ["DISCOVER", "OFFER", "REQUEST", "ACK"],
  );
  assert.equal(results[0].messages[0].from, "0.0.0.0");
  assert.equal(results[0].messages[0].to, "255.255.255.255");
  assert.equal(leases.laptop, "192.168.1.100");
  assert.ok(!allConnected(small, leases));

  const wide = { enabled: true, start: 100, end: 105 };
  const all = connectAll(wide);
  assert.ok(all.results.every((r) => r.kind === "lease"));
  assert.ok(allConnected(wide, all.leases));
  // Reconnecting keeps the same address.
  const again = connect(DEVICES[0], wide, all.leases);
  assert.equal(again.kind, "renew");
  assert.equal(again.ip, all.leases.laptop);
});

test("DHCP rejects pools that clash and falls back to APIPA without a server", () => {
  assert.ok(poolProblem({ enabled: true, start: 40, end: 60 }));
  assert.ok(poolProblem({ enabled: true, start: 1, end: 20 }));
  assert.ok(poolProblem({ enabled: true, start: 120, end: 110 }));
  assert.ok(poolProblem({ enabled: true, start: 100, end: 255 }));
  assert.equal(poolProblem({ enabled: true, start: 51, end: 254 }), null);
  assert.deepEqual(poolAddresses({ enabled: true, start: 40, end: 60 }), []);
  assert.equal(
    connect(DEVICES[0], { enabled: true, start: 40, end: 60 }, {}).kind,
    "invalid",
  );
  const off = connect(DEVICES[1], { enabled: false, start: 100, end: 105 }, {});
  assert.equal(off.kind, "apipa");
  assert.equal(off.ip, apipaFor(DEVICES[1]));
  assert.match(off.ip!, /^169\.254\.\d+\.\d+$/);
  assert.ok(off.messages.every((m) => m.name === "DISCOVER"));
  const { leases } = connectAll({ enabled: false, start: 100, end: 105 });
  assert.ok(!allConnected({ enabled: false, start: 100, end: 105 }, leases));
  // After the server comes back, an APIPA device gets a real lease.
  const back = connect(
    DEVICES[1],
    { enabled: true, start: 100, end: 105 },
    leases,
  );
  assert.equal(back.kind, "lease");
});

test("DNS walks the chain, caches answers and reports missing names", () => {
  assert.equal(
    normalizeName(" https://Bank.Example/kirish?x=1 "),
    "bank.example",
  );
  assert.equal(normalizeName("bad name"), null);
  let cache: CacheEntry[] = [];
  const first = resolve("bank.example", cache);
  assert.equal(first.ip, "198.51.100.20");
  assert.deepEqual(
    first.steps.map((s) => s.node),
    ["browser", "root", "tld", "authoritative", "resolver", "site"],
  );
  cache = remember(cache, first);
  const second = resolve("BANK.example", cache);
  assert.ok(second.fromCache);
  assert.equal(second.ip, first.ip);
  assert.equal(remember(cache, second).length, 1);

  const fake = resolve("bank.example.hisob-tekshiruv.example", []);
  assert.equal(fake.ip, "192.0.2.66");
  assert.equal(fake.owner, "hisob-tekshiruv.example");
  assert.equal(imitates(fake.name), "bank.example");
  assert.equal(imitates("www.bank.example"), null);

  const missing = resolve("yoq.example", []);
  assert.equal(missing.ip, null);
  assert.equal(missing.steps.at(-1)!.node, "tld");
  const noRecord = resolve("mail.bank.example", []);
  assert.equal(noRecord.ip, null);
  assert.equal(noRecord.steps.at(-1)!.node, "authoritative");
  assert.equal(resolve("google.com", []).ip, null);
  assert.equal(resolve("localhost", []).ip, "127.0.0.1");
  for (const name of SUGGESTED) assert.ok(resolve(name, []).steps.length > 0);
});

test("NAT gives each connection its own public port and keeps returning ones", () => {
  let table = record([], visit(HOME[0], []));
  const tv = visit(HOME[2], table);
  table = record(table, tv);
  // Laptop and TV use the same inner port; the router still tells them apart.
  assert.equal(HOME[0].port, HOME[2].port);
  assert.notEqual(table[0].outside, table[1].outside);
  assert.ok(table.every((e) => e.outside.startsWith(`${PUBLIC_IP}:`)));
  assert.equal(tv.before.src, "192.168.1.102:51514");
  assert.equal(tv.after.src, `${PUBLIC_IP}:40002`);
  const repeat = visit(HOME[0], table);
  assert.equal(repeat.entry.outside, table[0].outside);
  assert.equal(record(table, repeat).length, 2);
});

test("the address-origin lessons are wired to answerable tasks", () => {
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "dhcp") {
      assert.ok(!allConnected(w.start, connectAll(w.start).leases));
      const fixed = { ...w.start, end: 105 };
      assert.ok(allConnected(fixed, connectAll(fixed).leases));
    }
    if (w.type === "dns")
      for (const name of w.ask) assert.ok(resolve(name, []).ip, name);
    if (w.type === "nat") assert.ok(w.answer < w.options.length);
  }
  assert.deepEqual(
    LESSONS.filter((l) => ["dhcp", "dns", "nat"].includes(l.widget.type)).map(
      (l) => l.id,
    ),
    [9, 10, 11],
  );
});
