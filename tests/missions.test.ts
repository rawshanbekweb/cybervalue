import test from "node:test";
import assert from "node:assert/strict";
import { MISSIONS } from "../src/lib/missions/catalog";
import {
  fixture,
  freshSandbox,
  initialRequest,
  regressions,
  simulate,
} from "../src/lib/missions/engine";
import {
  evaluateSession,
  missionReport,
  newSession,
  policyKey,
  recordRun,
  restoreSession,
} from "../src/lib/missions/session";

test("invoice investigation exposes both detail and collection leaks; a partial fix is insufficient", () => {
  const mission = MISSIONS[0];
  for (const variant of [1, 2, 3]) {
    const request = initialRequest("invoice", variant);
    assert.equal(
      simulate("invoice", variant, mission.initialPolicy, request).evidence,
      "baseline",
    );
    const crossAccount = {
      ...request,
      path: `/invoices/${fixture(variant).other}`,
    };
    assert.equal(
      simulate("invoice", variant, mission.initialPolicy, crossAccount)
        .evidence,
      "exploit",
    );
    const partial = { ...mission.initialPolicy, detail: "owner" };
    assert.equal(
      simulate("invoice", variant, partial, crossAccount).status,
      403,
    );
    assert.equal(
      simulate("invoice", variant, partial, { ...request, path: "/invoices" })
        .evidence,
      "exploit",
    );
    assert.equal(
      regressions("invoice", variant, partial).filter((row) => !row.passed)
        .length,
      1,
    );
    assert.ok(
      regressions("invoice", variant, { ...partial, list: "owner" }).every(
        (row) => row.passed,
      ),
    );
    assert.equal(
      simulate("invoice", variant, partial, { ...crossAccount, actor: "sam" })
        .status,
      200,
    );
  }
});

test("checkout preserves legitimate purchases while preventing price, quantity and coupon manipulation", () => {
  const mission = MISSIONS[1];
  const base = initialRequest("checkout", 1);
  const body = JSON.parse(base.body);
  const oneCent = { ...base, body: JSON.stringify({ ...body, unitPrice: 1 }) };
  assert.equal(
    simulate("checkout", 1, mission.initialPolicy, oneCent).data.total,
    1,
  );
  const fixed = {
    price: "catalog",
    quantity: "bounded",
    coupon: "once",
    shutdown: "off",
  };
  assert.equal(simulate("checkout", 1, fixed, oneCent).data.total, 5900);
  assert.equal(simulate("checkout", 1, fixed, oneCent).evidence, "defense");
  const discount = {
    ...base,
    body: JSON.stringify({
      ...body,
      quantity: 3,
      coupons: ["WELCOME10", "WELCOME10"],
    }),
  };
  assert.equal(simulate("checkout", 1, fixed, discount).data.total, 15930);
  for (const quantity of [-1, 0, 1.1, 6])
    assert.equal(
      simulate("checkout", 1, fixed, {
        ...base,
        body: JSON.stringify({ ...body, quantity }),
      }).status,
      422,
    );
  for (const variant of [1, 2, 3])
    assert.ok(
      regressions("checkout", variant, fixed).every((row) => row.passed),
    );
});

test("webhook body deduplication fails changed metadata, while event IDs and signature checks cooperate", () => {
  const mission = MISSIONS[2];
  const base = initialRequest("webhook", 1);
  const first = simulate("webhook", 1, mission.initialPolicy, base);
  const replay = simulate(
    "webhook",
    1,
    mission.initialPolicy,
    base,
    first.state,
  );
  assert.equal(
    first.state.deliveries,
    1,
    "later requests must not mutate previous evidence",
  );
  assert.equal(replay.state.deliveries, 2);
  assert.equal(replay.evidence, "exploit");
  const partial = { signature: "verify", replay: "body", shutdown: "off" };
  const rows = regressions("webhook", 1, partial);
  assert.equal(
    rows.find((row) => row.name.includes("changed metadata"))?.passed,
    false,
  );
  const fixed = { ...partial, replay: "event" };
  const accepted = simulate("webhook", 1, fixed, base);
  const forged = {
    ...base,
    body: JSON.stringify({ ...JSON.parse(base.body), signature: "forged" }),
  };
  assert.equal(
    simulate("webhook", 1, fixed, forged, accepted.state).status,
    401,
    "verification precedes duplicate acknowledgement",
  );
  assert.equal(
    simulate("webhook", 1, fixed, base, accepted.state).state.deliveries,
    1,
  );
  for (const variant of [1, 2, 3])
    assert.ok(
      regressions("webhook", variant, fixed).every((row) => row.passed),
    );
});

test("shutdown, malformed input and unrelated paths cannot count as successful defenses", () => {
  for (const mission of MISSIONS) {
    const request = initialRequest(mission.id, 1);
    const shutdown = { ...mission.initialPolicy, shutdown: "on" };
    assert.equal(simulate(mission.id, 1, shutdown, request).evidence, null);
    assert.ok(regressions(mission.id, 1, shutdown).some((row) => !row.passed));
    assert.equal(
      simulate(mission.id, 1, mission.initialPolicy, {
        ...request,
        path: "https://example.com",
      }).status,
      400,
    );
    assert.equal(
      simulate(mission.id, 1, mission.initialPolicy, {
        ...request,
        method: "POST",
        body: "null",
      }).status,
      400,
    );
    assert.equal(
      simulate(mission.id, 1, mission.initialPolicy, {
        ...request,
        method: "POST",
        body: "{",
      }).evidence,
      null,
    );
    assert.equal(
      simulate(mission.id, 1, mission.initialPolicy, {
        ...request,
        path: "/unrelated",
      }).status,
      404,
    );
  }
});

test("mission verification requires observations, diagnosis, manual defense and current regression results", () => {
  const mission = MISSIONS[0];
  let session = newSession(mission);
  const fixed = { detail: "owner", list: "owner", shutdown: "off" };
  assert.equal(
    evaluateSession(mission, {
      ...session,
      policy: fixed,
      testedPolicy: policyKey(fixed),
      hypothesis: mission.rootCause,
    }).complete,
    false,
  );
  session = recordRun(
    session,
    session.request,
    simulate(mission.id, 1, session.policy, session.request),
  );
  const attack = { ...session.request, path: "/invoices/4112" };
  session = recordRun(
    session,
    attack,
    simulate(mission.id, 1, session.policy, attack),
  );
  session = { ...session, policy: fixed, sandbox: freshSandbox() };
  session = recordRun(
    session,
    attack,
    simulate(mission.id, 1, session.policy, attack),
  );
  session = {
    ...session,
    testedPolicy: policyKey(fixed),
    hypothesis: mission.rootCause,
  };
  assert.equal(evaluateSession(mission, session).complete, true);
  assert.equal(evaluateSession(mission, session).score, 100);
  assert.equal(evaluateSession(mission, { ...session, hints: 3 }).score, 85);
  assert.equal(
    evaluateSession(mission, { ...session, policy: { ...fixed, list: "all" } })
      .complete,
    false,
  );
  const report = missionReport(mission, session);
  assert.match(report, /Verified in simulation/);
  assert.match(report, /GET \/invoices\/4112/);
  assert.match(report, /"detail": "owner"/);
});

test("stored sessions recover from malformed records and history is bounded", () => {
  const mission = MISSIONS[0];
  for (const bad of [
    null,
    "broken",
    [],
    { version: 2 },
    { ...newSession(mission), policy: { detail: "arbitrary" } },
  ])
    assert.equal(restoreSession(mission, bad).history.length, 0);
  let session = newSession(mission, 3);
  for (let i = 0; i < 30; i++)
    session = recordRun(
      session,
      session.request,
      simulate(mission.id, 3, session.policy, session.request),
    );
  assert.equal(session.history.length, 16);
  assert.deepEqual(
    restoreSession(mission, JSON.parse(JSON.stringify(session))),
    session,
  );
});
