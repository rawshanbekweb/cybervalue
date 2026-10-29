import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BASIC_TOKEN,
  CAPTURE,
  decodeBasic,
  filterSolved,
  gaps,
  HOSTS,
  isBeacon,
  jitter,
  parseFilter,
  PASSWORD,
  SCAN_TARGET,
  shown,
  STREAM,
} from "../src/lib/traffic/tools";
import { LESSONS } from "../src/lib/traffic/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("display filters follow Wireshark's basics", () => {
  assert.equal(shown("")?.length, CAPTURE.length);
  assert.deepEqual(shown("dns"), [1, 2]);
  assert.deepEqual(shown("icmp"), [15]);
  assert.deepEqual(shown("tcp.dstport == 443 && tls"), [6]);
  assert.deepEqual(shown("ftp || icmp"), [14, 15]);
  assert.deepEqual(shown("udp.port == 53 and ip.src == 8.8.8.8"), [2]);
  // ip.addr matches either side; != on it means neither side.
  assert.deepEqual(shown("ip.addr == 8.8.8.8"), [1, 2]);
  assert.equal(shown("ip.addr != 10.0.0.20")?.includes(7), false);
  // A field the packet lacks makes the comparison false, as in Wireshark.
  assert.equal(shown("tcp.flags.syn == 0")?.includes(1), false);
  assert.deepEqual(shown("!(tcp || udp)"), [15]);
  assert.deepEqual(shown("not tcp and not udp"), [15]);
  assert.deepEqual(shown("tcp.flags.reset == 1"), [10, 13]);
  assert.deepEqual(
    shown("tcp.flags.syn eq true && tcp.flags.ack eq true"),
    [4, 8],
  );
});

test("broken filters report why", () => {
  const code = (f: string) => {
    const r = parseFilter(f);
    return r.ok ? "ok" : r.error.code;
  };
  assert.equal(code("ip.src =="), "value");
  assert.equal(code("ip.src == 1 &&"), "unfinished");
  assert.equal(code("(dns"), "paren");
  assert.equal(code("&& dns"), "field");
  assert.equal(code("ip.srcc == 1"), "unknown");
  assert.equal(code("dns tcp"), "end");
  assert.equal(code("dns ; tcp"), "char");
  assert.equal(shown("(dns"), null);
});

test("only the scanner's bare SYNs solve the filter lesson", () => {
  assert.deepEqual(SCAN_TARGET, [7, 9, 11, 12]);
  assert.ok(
    filterSolved(
      "ip.src == 10.0.0.66 && tcp.flags.syn == 1 && tcp.flags.ack == 0",
    ),
  );
  assert.ok(
    filterSolved(
      "tcp.flags.syn==1 and !tcp.flags.ack==1 and ip.src==10.0.0.66",
    ),
  );
  // Without the address, the client's own SYN slips in.
  assert.ok(!filterSolved("tcp.flags.syn == 1 && tcp.flags.ack == 0"));
  // Without the flags, the ping and the RST come too.
  assert.ok(!filterSolved("ip.src == 10.0.0.66"));
  assert.ok(!filterSolved(""));
  assert.ok(!filterSolved("(ip.src == 10.0.0.66"));
});

test("Basic credentials are only Base64", () => {
  assert.ok(STREAM.some((line) => line.includes(BASIC_TOKEN)));
  assert.deepEqual(decodeBasic(BASIC_TOKEN), {
    user: "ali",
    password: "Toshkent2026",
  });
  assert.equal(PASSWORD, "Toshkent2026");
  assert.equal(decodeBasic("not base64!"), null);
  assert.equal(decodeBasic(btoa("no colon")), null);
});

test("exactly one host beacons", () => {
  const beacons = HOSTS.filter(isBeacon);
  assert.equal(beacons.length, 1);
  assert.equal(beacons[0].dst, "203.0.113.50");
  assert.ok(gaps(beacons[0].times).every((g) => g >= 59 && g <= 61));
  for (const h of HOSTS) {
    assert.ok(h.times.every((s) => s >= 0 && s <= 600));
    if (!isBeacon(h)) assert.ok(h.times.length < 5 || jitter(h.times) > 0.5);
  }
});

test("the curriculum is numbered and quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.traffic.total, LESSONS.length);
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
  }
  // The final quiz's filter answers agree with the filter engine.
  const final = LESSONS[7].widget;
  assert.equal(final.type, "quiz");
  if (final.type === "quiz") {
    const q = final.questions[0];
    const either = shown(q.options[q.answer].en)!;
    assert.deepEqual(either, [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(shown(q.options[1].en), []);
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("traffic-1");
  assert.ok(checkpoint);
  const questions = questionsFor(checkpoint, 7);
  assert.equal(questions.length, 10);
  assert.equal(
    grade(
      questions,
      questions.map((q) => q.answer),
    ).percent,
    100,
  );
});
