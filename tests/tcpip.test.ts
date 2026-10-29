import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANSWERS,
  BLANKS,
  blankRight,
  CLIENT_ISN,
  dnsSafe,
  FORGED,
  poisonOdds,
  portState,
  REQUEST_BYTES,
  SERVER_ISN,
} from "../src/lib/tcpip/tools";
import { LESSONS } from "../src/lib/tcpip/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";
import {
  checkpointById,
  grade,
  questionsFor,
} from "../src/lib/checkpoints/questions";

test("handshake numbers follow TCP's rules", () => {
  assert.equal(ANSWERS.synAckAck, CLIENT_ISN + 1);
  assert.equal(ANSWERS.ackSeq, CLIENT_ISN + 1);
  assert.equal(ANSWERS.ackAck, SERVER_ISN + 1);
  assert.equal(ANSWERS.dataAck, CLIENT_ISN + 1 + REQUEST_BYTES);
  for (const b of BLANKS) assert.ok(blankRight(b, String(ANSWERS[b])), b);
  assert.ok(!blankRight("synAckAck", String(CLIENT_ISN)));
  assert.ok(!blankRight("ackAck", ""));
  assert.ok(!blankRight("ackAck", "7001x"));
});

test("a SYN scan reads replies as nmap does", () => {
  assert.equal(portState("synack"), "open");
  assert.equal(portState("rst"), "closed");
  assert.equal(portState("none"), "filtered");
  assert.equal(portState("icmp"), "filtered");
});

test("DNS poisoning odds fall with a random port and vanish with DNSSEC", () => {
  const plain = (forged: number) =>
    poisonOdds({ forged, randomPort: false, dnssec: false });
  // More forged answers, better odds; the full ID space is near-certain-ish.
  assert.ok(plain(100) < plain(1000));
  assert.ok(plain(65_536) > 0.6);
  assert.ok(
    poisonOdds({ forged: 65_536, randomPort: true, dnssec: false }) < 0.0001,
  );
  assert.equal(
    poisonOdds({ forged: 65_536, randomPort: false, dnssec: true }),
    0,
  );
  for (const forged of FORGED) {
    assert.ok(!dnsSafe({ forged, randomPort: false, dnssec: false }));
    assert.ok(dnsSafe({ forged, randomPort: true, dnssec: false }));
    assert.ok(dnsSafe({ forged, randomPort: false, dnssec: true }));
  }
});

test("the curriculum is numbered, the scan sort agrees, quizzes valid", () => {
  LESSONS.forEach((lesson, i) => assert.equal(lesson.id, i + 1));
  assert.equal(LAB_PROGRESS.tcpip.total, LESSONS.length);
  const reply = (en: string) =>
    en.includes("SYN-ACK")
      ? "synack"
      : en.includes("RST")
        ? "rst"
        : en.includes("ICMP")
          ? "icmp"
          : "none";
  for (const lesson of LESSONS) {
    const w = lesson.widget;
    if (w.type === "quiz")
      for (const q of w.questions)
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
    if (lesson.id === 4 && w.type === "sort")
      for (const item of w.items)
        assert.equal(
          portState(reply(item.label.en)),
          item.bucket,
          item.label.en,
        );
  }
});

test("the checkpoint builds ten questions and grades them", () => {
  const checkpoint = checkpointById("tcpip-1");
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
