import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStep } from "../src/lib/student/next-step";

const base = {
  assignments: [],
  entrance: [],
  materials: [],
  done: new Set<string>(),
  labs: {},
};
const m = (id: string) => ({ id, slug: `s-${id}`, title: `T ${id}` });

test("an open assignment with the nearest deadline comes first", () => {
  const step = nextStep({
    ...base,
    materials: [m("a")],
    assignments: [
      {
        title: "Later",
        dueAt: new Date(2030, 1, 2),
        status: "open",
        target: { kind: "lab", id: "linux" },
        material: null,
      },
      {
        title: "Sooner",
        dueAt: new Date(2030, 1, 1),
        status: "open",
        target: { kind: "material", id: "x" },
        material: { slug: "quiz-1" },
      },
      {
        title: "Done already",
        dueAt: new Date(2020, 1, 1),
        status: "done",
        target: { kind: "lab", id: "html" },
        material: null,
      },
    ],
  });
  assert.equal(step.kind, "assignment");
  assert.deepEqual(step.kind === "assignment" && [step.title, step.href], [
    "Sooner",
    "/student/m/quiz-1",
  ]);
});

test("then the entrance exam, then the first unfinished material", () => {
  const entrance = [m("e1"), m("e2")];
  assert.deepEqual(nextStep({ ...base, entrance, done: new Set(["e1"]) }), {
    kind: "entrance",
    title: "T e2",
    href: "/student/m/s-e2",
  });
  assert.deepEqual(
    nextStep({
      ...base,
      entrance,
      materials: [m("a"), m("b")],
      done: new Set(["e1", "e2", "a"]),
    }),
    { kind: "material", title: "T b", href: "/student/m/s-b" },
  );
});

test("with no teacher work, a started lab continues before a new one", () => {
  assert.deepEqual(nextStep({ ...base, labs: { linux: 4 } }), {
    kind: "lab",
    lab: "linux",
    href: "/akademiya/linux-basics",
    done: 4,
    total: 16,
  });
  const first = nextStep(base);
  assert.equal(first.kind === "lab" && first.lab, "network");
  // A finished lab is skipped.
  const after = nextStep({ ...base, labs: { network: 17 } });
  assert.equal(after.kind === "lab" && after.lab, "linux");
});

test("everything finished", () => {
  assert.deepEqual(
    nextStep({
      ...base,
      labs: {
        network: 17,
        linux: 16,
        html: 12,
        security: 36,
        http: 10,
        input: 9,
        browser: 8,
        access: 9,
        api: 8,
        classic: 8,
        symmetric: 8,
        hashes: 8,
        pubkey: 8,
        tls: 8,
        tcpip: 8,
        traffic: 8,
        firewall: 8,
        connections: 8,
        ids: 8,
        evidence: 8,
        filesystem: 8,
        logs: 8,
        response: 8,
        report: 8,
        stego: 8,
        lsb: 8,
        scams: 8,
        httpbasics: 9,
        https: 9,
        bash: 9,
        ssh: 8,
        crypto: 11,
      },
      level: "intermediate",
    }),
    { kind: "done" },
  );
});

test("Intermediate labs are suggested only to students they are open to", () => {
  const beginnerLabsDone = {
    network: 17,
    linux: 16,
    html: 12,
    security: 36,
    httpbasics: 9,
    https: 9,
    bash: 9,
    ssh: 8,
    crypto: 11,
    scams: 8,
  };
  assert.deepEqual(nextStep({ ...base, labs: beginnerLabsDone }), {
    kind: "done",
  });
  const next = nextStep({
    ...base,
    labs: beginnerLabsDone,
    level: "intermediate",
  });
  assert.equal(next.kind === "lab" && next.lab, "http");
});
