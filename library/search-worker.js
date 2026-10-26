import {normalize,snippet} from './search-utils.js';
const cache=new Map();let current=0;
self.onmessage=async({data:{id,q,groups,root}})=>{current=id;if(!q)return;const terms=normalize(q).split(/\s+/),pending=[...groups];let completed=0;
 async function run(){while(pending.length&&current===id){const group=pending.shift();try{if(!cache.has(group.id))cache.set(group.id,fetch(new URL(group.file,root)).then(r=>{if(!r.ok)throw Error('load');return r.json()}).catch(e=>{cache.delete(group.id);throw e}));const rows=await cache.get(group.id);if(current!==id)return;const hits=rows.filter(r=>terms.every(t=>normalize(r.text).includes(t))).map(r=>({id:r.id,snippet:snippet(r.text,q)}));self.postMessage({id,hits,completed:++completed,total:groups.length});}catch{if(current===id)self.postMessage({id,hits:[],failed:group.id,completed:++completed,total:groups.length})}}}
 await Promise.all([run(),run()]);
};
