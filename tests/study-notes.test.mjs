import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hasEasyReading,resolveReadingView,visibleCommentary} from '../reader/reading-view.js';
import {markdown} from '../reader/markdown.js';

const book=JSON.parse(fs.readFileSync(new URL('../data/books/introspection.json',import.meta.url)));
test('all 492 study entries receive their exact notes and appendices remain separate',()=>{
 const entries=book.entries.filter(e=>!e.appendix&&e.commentary?.length);
 assert.equal(entries.length,492);
 assert.deepEqual(entries.map(e=>e.id),book.entries.filter(e=>!e.appendix&&!e.chapter.endsWith('appendix')).map(e=>e.id));
 assert.equal(book.entries.filter(e=>e.appendix).length,7);
 assert.ok(book.entries.filter(e=>e.appendix).every(e=>!hasEasyReading(book,e)));
 for(const entry of entries){
  const source=fs.readFileSync(new URL('../docs/study-notes/'+entry.chapter+'-'+entry.id.split('.').at(-1)+'.md',import.meta.url),'utf8').trim();
  assert.equal(source.split(/\r?\n/)[0],'# '+entry.label);
  const expected=source.split(/\r?\n/).slice(1).join('\n').trim().replace(/^(#{2,6}) /gm,(_,h)=>h.slice(1)+' ');
  assert.equal(entry.commentary,expected);
  const html=markdown(entry.commentary);
  assert.match(html,/<h3>/);
  assert.ok(!html.includes('<h4>'));
  assert.ok(!entry.commentary.includes('친구에게 설명하듯 정리한 원고'));
  assert.ok(entry.texts.korean&&entry.texts.english);
 }
 const index=JSON.parse(fs.readFileSync(new URL('../data/search/introspection.json',import.meta.url)));
 for(const entry of entries){const text=index.find(e=>e.id==='introspection:'+entry.id).text;if(hasEasyReading(book,entry))assert.ok(text.includes(entry.commentary.toLocaleLowerCase()),entry.id+' summary indexed');else{assert.equal(visibleCommentary(book,entry),'');assert.ok(!text.includes(entry.commentary.toLocaleLowerCase()),entry.id+' hidden summary excluded');}}
});

test('easy reading defaults respect explicit views and fall back for unavailable entries',()=>{
 const comic=book.entries[0],entry=book.entries.find(e=>e.chapter==='fire-negative'&&e.commentary?.length),unready={...entry,commentary:[]},appendix=book.entries.find(e=>e.appendix);
 assert.equal(hasEasyReading(book,comic),false);
 assert.equal(book.entries.filter(e=>hasEasyReading(book,e)).length,446);
 assert.equal(resolveReadingView(book,comic,null),'comic');
 assert.equal(resolveReadingView(book,comic,'commentary'),'comic');
 for(const view of ['text','note'])assert.equal(resolveReadingView(book,comic,view),view);
 assert.equal(resolveReadingView(book,entry,null),'commentary');
 for(const view of ['text','commentary','note'])assert.equal(resolveReadingView(book,entry,view),view);
 assert.equal(resolveReadingView(book,unready,'commentary'),'text');
 assert.equal(resolveReadingView(book,appendix,'commentary'),'text');
 assert.equal(resolveReadingView(book,entry,'comic',[]),'commentary');
 assert.equal(resolveReadingView(book,entry,'comic',[{src:'page.webp'}]),'comic');
 assert.equal(resolveReadingView({},entry,null),'text');
 assert.equal(resolveReadingView({},entry,'commentary'),'commentary');
});
