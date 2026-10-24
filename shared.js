/* Shared reading records, navigation and accessible controls. Existing keys are retained. */
(() => {
 const root=new URL('.',document.currentScript.src),url=p=>new URL(p,root).href;
 const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
 const array=key=>{const v=read(key,[]);return Array.isArray(v)?v:[]};
 let lastWarning=0,firstNavigation=!location.pathname.includes('/shinji/');
 function announce(message){let box=document.getElementById('siteStatus');if(!box){box=document.createElement('div');box.id='siteStatus';box.setAttribute('role','status');document.body.append(box)}box.textContent=message;box.hidden=false;clearTimeout(box.timer);box.timer=setTimeout(()=>box.hidden=true,5000)}
 function warn(){if(Date.now()-lastWarning>5000){lastWarning=Date.now();announce('저장하지 못했어요. 브라우저 저장 공간을 확인하고 중요한 노트는 복사해 주세요.')}}
 function visit(title,href=location.href){const u=new URL(href,root);if(u.origin!==root.origin)return;const item={title:String(title),href:u.pathname+u.search+u.hash,at:Date.now()};const rows=array('simsang-recent').filter(r=>r&&typeof r.href==='string'&&r.href!==item.href);if(!write('simsang-recent',[item,...rows].slice(0,30)))warn()}
 function navigate(href){if(firstNavigation){history.replaceState(null,'',href);firstNavigation=false}else if(new URL(href,location.href).href!==location.href)history.pushState(null,'',href)}
 window.Simsang={root:root.href,url,read,write,array,visit,navigate,announce,warn};
 window.addEventListener('popstate',()=>location.reload());
 document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('body>header'),nav=header?.querySelector('nav');
  if(nav&&!document.querySelector('.main-mode-nav')){
   const menu=document.createElement('details');menu.className='site-menu';const summary=document.createElement('summary');summary.textContent='메뉴';menu.append(summary,nav);header.append(menu);const wide=matchMedia('(min-width:851px)');const setMenu=()=>{menu.open=wide.matches};setMenu();wide.addEventListener('change',setMenu);
   const search=document.createElement('a');search.href=url('library/');search.textContent='통합 검색';if(![...nav.querySelectorAll('a')].some(a=>a.href===search.href))nav.append(search);
   const saved=document.createElement('a');saved.href=url('library/?tab=saved');saved.textContent='내 책갈피';if(![...nav.querySelectorAll('a')].some(a=>a.href===saved.href))nav.append(saved);
  }
  if(document.querySelector('.main-mode-nav')){const a=document.createElement('a');a.className='archive-library-link';a.href=url('library/');a.textContent='통합 검색 · 책갈피';document.querySelector('.header-actions').append(a)}
  const main=document.querySelector('main');if(main){if(!main.id)main.id='mainContent';const a=document.createElement('a');a.className='skip-link';a.href='#'+main.id;a.textContent='본문으로 건너뛰기';document.body.prepend(a)}
  if(/\/(reader|yoga)\//.test(location.pathname)){
   const tools=document.querySelector('.reading-tools');const b=document.createElement('button');b.className='reading-font';b.textContent='글자 크기';b.setAttribute('aria-label','본문 글자 크기 변경');let size=Number(read('simsang-reading-font',18));if(![18,20,22,24].includes(size))size=18;
   const apply=()=>{document.documentElement.style.setProperty('--reading-font',size+'px');b.textContent='글자 '+size};apply();b.onclick=()=>{size=size===24?18:size+2;if(!write('simsang-reading-font',size))warn();apply()};tools?.append(b);
  }
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
