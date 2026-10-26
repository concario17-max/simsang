const encoder = new TextEncoder();
const COOKIE = '__Host-simsang-entry';
const DAYS = 365 * 86400;
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex, nofollow'};
async function mac(secret, text) {
 const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
function equal(a,b) { let d=a.length^b.length; for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0; }
export function destination(value, origin) {
 try { const u=new URL(value,origin);return u.origin===origin&&!u.pathname.startsWith('/__entry')?u.pathname+u.search+u.hash:'/'; } catch { return '/'; }
}
function page(next, message='', status=200) {
 const nonce=crypto.randomUUID();
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>입장 · 심상 서재</title><style>
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f6f4ee;color:#30382f;font-family:system-ui,-apple-system,sans-serif;padding:56px 28px}main{width:min(100%,352px);text-align:center}.mark{display:block;width:1px;height:36px;margin:0 auto 28px;background:#8b947d}.eyebrow{margin:0;color:#67715f;font-size:10px;font-weight:500;letter-spacing:.25em}h1{font-family:"Noto Serif KR","Nanum Myeongjo","AppleMyungjo","Batang",serif;font-size:42px;font-weight:400;letter-spacing:.12em;line-height:1.5;margin:18px 0 14px;padding-left:.12em}.intro{margin:0;color:#73786e;font-size:14px;line-height:1.9;font-weight:400}form{margin-top:48px;text-align:left}label{display:block;font-size:12px;color:#596350;margin-bottom:12px}input,button{width:100%;min-height:54px;border-radius:3px;font:inherit}input{appearance:none;padding:12px 16px;border:1px solid #a7ae9e;background:transparent;color:#30382f;letter-spacing:.22em;font-size:18px;transition:border-color .15s,box-shadow .15s}input:focus{border-color:#59694c;outline:0;box-shadow:0 0 0 3px #59694c18}button{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:12px;border:1px solid #45543c;background:#45543c;color:#fff;font-size:14px;cursor:pointer;transition:background .15s}button:hover{background:#34422d}button span{font-size:18px;font-weight:300}button:focus-visible,summary:focus-visible{outline:2px solid #59694c;outline-offset:5px}.note{margin:24px 0 0;color:#73786e;font-size:11px;line-height:1.8}details{margin-top:8px;color:#73786e;font-size:11px;line-height:1.8}summary{display:inline-block;cursor:pointer;text-decoration:underline;text-underline-offset:4px}details p{margin:10px 0 0}.error{margin:24px 0 -24px;padding:12px;border-left:2px solid #a05748;text-align:left;background:#a0574808;color:#894638;font-size:13px;line-height:1.7}.footer{margin:52px 0 0;font-family:serif;color:#7b846f;font-size:20px}@media(max-width:480px){body{padding:40px 28px}h1{font-size:36px}form{margin-top:38px}.footer{margin-top:40px}}@media(prefers-reduced-motion:reduce){input,button{transition:none}}
</style><main><header><span class="mark" aria-hidden="true"></span><p class="eyebrow">SIMSANG ARCHIVE</p><h1>심상 서재</h1><p class="intro">마음에 남는 문장을 만나는 곳</p></header>${message?`<p id="entry-error" role="alert" class="error">${escape(message)}</p>`:''}<form method="post" action="/__entry"><input type="hidden" name="next" value="${escape(next)}"><label for="code">입장코드</label><input id="code" name="code" type="password" inputmode="numeric" autocomplete="current-password" maxlength="128" required${message?' aria-invalid="true" aria-describedby="entry-error"':''}><button type="submit">들어가기 <span aria-hidden="true">→</span></button></form><p class="note">한 번 입장하면 이 브라우저에서 기억합니다.</p><details><summary>입장 유지 안내</summary><p>입장은 1년간 유지되며 방문할 때마다 자동 연장됩니다.<br>쿠키를 삭제하거나 브라우저를 바꾸면 다시 입력해주세요.</p></details><p class="footer" aria-hidden="true">心</p></main><script nonce="${nonce}">document.querySelector('form').addEventListener('submit',()=>{const field=document.querySelector('[name=next]');if(location.hash&&!field.value.includes('#'))field.value+=location.hash;});</script></html>`;
 return new Response(html,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`}});
}
async function sessionCookie(signingKey, origin, now) {
 const exp=String(now+DAYS),signed=await mac(signingKey,origin+':'+exp);
 return `${COOKIE}=${exp}.${signed}; Path=/; Max-Age=${DAYS}; HttpOnly; Secure; SameSite=Lax`;
}
export async function onRequest({request,env,next}) {
 const url=new URL(request.url);
 // Never silently serve protected assets when configuration is absent.
 if(!env.ACCESS_CODE||!env.ACCESS_SECRET||env.ACCESS_SECRET.length<32||!env.ACCESS_ATTEMPTS)
  return new Response('입장 설정을 준비하고 있습니다. 잠시 후 다시 방문해주세요.',{status:503,headers});
 const signingKey=await mac(env.ACCESS_SECRET,'version:'+env.ACCESS_CODE);
 const now=Math.floor(Date.now()/1000);
 const token=(request.headers.get('Cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
 const [expiry,signature,...extra]=token.split('.');
 const authenticated=!extra.length&&/^\d{10}$/.test(expiry||'')&&+expiry>now&&+expiry<=now+DAYS&&/^[a-f0-9]{64}$/.test(signature||'')&&equal(signature,await mac(signingKey,url.origin+':'+expiry));
 if(url.pathname==='/__entry') {
  if(request.method==='GET')return page(destination(url.searchParams.get('next')||'/',url.origin));
  if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, POST'}});
  if(request.headers.get('Origin')!==url.origin)return new Response('Forbidden',{status:403,headers});
  if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Unsupported form',{status:415,headers});
  if(Number(request.headers.get('Content-Length'))>2048)return new Response('Request too large',{status:413,headers});
  const reader=request.body?.getReader();let body='',size=0;
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return new Response('Request too large',{status:413,headers});}body+=new TextDecoder().decode(value);}
  const form=new URLSearchParams(body),target=destination(form.get('next')||'/',url.origin);
  const bucket='attempt:'+await mac(env.ACCESS_SECRET,request.headers.get('CF-Connecting-IP')||'unknown');
  try {
   const record=await env.ACCESS_ATTEMPTS.get(bucket,'json');
   const attempts=record&&record.until>now?record:{count:0,until:now+900};
   if(attempts.count>=5)return page(target,'입력 횟수를 초과했어요. 15분 후 다시 시도해주세요.',429);
   const correct=equal(await mac(signingKey,form.get('code')||''),await mac(signingKey,env.ACCESS_CODE));
   if(!correct){await env.ACCESS_ATTEMPTS.put(bucket,JSON.stringify({...attempts,count:attempts.count+1}),{expirationTtl:900});return page(target,'입장코드가 맞지 않습니다.',401);}
   return new Response(null,{status:303,headers:{...headers,Location:target,'Set-Cookie':await sessionCookie(signingKey,url.origin,now)}});
  } catch {return new Response('입장 확인을 잠시 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',{status:503,headers});}
 }
 if(!authenticated) {
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('입장이 필요합니다.',{status:401,headers});
  const target=url.pathname+url.search;
  return new Response(null,{status:302,headers:{...headers,Location:'/__entry?next='+encodeURIComponent(target)}});
 }
 const original=await next();
 const response=new Response(original.body,original);
 for(const [key,value] of Object.entries(headers))response.headers.set(key,value);
 // Browser may retain static bytes but must revalidate through this gate on every use.
 if(/\.(?:js|css|json|webp|png|jpg|jpeg|svg|woff2)$/.test(url.pathname))response.headers.set('Cache-Control','private, no-cache, must-revalidate');
 response.headers.append('Vary','Cookie');
 response.headers.append('Set-Cookie',await sessionCookie(signingKey,url.origin,now));
 return response;
}
