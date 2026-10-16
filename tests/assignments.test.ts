import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignmentSchema,
  assignmentStatus,
  completedAt,
  dueLabel,
  isUrgent,
  localInput,
  parseTarget,
  targetHref,
  type Completion,
} from "../src/lib/student/assignments";
import { attention } from "../src/lib/student/class";
import { standing } from "../src/lib/student/xp";

const DAY = 86_400_000;
const at = (iso: string) => new Date(iso);

test("targets parse only known kinds and ids", () => {
  assert.deepEqual(parseTarget("material:abc123"), {
    kind: "material",
    id: "abc123",
  });
  assert.deepEqual(parseTarget("checkpoint:network-1"), {
    kind: "checkpoint",
    id: "network-1",
  });
  assert.deepEqual(parseTarget("lab:linux"), { kind: "lab", id: "linux" });
  for (const bad of [
    "checkpoint:nope",
    "lab:chemistry",
    "material:",
    "material:a:b",
    "quiz:x",
    "material:../x",
  ])
    assert.equal(parseTarget(bad), null, bad);
  assert.equal(
    targetHref({ kind: "checkpoint", id: "linux-1" }),
    "/akademiya/linux-basics#checkpoints",
  );
  assert.equal(
    targetHref({ kind: "material", id: "x" }, "ip-test"),
    "/student/m/ip-test",
  );
});

test("status: on time, late, open and missed", () => {
  const due = at("2026-10-24T13:00:00Z");
  const now = due.getTime();
  assert.equal(assignmentStatus(at("2026-10-23T10:00:00Z"), due, now), "done");
  assert.equal(assignmentStatus(at("2026-10-25T10:00:00Z"), due, now), "late");
  assert.equal(assignmentStatus(null, due, now - 1), "open");
  assert.equal(assignmentStatus(null, due, now + 1), "missed");
  assert.equal(isUrgent("open", due, now - 3 * DAY), true);
  assert.equal(isUrgent("open", due, now - 10 * DAY), false);
  assert.equal(isUrgent("missed", due, now + DAY), true);
  assert.equal(isUrgent("done", due, now - DAY), false);
});

test("due labels count Tashkent calendar days", () => {
  // Friday 18:00 in Tashkent.
  const due = at("2026-10-24T13:00:00Z");
  assert.deepEqual(dueLabel(due, at("2026-10-24T04:00:00Z").getTime()), {
    text: "Due today",
  });
  // 23:30 Thursday in Tashkent is still "tomorrow", not "today".
  assert.deepEqual(dueLabel(due, at("2026-10-23T18:30:00Z").getTime()), {
    text: "Due tomorrow",
  });
  assert.deepEqual(dueLabel(due, at("2026-10-20T08:00:00Z").getTime()), {
    text: "Due in {days} days",
    days: 4,
  });
  assert.deepEqual(dueLabel(due, at("2026-10-26T08:00:00Z").getTime()), {
    text: "{days} days overdue",
    days: 2,
  });
});

test("the form's deadline is read as Tashkent time", () => {
  const parsed = assignmentSchema.parse({
    title: " Lessons 1–6 ",
    note: "",
    group: "A-1",
    target: "checkpoint:network-1",
    dueAt: "2026-10-24T18:00",
  });
  assert.equal(parsed.title, "Lessons 1–6");
  assert.equal(parsed.dueAt.toISOString(), "2026-10-24T13:00:00.000Z");
  assert.equal(localInput(parsed.dueAt), "2026-10-24T18:00");
  for (const bad of [
    { target: "lab:nope" },
    { dueAt: "tomorrow" },
    { group: "<b>" },
    { title: "" },
  ])
    assert.equal(
      assignmentSchema.safeParse({
        title: "x",
        note: "",
        group: "",
        target: "lab:html",
        dueAt: "2026-10-24T18:00",
        ...bad,
      }).success,
      false,
      JSON.stringify(bad),
    );
});

test("completion comes from progress, passed checkpoints and full labs", () => {
  const data: Completion = {
    materials: [
      { id: "m1", studentId: "s1", at: at("2026-10-22T00:00:00Z") },
      { id: "m1", studentId: "s1", at: at("2026-10-20T00:00:00Z") },
    ],
    checkpoints: [
      {
        studentId: "s1",
        checkpoint: "network-1",
        score: 6,
        total: 12,
        createdAt: at("2026-10-19T00:00:00Z"),
      },
      {
        studentId: "s1",
        checkpoint: "network-1",
        score: 10,
        total: 12,
        createdAt: at("2026-10-21T00:00:00Z"),
      },
    ],
    labs: [
      {
        studentId: "s1",
        lab: "html",
        lessons: [1, 2, 3],
        updatedAt: at("2026-10-21T00:00:00Z"),
      },
      {
        studentId: "s2",
        lab: "html",
        lessons: [1, 2, 3, 4],
        updatedAt: at("2026-10-22T00:00:00Z"),
      },
    ],
  };
  const total = () => 4;
  // The first completion counts.
  assert.equal(
    completedAt({ kind: "material", id: "m1" }, "s1", data, total)?.getDate(),
    20,
  );
  assert.equal(
    completedAt({ kind: "material", id: "m1" }, "s2", data, total),
    null,
  );
  // A failed attempt does not count; the first passing one does.
  assert.equal(
    completedAt(
      { kind: "checkpoint", id: "network-1" },
      "s1",
      data,
      total,
    )?.getDate(),
    21,
  );
  assert.equal(
    completedAt({ kind: "lab", id: "html" }, "s1", data, total),
    null,
  );
  assert.equal(
    completedAt({ kind: "lab", id: "html" }, "s2", data, total)?.getDate(),
    22,
  );
});

test("a missed deadline puts the student on the attention list", () => {
  const now = at("2026-10-20T10:00:00Z").getTime();
  const s = standing(
    {
      materials: [],
      progress: [],
      submissions: [],
      checkpoints: [
        {
          checkpoint: "linux-1",
          score: 9,
          total: 10,
          createdAt: new Date(now - DAY),
        },
      ],
      labs: [],
    },
    now,
  );
  assert.deepEqual(attention(s, 0, now), []);
  assert.deepEqual(attention(s, 0, now, 1), ["missed"]);
});
