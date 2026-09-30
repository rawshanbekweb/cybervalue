import fs from 'node:fs';
import ts from 'typescript';
const strings=new Set();
for(const file of process.argv.slice(2)) {
 const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n) {
  if(ts.isJsxText(n)) {const s=n.text.replace(/\s+/g,' ').trim(); if(/[A-Za-z]/.test(s))strings.add(s);}
  if(ts.isStringLiteral(n) && !ts.isImportDeclaration(n.parent) && !/^(className|href|id|name|type|role|aria-labelledby)$/.test(n.parent.name?.getText(ast)??'') && /[A-Za-z]/.test(n.text)&&(/\s/.test(n.text)||/[‘’]/.test(n.text))&&!n.text.includes('\n')&&!/^[@#./]/.test(n.text))strings.add(n.text);
  ts.forEachChild(n,visit);
 }
 visit(ast);
}
console.log([...strings].join('\n'));
