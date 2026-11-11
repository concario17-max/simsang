import {comicPages} from './media.js';

export function hasEasyReading(book,entry){
 return !!(book.reflection&&!entry.appendix&&entry.commentary?.length&&!comicPages(entry).length);
}

export function visibleCommentary(book,entry){return book.reflection&&!hasEasyReading(book,entry)?'':entry.commentary;}

export function resolveReadingView(book,entry,requested,pages=comicPages(entry)){
 const preferred=book.reflection&&pages.length?'comic':hasEasyReading(book,entry)?'commentary':'text';
 const view=requested||preferred;
 if(book.reflection&&((view==='commentary'&&!hasEasyReading(book,entry))||(view==='comic'&&!pages.length)))return preferred;
 return view;
}
