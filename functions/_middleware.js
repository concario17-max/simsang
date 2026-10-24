const encoder = new TextEncoder();
const COOKIE = '__Host-simsang-entry';
const DAYS = 30 * 86400;
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
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>입장 · 심상 서재</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f3f0e8;color:#292d25;font-family:system-ui,sans-serif;padding:24px}main{width:min(100%,420px)}.seal{font:48px serif;color:#69714d}small{letter-spacing:.18em;color:#69714d}h1{font-size:32px;margin:18px 0}p{line-height:1.8;color:#62665a}label{display:block;margin:30px 0 10px}input,button{width:100%;min-height:52px;border-radius:8px;font:inherit}input{padding:12px;border:1px solid #8d9380;background:#fff}button{margin-top:14px;border:0;background:#4e593d;color:white;cursor:pointer}:focus-visible{outline:3px solid #9a6231;outline-offset:4px}.note{font-size:13px}.error{color:#923d32}</style><main><div class="seal" aria-hidden="true">心</div><small>SIMSANG ARCHIVE</small><h1>심상 서재에 오신 것을<br>환영합니다.</h1><p>입장코드를 입력하고<br>마음에 남는 문장을 만나보세요.</p>${message?`<p role="alert" class="error">${escape(message)}</p>`:''}<form method="post" action="/__entry"><input type="hidden" name="next" value="${escape(next)}"><label for="code">입장코드</label><input id="code" name="code" type="password" inputmode="numeric" autocomplete="current-password" maxlength="128" required autofocus><button type="submit">서재 들어가기</button></form><p class="note">이 브라우저에서 30일 동안 입장이 유지됩니다.</p></main><script nonce="${nonce}">document.querySelector('form').addEventListener('submit',()=>{const field=document.querySelector('[name=next]');if(location.hash&&!field.value.includes('#'))field.value+=location.hash;});</script></html>`;
 return new Response(html,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`}});
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
   const exp=String(now+DAYS),signed=await mac(signingKey,url.origin+':'+exp);
   return new Response(null,{status:303,headers:{...headers,Location:target,'Set-Cookie':`${COOKIE}=${exp}.${signed}; Path=/; Max-Age=${DAYS}; HttpOnly; Secure; SameSite=Lax`}});
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
 response.headers.append('Vary','Cookie');
 return response;
}
