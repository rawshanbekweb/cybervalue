import ts from 'typescript';
import fs from 'node:fs';
export const files = [
 'src/app/page.tsx','src/app/about/page.tsx','src/app/activity/page.tsx','src/app/search/page.tsx','src/app/playground/page.tsx','src/app/not-found.tsx','src/app/error.tsx',
 'src/components/mission-gateway.tsx','src/components/studio-gateway.tsx','src/components/ctf-gateway.tsx','src/components/web-lesson-resource.tsx','src/components/archive.tsx','src/components/ui.tsx','src/components/learning-catalog.tsx','src/components/practice-preview.tsx',
];
const strings = new Set();
for (const file of files) {
 const src=fs.readFileSync(file,'utf8');
 const ast=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n) {
   if(ts.isJsxText(n)) {const text=n.text.replace(/\s+/g,' ').trim(); if(/[A-Za-z]/.test(text)) strings.add(text);}
   if(ts.isStringLiteral(n) && /[A-Za-z]/.test(n.text) && !/^[@./#]/.test(n.text) && /[ A-Z]/.test(n.text)) strings.add(n.text);
   ts.forEachChild(n,visit);
 }
 visit(ast);
}
for(const file of ['src/lib/site.ts','src/lib/learning.ts']) {
 const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 function visit(n) {
  if(ts.isPropertyAssignment(n) && /^(title|description|eyebrow|empty|detail|singular|label|level|category)$/.test(n.name.getText(ast)) && ts.isStringLiteral(n.initializer)) strings.add(n.initializer.text);
  ts.forEachChild(n,visit);
 }
 visit(ast);
}
fs.writeFileSync('.i18n-work/strings.json',JSON.stringify([...strings],null,2));
console.log([...strings].join('\n'));
