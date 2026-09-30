import fs from 'node:fs';
function edit(file, pairs) {
 let s=fs.readFileSync(file,'utf8');
 for(const [a,b] of pairs) {if(!s.includes(a)) throw new Error(file+': missing '+a);s=s.replaceAll(a,b);}
 fs.writeFileSync(file,s);
}
edit('src/app/page.tsx', [
 ['<h3>{title}</h3>','<h3>{t(title)}</h3>'],['<p>{text}</p>','<p>{t(text)}</p>'],['{label}\n','{t(label)}\n'],
 ['description: site.description,','description: t(site.description),'],
]);
edit('src/components/playground/html-basics/HtmlBasics.tsx', [
 ['import { useState } from "react";', 'import { useState } from "react";\nimport { useTranslator } from "@/components/locale-provider";'],
 ['export function HtmlBasics() {','export function HtmlBasics() {\n  const t = useTranslator();'],
 ['<h1>HTML Lessons</h1>','<h1>{t("HTML Lessons")}</h1>'],
 ['12 SHORT EXERCISES','{t("12 SHORT EXERCISES")}'],
 ['HTML sinovi · bir martalik baholash →','{t("HTML test · one-time assessment →")}'],
 ['<span>Progress</span>','<span>{t("Progress")}</span>'],
 ['{l.title}','{t(l.title)}'],['{lesson.title}','{t(lesson.title)}'],['{lesson.intro}','{t(lesson.intro)}'],['{lesson.task}','{t(lesson.task)}'],['{r.label}','{t(r.label)}'],
 ['LESSON {lesson.id} / {TOTAL}','{t("Lesson {lesson} / {total}", { lesson: lesson.id, total: TOTAL })}'],
 ['<b>Task:</b>','<b>{t("Task:")}</b>'],
 ['<h3>Code (edit it)</h3>','<h3>{t("Code (edit it)")}</h3>'],
 ['spellCheck={false}','aria-label={t("Code (edit it)")}\n              spellCheck={false}'],
 ['<h3>Result (live preview)</h3>','<h3>{t("Result (live preview)")}</h3>'],
 ['title="Result"','title={t("Result")}'],
 ['            Check\n','            {t("Check")}\n'],
 ['            Sample solution\n','            {t("Sample solution")}\n'],
 ['            Start over\n','            {t("Start over")}\n'],
 ['✓ All conditions passed! You can move on to the next lesson.','{t("✓ All conditions passed! You can move on to the next lesson.")}'],
 ['← Previous lesson','{t("← Previous lesson")}'],['Next lesson →','{t("Next lesson →")}'],
]);
