import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BEGINNER_LABS,
  DOMAINS,
  PATHS,
  PHASES,
} from "../src/lib/intermediate/roadmap";

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
