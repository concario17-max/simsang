export function hasEasyReading(book,entry){
 return !!(book.reflection&&!entry.appendix&&entry.commentary?.length);
}

export function resolveReadingView(book,entry,requested,pages=[]){
 const view=requested||(hasEasyReading(book,entry)?'commentary':'text');
 if(book.reflection&&((view==='commentary'&&!hasEasyReading(book,entry))||(view==='comic'&&!pages.length)))return 'text';
 return view;
}
