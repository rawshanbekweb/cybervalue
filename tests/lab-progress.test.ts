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
import { LESSONS as CRYPTO } from "../src/lib/crypto-basics/curriculum";
import { LESSONS as INPUT } from "../src/lib/untrusted-input/curriculum";
import { LESSONS as SCAMS } from "../src/lib/scams/curriculum";
import { LESSONS as BROWSER } from "../src/lib/browser-risks/curriculum";
import { LESSONS as ACCESS } from "../src/lib/access-control/curriculum";
import { LESSONS as API } from "../src/lib/api-security/curriculum";
import { LESSONS as CLASSIC } from "../src/lib/classical-ciphers/curriculum";
import { LESSONS as SYMMETRIC } from "../src/lib/symmetric/curriculum";
import { LESSONS as HASHES } from "../src/lib/hashes/curriculum";
import { LESSONS as PUBKEY } from "../src/lib/public-key/curriculum";
import { LESSONS as TLS } from "../src/lib/tls/curriculum";
import { LESSONS as TCPIP } from "../src/lib/tcpip/curriculum";
import { LESSONS as TRAFFIC } from "../src/lib/traffic/curriculum";
import { LESSONS as FIREWALL } from "../src/lib/firewall/curriculum";
import { LESSONS as CONNECTIONS } from "../src/lib/connections/curriculum";
import { LESSONS as IDS } from "../src/lib/ids/curriculum";
import { LESSONS as EVIDENCE } from "../src/lib/evidence/curriculum";
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
  assert.equal(LAB_PROGRESS.crypto.total, CRYPTO.length);
  assert.equal(LAB_PROGRESS.input.total, INPUT.length);
  assert.equal(LAB_PROGRESS.scams.total, SCAMS.length);
  assert.equal(LAB_PROGRESS.browser.total, BROWSER.length);
  assert.equal(LAB_PROGRESS.access.total, ACCESS.length);
  assert.equal(LAB_PROGRESS.api.total, API.length);
  assert.equal(LAB_PROGRESS.classic.total, CLASSIC.length);
  assert.equal(LAB_PROGRESS.symmetric.total, SYMMETRIC.length);
  assert.equal(LAB_PROGRESS.hashes.total, HASHES.length);
  assert.equal(LAB_PROGRESS.pubkey.total, PUBKEY.length);
  assert.equal(LAB_PROGRESS.tls.total, TLS.length);
  assert.equal(LAB_PROGRESS.tcpip.total, TCPIP.length);
  assert.equal(LAB_PROGRESS.traffic.total, TRAFFIC.length);
  assert.equal(LAB_PROGRESS.firewall.total, FIREWALL.length);
  assert.equal(LAB_PROGRESS.connections.total, CONNECTIONS.length);
  assert.equal(LAB_PROGRESS.ids.total, IDS.length);
  assert.equal(LAB_PROGRESS.evidence.total, EVIDENCE.length);
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
