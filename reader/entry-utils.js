export function entryRange(entry) {
 const start=Number(entry.id.split('.').at(-1));
 const match=String(entry.audio||'').match(/\/(\d+)_(\d+)-(\d+)\.mp3$/);
 const end=match && Number(match[1])===Number(entry.chapter) && Number(match[2])===start ? Number(match[3]) : start;
 return {start,end:Number.isInteger(end)&&end>=start?end:start};
}
export function entryAliases(slug,entry) {
 if(slug!=='gita')return [];
 const {start,end}=entryRange(entry);
 return Array.from({length:end-start+1},(_,i)=>entry.chapter+'.'+(start+i));
}
export function entryLabel(slug,entry) {
 if(slug!=='gita')return entry.label;
 const {start,end}=entryRange(entry);
 return '제'+entry.chapter+'장 '+start+(end>start?'~'+end:'')+'절';
}
export const entryMatches=(slug,entry,id)=>entry.id===id||entryAliases(slug,entry).includes(id);
export const readerHref=(book,verse,view)=>'?'+new URLSearchParams({book,verse,view});
