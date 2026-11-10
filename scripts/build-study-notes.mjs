import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const dir=path.join(root,'docs/study-notes');
const book=JSON.parse(fs.readFileSync(path.join(root,'data/books/introspection.json'),'utf8'));
const entries=book.entries.filter(e=>!e.chapter.endsWith('appendix'));
const chapters=[...new Set(entries.map(e=>e.chapter))];
const report=[];
const errors=[];
const combined=[];
for(const chapter of chapters){
 const source=entries.filter(e=>e.chapter===chapter);
 const rows=[];
 for(const e of source){
  const suffix=e.id.split('.').at(-1);
  const file=`${chapter}-${suffix}.md`;
  const absolute=path.join(dir,file);
  if(!fs.existsSync(absolute))continue;
  const content=fs.readFileSync(absolute,'utf8').trim();
  if(content.split(/\r?\n/)[0]!==`# ${e.label}`)errors.push(`${file}: title differs from source`);
  if(/친구에게 설명하듯 정리한 원고|구어체 정리 원고|이 책에서는|원문은|2026-11-10/.test(content))errors.push(`${file}: unwanted metadata`);
  if(/^##\s+\d+[.)]/m.test(content))errors.push(`${file}: numbered subheading`);
  const sections=(content.match(/^## /gm)||[]).length;
  const tables=(content.match(/^\|[-: ]+\|/gm)||[]).length;
  if(sections<3)errors.push(`${file}: fewer than three sections`);
  if(tables>1)errors.push(`${file}: too many tables`);
  rows.push({id:e.id,title:e.title,label:e.label,file,sections,tables,sourceCharacters:e.texts.korean.length,summaryCharacters:content.length,sourceSha256:crypto.createHash('sha256').update(e.texts.korean).digest('hex'),content});
 }
 const complete=rows.length===source.length;
 report.push({chapter,expected:source.length,saved:rows.length,complete});
 if(complete){
  const heading=source[0].label.replace(/ (?:서론|\d+\..*)$/,'');
  fs.writeFileSync(path.join(dir,`${chapter}-all.md`),`# ${heading}\n\n`+rows.map(r=>r.content.replace(/^(#{1,5}) /gm,'$1# ')).join('\n\n---\n\n')+'\n');
  combined.push(`## ${heading}\n\n`+rows.map(r=>r.content.replace(/^(#{1,4}) /gm,'$1## ')).join('\n\n---\n\n'));
  fs.writeFileSync(path.join(dir,`${chapter}-index.md`),`# ${heading}\n\n`+rows.map(r=>`- [${r.label}](<${path.join(dir,r.file).replaceAll('\\','/')}>)`).join('\n')+'\n');
  fs.writeFileSync(path.join(dir,`${chapter}-review.json`),JSON.stringify(rows.map(({content,...r})=>r),null,2)+'\n');
 }
}
const total=report.reduce((n,r)=>n+r.saved,0);
fs.writeFileSync(path.join(dir,'all-chapters-progress.json'),JSON.stringify({expected:entries.length,saved:total,complete:total===entries.length,chapters:report,errors},null,2)+'\n');
fs.writeFileSync(path.join(dir,'all-chapters-index.md'),'# 화·풍·수·지 정리글\n\n'+report.map(r=>{
 const label=entries.find(e=>e.chapter===r.chapter).label.replace(/ (?:서론|\d+\..*)$/,'');
 return r.complete?`- [${label} · ${r.saved}개](<${path.join(dir,`${r.chapter}-all.md`).replaceAll('\\','/')}>) · [항목별 목차](<${path.join(dir,`${r.chapter}-index.md`).replaceAll('\\','/')}>)`:`- ${label} · ${r.saved}/${r.expected}개 저장`;
}).join('\n')+'\n');
if(total===entries.length && !errors.length){
 fs.writeFileSync(path.join(dir,'all-chapters.md'),'# 화·풍·수·지\n\n'+combined.join('\n\n---\n\n')+'\n');
}
console.log(JSON.stringify({saved:total,expected:entries.length,chapters:report,errors},null,2));
if(errors.length)process.exitCode=1;
