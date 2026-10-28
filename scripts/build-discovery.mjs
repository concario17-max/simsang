import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';import {dateForYao} from '../calendar/date-utils.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const check=process.argv.includes('--check');
const write=(p,v)=>{if(check){if(fs.readFileSync(path.join(root,p),'utf8')!==JSON.stringify(v))throw Error('검색 자료 재생성 필요: '+p);return}fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(v))};
const text=v=>typeof v==='string'?v:Array.isArray(v)?v.map(text).join(' '):v&&typeof v==='object'?Object.values(v).map(text).join(' '):'';
const metadata=[],groups=[];
function group(id,label,rows){groups.push({id,label,file:`data/search/${id}.json`,count:rows.length});rows.forEach(({text,...row})=>metadata.push({...row,group:id,collection:label}));write(`data/search/${id}.json`,rows.map(r=>({id:r.id,text:r.text.toLocaleLowerCase()})))}
const cal=read('data/calendar.json');write('data/daily.json',{bonusYao:Object.fromEntries(Object.entries(cal.bonusYao).map(([n,t])=>[n,t.split(/\n\s*\n/).slice(0,2).join('\n\n')])),yao:Object.fromEntries(Object.entries(cal.yao).map(([n,t])=>[n,t.split(/\n\s*\n/).slice(0,2).join('\n\n')]))});
const rows=[];
for(const source of ['yao','gua'])for(const bonus of [false,true])for(const [n,body] of Object.entries(cal[bonus?(source==='yao'?'bonusYao':'bonusGua'):source])){
 const number=+n,yao=source==='yao'?number:(number-1)*6+1,date=bonus?'2001-04-02':dateForYao(yao,2001);if(!date)continue;
 rows.push({id:`calendar:${source}:${bonus?'bonus':'regular'}:${n}`,title:body.split('\n')[0],href:`calendar/?date=${date}&source=${source}${bonus?'&num='+n:''}`,calendar:{source,num:number,bonus},text:body+' '+(!bonus?cal[source+'Commentary'][n]||'':'')});
}
cal.soul.forEach((s,i)=>{const r=s.ranges[0].start;rows.push({id:`calendar:soul:${i}`,title:s.weeksLabel,href:`calendar/?date=2001-${String(r.m).padStart(2,'0')}-${String(r.d).padStart(2,'0')}&source=soul`,text:text(s.sections)})});group('calendar','영성 달력',rows);
group('yoga','요가수트라',read('data/yoga.json').map(e=>({id:'yoga:'+e.id,title:e.id+' · '+(e.commentary[0]?.title||'요가수트라'),href:'yoga/?verse='+e.id,key:'simsang-yoga-bookmarks',token:e.id,text:text(Object.fromEntries(Object.entries(e).filter(([k])=>!['audio','comic'].includes(k))))})));
for(const slug of ['gita','lamp','Thodol','rosi','miracle','3body','introspection']){const b=read('data/books/'+slug+'.json');group(slug,b.title,b.entries.map(e=>({id:slug+':'+e.id,title:e.label,href:'reader/?'+new URLSearchParams({book:slug,verse:e.id}),key:'simsang-book-'+slug+'-bookmarks',token:e.id,text:e.id+' '+e.label+' '+text(e.texts)+' '+text(e.commentary)})))}
const data=(file,name)=>{const c=vm.createContext({});return vm.runInContext(fs.readFileSync(path.join(root,'shinji/js/'+file),'utf8')+'\n'+name,c)};
const stories=data('stories-data.js','STORIES_DATA'),books=data('books-data.js','BOOKS_DATA'),videos=data('lectures-data.js','LECTURE_DATA');
group('shinji','다카하시 신지',[
 ...stories.map(s=>({id:'shinji:story:'+s.id,title:s.number+' '+s.title,href:'shinji/#story-'+String(s.id).padStart(3,'0'),key:'simsang-shinji_bookmarks',token:s.id,text:text([s.title,s.origTitle,s.body,s.paragraphs,s.notes])})),
 ...books.flatMap(b=>b.chapters.map(c=>({id:'shinji:book:'+b.id+':'+c.id,title:b.title+' · '+c.number+' '+c.title,href:`shinji/#book-${b.id}-${c.id}`,key:'simsang-shinji_book_bookmarks',token:`${b.id}-${c.id}`,text:text([b.title,c.title,c.origTitle,c.summary,c.paragraphs])}))),
 ...videos.map(v=>({id:'shinji:video:'+v.id,title:v.number+' '+v.title,href:'shinji/#video-'+v.id,text:text([v.title,v.titleJp,v.summary,v.tags,v.timestamps])}))
]);
write('data/search/catalog.json',{groups,entries:metadata});console.log(`${metadata.length} search records; daily ${fs.statSync(path.join(root,'data/daily.json')).size} bytes`);
