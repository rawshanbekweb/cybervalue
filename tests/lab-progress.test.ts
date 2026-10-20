import { test } from "node:test";
import assert from "node:assert/strict";
import { LESSONS as LINUX } from "../src/lib/linux/curriculum";
import { LESSONS as NETWORK } from "../src/lib/network/curriculum";
import { HTML_LESSONS } from "../src/components/playground/html-basics/lessons.data";
import { LESSONS as SECURITY } from "../src/components/playground/security-lab/lessons.data";
import { LESSONS as HTTP } from "../src/lib/http/curriculum";
import { LESSONS as HTTP_BASICS } from "../src/lib/http-basics/curriculum";
import { LESSONS as HTTPS } from "../src/lib/https-basics/curriculum";
import { LESSONS as BASH } from "../src/lib/bash-basics/curriculum";
import { LESSONS as SSH } from "../src/lib/ssh-basics/curriculum";
import {
  isLabId,
  LAB_PROGRESS,
  lessonList,
  toRecord,
} from "../src/lib/lab-progress";

test("lab progress totals match the lessons", () => {
  assert.equal(LAB_PROGRESS.linux.total, LINUX.length);
  assert.equal(LAB_PROGRESS.network.total, NETWORK.length);
  assert.equal(LAB_PROGRESS.html.total, HTML_LESSONS.length);
  assert.equal(LAB_PROGRESS.security.total, SECURITY.length);
  assert.equal(LAB_PROGRESS.http.total, HTTP.length);
  assert.equal(LAB_PROGRESS.httpbasics.total, HTTP_BASICS.length);
  assert.equal(LAB_PROGRESS.https.total, HTTPS.length);
  assert.equal(LAB_PROGRESS.bash.total, BASH.length);
  assert.equal(LAB_PROGRESS.ssh.total, SSH.length);
  assert.equal(isLabId("toString"), false);
  assert.equal(isLabId("network"), true);
});

test("stored progress is validated and normalised", () => {
  assert.deepEqual(
    lessonList({ 3: true, 1: true, 2: false, 99: true, x: true }, 17),
    [1, 3],
  );
  assert.deepEqual(lessonList([5, 5, 0, 2.5, "3", 17, 18], 17), [5, 17]);
  assert.deepEqual(lessonList("junk", 17), []);
  assert.deepEqual(toRecord([1, 4]), { 1: true, 4: true });
});
