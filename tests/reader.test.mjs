import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {entryLabel,entryAliases,entryMatches,readerHref} from '../reader/entry-utils.js';
import {markdown} from '../reader/markdown.js';
import {score} from '../library/search-utils.js';
const book=JSON.parse(fs.readFileSync(new URL('../data/books/gita.json',import.meta.url)));
test('grouped verses retain canonical IDs while every member resolves and ranks',()=>{
 const grouped=book.entries.find(e=>e.id==='1.4');
 assert.equal(entryLabel('gita',grouped),'제1장 4~6절');
 assert.deepEqual(entryAliases('gita',grouped),['1.4','1.5','1.6']);
 assert.ok(entryMatches('gita',grouped,'1.5'));assert.ok(!entryMatches('gita',grouped,'1.7'));
 const catalog=JSON.parse(fs.readFileSync(new URL('../data/search/catalog.json',import.meta.url)));
 const row=catalog.entries.find(r=>r.token==='1.4'&&r.group==='gita');
 assert.equal(row.token,'1.4');assert.equal(row.title,'제1장 4~6절');
 assert.equal(score(row,'1.5'),1000);
 const aliases=new Set();
 for(const entry of book.entries)for(const alias of entryAliases('gita',entry)){assert.ok(!aliases.has(alias),'ambiguous verse '+alias);aliases.add(alias);}
});
test('single verses and unrelated books keep distinct labels and identities',()=>{
 assert.equal(entryLabel('gita',book.entries[0]),'제1장 1절');
 assert.equal(entryLabel('lamp',{label:'제5송'}),'제5송');
 assert.deepEqual(entryAliases('lamp',{id:'bodhi.2.5'}),[]);
});
test('shared reading links round trip every view and canonical verse',()=>{
 for(const view of ['text','comic','commentary','note','albums']){
 const params=new URLSearchParams(readerHref('introspection','earth.positive.001',view));
 assert.equal(params.get('book'),'introspection');assert.equal(params.get('verse'),'earth.positive.001');assert.equal(params.get('view'),view);
 }
});
test('appendix quotations preserve boundaries, lists and heading levels without executing markup',()=>{
 const html=markdown('# 부록\n## 검토\n### 항목\n설명\n> 인용 **강조**\n>\n> - 원문 <script>alert(1)</script>\n다음 설명');
 assert.match(html,/<h3>부록<\/h3><h4>검토<\/h4><h5>항목<\/h5>/);
 assert.match(html,/<blockquote><p>인용 <strong>강조<\/strong><\/p><ul>/);
 assert.ok(html.includes('</blockquote><p>다음 설명</p>'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
});
test('Earth numbering, bilingual text, ordered comics and review appendices are complete',()=>{
 const b=JSON.parse(fs.readFileSync(new URL('../data/books/introspection.json',import.meta.url)));
 for(const [part,count]of [['positive',60],['negative',86]]){const es=b.entries.filter(e=>e.chapter==='earth-'+part);assert.equal(es.length,count);es.forEach((e,i)=>{assert.equal(e.id,'earth.'+part+'.'+String(i+1).padStart(3,'0'));assert.ok(e.texts.korean.trim());assert.ok(e.texts.english.trim());});}
 for(let n=1;n<=6;n++){const e=b.entries.find(e=>e.id==='earth.positive.'+String(n).padStart(3,'0'));assert.equal(e.comics.length,3);e.comics.forEach((c,i)=>assert.ok(c.src.endsWith('/0'+(i+1)+'.webp')));}
 assert.equal(b.entries.find(e=>e.id==='earth.positive.007').comics.length,0);
 assert.equal(b.entries.filter(e=>e.id.startsWith('earth.')&&e.appendix).length,2);
});
