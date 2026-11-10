import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'data/books/introspection.json');
const book=JSON.parse(fs.readFileSync(file,'utf8'));
const args=process.argv.slice(2);
if(args.includes('--all')&&args.length!==1)throw Error('--all은 항목 ID와 함께 사용할 수 없습니다.');
const ids=args[0]==='--all'?book.entries.filter(e=>!e.appendix&&!e.chapter.endsWith('appendix')).map(e=>e.id):args;
if(!ids.length)throw Error('가져올 항목 ID를 지정하세요.');
const updates=ids.map(id=>{
 const entry=book.entries.find(e=>e.id===id);
 if(!entry||entry.appendix)throw Error('학습 항목을 찾을 수 없습니다: '+id);
 const note=fs.readFileSync(path.join(root,'docs/study-notes',entry.chapter+'-'+id.split('.').at(-1)+'.md'),'utf8').trim();
 const [title,...body]=note.split(/\r?\n/);
 if(title!=='# '+entry.label)throw Error('제목이 일치하지 않습니다: '+id);
 return {entry,body:body.join('\n').trim().replace(/^(#{2,6}) /gm,(_,hashes)=>hashes.slice(1)+' ')};
});
for(const {entry,body}of updates)entry.commentary=body;
fs.writeFileSync(file,JSON.stringify(book)+'\n');
console.log('정리글 연결: '+ids.length+'개');
