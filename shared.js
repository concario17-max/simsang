/* Shared reading records, navigation and accessible controls. Existing keys are retained. */
(() => {
 const root=new URL('.',document.currentScript.src),url=p=>new URL(p,root).href;
 const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
 const array=key=>{const v=read(key,[]);return Array.isArray(v)?v:[]};
 let lastWarning=0,firstNavigation=!location.pathname.includes('/shinji/');
 function announce(message){let box=document.getElementById('siteStatus');if(!box){box=document.createElement('div');box.id='siteStatus';box.setAttribute('role','status');document.body.append(box)}box.textContent=message;box.hidden=false;clearTimeout(box.timer);box.timer=setTimeout(()=>box.hidden=true,5000)}
 function warn(){if(Date.now()-lastWarning>5000){lastWarning=Date.now();announce('저장하지 못했어요. 브라우저 저장 공간을 확인하고 중요한 노트는 복사해 주세요.')}}
 const safeURL=value=>{try{if(typeof value!=='string')return null;const u=new URL(value,root);return u.origin===root.origin&&u.pathname.startsWith(root.pathname)?u:null}catch{return null}};
 const recent=()=>array('simsang-recent').filter(r=>r&&typeof r.title==='string'&&Number.isFinite(r.at)&&safeURL(r.href)).sort((a,b)=>b.at-a.at);
 const locked=task=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request('simsang-records',task):Promise.resolve().then(task);
 async function toggle(key,item,identity=x=>JSON.stringify(x)){
  return locked(()=>{const rows=array(key),id=identity(item),exists=rows.some(x=>identity(x)===id);const next=exists?rows.filter(x=>identity(x)!==id):[...rows,item];if(!write(key,next)){warn();return null}return {rows:next,added:!exists}});
 }
 const noteKey=k=>/^simsang-(?:book-(?:gita|lamp|Thodol|rosi|miracle|3body)-note-.+|yoga-note-.+|calendar-note:.+)$/.test(k);
 const conflictKey=k=>/^simsang-note-copy-[\w-]+$/.test(k);
 const markKey=k=>/^simsang-(?:book-(?:gita|lamp|Thodol|rosi|miracle|3body)-bookmarks|yoga-bookmarks|calendar-bookmarks|shinji_bookmarks|shinji_book_bookmarks)$/.test(k);
 const ownKey=k=>noteKey(k)||conflictKey(k)||markKey(k)||['simsang-recent','simsang-calendar-last','simsang-library-last','simsang-yoga-last','simsang-shinji_last_story','simsang-shinji_last_video','simsang-shinji_last_read_book'].includes(k);
 const copyKey=()=> 'simsang-note-copy-'+crypto.randomUUID();
 function snapshot(){const entries={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(ownKey(k)){const value=read(k,null);if(value!==null)entries[k]=value}}return {format:'simsang-records',version:1,createdAt:new Date().toISOString(),entries}}
 function validateBackup(value){
  if(!value||value.format!=='simsang-records'||value.version!==1||!value.entries||Array.isArray(value.entries)||typeof value.entries!=='object')throw Error('심상 서재 백업 파일이 아닙니다.');
  const pairs=Object.entries(value.entries);if(pairs.length>10000)throw Error('백업 항목이 너무 많습니다.');
  for(const [k,v] of pairs){
   if(k.length>500||!ownKey(k))throw Error('지원하지 않는 기록이 포함되어 있습니다.');
   if(noteKey(k)){if(typeof v!=='string'||v.length>500000)throw Error('노트 형식이 올바르지 않습니다.');}
   else if(conflictKey(k)){if(!v||!noteKey(v.source)||typeof v.text!=='string'||v.text.length>500000||typeof v.at!=='string')throw Error('노트 사본 형식이 올바르지 않습니다.');}
   else if(markKey(k)){
    if(!Array.isArray(v)||v.length>10000)throw Error('책갈피 형식이 올바르지 않습니다.');
    if(k==='simsang-calendar-bookmarks'){if(v.some(x=>!x||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!['yao','gua','soul'].includes(x.source)||(x.num!==null&&(!Number.isInteger(x.num)||x.num<1||x.num>384))||typeof x.label!=='string'))throw Error('달력 책갈피가 올바르지 않습니다.');}
    else if(v.some(x=>!(typeof x==='string'&&x.length<500||Number.isInteger(x)&&x>0)))throw Error('책갈피 값이 올바르지 않습니다.');
   }else if(k==='simsang-recent'){if(!Array.isArray(v)||v.length>1000||v.some(x=>!x||!safeURL(x.href)||typeof x.title!=='string'||!Number.isFinite(x.at)))throw Error('읽기 기록이 올바르지 않습니다.');}
   else if(k==='simsang-calendar-last'){if(!v||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||!['yao','gua','soul'].includes(v.source)||!Number.isInteger(v.num)||v.num<1||v.num>384)throw Error('달력 기록이 올바르지 않습니다.');}
   else if(k==='simsang-library-last'){if(!v||!['gita','lamp','Thodol','rosi','miracle','3body'].includes(v.book)||typeof v.id!=='string'||typeof v.title!=='string')throw Error('문헌 기록이 올바르지 않습니다.');}
   else if(k==='simsang-shinji_last_read_book'){if(!v||typeof v.bookId!=='string'||typeof v.chapterTitle!=='string')throw Error('도서 기록이 올바르지 않습니다.');}
   else if(k==='simsang-yoga-last'){if(typeof v!=='string'||!/^\d+\.\d+$/.test(v))throw Error('요가 기록이 올바르지 않습니다.');}
   else if(!Number.isInteger(v)||v<1)throw Error('읽기 번호가 올바르지 않습니다.');
  }return value;
 }
 const markIdentity=x=>x&&typeof x==='object'?JSON.stringify([x.date,x.source,x.num]):JSON.stringify(x);
 async function restoreBackup(backup){validateBackup(backup);return locked(()=>{
  const changes=new Map();let copies=0;
  for(const [k,v] of Object.entries(backup.entries)){
   const old=read(k,null);
   if(markKey(k)){const merged=new Map(array(k).map(x=>[markIdentity(x),x]));v.forEach(x=>merged.set(markIdentity(x),x));changes.set(k,[...merged.values()]);}
   else if(k==='simsang-recent'){const merged=new Map();[...recent(),...v].sort((a,b)=>b.at-a.at).forEach(x=>{const id=safeURL(x.href).href;if(!merged.has(id))merged.set(id,x)});changes.set(k,[...merged.values()].slice(0,30));}
   else if(noteKey(k)&&old!==null&&old!==v){const duplicate=Object.values(snapshot().entries).some(x=>x&&typeof x==='object'&&x.source===k&&x.text===v);if(!duplicate){changes.set(copyKey(),{source:k,text:v,at:new Date().toISOString()});copies++;}}
   else if(old===null)changes.set(k,v);
  }
  const previous=new Map([...changes.keys()].map(k=>[k,localStorage.getItem(k)]));
  try{for(const [k,v] of changes)localStorage.setItem(k,JSON.stringify(v));}
  catch(error){for(const [k,v] of previous)if(v===null)localStorage.removeItem(k);for(const [k,v] of previous)if(v!==null)localStorage.setItem(k,v);throw Error('저장 공간이 부족하거나 저장할 수 없습니다. 기존 기록을 유지했습니다.');}
  return {count:changes.size,copies};
 })}
 async function saveNote(key,text,base){return locked(()=>{const current=read(key,'');if(current!==base&&current!==text){const copy=copyKey();if(!write(copy,{source:key,text,at:new Date().toISOString()})){warn();return {ok:false}}return {ok:true,conflict:true,key:copy};}if(!write(key,text)){warn();return {ok:false}}return {ok:true}})}
 function bindNote(el,key,status){let base=read(key,''),copy=null,queue=Promise.resolve();el.value=typeof base==='string'?base:'';base=el.value;
  el.oninput=()=>{const text=el.value;status.textContent='저장 중…';queue=queue.then(async()=>{let result;if(copy){result=await locked(()=>({ok:write(copy,{source:key,text,at:new Date().toISOString()})}));}else result=await saveNote(key,text,base);if(result.ok){base=text;if(result.conflict)copy=result.key;status.textContent=copy?'다른 탭의 수정과 겹쳐 별도 사본으로 저장했어요. 나의 서재에서 확인하세요.':'저장했어요.';}else status.textContent='저장하지 못했어요. 내용을 복사해 보관해주세요.';}).catch(()=>{status.textContent='저장하지 못했어요. 내용을 복사해 보관해주세요.';warn()});};
 }
 function visit(title,href=location.href){const u=safeURL(href);if(!u)return;const item={title:String(title),href:u.pathname+u.search+u.hash,at:Date.now()};return locked(()=>{const rows=recent().filter(r=>r.href!==item.href);if(!write('simsang-recent',[item,...rows].slice(0,30)))warn()}).catch(warn)}
 function navigate(href){if(firstNavigation){history.replaceState(null,'',href);firstNavigation=false}else if(new URL(href,location.href).href!==location.href)history.pushState(null,'',href)}
 const findTerm=new URLSearchParams(location.search).get('find')?.trim()||'';
 function highlightReading(container){if(!container||!findTerm)return false;const needle=findTerm.split(/\s+/)[0].toLocaleLowerCase();if(!needle)return false;const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('script,style,textarea,input,button,mark')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let first=null,count=0;
  for(const node of nodes){const value=node.textContent,lower=value.toLocaleLowerCase();let offset=0,pos=lower.indexOf(needle);if(pos<0)continue;const fragment=document.createDocumentFragment();while(pos>=0&&count<300){fragment.append(document.createTextNode(value.slice(offset,pos)));const mark=document.createElement('mark');mark.textContent=value.slice(pos,pos+needle.length);fragment.append(mark);first??=mark;count++;offset=pos+needle.length;pos=lower.indexOf(needle,offset)}fragment.append(document.createTextNode(value.slice(offset)));node.replaceWith(fragment);if(count>=300)break;}if(first)requestAnimationFrame(()=>first.scrollIntoView({block:'center'}));return !!first;
 }
 let positionKey=null,positionTimer=null;
 function readingRendered(view){const el=document.getElementById('content');if(!el)return;const u=new URL(location.href);u.searchParams.delete('find');u.searchParams.delete('view');const key='simsang-position:'+u.pathname+u.search+':'+view;positionKey=key;if(view==='note')return;if(highlightReading(el))return;const top=read(key,null);if(Number.isFinite(top)&&top>=0)requestAnimationFrame(()=>{if(positionKey===key)window.scrollTo({top,behavior:'instant'})});}
 window.addEventListener('pagehide',()=>{if(positionKey)write(positionKey,window.scrollY)});
 window.addEventListener('scroll',()=>{if(!positionKey)return;const key=positionKey,top=window.scrollY;clearTimeout(positionTimer);positionTimer=setTimeout(()=>{if(!write(key,top))warn()},200)},{passive:true});
 window.Simsang={root:root.href,url,read,write,array,visit,navigate,announce,warn,safeURL,recent,toggle,locked,bindNote,saveNote,noteKey,conflictKey,snapshot,validateBackup,restoreBackup,readingRendered,highlightReading};
 window.addEventListener('popstate',()=>location.reload());
 document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('body>header'),nav=header?.querySelector('nav');
  if(nav&&!document.querySelector('.main-mode-nav')){
   const menu=document.createElement('details');menu.className='site-menu';const summary=document.createElement('summary');summary.textContent='메뉴';menu.append(summary,nav);header.append(menu);const wide=matchMedia('(min-width:851px)');const setMenu=()=>{menu.open=wide.matches};setMenu();wide.addEventListener('change',setMenu);
   const search=document.createElement('a');search.href=url('library/');search.textContent='통합 검색';if(![...nav.querySelectorAll('a')].some(a=>a.href===search.href))nav.append(search);
   const saved=document.createElement('a');saved.href=url('library/?tab=saved');saved.textContent='나의 서재';if(![...nav.querySelectorAll('a')].some(a=>a.href===saved.href))nav.append(saved);
  }
  if(document.querySelector('.main-mode-nav')){const a=document.createElement('a');a.className='archive-library-link';a.href=url('library/');a.textContent='검색 · 나의 서재';document.querySelector('.header-actions').append(a)}
  const main=document.querySelector('main');if(main){if(!main.id)main.id='mainContent';const a=document.createElement('a');a.className='skip-link';a.href='#'+main.id;a.textContent='본문으로 건너뛰기';document.body.prepend(a)}
  if(/\/(reader|yoga)\//.test(location.pathname)){
   const tools=document.querySelector('.reading-tools');const b=document.createElement('button');b.className='reading-font';b.textContent='글자 크기';b.setAttribute('aria-label','본문 글자 크기 변경');let size=Number(read('simsang-reading-font',18));if(![18,20,22,24].includes(size))size=18;
   const apply=()=>{document.documentElement.style.setProperty('--reading-font',size+'px');b.textContent='글자 '+size};apply();b.onclick=()=>{size=size===24?18:size+2;if(!write('simsang-reading-font',size))warn();apply()};tools?.append(b);
  }
  const aside=document.querySelector('aside.reading-summary');if(aside){const wrap=document.createElement('details'),summary=document.createElement('summary');wrap.className='reading-index';summary.textContent='목차 · 검색 · 자료 안내';aside.before(wrap);wrap.append(summary,aside);const wide=matchMedia('(min-width:701px)');wrap.open=wide.matches;wide.addEventListener('change',()=>wrap.open=wide.matches);}
  // Fullscreen Shinji readers use a focus trap and make background content inert.
  const ids=['storyModalBackdrop','bookReaderModal','modalBackdrop','cmdPaletteModal'];let active=null,returnFocus=null;
  const visible=el=>el&&(el.id==='bookReaderModal'?el.style.display==='flex':el.classList.contains('active'));
  function sync(){const next=ids.map(id=>document.getElementById(id)).filter(visible).pop()||null;if(next===active)return;
   const previous=active;active=next;
   for(const child of document.body.children){if(['SCRIPT','LINK','STYLE'].includes(child.tagName))continue;child.inert=!!active&&child!==active&&!child.contains(active)&&child.id!=='siteStatus'}
   if(active){if(!previous)returnFocus=document.activeElement;active.tabIndex=-1;active.setAttribute('aria-label',active.id==='cmdPaletteModal'?'자료 빠른 검색':'독서 화면');(active.querySelector('input,button')||active).focus()}
   else if(returnFocus?.isConnected)returnFocus.focus();
  }
  if(ids.some(id=>document.getElementById(id))){new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style']});document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!active)return;const els=[...active.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=els[0],last=els.at(-1);if(!first){e.preventDefault();active.focus()}else if(e.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){e.preventDefault();first.focus()}});sync()}
 });
})();
