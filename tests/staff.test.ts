import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupCondition,
  groupLabel,
  homeOf,
  isStaffPath,
  mayManage,
  pickGroup,
  roleOf,
} from "../src/lib/staff";

const owner = { owner: true, groups: [] };
const teacher = { owner: false, groups: ["3-A", "3-B"] };
const all = ["3-A", "3-B", "4-A"];

test("lets an owner pick any group or all of them", () => {
  assert.deepEqual(pickGroup(owner, all, "4-A"), { groups: all, group: "4-A" });
  assert.deepEqual(pickGroup(owner, all, ""), { groups: all, group: "" });
  assert.equal(pickGroup(owner, all, "nope").group, "");
});

test("keeps a teacher inside their own groups", () => {
  assert.deepEqual(pickGroup(teacher, all, "3-B"), {
    groups: ["3-A", "3-B"],
    group: "3-B",
  });
  // Someone else's group or no choice means all of the teacher's groups.
  assert.deepEqual(pickGroup(teacher, all, "4-A").group, ["3-A", "3-B"]);
  assert.deepEqual(pickGroup(teacher, all, undefined).group, ["3-A", "3-B"]);
});

test("gives a teacher with no groups in use nothing to see", () => {
  assert.deepEqual(pickGroup(teacher, ["4-A"], "").group, []);
});

test("turns a pick into a Prisma filter", () => {
  assert.deepEqual(groupCondition(""), {});
  assert.deepEqual(groupCondition("3-A"), { group: "3-A" });
  assert.deepEqual(groupCondition(["3-A"]), { group: { in: ["3-A"] } });
  assert.deepEqual(groupCondition([]), { group: { in: [] } });
});

test("labels only single groups", () => {
  assert.equal(groupLabel("3-A"), "3-A");
  assert.equal(groupLabel(["3-A", "3-B"]), "");
});

test("reads roles, falling back to owner for old rows", () => {
  assert.equal(roleOf({ role: "teacher" }), "teacher");
  assert.equal(roleOf({ role: "admin" }), "admin");
  assert.equal(roleOf({ role: "owner" }), "owner");
  assert.equal(roleOf({ role: "" }), "owner");
});

test("sends teachers to /teacher and everyone else to /admin", () => {
  assert.equal(homeOf({ role: "teacher" }), "/teacher");
  assert.equal(homeOf({ role: "admin" }), "/admin");
  assert.equal(homeOf({ role: "owner" }), "/admin");
});

test("accepts only staff panel paths after signing in", () => {
  for (const ok of ["/admin", "/admin/team", "/teacher", "/teacher/class?g=A"])
    assert.ok(isStaffPath(ok), ok);
  for (const bad of [
    "/administrator",
    "/teachers",
    "//evil.example",
    "https://x.uz/admin",
    "/student",
  ])
    assert.ok(!isStaffPath(bad), bad);
});

test("lets admins manage only teachers and owners everyone", () => {
  assert.ok(mayManage({ role: "owner" }, "admin", "owner"));
  assert.ok(mayManage({ role: "admin" }, "teacher", "teacher"));
  assert.ok(!mayManage({ role: "admin" }, "teacher", "admin"));
  assert.ok(!mayManage({ role: "admin" }, "owner"));
  assert.ok(!mayManage({ role: "teacher" }, "teacher"));
});
