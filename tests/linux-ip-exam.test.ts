import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHOICES,
  LINUX_IP_EXAM_MINUTES,
  MAX_OPEN,
  MAX_TEST,
  MAX_TOTAL,
  OPENS,
} from "../src/lib/linux-ip-exam/content";
import {
  applyReview,
  gradeLinuxIp,
  keyIds,
  norm,
} from "../src/lib/linux-ip-exam/grading";
import { EXPLANATIONS } from "../src/lib/linux-ip-exam/explanations";

const CHOICE_ANSWERS: Record<string, number> = {
  l1: 1,
  l2: 2,
  l3: 3,
  l4: 0,
  l5: 3,
  l6: 1,
  l7: 2,
  l8: 0,
  l9: 1,
  l10: 3,
  l11: 1,
  l12: 0,
  l13: 2,
  l14: 2,
  l15: 1,
  l16: 2,
  l17: 3,
  l18: 0,
  l19: 1,
  l20: 2,
  n1: 1,
  n2: 2,
  n3: 1,
  n4: 3,
  n5: 1,
  n6: 0,
  n7: 2,
  n8: 1,
  n9: 2,
  n10: 3,
  n11: 1,
  n12: 1,
  n13: 1,
  n14: 2,
  n15: 1,
  n16: 2,
  n17: 3,
  n18: 2,
  n19: 0,
  n20: 3,
};

const OPEN_ANSWERS: Record<string, string> = {
  o1: "tail -n 5 /etc/passwd",
  o2: "30",
  o3: "chmod 750 script.sh",
  o4: 'grep -c "Failed password" /var/log/auth.log',
  o5: "172.16.32.0",
  o6: "192.168.1.95",
  o7: "2001:db8::ff00:42:8329",
  o8: "/22",
  o9: "sudo ss -tlnp | grep 8080",
  o10: 'find . -name "*.log" -mtime +7 -delete',
};

const full = () => ({
  ...Object.fromEntries(
    Object.entries(CHOICE_ANSWERS).map(([k, v]) => [k, String(v)]),
  ),
  ...OPEN_ANSWERS,
});

test("the exam has 40 tests and 10 open questions worth 100 points in 2 hours", () => {
  assert.equal(CHOICES.length, 40);
  assert.equal(OPENS.length, 10);
  assert.equal(MAX_TEST, 70);
  assert.equal(MAX_OPEN, 30);
  assert.equal(MAX_TOTAL, 100);
  assert.equal(LINUX_IP_EXAM_MINUTES, 120);
  const ids = [...CHOICES, ...OPENS].map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...keyIds()].sort(), [...ids].sort());
  for (const c of CHOICES) {
    assert.equal(c.options.length, 4, c.id);
    assert.equal(new Set(c.options).size, 4, c.id);
    assert.ok([0.9, 1, 2, 3].includes(c.points), c.id);
  }
  for (const o of OPENS) assert.ok([2, 3, 4].includes(o.points), o.id);
  // Correct answers are spread over every option position.
  const positions = new Set(Object.values(CHOICE_ANSWERS));
  assert.equal(positions.size, 4);
});

test("all correct answers score 100, no answers score 0", () => {
  const r = gradeLinuxIp(full());
  assert.equal(r.total, 100);
  assert.equal(r.test.score, 70);
  assert.equal(r.open.score, 30);
  assert.ok(r.items.every((i) => i.score === i.max));
  const empty = gradeLinuxIp({});
  assert.equal(empty.total, 0);
  assert.ok(empty.items.every((i) => i.expected));
});

test("decimal points add up without float noise", () => {
  const answers = full();
  answers.l1 = "0"; // a 0.9-point question wrong
  const r = gradeLinuxIp(answers);
  assert.equal(r.total, 99.1);
  assert.equal(r.test.score, 69.1);
});

test("open answers accept common correct variants", () => {
  const accept: Record<string, string[]> = {
    o1: [
      "tail -5 /etc/passwd",
      "$ tail -n5 /etc/passwd",
      "tail /etc/passwd -n 5",
    ],
    o3: ["chmod u=rwx,g=rx,o= script.sh", "chmod 0750 ./script.sh"],
    o4: [
      "grep 'Failed password' /var/log/auth.log | wc -l",
      "cat /var/log/auth.log | grep “Failed password” | wc -l",
    ],
    o5: ["172.16.32.0/20"],
    o7: ["2001:DB8::FF00:42:8329"],
    o8: ["22", "255.255.252.0"],
    o9: ["ss -ltnp", "sudo netstat -tulpn | grep :8080", "lsof -i :8080"],
    o10: [
      "find . -type f -name '*.log' -mtime +7 -delete",
      String.raw`find ./ -name "*.log" -mtime +7 -exec rm {} \;`,
      "find . -name *.log -mtime +7 -exec rm -f {} +",
    ],
  };
  for (const [id, variants] of Object.entries(accept))
    for (const v of variants) {
      const r = gradeLinuxIp({ [id]: v });
      assert.equal(
        r.items.find((i) => i.id === id)?.score,
        OPENS.find((o) => o.id === id)?.points,
        `${id}: ${v}`,
      );
    }
});

test("open answers reject wrong ones", () => {
  const reject: Record<string, string[]> = {
    o1: ["head -n 5 /etc/passwd", "tail -n 10 /etc/passwd"],
    o2: ["32", "62"],
    o3: ["chmod 755 script.sh", "chmod 777 script.sh"],
    o4: [
      "grep -c Failed password /var/log/auth.log",
      "grep -c 'Failed password' /var/log/syslog",
    ],
    o5: ["172.16.45.0", "172.16.0.0"],
    o6: ["192.168.1.127", "192.168.1.255"],
    o7: ["2001:db8:0:0:0:ff00:42:8329", "2001:db8::ff00::42:8329"],
    o8: ["/23", "/21"],
    o9: ["ss -t", "ping 8080"],
    o10: [
      'find . -name "*.log" -mtime -7 -delete',
      'find . -name "*.log" -delete',
      "rm *.log",
    ],
  };
  for (const [id, variants] of Object.entries(reject))
    for (const v of variants) {
      const r = gradeLinuxIp({ [id]: v });
      assert.equal(r.items.find((i) => i.id === id)?.score, 0, `${id}: ${v}`);
    }
});

test("normalising keeps the meaning of an answer", () => {
  assert.equal(norm("  $  ls   -la ; "), "ls -la");
  assert.equal(norm("grep “a b”"), 'grep "a b"');
});

test("the result keeps what the student picked or typed", () => {
  const r = gradeLinuxIp({ l1: "0", o2: " 32 ", l2: "9" });
  const item = (id: string) => r.items.find((i) => i.id === id)!;
  assert.equal(item("l1").answer, CHOICES[0].options[0]);
  assert.equal(item("l1").expected, CHOICES[0].options[1]);
  assert.equal(item("l2").answer, "");
  assert.equal(item("o2").answer, "32");
  assert.equal(item("o3").answer, "");
});

test("the teacher's points for open questions replace the automatic ones", () => {
  const graded = gradeLinuxIp(full());
  const r = applyReview(graded, { o1: 1, o8: 2.5, l1: 0, o2: 99, o3: -1 });
  // l1 isn't an open question and 99 / -1 are out of range: all ignored.
  assert.equal(r.total, 100 - 1 - 1.5);
  assert.equal(r.open.score, 30 - 2.5);
  assert.equal(r.test.score, 70);
  const o1 = r.items.find((i) => i.id === "o1")!;
  assert.equal(o1.score, 1);
  assert.ok(o1.reviewed);
  assert.ok(!r.items.find((i) => i.id === "o2")!.reviewed);
  // A blank paper can earn points from the teacher.
  assert.equal(applyReview(gradeLinuxIp({}), { o9: 4 }).total, 4);
});

test("every question has a full explanation in both languages", () => {
  for (const q of [...CHOICES, ...OPENS]) {
    const e = EXPLANATIONS[q.id];
    assert.ok(e, q.id);
    assert.ok(e.uz.length > 150 && e.en.length > 150, q.id);
    assert.notEqual(e.uz, e.en, q.id);
  }
  assert.equal(Object.keys(EXPLANATIONS).length, CHOICES.length + OPENS.length);
});
