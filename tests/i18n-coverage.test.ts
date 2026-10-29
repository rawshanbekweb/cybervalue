import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createTranslator } from "../src/lib/i18n";
import { STUDIO_PROJECTS } from "../src/lib/studio/projects";
import { checkProject } from "../src/lib/studio/checks";
import { MISSIONS, missionFiles } from "../src/lib/missions/catalog";
import {
  initialRequest,
  regressions,
  simulate,
} from "../src/lib/missions/engine";
import { translateStep } from "../src/lib/missions/i18n";
import {
  GROUPS,
  LESSONS,
  QUIZ,
} from "../src/components/playground/security-lab/lessons.data";
import { challengeFor } from "../src/lib/html-assessment/challenge";
import { CHOICES, GROUP_LABELS, TASKS } from "../src/lib/resource-exam/content";
import { gradeExam } from "../src/lib/resource-exam/grading";
import { SCENARIOS } from "../src/lib/defend/scenarios";

// Each module's source text must change when rendered in the other language.
function assertTranslated(
  locale: "uz" | "en",
  texts: Iterable<string>,
  module: string,
) {
  const t = createTranslator(locale);
  const missing = [...new Set(texts)].filter((text) => t(text) === text);
  assert.deepEqual(missing, [], `${module}: missing ${locale} translations`);
}

test("Project Studio briefs, hints and every structural check are translated", () => {
  const texts: string[] = [];
  for (const project of STUDIO_PROJECTS) {
    texts.push(
      project.title,
      project.client,
      project.level,
      project.brief,
      ...project.requirements,
      ...project.review,
      ...project.hints,
    );
    // The starter fails most checks and an empty document fails the rest.
    for (const html of [project.html, "<p>"])
      for (const check of checkProject(project.id, html))
        texts.push(check.label, check.detail);
  }
  assertTranslated("uz", texts, "Studio");
});

test("Missions briefs, controls, case files, traces and regression checks are translated", () => {
  const texts: string[] = [];
  const steps: string[] = [];
  for (const mission of MISSIONS) {
    texts.push(
      mission.title,
      mission.difficulty,
      mission.minutes,
      mission.category,
      mission.brief,
      mission.objective,
      mission.impact,
      mission.debrief,
      ...mission.hypotheses,
      ...mission.hints,
    );
    for (const control of mission.controls)
      texts.push(control.label, ...control.options.map((o) => o.label));
    // Briefing documents differ by language; code, data and logs do not.
    const uzFiles = missionFiles(mission.id, 1, createTranslator("uz"));
    missionFiles(mission.id, 1, createTranslator("en")).forEach((file, i) =>
      assert.equal(
        file.text !== uzFiles[i].text,
        /\.(md|txt)$/.test(file.name),
        `${mission.id}/${file.name}`,
      ),
    );
    // Every policy combination exercises both the vulnerable and fixed paths.
    const combos = mission.controls.reduce<Record<string, string>[]>(
      (all, control) =>
        all.flatMap((policy) =>
          control.options.map((o) => ({ ...policy, [control.key]: o.value })),
        ),
      [{ shutdown: "off" }],
    );
    for (const policy of [...combos, { ...combos[0], shutdown: "on" }])
      for (const check of regressions(mission.id, 1, policy)) {
        texts.push(check.name);
        steps.push(check.expected);
      }
    for (const policy of combos) {
      const base = initialRequest(mission.id, 1);
      for (const request of [
        base,
        { ...base, actor: "anonymous" as const },
        { ...base, actor: "sam" as const },
        { ...base, path: "/invoices" },
      ])
        steps.push(...simulate(mission.id, 1, policy, request).trace);
    }
  }
  assertTranslated("uz", texts, "Missions");
  const t = createTranslator("uz");
  const untranslated = [...new Set(steps)].filter(
    // Request lines and bare status codes are protocol text, not prose.
    (step) =>
      !/^(GET|POST) \/|^\d{3}$/.test(step) && translateStep(t, step) === step,
  );
  assert.deepEqual(untranslated, [], "Missions traces/expectations");
});

// Technical terms that read the same in Uzbek.
const SAME_IN_UZBEK = new Set([
  "Frontend",
  "Backend",
  "JWT",
  "Cookie",
  "SQL",
  "XSS",
  "CSS",
  "SQL Injection",
  "SELECT, INSERT, UPDATE, DELETE",
  "201",
  "401",
  "500",
]);

test("every Web Security Lab lesson, group and quiz question is translated", () => {
  const texts: string[] = [];
  for (const lesson of LESSONS)
    texts.push(
      lesson.title,
      lesson.heading,
      lesson.intro,
      lesson.task,
      lesson.mission,
      lesson.result,
      lesson.principle,
      lesson.teacher,
      lesson.question,
      ...lesson.theory,
    );
  texts.push(...GROUPS.map((group) => group.title));
  for (const question of QUIZ)
    texts.push(question.q, question.why, ...question.a);
  assertTranslated(
    "uz",
    texts.filter((text) => !SAME_IN_UZBEK.has(text)),
    "Security Lab",
  );
});

test("the HTML assessment's questions, requirements and explanations have English text", () => {
  const texts: string[] = [];
  for (const variant of [0, 1, 2]) {
    const challenge = challengeFor(variant);
    texts.push(...challenge.requirements, ...challenge.reasoning);
    for (const question of challenge.questions)
      texts.push(
        question.prompt,
        // Options that are only markup read the same in every language.
        ...question.options.filter((option) => !/^[<s]/.test(option)),
      );
  }
  assertTranslated("en", texts, "HTML assessment");
});

test("the resource exam's questions, tasks and feedback have English text", () => {
  // Markup, commands, addresses and record names read the same everywhere.
  const prose = (text: string) =>
    /[a-z‘’]{3,} [a-z‘’]{2,}/i.test(text) &&
    !/^(\/|[<>|!]|[A-Z]+ \/)/.test(text);
  const texts: string[] = [...Object.values(GROUP_LABELS)];
  for (const choice of CHOICES) texts.push(choice.prompt, ...choice.options);
  for (const task of TASKS) {
    texts.push(task.title, task.brief);
    for (const input of task.inputs)
      texts.push(input.label, ...(input.options ?? []));
  }
  const empty = gradeExam({});
  for (const item of empty.items) if (item.explain) texts.push(item.explain);
  assertTranslated(
    "en",
    texts.filter((text) => prose(text) && text !== "ISP gateway"),
    "Resource exam",
  );
});

test("every Build & Defend scenario, case, hint and interface string is translated", () => {
  const texts: string[] = [];
  for (const scenario of SCENARIOS) {
    texts.push(
      scenario.title,
      scenario.client,
      scenario.brief,
      scenario.debrief,
      ...scenario.hints,
    );
    // The attack class is a standard English term in Uzbek security writing.
    if (scenario.level !== "Open redirect") texts.push(scenario.level);
    for (const item of scenario.cases) texts.push(item.label, item.failure);
  }
  // Interface copy is every string literal passed to t(), directly or as
  // either branch of a condition, plus the page metadata.
  const source = [
    "src/components/playground/defend/DefendLab.tsx",
    "src/components/defend-gateway.tsx",
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  for (const match of source.matchAll(/\bt\(\s*"([^"]*)"/g))
    texts.push(match[1]);
  for (const match of source.matchAll(
    /\bt\(\s*[^"()]*?\?\s*"([^"]*)"\s*:\s*"([^"]*)"/g,
  ))
    texts.push(match[1], match[2]);
  const page = readFileSync("src/app/[lang]/akademiya/defend/page.tsx", "utf8");
  const [, title, description] =
    /metadata\(\s*"([^"]*)",\s*"([^"]*)"/.exec(page) ?? [];
  texts.push(title, description);
  assertTranslated("uz", texts, "Build & Defend");
});

test('every t("…") string in the interactive labs has Uzbek in the shared dictionary', () => {
  // Terms the Uzbek copy keeps in English.
  const same = new Set([
    "Mask",
    "Wildcard",
    "Printer",
    "Public IP",
    "Server",
    "Flag",
  ]);
  const dirs = [
    "src/components/playground/network-lab",
    "src/components/playground/linux-lab",
    "src/components/playground/junior",
    "src/components/playground/junior/ciphers",
    "src/components/playground/checkpoint",
    "src/components/playground/http-lab",
    "src/components/playground/anim-lab",
    "src/components/playground/video-lesson",
    "src/components/playground/http-basics",
    "src/components/playground/https-basics",
    "src/components/playground/bash-basics",
    "src/components/playground/ssh-basics",
    "src/components/playground/crypto-basics",
    "src/components/playground/untrusted-input",
    "src/components/playground/scams",
    "src/components/playground/browser-risks",
    "src/components/playground/access-control",
    "src/components/playground/api-security",
    "src/components/playground/classical-ciphers",
    "src/components/playground/symmetric",
    "src/components/playground/hashes",
    "src/components/playground/public-key",
    "src/components/playground/tls",
    "src/components/playground/tcpip",
    "src/components/playground/traffic",
    "src/components/playground/firewall",
    "src/components/playground/connections",
    "src/components/playground/ids",
    "src/components/playground/evidence",
    "src/components/playground/filesystem",
    "src/components/playground/logs",
    "src/components/playground/response",
    "src/components/playground/report",
    "src/components/playground/stego",
    "src/components/playground/lsb",
    "src/components/playground/metadata",
    "src/components/playground/formats",
    "src/components/playground/steganalysis",
    "src/components/playground/siem",
  ];
  const texts: string[] = [];
  for (const dir of dirs)
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
      const source = readFileSync(`${dir}/${file}`, "utf8");
      for (const match of source.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g))
        texts.push(JSON.parse(`"${match[1]}"`));
    }
  assert.ok(texts.length > 400);
  assertTranslated(
    "uz",
    texts.filter((text) => !same.has(text)),
    "Interactive labs",
  );
});

test("every page title and description passed to metadata() has Uzbek", () => {
  // Names the Uzbek pages keep as they are.
  const same = new Set([
    "CTF",
    "Cybervalue Academy Kids",
    "Cybervalue Academy Junior",
    "Academy Intermediate",
  ]);
  const texts: string[] = [];
  for (const file of readdirSync("src/app", {
    recursive: true,
    encoding: "utf8",
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(`src/app/${file}`, "utf8");
    for (const match of source.matchAll(
      /\bmetadata\(\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"/g,
    ))
      texts.push(JSON.parse(`"${match[1]}"`), JSON.parse(`"${match[2]}"`));
  }
  assert.ok(texts.length > 40);
  // Source text may be English or Uzbek; either way the two languages differ.
  const uz = createTranslator("uz");
  const en = createTranslator("en");
  const missing = [...new Set(texts)].filter(
    (text) => !same.has(text) && uz(text) === en(text),
  );
  assert.deepEqual(missing, [], "Page metadata: missing translations");
});
