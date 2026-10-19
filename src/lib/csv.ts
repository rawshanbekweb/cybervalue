// Reading spreadsheets saved as CSV. Excel writes "," or ";" (by locale),
// Google Sheets "," and tab-separated text uses tabs; quoted cells may hold
// separators, quotes ("") and line breaks.

export function detectDelimiter(text: string) {
  const line = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map(
    (d) => [d, line.split(d).length - 1] as const,
  );
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

export function parseCsv(input: string, delimiter = detectDelimiter(input)) {
  const text = input.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

const NAME =
  /^(name|full ?name|student|ism|ismi|f\.?i\.?o\.?|fio|ism.?familiya|familiya.?ism|o.quvchi|bola)$/i;
const FIRST = /^(first ?name|ism|ismi)$/i;
const LAST = /^(last ?name|surname|familiya|familiyasi)$/i;
const GROUP = /^(group|class|guruh|guruhi|sinf|sinfi)$/i;

/**
 * Turns a spreadsheet into roster lines ("Full name | group"). A header row
 * is recognised in English or Uzbek (Name / Ism, First and Last name,
 * Group / Guruh / Sinf); without one the first column is the name and the
 * second the group.
 */
export function rosterFromCsv(input: string) {
  const rows = parseCsv(input);
  if (!rows.length) return "";
  const header = rows[0].map((c) => c.replace(/[‘’ʻʼ`']/g, "'"));
  const find = (re: RegExp) => header.findIndex((c) => re.test(c));
  // A full-name column wins; otherwise first and last name are joined in
  // the order the sheet has them (Uzbek lists often put the surname first).
  const fullName = header.findIndex((c) => NAME.test(c) && !FIRST.test(c));
  const first = find(FIRST);
  const last = find(LAST);
  const group = find(GROUP);
  const hasHeader = fullName >= 0 || first >= 0 || last >= 0 || group >= 0;
  const body = hasHeader ? rows.slice(1) : rows;
  const groupAt = hasHeader ? group : 1;
  const parts =
    fullName >= 0
      ? [fullName]
      : first >= 0 && last >= 0
        ? [Math.min(first, last), Math.max(first, last)]
        : [first >= 0 ? first : last >= 0 ? last : 0];
  return body
    .map((r) => {
      const full = parts.map((i) => r[i] ?? "").join(" ");
      // "|" separates name and group in the roster, so it cannot stay inside.
      const clean = (s: string) =>
        s.replaceAll("|", " ").replace(/\s+/g, " ").trim();
      const person = clean(full);
      const team = groupAt >= 0 ? clean(r[groupAt] ?? "") : "";
      return person ? (team ? `${person} | ${team}` : person) : "";
    })
    .filter(Boolean)
    .join("\n");
}
