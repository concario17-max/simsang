import {comicPages} from '../reader/media.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{
 const response=await fetch('../data/books/introspection.json');if(!response.ok)throw Error('load');const book=await response.json();
 const last=Simsang.read('simsang-book-introspection-last',null),entry=book.entries.find(e=>e.id===last);if(entry){$('#resume').href='../reader/?'+new URLSearchParams({book:'introspection',verse:entry.id});$('#resume').textContent=entry.label+' 이어서 읽기 ↗';}
 function render(){const q=$('#query').value.trim().toLowerCase(),comicOnly=$('#comicOnly').checked,entries=book.entries.filter(e=>(!q||[e.label,e.englishTitle].join(' ').toLowerCase().includes(q))&&(!comicOnly||comicPages(e).length));$('#status').textContent=entries.length?entries.length+'개 읽기 항목':comicOnly?'아직 공개된 학습만화가 없어요. 필터를 해제하면 본문을 읽을 수 있어요.':'일치하는 특성이 없어요.';$('#contents').innerHTML=book.chapters.map(c=>{const rows=entries.filter(e=>e.chapter===c.id);return rows.length?'<section class="chapter"><h3>'+esc(c.title)+'</h3><ul>'+rows.map(e=>'<li><a href="../reader/?'+esc(new URLSearchParams({book:'introspection',verse:e.id}).toString())+'">'+esc(e.label)+'<small>'+ (comicPages(e).length?'본문 · 학습만화':'본문')+'</small></a></li>').join('')+'</ul></section>':''}).join('')}
 $('#query').oninput=render;$('#comicOnly').onchange=render;render();
}catch{$('#status').textContent='목차를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.'}
