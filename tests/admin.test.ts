import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { formDataToContentInput } from "../src/lib/admin-form";
import { contentSchema } from "../src/lib/validation";

test("hashPassword/verifyPassword round trip and rejection", () => {
  const stored = hashPassword("correct horse battery staple");
  assert.equal(verifyPassword("correct horse battery staple", stored), true);
  assert.equal(verifyPassword("wrong password", stored), false);
  assert.equal(
    verifyPassword("correct horse battery staple", "garbage"),
    false,
  );
  assert.equal(
    verifyPassword("correct horse battery staple", "scrypt:1:2"),
    false,
  );
});

test("formDataToContentInput maps a project form to a valid ContentInput", () => {
  const form = new FormData();
  form.set("slug", "e2e-project");
  form.set("title", "A sufficiently long title");
  form.set(
    "summary",
    "A summary that is definitely long enough to pass validation.",
  );
  form.set("body", "Body text for the project.");
  form.set("status", "DRAFT");
  form.set("problem", "Problem");
  form.set("objective", "Objective");
  form.set("architecture", "Architecture");
  form.set("securityConsiderations", "Security");
  form.set("challenges", "Challenges");
  form.set("solution", "Solution");
  form.set("result", "Result");
  form.set("lessonsLearned", "Lessons");
  form.set("projectStatus", "Active");
  form.set("technologies", "Next.js, Prisma, PostgreSQL");

  const input = formDataToContentInput("work", form);
  const parsed = contentSchema.safeParse(input);
  assert.equal(parsed.success, true);
  if (parsed.success && parsed.data.kind === "PROJECT")
    assert.deepEqual(parsed.data.project.technologies, [
      "Next.js",
      "Prisma",
      "PostgreSQL",
    ]);
});

test("formDataToContentInput maps a CTF form with a datetime field", () => {
  const form = new FormData();
  form.set("slug", "e2e-ctf");
  form.set("title", "A sufficiently long title");
  form.set(
    "summary",
    "A summary that is definitely long enough to pass validation.",
  );
  form.set("body", "Body text for the event.");
  form.set("status", "DRAFT");
  form.set("eventName", "Example CTF 2026");
  form.set("eventDate", "2026-01-01T12:00");
  form.set("lessonsLearned", "Lessons");

  const parsed = contentSchema.safeParse(formDataToContentInput("ctf", form));
  assert.equal(parsed.success, true);
});

test("formDataToContentInput requires the lab authorized checkbox to be checked", () => {
  const form = new FormData();
  form.set("slug", "e2e-lab");
  form.set("title", "A sufficiently long title");
  form.set(
    "summary",
    "A summary that is definitely long enough to pass validation.",
  );
  form.set("body", "Body text for the lab.");
  form.set("status", "DRAFT");
  form.set("environment", "Local VM");
  form.set("objective", "Objective");
  form.set("methodology", "Methodology");
  form.set("discovery", "Discovery");
  form.set("analysis", "Analysis");
  form.set("impact", "Impact");
  form.set("remediation", "Remediation");
  form.set("lessonsLearned", "Lessons");
  form.set("difficulty", "BEGINNER");

  assert.equal(
    contentSchema.safeParse(formDataToContentInput("labs", form)).success,
    false,
  );
  form.set("authorized", "on");
  assert.equal(
    contentSchema.safeParse(formDataToContentInput("labs", form)).success,
    true,
  );
});
