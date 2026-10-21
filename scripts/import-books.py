"""Import the six source checkouts; usage: python3 scripts/import-books.py SOURCE_ROOT.
Only reading content is copied. Media URLs are pinned to source commits.
"""
import json, re, subprocess, sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SOURCES = Path(sys.argv[1])
NAMES = {'gita':'바가바드 기타','lamp':'보리도등론','Thodol':'티베트 사자의 서','rosi':'장미십자의 비의','miracle':'기적수업','3body':'인위삼신행상명등론'}
EN347 = 'Anger must come from judgment. Judgment is The weapon I would use against myself,\nTo keep the miracle away from me.'
KO347 = '분노는 판단에서 온다. 판단이란, 내가 기적들을 전부 몰아내려고 나 자신에게 겨누는 무기이다.'
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,d): p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
def decl_object(text,marker):
    # Extract a JSON-shaped TS data literal; remove trailing commas outside strings.
    s=text.split(marker,1)[1]; start=s.index('{');depth=0;string=False;escape=False;end=None
    for i,c in enumerate(s[start:],start):
        if string:
            if escape: escape=False
            elif c=='\\':escape=True
            elif c=='"':string=False
        elif c=='"':string=True
        elif c=='{':depth+=1
        elif c=='}':
            depth-=1
            if depth==0:end=i+1;break
    s=s[start:end];out=[];string=False;escape=False
    for i,c in enumerate(s):
        if string:
            out.append(c)
            if escape:escape=False
            elif c=='\\':escape=True
            elif c=='"':string=False
        else:
            if c=='"':string=True
            if c==',' and s[i+1:].lstrip().startswith(('}',']')):continue
            out.append(c)
    return json.loads(''.join(out))

selected=sys.argv[2:] or list(NAMES)
provenance=[x for x in read(ROOT/'data/books/sources.json') if x['slug'] not in selected] if (ROOT/'data/books/sources.json').exists() else []
for slug in selected:
    title=NAMES[slug]
    src=SOURCES/slug
    sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=src,text=True).strip()
    def media(p):
        if not p:return ''
        p=Path(p)
        assert p.is_file(),p
        return f'https://raw.githubusercontent.com/concario17-max/{slug}/{sha}/'+quote(p.relative_to(src).as_posix(),safe='/')
    comicroot=src/('학습만화' if slug in ['gita','Thodol','3body'] else 'src/assets/learning-comic')
    ext='webp' if slug in ['rosi','miracle'] else 'png'
    images=sorted(comicroot.glob(f'*/*.{ext}'))
    def comic(ch,number):
        candidates=[p for p in images if p.parent.name.removeprefix('chapter-')==str(ch)]
        exact=next((p for p in candidates if p.stem==str(number)),None)
        if exact:return media(exact)
        matchnum=re.match(r'\d+',str(number))
        if not matchnum:return ''
        v=int(matchnum[0])
        for p in candidates:
            m=re.fullmatch(r'(\d+)(?:-(\d+))?',p.stem)
            if m and int(m[1])<=v<=int(m[2] or m[1]):return media(p)
        return ''
    book={'slug':slug,'title':title,'source':{'repository':f'https://github.com/concario17-max/{slug}','commit':sha},'notice':'','chapters':[],'entries':[],'albums':[]}
    def chapter(id,title):book['chapters'].append({'id':str(id),'title':title})
    def add(id,ch,label,texts,commentary='',image='',audio='',words=None):
        book['entries'].append({'id':str(id),'chapter':str(ch),'label':str(label),'texts':texts,'commentary':commentary,'comic':image,'audio':audio,'words':words or []})
    if slug=='gita':
        d=read(src/'public/gita.json')
        for key,c in d.items():
            ch=c['chapter'];chapter(ch,f'제{ch}장')
            for p in c['verses']:
                texts={k:p.get(k,'') for k in ['sanskrit','iast','korean_pronunciation','translation_en','translation_ham','translation_gil','translation_jimong','translation_suk']}
                add(p['id'],ch,f"{p['verse']}절",texts,p.get('commentary_en',''),comic(ch,p['verse']),p.get('audio',''),p.get('words',[]))
        book['notice']='원문의 번역별 빈 항목은 그대로 유지했어요.'
    elif slug in ['lamp','rosi','miracle']:
        d=read(src/'public/reading-data.json');comments=read(src/'public/bodhi-commentary.json')
        groups=[g for g in d['chapters'] if slug!='lamp' or g['id']=='bodhi']
        for ch,s in enumerate([s for g in groups for s in g.get('subchapters',[g])],1):
            chapter(ch,s.get('chapterName') or s.get('title') or f'{ch}장')
            for i,p in enumerate(s['paragraphs']):
                num=re.match(r'\d+',p['id'].split('.')[-1]);num=int(num[0]) if num else i+1
                key=f'bodhi.{ch}.{num}' if slug=='lamp' else f'{slug}.{ch}.{num}'
                display='도입부' if slug=='lamp' and ch==1 else '결어' if slug=='lamp' and p['title']=='결어' else num
                texts=dict(p['text'])
                if slug=='miracle' and num==347:texts.update(english=EN347,korean=KO347)
                add(p['id'],ch,p['title'],texts,comments.get(key,''),comic(ch,display))
        book['notice']={'lamp':'도입부·68게송·결어를 읽을 수 있어요.','rosi':'제작 중인 문헌이에요. 현재 준비된 본문·해설·만화만 제공해요.','miracle':'원래 구성의 레슨 번호를 유지하며, 361~365과는 한 항목으로 읽어요.'}[slug]
    elif slug=='3body':
        for c in read(src/'public/reading-snapshot.json'):
            ch=c['id'];chapter(ch,c['chapterName'])
            for p in c['paragraphs']:add(p['id'],ch,f"{p['paragraphNumber']}문단",p['text'],image=comic(ch,p['paragraphNumber']))
        book['notice']='4장 본문과 준비된 학습만화를 제공해요.'
    else:
        # Only 1.52 is a matching prayer commentary; 1.1–1.51 are unrelated Yoga remnants.
        comments=decl_object((src/'src/data/chapter1Commentary.ts').read_text(),'export const chapter1Commentary =')
        prayers=read(src/'public/prayers.json');main=read(src/'public/book.json')
        chapter('prayers','기도문');n=0
        for group in prayers:
            for p in group['verses']:
                n+=1;texts=dict(p.get('text',{}))
                for k in ['translation_joongam','translation_ryu','translation_gil','translation_jimong','translation_suk','korean_pronunciation']:
                    if p.get(k):texts[k]=p[k]
                commentary=comments.get('1.52',[]) if n==52 else ''
                a=p.get('audioUrl') or p.get('audio') or ''
                if a and not a.startswith('http'):a=media(src/'public'/a.lstrip('/'))
                add(f'prayer.{n}','prayers',f"{n}. {p.get('chapterTitle') or group['chapterName']}",texts,commentary,comic(1,n),a)
        for i,group in enumerate(main,1):
            chapter(f'book-{i}',group['chapterName']);n=0
            for section in group.get('subchapters',[group]):
                for p in section['verses']:
                    n+=1;add(f'book.{i}.{n}',f'book-{i}',f"{n}. {section.get('chapterName','본문')}",p.get('text',{}))
        for album in read(src/'public/albums.json'):
            a=dict(album);a['coverImage']=media(src/'public'/a['coverImage'].lstrip('/'))
            a['tracks']=[{**t,'url':media(src/'public'/t['url'].lstrip('/'))} for t in a['tracks']];book['albums'].append(a)
        book['notice']='본문·기도문과 독송 앨범을 함께 읽고 들을 수 있어요.'
    assert len({e['id'] for e in book['entries']})==len(book['entries'])
    write(ROOT/f'data/books/{slug}.json',book)
    stats={'slug':slug,**book['source'],'entries':len(book['entries']),'commentaries':sum(bool(e['commentary']) for e in book['entries']),'comics':sum(bool(e['comic'])for e in book['entries']),'albums':len(book['albums'])}
    provenance.append(stats);print(json.dumps(stats,ensure_ascii=False),flush=True)
write(ROOT/'data/books/sources.json',provenance)
