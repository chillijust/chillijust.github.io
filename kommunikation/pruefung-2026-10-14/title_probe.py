"""Measure text ink bounds, including headings that do not widen the page."""
import ast,functools,http.server,json,threading
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun/titles'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
src=ast.parse((Path(__file__).resolve().parents[1]/'pruefung-2026-10-11/visual.py').read_text())
SETUP=next(ast.literal_eval(n.value) for n in src.body if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id=='SETUP')
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
s=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=s.serve_forever,daemon=True).start();rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for orient,size in [('portrait',{'width':430,'height':932}),('landscape',{'width':932,'height':430})]:
  for theme in ['hell','dunkel']:
   for kind in ['timer','drang']:
    ctx=b.new_context(viewport=size,is_mobile=True,has_touch=True,device_scale_factor=1,service_workers='block')
    page=ctx.new_page();page.goto(f'http://127.0.0.1:{s.server_port}');page.evaluate(SETUP)
    page.evaluate("(t)=>{state.thema=t;state.fluessig={ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))};themaAnwenden();flDauernSetzen();state.gewohnheiten[1].name='W'.repeat(NAME_MAX);zeige('home');}",theme)
    if kind=='timer':page.evaluate("()=>{state.timer={id:'g1',tag:heuteSchluessel(),start:zeitJetzt(),ms:600000,stumm:true,pausiert:null};timerOeffnen('g1');}")
    else:page.evaluate("()=>{state.welle={id:'a0',start:zeitJetzt()};drangOeffnen('a0');}")
    page.wait_for_timeout(1800)
    row=page.evaluate(r"""(kind)=>{
      const name=$(kind==='timer'?'timerName':'drangName'),card=$(kind==='timer'?'timerKarte':'drangKarte');
      const range=document.createRange();range.selectNodeContents(name);const ink=range.getBoundingClientRect(),c=card.getBoundingClientRect(),h=name.getBoundingClientRect();
      const sound=$('timerTon'),tone=kind==='timer'&&sound?sound.getBoundingClientRect():null;
      return {kind,text:name.textContent,nameMax:NAME_MAX,header:h.toJSON(),textInk:ink.toJSON(),card:c.toJSON(),
        inkBeyondCard:ink.right>c.right+.5||ink.left<c.left-.5,
        overlapsSound:!!(tone&&ink.right>tone.left&&ink.left<tone.right&&ink.top<tone.bottom&&ink.bottom>tone.top),
        overflowWrap:getComputedStyle(name).overflowWrap,textOverflow:getComputedStyle(name).textOverflow,
        clippedByCard:getComputedStyle(card).overflow,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    }""",kind)
    row.update(orientation=orient,theme=theme);file=f'{orient}-{theme}-{kind}-long-name.png';page.screenshot(path=str(OUT/file));row['image']=file
    rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True);ctx.close()
 b.close()
s.shutdown();(OUT/'title-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
