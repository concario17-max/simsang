import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {comicPages} from '../reader/media.js';
const book=JSON.parse(fs.readFileSync(new URL('../data/books/introspection.json',import.meta.url)));
test('fire has independent positive/negative numbering, introduction and bilingual text',()=>{assert.equal(book.entries.filter(x=>x.id.startsWith('fire.')&&!x.appendix).length,103);assert.equal(new Set(book.entries.map(x=>x.id)).size,book.entries.length);for(const [part,count] of [['positive',40],['negative',62]])for(let n=1;n<=count;n++){const e=book.entries.find(x=>x.id===`fire.${part}.${String(n).padStart(3,'0')}`);assert.ok(e.texts.korean.length>100);assert.ok(e.texts.english.length>100);assert.ok(e.englishTitle);if(part==='negative')assert.equal(e.comics.length,1)}assert.ok(book.entries.find(x=>x.id==='fire.negative.intro').texts.english.startsWith('Negative (passive) qualities'));assert.match(book.entries.find(x=>x.id==='fire.negative.032').texts.english,/^Motto:/);assert.match(book.entries.find(x=>x.id==='fire.negative.059').texts.english,/^Motto:/)});

test('all forty fire-positive entries expose forty-seven ordered existing comic pages',()=>{
 const entries=book.entries.filter(e=>e.chapter==='fire-positive');
 assert.equal(entries.length,40);
 assert.equal(entries.reduce((n,e)=>n+comicPages(e).length,0),47);
 const doublePages=new Set([1,2,3,4,7,12,18]);
 for(const e of entries){
  const n=Number(e.id.split('.').at(-1)),pages=comicPages(e);
  assert.equal(pages.length,doublePages.has(n)?2:1);
  pages.forEach((p,i)=>{
   assert.equal(p.src,'/assets/introspection/fire/positive/'+String(n).padStart(3,'0')+'/'+String(i+1).padStart(2,'0')+'-v8.png');
   assert.ok(p.alt.includes(e.label));
   const b=fs.readFileSync(new URL('..'+p.src,import.meta.url));
   assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  });
 }
});
test('comics accept legacy single images and ordered multi-page descriptions',()=>{assert.deepEqual(comicPages({comic:'one.webp'}),[{src:'one.webp'}]);assert.deepEqual(comicPages({comic:'old.webp',comics:[{src:'1.webp',alt:'첫 장'},'2.webp']}),[{src:'1.webp',alt:'첫 장'},{src:'2.webp'}]);assert.deepEqual(comicPages({comics:[]}),[])});
test('every reflection entry is discoverable with the same bookmark identity',()=>{const c=JSON.parse(fs.readFileSync(new URL('../data/search/catalog.json',import.meta.url)));for(const e of book.entries){const row=c.entries.find(x=>x.id==='introspection:'+e.id);assert.equal(row.token,e.id);assert.equal(row.key,'simsang-book-introspection-bookmarks')}});

test('air has 127 bilingual qualities and the complete appendix as the final entry',()=>{for(const [part,count] of [['positive',58],['negative',69]])for(let n=1;n<=count;n++){const e=book.entries.find(x=>x.id===`air.${part}.${String(n).padStart(3,'0')}`);assert.ok(e.texts.korean.length>100);assert.ok(e.texts.english.length>100);assert.ok(e.englishTitle);if(part==='negative')assert.deepEqual(e.comics,[]);else{const pages=comicPages(e);assert.equal(pages.length,1);assert.ok(pages[0].src.startsWith('/assets/introspection/air/positive/'+String(n).padStart(3,'0')+'/01-v'));assert.ok(pages[0].alt.includes(e.label));const b=fs.readFileSync(new URL('..'+pages[0].src,import.meta.url));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a')}}const appendix=book.entries.find(e=>e.id==='air.appendix');assert.equal(appendix.id,'air.appendix');assert.equal(appendix.texts.korean.match(/^### 부록 \d+/gm).length,29);assert.ok(appendix.appendix);assert.equal(appendix.texts.english,undefined)});

test('fire appendices follow its body and include glossary and all 13 review notes',()=>{const glossary=book.entries.find(e=>e.id==='fire.appendix.001');const review=book.entries.find(e=>e.id==='fire.appendix.002');assert.ok(glossary.appendix&&review.appendix);assert.match(glossary.texts.korean,/\| 原語|\| 원어/);assert.equal(review.texts.korean.match(/^### \d+\./gm).length,13);assert.equal(book.entries[103].id,glossary.id);assert.equal(book.entries[104].id,review.id);assert.equal(book.entries[105].id,'air.positive.001');assert.equal(review.texts.english,undefined)});

test('water numbering, bilingual entries and both appendices are complete',()=>{for(const [part,count] of [['positive',36],['negative',80]]){const entries=book.entries.filter(e=>e.chapter==='water-'+part);assert.equal(entries.length,count);entries.forEach((e,i)=>{assert.equal(e.id,`water.${part}.${String(i+1).padStart(3,'0')}`);assert.ok(e.texts.english.length>100);assert.ok(e.texts.korean.length>50);assert.deepEqual(e.comics,[])})}for(const id of ['water.appendix.001','water.appendix.002']){const e=book.entries.find(e=>e.id===id);assert.ok(e.appendix);assert.ok(e.texts.korean.length>1000);assert.equal(e.texts.english,undefined)}});


test('all 63 fire-negative entries have comics and corrected assets use fresh versions',()=>{
 const rows=book.entries.filter(e=>e.chapter==='fire-negative');
 assert.equal(rows.reduce((n,e)=>n+comicPages(e).length,0),63);
 for(const e of rows){const part=e.id.split('.').at(-1);const pages=comicPages(e);assert.equal(pages.length,1);const version=new Set(['017','031','033','038','039','046','052','053']).has(part)?2:1;assert.equal(pages[0].src,'/assets/introspection/fire/negative/'+part+'/01-v'+version+'.png');assert.ok(pages[0].alt.includes(e.label));const b=fs.readFileSync(new URL('..'+pages[0].src,import.meta.url));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');}
});
