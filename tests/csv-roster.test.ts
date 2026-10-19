import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDelimiter, parseCsv, rosterFromCsv } from "../src/lib/csv";
import {
  filtersQuery,
  readFilters,
  sortUsers,
  type ListedUser,
} from "../src/lib/admin/users-list";

test("parseCsv handles quotes, escaped quotes and line breaks", () => {
  assert.deepEqual(parseCsv('a,"b, c","say ""hi"""\r\n"x\ny",z\n'), [
    ["a", "b, c", 'say "hi"'],
    ["x\ny", "z"],
  ]);
});

test("the delimiter is detected from the first line", () => {
  assert.equal(detectDelimiter("Ism;Guruh\nA;B"), ";");
  assert.equal(detectDelimiter("Ism\tGuruh"), "\t");
  assert.equal(detectDelimiter("Name,Group"), ",");
  assert.equal(detectDelimiter("Just one column"), ",");
});

test("a sheet without a header uses name then group", () => {
  assert.equal(
    rosterFromCsv("Lola Karimova,3-A\nSardor Aliyev,3-B\n"),
    "Lola Karimova | 3-A\nSardor Aliyev | 3-B",
  );
});

test("Uzbek headers from Excel (semicolons, BOM) are recognised", () => {
  assert.equal(
    rosterFromCsv(
      "﻿№;Familiya;Ism;Sinf\n1;Karimova;Lola;3-A\n2;Aliyev;Sardor;3-A",
    ),
    "Karimova Lola | 3-A\nAliyev Sardor | 3-A",
  );
  assert.equal(
    rosterFromCsv("F.I.O,Guruh\nLola Karimova,7-B"),
    "Lola Karimova | 7-B",
  );
});

test("English headers, a missing group and stray pipes", () => {
  assert.equal(
    rosterFromCsv("Group,Full name\n,Ann | Lee\n5-A,Bob\n,\n"),
    "Ann Lee\nBob | 5-A",
  );
  assert.equal(rosterFromCsv(""), "");
});

const user = (over: Partial<ListedUser>): ListedUser => ({
  key: "s:1",
  id: "1",
  kind: "student",
  name: "A",
  group: "",
  status: "active",
  level: "",
  xp: null,
  done: null,
  submissions: null,
  last: null,
  createdAt: new Date(0),
  ...over,
});

test("users sort by a column with the name as tie-breaker", () => {
  const rows = [
    user({ key: "1", name: "Zuhra", group: "10-A", last: new Date(3) }),
    user({ key: "2", name: "Aziz", group: "9-A", last: null }),
    user({ key: "3", name: "Bek", group: "9-A", last: new Date(5) }),
  ];
  const keys = (r: ListedUser[]) => r.map((u) => u.key);
  assert.deepEqual(keys(sortUsers(rows, "name", "asc")), ["2", "3", "1"]);
  // Numeric group order: 9-A before 10-A.
  assert.deepEqual(keys(sortUsers(rows, "group", "asc")), ["2", "3", "1"]);
  assert.deepEqual(keys(sortUsers(rows, "last", "desc")), ["3", "1", "2"]);
});

test("filters are read safely and written back without defaults", () => {
  const filters = readFilters({
    q: "  ali ",
    kind: "kids",
    status: "bogus",
    sort: "last",
    dir: "desc",
    page: "-4",
  });
  assert.deepEqual(filters, {
    q: "ali",
    kind: "kids",
    status: "all",
    group: "",
    sort: "last",
    dir: "desc",
    page: 1,
  });
  assert.equal(
    filtersQuery(filters, { page: 3 }),
    "?q=ali&kind=kids&sort=last&dir=desc&page=3",
  );
  assert.equal(filtersQuery(readFilters({})), "");
});
