/* Presentation controls preserve all existing reading record keys. */
document.addEventListener('DOMContentLoaded',()=>{
 const buttons=[...document.querySelectorAll('[data-layout]')],books=document.querySelector('#books');
 function layout(mode){if(!books)return;const list=mode==='list';books.classList.toggle('list-view',list);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===(list?'list':'grid'))));}
 layout(window.Simsang?.read('simsang-collection-layout','grid'));
 buttons.forEach(b=>b.addEventListener('click',()=>{layout(b.dataset.layout);window.Simsang?.write('simsang-collection-layout',b.dataset.layout);}));
 const content=document.querySelector('.reading-content');
 if(content){
  const bar=document.createElement('div');bar.className='reading-progress';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','현재 본문 읽기 진행');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.innerHTML='<span></span>';document.body.prepend(bar);
  let queued=false;const update=()=>{queued=false;const rect=content.getBoundingClientRect(),distance=rect.height-innerHeight;const p=distance<=0?(rect.top<innerHeight?100:0):Math.min(100,Math.max(0,-rect.top/distance*100));bar.firstElementChild.style.transform=`scaleX(${p/100})`;bar.setAttribute('aria-valuenow',String(Math.round(p)));};
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);if(typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(content);update();
 }
});
