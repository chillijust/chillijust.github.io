"""Screenshots and layout observations on untouched app files."""
import ast, functools, http.server, json, threading
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--old-root',type=Path,default=Path('/tmp/chilli-review-rerun/old-main'))
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun/visual'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
source=ast.parse((Path(__file__).resolve().parents[1]/'pruefung-2026-10-11/visual.py').read_text())
constants={n.targets[0].id:ast.literal_eval(n.value) for n in source.body if isinstance(n,ast.Assign)
           and isinstance(n.targets[0],ast.Name) and n.targets[0].id in ['SETUP','METRICS']}
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();BASE=f'http://127.0.0.1:{server.server_port}'
SCENES={
 'home':"zeige('home');",
 'long-titles':"zeige('home');document.querySelector('#ansicht>.abschnitt [data-termin=\"t0\"]').scrollIntoView({block:'start'});",
 'calendar-week':"state.gewohnheiten=Array.from({length:12},(_,i)=>gewohnheitLesen({id:'g'+i,name:'Gewohnheit '+i,rhythmus:{art:'taeglich'},angelegt:'2026-07-01',erledigt:i<10?[heuteSchluessel()]:[]}));state.kalender='woche';zeige('home');",
 'calendar-month':"state.kalender='monat';kalTag=heuteSchluessel();zeige('home');",
 'timer':"zeige('home');document.querySelector('#ansicht>.abschnitt [data-termin=\"t2\"]').scrollIntoView({block:'center'});state.timer={id:'g1',tag:heuteSchluessel(),start:zeitJetzt(),ms:600000,stumm:true,pausiert:null};timerOeffnen('g1');",
 'drang':"zeige('home');document.querySelector('#ansicht>.abschnitt [data-termin=\"t2\"]').scrollIntoView({block:'center'});state.welle={id:'a0',start:zeitJetzt()};drangOeffnen('a0');",
 'switch-off':"zeige('neu');window.scrollTo(0,document.documentElement.scrollHeight);",
 'fluid-settings':"esReiter='fluessig';zeige('einstellungen');",
 'appointment':"zeige('termin','t0');",
 'menu':"menueOeffnen();"
}
EXTRA=r"""()=>{
 const seen=e=>!!(e&&e.getClientRects().length),r=e=>e?e.getBoundingClientRect().toJSON():null;
 const cards=['timerKarte','drangKarte'].map(id=>$(id)).filter(seen);
 return {titleLines:Array.from(document.querySelectorAll('#ansicht .tm-titel,#ansicht .gw-name')).map(e=>({text:e.textContent,
   height:e.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(e).lineHeight),
   clamp:getComputedStyle(e).webkitLineClamp,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight})),
   dialogs:cards.map(e=>({id:e.id,background:getComputedStyle(e).backgroundColor,blur:getComputedStyle(e).backdropFilter,
     rect:r(e),buttons:Array.from(e.querySelectorAll('button')).map(b=>({id:b.id,rect:r(b),onScreen:b.getBoundingClientRect().top>=0&&b.getBoundingClientRect().bottom<=innerHeight}))})),
   count:$('tagesZahl')?{text:$('tagesZahl').textContent,rect:r($('tagesZahl')),lineHeight:getComputedStyle($('tagesZahl')).lineHeight}:null,
   switches:Array.from(document.querySelectorAll('[role="switch"]')).filter(seen).map(e=>({id:e.id,checked:e.getAttribute('aria-checked'),rect:r(e)}))};
}"""
rows=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,root in [('new',ROOT),('old',args.old_root.resolve())]:
  for orient,size in [('portrait',{'width':430,'height':932}),('landscape',{'width':932,'height':430})]:
   for theme in ['hell','dunkel']:
    scenes=SCENES if label=='new' else {k:v for k,v in SCENES.items() if k in ['timer','long-titles','switch-off','calendar-week']}
    for name,code in scenes.items():
     if label=='old' and name=='drang':continue
     ctx=browser.new_context(viewport=size,is_mobile=True,has_touch=True,device_scale_factor=1,service_workers='block')
     page=ctx.new_page();errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
     path='/' if label=='new' else '/OLD/'
     if label=='old':
      # Old HTML is served from a dedicated second local server, without rewriting its contents.
      oldserver=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
      threading.Thread(target=oldserver.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{oldserver.server_port}'
     else:url=BASE
     page.goto(url);page.evaluate(constants['SETUP'])
     page.evaluate("(t)=>{state.thema=t;state.fluessig={ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))};themaAnwenden();flDauernSetzen();}",theme)
     page.evaluate("()=>{"+code+"}");page.wait_for_timeout(1700)
     row={'label':label,'scene':name,'theme':theme,'orientation':orient,'metrics':page.evaluate(constants['METRICS']),
          'extra':page.evaluate(EXTRA),'errors':errors}
     file=f'{label}-{orient}-{theme}-{name}.png';page.screenshot(path=str(OUT/file));row['image']=file
     rows.append(row);print(json.dumps({'image':file,'overflow':row['metrics']['scrollWidth']-size['width'],
       'duplicates':row['metrics']['duplicateIds'],'small':row['metrics']['small'],'errors':errors},ensure_ascii=False),flush=True)
     ctx.close()
     if label=='old':oldserver.shutdown()
 browser.close()
server.shutdown();(OUT/'visual-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
