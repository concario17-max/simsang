/** Calendar dates use a fixed 365-day reading cycle; Feb 29 repeats Feb 28. */
export const toUtcDateOnly=(y,m,d)=>Date.UTC(y,m-1,d);
export function getCycleStartUtc(date,startMonth=4,startDay=7){const y=date.getFullYear();return Date.UTC(y-(Date.UTC(y,date.getMonth(),date.getDate())<Date.UTC(y,startMonth-1,startDay)?1:0),startMonth-1,startDay)}
export const inRange=n=>n>=0&&n<365;
export function calcYaoNum(date){
 const m=date.getMonth(),day=date.getDate();
 if(Number.isNaN(date.getTime())||(m===3&&day>=2&&day<=6))return null;
 const fixed=Date.UTC(2001,m,m===1&&day===29?28:day);
 const start=Date.UTC(2001,3,7),days=((fixed-start)/86400000+365)%365;
 return days<360?25+days:null;
}
export const calcGuaNum=n=>Number.isInteger(n)&&n>=1&&n<=384?Math.floor((n-1)/6)+1:null;
/** Inverse for ordinary entries. Bonus 1–24 are selected separately on April 2. */
export function dateForYao(n,year){
 if(!Number.isInteger(n)||n<25||n>384)return null;
 const d=new Date(Date.UTC(2001,3,7+n-25));
 return `${year}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
export function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||'')||s<'1900-01-01'||s>'2199-12-31')return false;const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s}
