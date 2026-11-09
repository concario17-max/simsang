const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
export function markdown(s){
 const lines=String(s).split(/\r?\n/);let result='';
 for(let i=0;i<lines.length;){const l=lines[i];
  if(!l.trim()){i++;continue}
  if(l.trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?[\s:|\-]+\|\s*$/.test(lines[i+1])){
   const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());const heads=cells(l);i+=2;let rows='';
   while(i<lines.length&&lines[i].trim().startsWith('|')){rows+='<tr>'+cells(lines[i++]).map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>'}
   result+='<div class="table-scroll"><table><thead><tr>'+heads.map(c=>'<th>'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';continue;
  }
  if(/^\s*>/.test(l)){const quote=[];while(i<lines.length&&/^\s*>/.test(lines[i]))quote.push(lines[i++].replace(/^\s*> ?/,''));result+='<blockquote>'+markdown(quote.join('\n'))+'</blockquote>';continue;}
  const h=l.match(/^(#{1,6})\s+(.+)/);if(h){const level=Math.min(6,h[1].length+2);result+='<h'+level+'>'+inline(h[2])+'</h'+level+'>';i++;continue}
  if(/^\s*[-*]\s+/.test(l)){let items='';while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i]))items+='<li>'+inline(lines[i++].replace(/^\s*[-*]\s+/,''))+'</li>';result+='<ul>'+items+'</ul>';continue}
  let p=[];while(i<lines.length&&lines[i].trim()&&!/^#{1,6}\s|^\s*[-*]\s+|^\s*>/.test(lines[i]))p.push(lines[i++]);result+='<p>'+inline(p.join('\n'))+'</p>';
 }
 return result;
}
