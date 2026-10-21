const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const params=new URLSearchParams(location.search),allowed=['gita','lamp','Thodol','rosi','miracle','3body'];
const slug=params.get('book'),prefix='simsang-book-'+slug+'-';
let book,index=0,zoom=100,view=read(prefix+'view','text'),marks=read(prefix+'bookmarks',[]);
if(!Array.isArray(marks))marks=[];
if(!['text','commentary','comic','note','albums'].includes(view))view='text';
const initialLast=read(prefix+'last',null);
const labels={sanskrit:'산스크리트 원문',tibetan:'티베트어 원문',german:'독일어 원문',iast:'로마자 표기',pronunciation:'발음',korean_pronunciation:'한글 발음',english:'영어',korean:'한국어',ai_translation:'AI 번역',translation_en:'영어 번역',translation_ham:'한국어 번역 · Ham',translation_gil:'한국어 번역 · Gil',translation_jimong:'한국어 번역 · Jimong',translation_suk:'한국어 번역 · Suk',translation_joongam:'중암 선혜 번역',translation_ryu:'류시화 번역'};
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
function markdown(s){
 const lines=String(s).split(/\r?\n/);let result='';
 for(let i=0;i<lines.length;){const l=lines[i];
  if(!l.trim()){i++;continue}
  if(l.trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?[\s:|\-]+\|\s*$/.test(lines[i+1])){
   const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());const heads=cells(l);i+=2;let rows='';
   while(i<lines.length&&lines[i].trim().startsWith('|')){rows+='<tr>'+cells(lines[i++]).map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>'}
   result+='<div class="table-scroll"><table><thead><tr>'+heads.map(c=>'<th>'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';continue;
  }
  const h=l.match(/^#{1,6}\s+(.+)/);if(h){result+='<h3>'+inline(h[1])+'</h3>';i++;continue}
  if(/^\s*[-*]\s+/.test(l)){let items='';while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i]))items+='<li>'+inline(lines[i++].replace(/^\s*[-*]\s+/,''))+'</li>';result+='<ul>'+items+'</ul>';continue}
  let p=[];while(i<lines.length&&lines[i].trim()&&!/^#{1,6}\s|^\s*[-*]\s+/.test(lines[i]))p.push(lines[i++]);result+='<p>'+inline(p.join('\n'))+'</p>';
 }
 return result;
}
function commentary(c){if(typeof c==='string')return markdown(c);return (c||[]).map(b=>(b.title?'<h3>'+esc(b.title)+'</h3>':'')+(b.paragraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('')+(b.bullets?'<ul>'+b.bullets.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'')+(b.table?'<div class="table-scroll"><table><thead><tr>'+b.table.headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+b.table.rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'')).join('')}
function textValue(v){if(typeof v==='string')return v;if(Array.isArray(v))return v.map(x=>typeof x==='string'?x:[x.translator,x.text].filter(Boolean).join('\n')).join('\n\n');return ''}
function translations(x){return Object.entries(x.texts).filter(([,v])=>textValue(v).trim()).map(([k,v])=>'<section class="translation"><small>'+esc(labels[k]||k)+'</small><p'+(k==='tibetan'?' lang="bo"':k==='sanskrit'?' lang="sa"':k==='german'?' lang="de"':'')+'>'+esc(textValue(v))+'</p></section>').join('')}
function empty(s){return '<p class="empty-reading">'+s+'</p>'}
function go(id,push=true){const n=book.entries.findIndex(x=>x.id===id);if(n<0)return false;index=n;render(push);return true}
function render(push=true){
 const x=book.entries[index];if(push)history.replaceState(null,'','?'+new URLSearchParams({book:slug,verse:x.id}));
 save(prefix+'last',x.id);save('simsang-library-last',{book:slug,id:x.id,title:book.title,label:x.label});
 document.title=x.label+' · '+book.title+' · 심상 서재';$('#verseTitle').textContent=x.label;
 $('#chapterSelect').value=x.chapter;$('#verseSelect').innerHTML=book.entries.filter(e=>e.chapter===x.chapter).map(e=>'<option value="'+esc(e.id)+'">'+esc(e.label)+'</option>').join('');$('#verseSelect').value=x.id;
 $('#availability').textContent=['본문',x.commentary&&x.commentary.length?'해설':null,x.comic?'만화':null,x.audio?'음원':null].filter(Boolean).join(' · ')+' 제공';
 $('#viewTabs').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view))});
 $('#bookmark').textContent=marks.includes(x.id)?'★ 저장됨':'☆ 책갈피';$('#bookmark').setAttribute('aria-pressed',String(marks.includes(x.id)));$('#prev').disabled=index===0;$('#next').disabled=index===book.entries.length-1;$('#position').textContent=`${index+1} / ${book.entries.length}`;
 if(view==='text')$('#content').innerHTML='<div class="prose">'+translations(x)+(x.audio?'<div class="audio-label">원문 듣기</div><audio controls preload="none" src="'+esc(x.audio)+'"></audio>':'')+(x.words.length?'<h3>단어 풀이</h3><dl class="words">'+x.words.map(w=>'<dt>'+esc(w.s||w.word)+'</dt><dd>'+esc(w.m||w.meaning)+'</dd>').join('')+'</dl>':'')+'</div>';
 if(view==='commentary')$('#content').innerHTML=x.commentary&&x.commentary.length?'<div class="prose">'+commentary(x.commentary)+'</div>':empty('이 항목의 해설은 아직 준비되지 않았어요. 본문·번역을 읽어주세요.');
 if(view==='comic'){
  $('#content').innerHTML=x.comic?'<p class="comic-hint">그림을 누르면 크게 볼 수 있어요.</p><button class="comic-open" aria-label="학습만화 확대"><img src="'+esc(x.comic)+'" alt="'+esc(book.title+' '+x.label+' 학습만화')+'" decoding="async"></button>':empty('이 항목의 학습만화는 아직 준비되지 않았어요.');
  const btn=$('.comic-open');if(btn){btn.onclick=()=>{zoom=100;$('#largeImage').src=x.comic;$('#largeImage').style.width='100%';$('#imageViewer').showModal()};btn.querySelector('img').onerror=()=>{$('#content').innerHTML=empty('그림을 불러오지 못했어요. 잠시 후 다시 시도하거나 본문·해설을 읽어주세요.')}}
 }
 if(view==='note'){
  $('#content').innerHTML='<label for="note">오늘의 문장이 남긴 것</label><textarea id="note" placeholder="마음에 남은 문장을 적어보세요."></textarea><p id="noteStatus" role="status">이 브라우저에 자동 저장돼요.</p>';
  $('#note').value=read(prefix+'note-'+x.id,'');$('#note').oninput=()=>{$('#noteStatus').textContent=save(prefix+'note-'+x.id,$('#note').value)?'저장했어요.':'저장 공간을 사용할 수 없어요. 내용을 복사해 보관해주세요.'};
 }
 if(view==='albums')$('#content').innerHTML=book.albums.map(a=>'<section class="album"><div class="album-top"><img loading="lazy" src="'+esc(a.coverImage)+'" alt="'+esc(a.title)+' 표지"><div><h3>'+esc(a.title)+'</h3><p>'+esc(a.description||'')+'</p></div></div>'+a.tracks.map(t=>'<div class="track"><small>'+esc(t.title)+'</small><audio controls preload="none" src="'+esc(t.url)+'"></audio></div>').join('')+'</section>').join('');
}
function resultButton(x){return '<button data-id="'+esc(x.id)+'">'+esc(book.chapters.find(c=>c.id===x.chapter)?.title+' · '+x.label)+'</button>'}
$('#chapterSelect').onchange=e=>go(book.entries.find(x=>x.chapter===e.target.value).id);$('#verseSelect').onchange=e=>go(e.target.value);
$('#viewTabs').onclick=e=>{const b=e.target.closest('[data-view]');if(b&&book){view=b.dataset.view;save(prefix+'view',view);render()}};
$('#prev').onclick=()=>{if(index>0)go(book.entries[index-1].id)};$('#next').onclick=()=>{if(index+1<book.entries.length)go(book.entries[index+1].id)};
$('#resume').onclick=()=>{if(book)go(initialLast||book.entries[0].id)};
$('#bookmark').onclick=()=>{if(!book)return;const id=book.entries[index].id;const next=marks.includes(id)?marks.filter(x=>x!==id):[...marks,id];if(save(prefix+'bookmarks',next)){marks=next;render()}else alert('책갈피를 저장할 수 없어요.')};
$('#search').oninput=()=>{if(!book)return;const q=$('#search').value.trim().toLowerCase();const hits=q?book.entries.filter(x=>[x.id,x.label,...Object.values(x.texts).map(textValue),typeof x.commentary==='string'?x.commentary:JSON.stringify(x.commentary)].join(' ').toLowerCase().includes(q)):[];$('#results').innerHTML=q?(hits.slice(0,100).map(resultButton).join('')||'<p>검색 결과가 없어요.</p>')+(hits.length>100?'<p>앞의 100개 결과를 표시했어요. 검색어를 더 구체적으로 입력해주세요.</p>':''):''};
$('#results').onclick=e=>{const b=e.target.closest('[data-id]');if(b)go(b.dataset.id)};
$('#saved').onclick=()=>{if(!book)return;$('#savedList').innerHTML=book.entries.filter(x=>marks.includes(x.id)).map(resultButton).join('')||'<p>아직 저장한 구절이 없어요.</p>';$('#savedDialog').showModal()};
$('#savedList').onclick=e=>{const b=e.target.closest('[data-id]');if(b){go(b.dataset.id);$('#savedDialog').close()}};
$('#closeSaved').onclick=()=>$('#savedDialog').close();$('#closeImage').onclick=()=>$('#imageViewer').close();$('#zoomIn').onclick=()=>{$('#largeImage').style.width=(zoom=Math.min(300,zoom+25))+'%'};$('#zoomOut').onclick=()=>{$('#largeImage').style.width=(zoom=Math.max(50,zoom-25))+'%'};
document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true);
try{
 if(!allowed.includes(slug))throw Error('unknown book');const r=await fetch('../data/books/'+slug+'.json');if(!r.ok)throw Error('load');book=await r.json();
 $('#bookTitle').textContent=book.title;$('#notice').textContent=book.notice;$('#sourceLink').href=book.source.repository+'/tree/'+book.source.commit;
 $('#chapterSelect').innerHTML=book.chapters.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.title)+'</option>').join('');$('#albumTab').hidden=!book.albums.length;if(view==='albums'&&!book.albums.length)view='text';
 $('#loading').hidden=true;$('#layout').hidden=false;if(!go(params.get('verse')||initialLast))go(book.entries[0].id);
}catch{$('#loading').textContent='자료를 불러오지 못했어요. 전체 서재에서 문헌을 다시 선택해주세요.';$('#bookTitle').textContent='문헌 읽기'}
