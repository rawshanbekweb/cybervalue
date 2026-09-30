import fs from 'node:fs';
import ts from 'typescript';
import { files } from './extract.mjs';
const dict=Object.assign({}, ...['messages','html','ctf'].map(name=>JSON.parse(fs.readFileSync('src/lib/i18n/'+name+'.json','utf8'))));
const known=new Set([...Object.keys(dict),...Object.values(dict)]);
for(const file of process.argv.length > 2 ? process.argv.slice(2) : files) {
 let source=fs.readFileSync(file,'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const edits=[]; const owners=new Set();
 const client=source.includes('"use client"');
 function owner(n) { for(let p=n;p;p=p.parent) if(ts.isFunctionDeclaration(p)&&p.name&&/^[A-Z]/.test(p.name.text)) return p; }
 function replace(n,text) {const fn=owner(n);if(!fn)return; edits.push([n.getStart(ast),n.end,text]);owners.add(fn);}
 function visit(n) {
   if(ts.isJsxText(n)) {
    const s=n.text.replace(/\s+/g,' ').trim();
    if(known.has(s)) replace(n,`{t(${JSON.stringify(s)})}`);
   } else if(ts.isJsxAttribute(n)&&n.initializer&&ts.isStringLiteral(n.initializer)&&['title','placeholder','aria-label','link'].includes(n.name.text)&&known.has(n.initializer.text)) {
    replace(n.initializer,`{t(${JSON.stringify(n.initializer.text)})}`);
   } else if(ts.isStringLiteral(n)&&known.has(n.text)&&ts.isConditionalExpression(n.parent)&&n!==n.parent.condition) {
    replace(n,`t(${JSON.stringify(n.text)})`);
   }
   ts.forEachChild(n,visit);
 }
 visit(ast);
 if(!edits.length)continue;
 for(const fn of owners) {
  edits.push([fn.body.getStart(ast)+1,fn.body.getStart(ast)+1,`\n  const t = ${client?'useTranslator()':'await getTranslator()'};`]);
  if(!client&&!fn.modifiers?.some(m=>m.kind===ts.SyntaxKind.AsyncKeyword)) {
   const start=source.indexOf('function',fn.getStart(ast)); edits.push([start,start,'async ']);
  }
 }
 edits.sort((a,b)=>b[0]-a[0]);
 for(const [start,end,text] of edits)source=source.slice(0,start)+text+source.slice(end);
 const imp=client?'import { useTranslator } from "@/components/locale-provider";':'import { getTranslator } from "@/lib/i18n/server";';
 source=client?source.replace('"use client";','"use client";\n'+imp):imp+'\n'+source;
 fs.writeFileSync(file,source);
}
