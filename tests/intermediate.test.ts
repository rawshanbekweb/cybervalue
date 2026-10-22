import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BEGINNER_LABS,
  DOMAINS,
  OPEN_MODULES,
  PATHS,
  PHASES,
} from "../src/lib/intermediate/roadmap";
import { isStudentNext, opensIntermediate } from "../src/lib/student/levels";
import { LAB_META, isLabId } from "../src/lib/lab-progress";

test("the Intermediate roadmap is consistent", () => {
  const ids = DOMAINS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, "domain ids are unique");
  for (const d of DOMAINS) {
    assert.ok(
      PHASES.some((p) => p.phase === d.phase),
      d.id,
    );
    for (const need of d.needs) assert.ok(need in BEGINNER_LABS, need);
    assert.ok(d.modules.length >= 4, `${d.id} has its modules`);
    for (const m of d.modules) {
      assert.ok(m.title.uz && m.title.en && m.goal.uz && m.goal.en, d.id);
      assert.ok(m.topics.length > 0, m.title.en);
    }
  }
  for (const phase of PHASES)
    assert.ok(
      DOMAINS.some((d) => d.phase === phase.phase),
      "no empty phase",
    );
  for (const path of PATHS)
    for (const id of path.domains) assert.ok(ids.includes(id), id);
  // The domains the owner asked for are all there.
  for (const id of ["webappsec", "appsec", "netsec", "crypto", "stego"])
    assert.ok(ids.includes(id), id);
});

test("open modules live under /intermediate and name a real lab", () => {
  assert.ok(OPEN_MODULES.length > 0);
  for (const m of OPEN_MODULES) {
    assert.match(m.href, /^\/intermediate\//);
    if (m.lab) {
      assert.ok(isLabId(m.lab), m.lab);
      assert.equal(LAB_META.find((l) => l.id === m.lab)?.href, m.href);
    }
  }
});

test("Intermediate opens at the Intermediate and Advanced levels", () => {
  assert.ok(opensIntermediate("intermediate"));
  assert.ok(opensIntermediate("advanced"));
  assert.ok(!opensIntermediate("beginner"));
  assert.ok(!opensIntermediate(""));
});

test("a student is sent back only to the student area or Intermediate", () => {
  for (const ok of ["/student", "/intermediate", "/intermediate/http#lesson/2"])
    assert.ok(isStudentNext(ok), ok);
  for (const bad of [
    "/admin",
    "//evil.example",
    "https://x.uz/intermediate",
    "/intermediates",
    null,
    "/intermediate/" + "x".repeat(300),
  ])
    assert.ok(!isStudentNext(bad), String(bad));
});
