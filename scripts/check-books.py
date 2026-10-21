"""Verify approved content boundaries, source preservation and media paths."""
import json, re, sys
from pathlib import Path
from urllib.parse import unquote, urlparse
root=Path(__file__).resolve().parents[1];sources=Path(sys.argv[1])
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
books={p.stem:read(p) for p in (root/'data/books').glob('*.json') if p.stem!='sources'}
for slug,count in {'gita':640,'lamp':70,'rosi':995,'miracle':291,'3body':168,'Thodol':331}.items():
 b=books[slug];assert len(b['entries'])==count;assert len({e['id'] for e in b['entries']})==count
 def walk(x):
  if isinstance(x,dict):
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
  elif isinstance(x,str) and x.startswith('https://raw.githubusercontent.com/'):
   owner,repo,sha,path=urlparse(x).path.lstrip('/').split('/',3)
   assert owner=='concario17-max' and repo==slug and sha==b['source']['commit']
   assert (sources/slug/unquote(path)).is_file(),x
 walk(b)
g=books['gita']['entries'];assert sum(not e['texts']['translation_suk'].strip() for e in g)==60
original=[v for c in read(sources/'gita/public/gita.json').values() for v in c['verses']]
assert [e['id'] for e in g]==[e['id'] for e in original]
for e,o in zip(g,original):
 assert all(v==o.get(k,'') for k,v in e['texts'].items())
 assert e['commentary']==o.get('commentary_en','')
for slug in ['lamp','rosi','miracle']:
 groups=read(sources/slug/'public/reading-data.json')['chapters']
 if slug=='lamp':groups=[c for c in groups if c['id']=='bodhi']
 original=[p for c in groups for s in c.get('subchapters',[c]) for p in s['paragraphs']]
 entries=books[slug]['entries'];assert [e['id'] for e in entries]==[p['id'] for p in original]
 for e,o in zip(entries,original):
  if slug=='miracle' and e['id'].endswith('.347'):continue
  assert e['texts']==o['text'],e['id']
m=books['miracle']['entries'];numbers={int(re.match(r'\d+',e['id'].split('.')[-1])[0]) for e in m}
missing=set().union(*(set(range(a,b+1)) for a,b in [(51,60),(81,90),(111,120),(141,150),(171,180),(201,220)]))
assert numbers==set(range(1,362))-missing
assert len([e for e in m if '361' in e['id']])==1
v=next(e for e in m if e['id'].endswith('.347'))['texts']
assert v['english']=='Anger must come from judgment. Judgment is The weapon I would use against myself,\nTo keep the miracle away from me.'
assert v['korean']=='분노는 판단에서 온다. 판단이란, 내가 기적들을 전부 몰아내려고 나 자신에게 겨누는 무기이다.'
assert all(e['id'].startswith('bodhi.') for e in books['lamp']['entries'])
assert not any(e['commentary'] for e in books['3body']['entries'])
assert [e['id'] for e in books['Thodol']['entries'] if e['commentary']]==['prayer.52']
print('PASS: six books, source text preservation, approved omissions/347, empty translations, pinned media paths')
