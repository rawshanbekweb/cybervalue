import fs from 'node:fs';
const file='src/components/playground/ctf/SignalCTF.tsx';
let s=fs.readFileSync(file,'utf8');
const start=s.indexOf('`# NOVA / 00:17');
const end=s.indexOf('\n',start);
if(start<0||end<0)throw new Error('Report not found');
const replacement='`# NOVA / 00:17 — ${t("Final signal")}\\n\\n${t("Score: {score}/900. Nodes: {solved}/5.", { score, solved })}\\n\\n${CHALLENGES.map((item) => `## ${item.number}. ${t(item.title)}\\n\\n${t("Status: {status}. Hints: {hints}/3.", { status: t(progress[item.id].proof ? "Restored" : "Open"), hints: progress[item.id].hints })}\\n\\n${t(progress[item.id].message)}\\n\\n${t("Notes")}: ${progress[item.id].notes || t("Not written")}`).join("\\n\\n")}\\n\\n${t("This is a personal learning record, not a competition result or certificate.")}\\n`, ';
s=s.slice(0,start)+replacement+s.slice(end);
fs.writeFileSync(file,s);
