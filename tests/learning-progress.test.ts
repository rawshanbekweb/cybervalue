import { test } from "node:test";
import assert from "node:assert/strict";
import { lessonRecord } from "../src/lib/learning-progress";

test("damaged lesson storage cannot crash an editor or inflate progress", () => {
  for (const value of [null, false, [], 42, "broken"]) {
    assert.deepEqual(lessonRecord<boolean>(value, 12, "boolean"), {});
  }
  assert.deepEqual(
    lessonRecord<boolean>(
      { 1: true, 2: false, 3: "yes", 999: true, "01": true, "-1": true },
      12,
      "boolean",
    ),
    { 1: true, 2: false },
  );
  assert.deepEqual(
    lessonRecord<string>(
      { 1: "", 2: "<h1>My draft</h1>", 3: {}, 4: true },
      12,
      "string",
    ),
    { 1: "", 2: "<h1>My draft</h1>" },
  );
});
