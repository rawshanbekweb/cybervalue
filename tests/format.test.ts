import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCount } from "../src/lib/format";

test("counts group thousands the same way on server and client", () => {
  assert.equal(formatCount(528, "en"), "528");
  assert.equal(formatCount(30000, "en"), "30,000");
  assert.equal(formatCount(1234567, "en"), "1,234,567");
  assert.equal(formatCount(30000, "uz"), "30 000");
  assert.equal(formatCount(0, "uz"), "0");
});
