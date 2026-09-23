import { z } from "zod";
import { MISSIONS, type Mission } from "./catalog";
import {
  freshSandbox,
  initialRequest,
  regressions,
  type LabRequest,
  type Outcome,
  type Policy,
} from "./engine";

const requestSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: z.string().max(160),
  actor: z.enum(["alex", "sam", "anonymous"]),
  body: z.string().max(4000),
});
const sandboxSchema = z.object({
  deliveries: z.number().int().min(0).max(50),
  seenEvents: z.array(z.string().max(80)).max(50),
  seenBodies: z.array(z.string().max(4000)).max(50),
});
const outcomeSchema = z.object({
  status: z.number().int().min(100).max(599),
  data: z.record(z.string(), z.unknown()),
  trace: z.array(z.string()).max(12),
  state: sandboxSchema,
  evidence: z.enum(["baseline", "exploit", "defense"]).nullable(),
});
const sessionSchema = z.object({
  version: z.literal(1),
  variant: z.number().int().min(1).max(3),
  policy: z.record(z.string(), z.string()),
  request: requestSchema,
  sandbox: sandboxSchema,
  history: z
    .array(
      z.object({
        request: requestSchema,
        outcome: outcomeSchema,
        policy: z.record(z.string(), z.string()),
      }),
    )
    .max(16),
  baseline: z.boolean(),
  exploit: z.boolean(),
  defensePolicy: z.string().nullable(),
  testedPolicy: z.string().nullable(),
  hints: z.number().int().min(0).max(3),
  hypothesis: z.number().int().min(-1).max(2),
  notes: z.string().max(5000),
});
export type Session = z.infer<typeof sessionSchema>;
export const policyKey = (policy: Policy) =>
  JSON.stringify(Object.entries(policy).sort(([a], [b]) => a.localeCompare(b)));

export function newSession(mission: Mission, variant = 1): Session {
  return {
    version: 1,
    variant,
    policy: { ...mission.initialPolicy },
    request: initialRequest(mission.id, variant),
    sandbox: freshSandbox(),
    history: [],
    baseline: false,
    exploit: false,
    defensePolicy: null,
    testedPolicy: null,
    hints: 0,
    hypothesis: -1,
    notes: "",
  };
}

export const EMPTY_SESSIONS = Object.fromEntries(
  MISSIONS.map((mission) => [mission.id, newSession(mission)]),
);
export function restoreSession(mission: Mission, raw: unknown): Session {
  const result = sessionSchema.safeParse(raw);
  if (!result.success) return EMPTY_SESSIONS[mission.id];
  const session = result.data;
  if (
    ![
      ...mission.controls,
      { key: "shutdown", options: [{ value: "off" }, { value: "on" }] },
    ].every((control) =>
      control.options.some(
        (option) => option.value === session.policy[control.key],
      ),
    )
  )
    return EMPTY_SESSIONS[mission.id];
  return session;
}

export function recordRun(
  session: Session,
  request: LabRequest,
  outcome: Outcome,
): Session {
  return {
    ...session,
    request,
    sandbox: outcome.state,
    history: [
      ...session.history,
      { request, outcome, policy: { ...session.policy } },
    ].slice(-16),
    baseline: session.baseline || outcome.evidence === "baseline",
    exploit: session.exploit || outcome.evidence === "exploit",
    defensePolicy:
      outcome.evidence === "defense"
        ? policyKey(session.policy)
        : session.defensePolicy,
  };
}

export function evaluateSession(mission: Mission, session: Session) {
  const tested = session.testedPolicy === policyKey(session.policy);
  const tests = tested
    ? regressions(mission.id, session.variant, session.policy)
    : [];
  const defended = session.defensePolicy === policyKey(session.policy);
  const diagnosed = session.hypothesis === mission.rootCause;
  const passing = tests.filter((test) => test.passed).length;
  const complete =
    session.baseline &&
    session.exploit &&
    defended &&
    diagnosed &&
    tests.length > 0 &&
    passing === tests.length;
  const score = Math.max(
    0,
    (session.baseline ? 15 : 0) +
      (session.exploit ? 20 : 0) +
      (defended ? 15 : 0) +
      (diagnosed ? 10 : 0) +
      (tests.length ? Math.round((40 * passing) / tests.length) : 0) -
      session.hints * 5,
  );
  return { tested, tests, defended, diagnosed, passing, complete, score };
}

export function missionReport(mission: Mission, session: Session): string {
  const result = evaluateSession(mission, session);
  return [
    `# ${mission.title}`,
    `Case variant: ${session.variant}`,
    `Status: ${result.complete ? "Verified in simulation" : "Investigation in progress"}`,
    `Learning score: ${result.score}/100 (hints used: ${session.hints})`,
    "",
    "## Findings",
    session.notes || "No investigator notes yet.",
    "",
    "## Root-cause hypothesis",
    mission.hypotheses[session.hypothesis] ?? "Not selected",
    "",
    "## Current policy",
    "```json",
    JSON.stringify(session.policy, null, 2),
    "```",
    "",
    "## Regression checks",
    ...result.tests.map(
      (test) =>
        `- [${test.passed ? "x" : " "}] ${test.name}\n  Expected: ${test.expected}\n  Observed: ${test.actual}`,
    ),
    "",
    "## Recorded requests (most recent 16)",
    ...session.history.map((run, index) =>
      [
        `### Request ${index + 1}: ${run.request.method} ${run.request.path}`,
        `Actor: ${run.request.actor}`,
        `Policy: ${JSON.stringify(run.policy)}`,
        "```json",
        run.request.body,
        "```",
        `Status: ${run.outcome.status}`,
        "```json",
        JSON.stringify(run.outcome.data, null, 2),
        "```",
        ...run.outcome.trace.map((step) => `- ${step}`),
        "",
      ].join("\n"),
    ),
    "",
    "This report describes synthetic browser simulations. It is a learning record, not a certification or an assessment of a live system.",
  ].join("\n");
}
