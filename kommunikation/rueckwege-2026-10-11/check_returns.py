import argparse,functools,http.server,json,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser(description='Beobachtet fünf Rückwege auf unverändertem App-Code.')
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-return-rerun'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve()
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
SETUP=r"""()=>{
  auftrittEnde(true);state=grundStand();state.thema='dunkel';state.schwachHinweis=false;
  state.fluessig={ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))};
  for(let i=0;i<6;i++)state.gewohnheiten.push(gewohnheitLesen({id:'g'+i,name:'Lesen '+i,
    rhythmus:{art:'taeglich'},angelegt:heuteSchluessel(),erledigt:[]}));
  for(let i=0;i<5;i++)state.termine.push(terminLesen({id:'t'+i,titel:'Termin '+i,
    tag:heuteSchluessel(),von:'12:00'}));
  themaAnwenden();flDauernSetzen();zeige('home');
  window.backCalls=[];
  const original=uebergangAusfuehren;
  uebergangAusfuehren=function(u){backCalls.push({kind:'transition',time:performance.now(),
    returnToHome:u&&u.zurueck,ghost:!!(u&&u.geist),alreadyMessage:u&&u.gemeldet,
    origin:herkunft,point:herkunftPunkt});return original(u);};
  const shrink=tropfenZu;
  tropfenZu=function(g,r,z,opt){backCalls.push({kind:'shrink',time:performance.now(),
    target:z.id||null,targetRect:z.getBoundingClientRect().toJSON?z.getBoundingClientRect().toJSON():z.getBoundingClientRect(),
    oldRect:r.toJSON?r.toJSON():r});return shrink(g,r,z,opt);};
}"""
SNAP=r"""()=>({view:ansicht,scrollY,homeScroll,origin:herkunft,point:herkunftPunkt,
  transform:getComputedStyle($('ansicht')).transform,opacity:getComputedStyle($('ansicht')).opacity,
  viewAnimations:$('ansicht').getAnimations().filter(a=>a.playState==='running').length,
  temp:Array.from(document.querySelectorAll('body>.geist,.tropfen-huelle,.fl-schicht')).map(e=>({
    cls:e.className,flow:!!e._fluss,progress:e._fluss?e._fluss.p.x:null,
    animations:e.getAnimations().filter(a=>a.playState==='running').length})),
  calls:backCalls.slice(),warning:!$('hinweisBlatt').hidden})"""
rows=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for case in ['journal-swipe','settings-scrolled-swipe','appointment-swipe','appointment-arrow','appointment-save']:
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='block')
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        page.goto(base);page.evaluate(SETUP);page.wait_for_timeout(1500)
        cdp=ctx.new_cdp_session(page);opening={}
        if case.startswith(('journal','settings')):
            destination='journal' if case.startswith('journal') else 'einstellungen'
            page.tap('#menuKnopf');page.wait_for_timeout(1100)
            page.tap('[data-menue="'+destination+'"]');page.wait_for_timeout(1600)
            if case.startswith('settings'):page.evaluate('window.scrollTo(0,300)');page.wait_for_timeout(200)
        else:
            page.evaluate("document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').scrollIntoView({block:'center'})")
            page.wait_for_timeout(300)
            point=page.evaluate("()=>{const r=document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').getBoundingClientRect();return{x:r.left+r.width*.8,y:r.top+r.height*.5}}")
            opening={'point':point,'homeBefore':page.evaluate('scrollY')}
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]})
            page.wait_for_timeout(1000)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            page.wait_for_timeout(1600)
            opening['openedView']=page.evaluate('ansicht')
            if case.endswith('save'):
                page.locator('#tmSpeichern').scroll_into_view_if_needed();page.wait_for_timeout(200)
        page.evaluate('backCalls=[]');before=page.evaluate(SNAP)
        during=None
        if case.endswith('swipe'):
            start={'x':6,'y':600}
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[start]})
            for i in range(1,7):
                cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':6+30*i,'y':600}]});page.wait_for_timeout(50)
            during=page.evaluate(SNAP)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        elif case.endswith('arrow'):page.tap('#zurueckKnopf')
        else:page.tap('#tmSpeichern')
        page.wait_for_timeout(120);after=page.evaluate(SNAP)
        if case in ['journal-swipe','appointment-arrow']:
            page.screenshot(path=str(OUT/(case+'-return.png')))
        page.wait_for_timeout(2000);end=page.evaluate(SNAP)
        row={'case':case,'opening':opening,'before':before,'duringDrag':during,'afterReleaseOrClick':after,'end':end,'errors':errors}
        rows.append(row)
        print(json.dumps({'case':case,'beforeView':before['view'],'duringView':during and during['view'],
            'duringTransform':during and during['transform'],'duringCalls':during and len(during['calls']),
            'after':after,'errors':errors},ensure_ascii=False),flush=True)
        ctx.close()
    browser.close()
server.shutdown();(OUT/'return-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
