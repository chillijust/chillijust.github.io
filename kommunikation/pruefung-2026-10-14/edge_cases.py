"""Minimal real-touch reproductions on untouched app, with read-only event logging."""
import ast,functools,http.server,json,threading,sys
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--old-root',type=Path,default=Path('/tmp/chilli-review-rerun/old-main'))
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun'))
parser.add_argument('--only-multitouch',action='store_true')
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
src=ast.parse((Path(__file__).resolve().parents[1]/'rueckwege-2026-10-11/check_returns.py').read_text())
SETUP=next(ast.literal_eval(n.value) for n in src.body if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id=='SETUP')
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
servers={}
for label,root in [('old',args.old_root.resolve()),('new',ROOT)]:
 s=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
 threading.Thread(target=s.serve_forever,daemon=True).start();servers[label]=s
rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label in ([] if '--only-multitouch' in sys.argv else ['old','new']):
  for hold in [650,1000,1500]:
   ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='block')
   page=ctx.new_page();page.goto(f'http://127.0.0.1:{servers[label].server_port}');page.evaluate(SETUP);page.wait_for_timeout(1500)
   page.evaluate("document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').scrollIntoView({block:'center'})");page.wait_for_timeout(250)
   point=page.evaluate("()=>{const r=document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').getBoundingClientRect();return{x:r.left+r.width*.8,y:r.top+r.height*.5}}")
   original=page.evaluate("gewohnheitNach('nope');terminNach('t3').wiederholung")
   page.evaluate("()=>{window.eventLog=[];['pointerdown','pointerup','click','contextmenu'].forEach(type=>document.addEventListener(type,e=>eventLog.push({type,id:e.target.id,tag:e.target.tagName,repeat:e.target.getAttribute&&e.target.getAttribute('data-wdh'),trusted:e.isTrusted,sinceHold:Date.now()-langGedrueckt}),true))}")
   cdp=ctx.new_cdp_session(page);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});page.wait_for_timeout(hold)
   before=page.evaluate("(pt)=>{const e=document.elementFromPoint(pt.x,pt.y);return{view:ansicht,repeat:terminEntwurf&&terminEntwurf.wiederholung,target:e?{id:e.id,tag:e.tagName,repeat:e.getAttribute('data-wdh'),text:e.textContent.slice(0,80)}:null}}",point)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(1600)
   after=page.evaluate("()=>({view:ansicht,repeat:terminEntwurf&&terminEntwurf.wiederholung,events:eventLog})")
   page.locator('#tmSpeichern').scroll_into_view_if_needed();page.tap('#tmSpeichern');page.wait_for_timeout(1000)
   saved=page.evaluate("()=>({memory:terminNach('t3').wiederholung,stored:JSON.parse(localStorage.getItem(SPEICHER)).termine.find(t=>t.id==='t3').wiederholung})")
   row={'label':label,'holdMs':hold,'point':point,'originalRepeat':original,'beforeRelease':before,'afterRelease':after,'saved':saved}
   rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True);ctx.close()
 ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='block')
 page=ctx.new_page();page.goto(f'http://127.0.0.1:{servers['new'].server_port}');page.evaluate(SETUP);page.wait_for_timeout(1500)
 page.tap('#menuKnopf');page.wait_for_timeout(1000);page.tap('[data-menue="journal"]');page.wait_for_timeout(1500)
 cdp=ctx.new_cdp_session(page);states=[]
 for i in range(3):
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':6,'y':600,'id':0}]})
  page.wait_for_timeout(70)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':6,'y':600,'id':0},{'x':240,'y':610,'id':1}]})
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(300)
  states.append(page.evaluate("()=>({view:ansicht,previews:document.querySelectorAll('body>.abbild').length,ready:$('app').classList.contains('bereit'),drag:!!rueckZug,prepared:!!wischVon})"))
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':6,'y':600}]})
 for x in [36,66,96,126,156,186]:
  cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':600}]});page.wait_for_timeout(50)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(1800)
 row={'case':'second-finger-before-drag-repeated','states':states,'afterNormalReturn':page.evaluate("()=>({view:ansicht,previews:document.querySelectorAll('body>.abbild').length,ready:$('app').classList.contains('bereit'),drag:!!rueckZug})")}
 rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True);ctx.close()
 ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='block')
 page=ctx.new_page();page.goto(f'http://127.0.0.1:{servers['new'].server_port}');page.evaluate(SETUP);page.wait_for_timeout(1500)
 page.tap('#menuKnopf');page.wait_for_timeout(1000);page.tap('[data-menue="journal"]');page.wait_for_timeout(1500)
 cdp=ctx.new_cdp_session(page)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':6,'y':600,'id':0}]})
 for x in [36,66,96,126,156,186]:
  cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':600,'id':0}]});page.wait_for_timeout(50)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':186,'y':600,'id':0},{'x':300,'y':600,'id':1}]})
 before=page.evaluate("()=>({view:ansicht,drag:!!rueckZug,spring:!!(rueckZug&&rueckZug.federt)})")
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(1800)
 row={'case':'second-finger-during-drag-no-further-move','beforeRelease':before,'afterRelease':page.evaluate("()=>({view:ansicht,previews:document.querySelectorAll('body>.abbild').length,drag:!!rueckZug})")}
 rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True);ctx.close();b.close()
for s in servers.values():s.shutdown()
(OUT/('edge-multitouch-results.json' if '--only-multitouch' in sys.argv else 'edge-case-results.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2))
