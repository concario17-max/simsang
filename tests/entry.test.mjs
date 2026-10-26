import {test} from 'node:test';import assert from 'node:assert/strict';import {onRequest,destination} from '../functions/_middleware.js';
const records=new Map();const env={ACCESS_CODE:'test-code',ACCESS_SECRET:'x'.repeat(64),ACCESS_ATTEMPTS:{get:async k=>records.get(k)||null,put:async(k,v)=>records.set(k,JSON.parse(v))}};
const req=(path,opts={})=>new Request('https://simsang.org'+path,opts);
const run=(r,e=env)=>onRequest({request:r,env:e,next:async()=>new Response('protected',{status:206,headers:{'Content-Type':'application/json'}})});
const post=code=>req('/__entry',{method:'POST',headers:{Origin:'https://simsang.org','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,next:'/reader/?book=miracle#chapter'})});
test('all anonymous routes protected, configuration fails closed',async()=>{for(const p of ['/','/data/books/gita.json','/assets/calendar/a.webp','/library/','/shinji/js/books-data.js'])assert.equal((await run(req(p))).status,302);assert.equal((await run(req('/'),{})).status,503)});
test('login, secure cookie, asset response, expiry, forgery and code rotation',async()=>{records.clear();const r=await run(post('test-code'));assert.equal(r.status,303);assert.equal(r.headers.get('Location'),'/reader/?book=miracle#chapter');const cookie=r.headers.get('Set-Cookie');for(const flag of ['HttpOnly','Secure','SameSite=Lax','Max-Age=31536000'])assert.ok(cookie.includes(flag));const auth=await run(req('/data/books/gita.json',{headers:{Cookie:cookie.split(';')[0]}}));assert.equal(auth.status,206);assert.equal(await auth.text(),'protected');assert.equal(auth.headers.get('Cache-Control'),'private, no-cache, must-revalidate');const token=cookie.split(';')[0];assert.equal((await run(req('/',{headers:{Cookie:token+'0'}}))).status,302);assert.equal((await run(req('/',{headers:{Cookie:token}}),{...env,ACCESS_CODE:'rotated'})).status,302);assert.equal((await run(req('/',{headers:{Cookie:'__Host-simsang-entry=1000000000.'+'0'.repeat(64)}}))).status,302)});
test('invalid code and rate limit; cross-site login rejected',async()=>{records.clear();for(let i=0;i<5;i++)assert.equal((await run(post('bad'))).status,401);assert.equal((await run(post('test-code'))).status,429);assert.equal((await run(req('/__entry',{method:'POST',headers:{Origin:'https://evil.example'}}))).status,403)});
test('safe redirect and entry form does not disclose secret',async()=>{for(const p of ['https://evil.example/','//evil.example/','/\\evil.example/','/__entry'])assert.equal(destination(p,'https://simsang.org'),'/');const html=await(await run(req('/__entry?next=%22%3E%3Cscript%3E'))).text();assert.ok(!html.includes('test-code'));assert.ok(!html.includes('value=""><script>'))});

test('visits renew sessions; old 30-day cookies upgrade without login',async()=>{
 records.clear();const realNow=Date.now;let time=1800000000000;Date.now=()=>time;
 try {
  const login=await run(post('test-code'));const first=login.headers.get('Set-Cookie').split(';')[0];
  const expiry=token=>Number(token.split('=')[1].split('.')[0]);
  assert.equal(expiry(first),time/1000+31536000);
  time+=10*86400000;
  const visit=await run(req('/library/',{headers:{Cookie:first}}));
  const renewed=visit.headers.get('Set-Cookie').split(';')[0];
  assert.equal(expiry(renewed),time/1000+31536000);assert.ok(expiry(renewed)>expiry(first));
  const {createHmac}=await import('node:crypto');const mac=(key,value)=>createHmac('sha256',key).update(value).digest('hex');
  const key=mac(env.ACCESS_SECRET,'version:'+env.ACCESS_CODE),oldExpiry=String(time/1000+30*86400);
  const legacy='__Host-simsang-entry='+oldExpiry+'.'+mac(key,'https://simsang.org:'+oldExpiry);
  const upgrade=await run(req('/',{headers:{Cookie:legacy}}));assert.equal(upgrade.status,206);
  assert.equal(expiry(upgrade.headers.get('Set-Cookie')),time/1000+31536000);
  time=(expiry(first)+1)*1000;
  assert.equal((await run(req('/',{headers:{Cookie:first}}))).status,302);
  assert.equal((await run(req('/',{headers:{Cookie:renewed}}))).status,206);
  assert.equal((await run(req('/',{headers:{Cookie:renewed}}),{...env,ACCESS_SECRET:'y'.repeat(64)})).status,302);
  const rejected=await run(req('/',{headers:{Cookie:renewed+'0'}}));assert.equal(rejected.status,302);assert.equal(rejected.headers.get('Set-Cookie'),null);
 } finally {Date.now=realNow;}
});

test('static revalidation remains gated and documents are never cached',async()=>{records.clear();const login=await run(post('test-code')),cookie=login.headers.get('Set-Cookie').split(';')[0];for(const path of ['/shared.js','/data/search/yoga.json','/assets/calendar/yao-384.webp']){const r=await run(req(path,{headers:{Cookie:cookie,'If-None-Match':'some-etag'}}));assert.equal(r.headers.get('Cache-Control'),'private, no-cache, must-revalidate');assert.match(r.headers.get('Vary'),/Cookie/);assert.equal((await run(req(path,{headers:{'If-None-Match':'some-etag'}}))).status,302)}assert.equal((await run(req('/library/',{headers:{Cookie:cookie}}))).headers.get('Cache-Control'),'private, no-store')});
