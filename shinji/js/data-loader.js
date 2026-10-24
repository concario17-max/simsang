/* Fetch each collection only when its menu is opened; rejected loads can retry. */
(() => {
 const pending={};
 const files={story:'stories-data.js',book:'books-data.js',video:'lectures-data.js'};
 const base=new URL('.',document.currentScript.src);
 window.loadShinjiData=mode=>{
  if(!files[mode])return Promise.reject(new Error('Unknown collection'));
  if(!pending[mode])pending[mode]=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=new URL(files[mode],base).href;
   script.onload=()=>resolve(mode==='story'?STORIES_DATA:mode==='book'?BOOKS_DATA:LECTURE_DATA);
   script.onerror=()=>{delete pending[mode];script.remove();reject(new Error('Load failed'))};document.head.append(script);
  });return pending[mode];
 };
})();
