import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHOICES,
  MAX_PRACTICE,
  MAX_TEST,
  MAX_TOTAL,
  TASKS,
} from "../src/lib/resource-exam/content";
import { gradeExam, inputKeyIds } from "../src/lib/resource-exam/grading";

const SOLUTION: Record<string, string> = {
  w1: "1",
  w2: "2",
  w3: "1",
  w4: "2",
  w5: "2",
  w6: "3",
  w7: "1",
  w8: "3",
  w9: "1",
  w10: "3",
  l1: "1",
  l2: "1",
  l3: "2",
  l4: "1",
  l5: "1",
  l6: "2",
  l7: "2",
  l8: "2",
  l9: "2",
  l10: "3",
  "url-scheme": "https",
  "url-host": "shop.example.com",
  "url-port": "8443",
  "url-path": "/search",
  "url-query": "?q=network&page=2",
  "url-fragment": "#results",
  "subnet-network": "192.168.1.0/25",
  "subnet-last": "192.168.1.126",
  "subnet-same": "Yo‘q, boshqa /25 subnetda",
  "route-1": "Router B",
  "route-2": "Router A",
  "route-3": "ISP gateway",
  "dns-1": "A",
  "dns-2": "AAAA",
  "dns-3": "CNAME",
  "dns-4": "MX",
  "dns-5": "NS",
  "dns-6": "PTR",
  "status-1": "401",
  "status-2": "403",
  "status-3": "500",
  "http-request":
    "GET /products?limit=5 HTTP/1.1\nHost: example.com\nAccept: application/json\n\n",
  "cmd-cd": "cd /var/log",
  "cmd-ls": "ls -al",
  "cmd-make": "mkdir loyiha && cd loyiha\ntouch notes.txt",
  "cmd-append": 'echo "Boshlandi" >> app.log',
  "cmd-find": "find /home -size +50M",
  "cmd-sudo": "sudo !!",
  "cmd-rm": "rm -rf loyiha_papka/",
};

test("the model solution scores full marks and every input has a key", () => {
  const ids = [
    ...CHOICES.map((c) => c.id),
    ...TASKS.flatMap((t) => t.inputs.map((i) => i.id)),
  ];
  assert.deepEqual([...ids].sort(), Object.keys(SOLUTION).sort());
  for (const task of TASKS)
    for (const input of task.inputs)
      assert.ok(inputKeyIds().includes(input.id));
  const result = gradeExam(SOLUTION);
  assert.equal(result.total, MAX_TOTAL);
  assert.equal(result.test.score, MAX_TEST);
  assert.equal(result.practice.score, MAX_PRACTICE);
  assert.equal(MAX_TOTAL, 100);
  assert.ok(result.items.every((item) => item.score === item.max));
});

test("blank and invalid answers score zero without throwing", () => {
  assert.equal(gradeExam({}).total, 0);
  assert.equal(gradeExam({ w1: "9", l1: "-1", "cmd-rm": "rm -rf /" }).total, 0);
});

test("practical checks reject near-misses", () => {
  const score = (id: string, value: string) =>
    gradeExam({ [id]: value }).items.find((i) => i.id === id)!.score;
  assert.equal(score("cmd-ls", "ls -l"), 0);
  assert.equal(score("cmd-append", "echo Boshlandi > app.log"), 0);
  assert.equal(score("cmd-find", "find /home -size 50M"), 0);
  assert.equal(score("cmd-rm", "rm loyiha_papka"), 0);
  assert.equal(score("cmd-rm", "rm -r /"), 0);
  assert.equal(score("cmd-cd", "cd var/log"), 0);
  assert.equal(score("cmd-make", "mkdir loyiha"), 2);
  assert.equal(score("cmd-make", "touch loyiha/notes.txt"), 0);
  assert.equal(
    score("http-request", "POST /products?limit=5 HTTP/1.1\nHost: example.com"),
    2,
  );
  assert.equal(
    score(
      "http-request",
      "GET /products?limit=5 HTTP/1.1\nHost: example.com\nAccept: application/json\n\nbody",
    ),
    7,
  );
  assert.equal(score("route-1", "Router A"), 0);
});

test("public exam content carries no answer keys", () => {
  const text = JSON.stringify({ CHOICES, TASKS });
  assert.ok(!/"(answer|explain|expected|correct)"/.test(text));
});
