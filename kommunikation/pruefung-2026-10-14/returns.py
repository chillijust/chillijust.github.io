"""Read-only real-touch replay for ADR 0060; no changes to the app."""
import ast, functools, http.server, json, threading
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun/returns'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve()
OUT.mkdir(parents=True, exist_ok=True)
old = ast.parse((Path(__file__).resolve().parents[1]/'rueckwege-2026-10-11/check_returns.py').read_text())
SETUP = next(ast.literal_eval(n.value) for n in old.body if isinstance(n, ast.Assign)
             and isinstance(n.targets[0], ast.Name) and n.targets[0].id == 'SETUP')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1',0), functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'
SNAP = r"""()=>{
 const app=$('app'), a=document.querySelector('body>.abbild'), ids={};
 document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
 return {view:ansicht,scrollY,homeScroll,origin:herkunft,point:herkunftPunkt,
   appTransform:getComputedStyle(app).transform,appInlineTransform:app.style.transform,
   clip:app.style.clipPath,appClass:app.className,appRect:app.getBoundingClientRect().toJSON(),
   viewTransform:getComputedStyle($('ansicht')).transform,
   preview:a?{inert:a.inert,aria:a.getAttribute('aria-hidden'),pointer:getComputedStyle(a).pointerEvents,
     shadow:!!a.shadowRoot,home:!!a.shadowRoot.querySelector('.held'),
     scroll:a.shadowRoot.querySelector('#app').style.transform}:null,
   drag:rueckZug?{dx:rueckZug.dx,v:rueckZug.v,spring:!!rueckZug.federt}:null,
   temp:Array.from(document.querySelectorAll('body>.geist,body>.abbild,body>.zug-schatten,.tropfen-huelle,.fl-schicht')).map(e=>e.className),
   duplicates:Object.keys(ids).filter(id=>ids[id]>1),
   highlighted:Array.from(document.querySelectorAll('.leuchtet')).map(e=>e.getAttribute('data-termin')),
   calls:backCalls.slice(),warning:!$('hinweisBlatt').hidden,
   title:$('tmTitel')?$('tmTitel').value:null};
}"""

def touch(cdp,kind,points):
    cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':points})

def gesture(page,cdp,kind='commit',screenshot=None):
    start={'x':6,'y':600}; touch(cdp,'touchStart',[start]); page.wait_for_timeout(70)
    if kind=='two-before':
        during=page.evaluate(SNAP)
        touch(cdp,'touchStart',[{'x':6,'y':600,'id':0},{'x':240,'y':610,'id':1}])
        touch(cdp,'touchEnd',[])
        return during
    points=[]
    if kind=='vertical':
        points=[{'x':6,'y':600-30*i} for i in range(1,7)]
    elif kind=='short':
        points=[{'x':6+8*i,'y':600} for i in range(1,7)]
    elif kind=='full-width':
        points=[{'x':6+70*i,'y':600} for i in range(1,7)]
    else:
        points=[{'x':6+30*i,'y':600} for i in range(1,7)]
    for point in points:
        touch(cdp,'touchMove',[point]); page.wait_for_timeout(100 if kind=='short' else 50)
    if kind=='short':page.wait_for_timeout(250)
    during=page.evaluate(SNAP)
    if screenshot:page.screenshot(path=str(OUT/screenshot))
    if kind=='cancel':touch(cdp,'touchCancel',[])
    elif kind=='two-fingers':
        touch(cdp,'touchStart',[{**points[-1],'id':0},{'x':240,'y':610,'id':1}])
        touch(cdp,'touchMove',[{**points[-1],'id':0},{'x':250,'y':610,'id':1}])
        touch(cdp,'touchEnd',[])
    elif kind=='rotate':
        page.set_viewport_size({'width':932,'height':430}); page.wait_for_timeout(100)
        touch(cdp,'touchEnd',[])
    elif kind=='sheet':
        page.evaluate("menueOeffnen()"); page.wait_for_timeout(100)
        touch(cdp,'touchMove',[points[-1]]);touch(cdp,'touchEnd',[])
    else:touch(cdp,'touchEnd',[])
    return during

rows=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,
                             args=['--no-sandbox','--disable-dev-shm-usage'])
    cases=[('journal-swipe','ios'),('settings-scrolled-swipe','ios'),('appointment-swipe','ios'),
      ('appointment-arrow','ios'),('appointment-save','ios'),('appointment-title','ios'),
      ('journal-short','ios'),('appointment-short','ios'),('settings-vertical','ios'),
      ('journal-cancel','ios'),('journal-two-fingers','ios'),('journal-rotate','ios'),
      ('journal-sheet','ios'),('journal-full-width','ios'),('journal-swipe','chilli'),
      ('journal-two-before','ios'),
      ('journal-swipe','aus'),('appointment-arrow','chilli'),('appointment-save','chilli'),
      ('journal-repeat','ios')]
    for case,style in cases:
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,
                               device_scale_factor=3,service_workers='block')
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        page.goto(BASE);page.evaluate(SETUP)
        if style!='ios':page.evaluate("(s)=>{if(s==='chilli')state.fluessig={ios:{}};if(s==='aus')state.bewegung='aus';themaAnwenden();flDauernSetzen();}",style)
        page.wait_for_timeout(1500);cdp=ctx.new_cdp_session(page)
        opening={}
        if case.startswith('appointment'):
            page.evaluate("document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').scrollIntoView({block:'center'})")
            page.wait_for_timeout(250)
            point=page.evaluate("()=>{const r=document.querySelector('#ansicht>.abschnitt [data-termin=\"t3\"]').getBoundingClientRect();return{x:r.left+r.width*.8,y:r.top+r.height*.5}}")
            opening={'point':point,'homeBefore':page.evaluate('scrollY')}
            touch(cdp,'touchStart',[point]);page.wait_for_timeout(1000);touch(cdp,'touchEnd',[])
            page.wait_for_timeout(1500);opening['openedView']=page.evaluate('ansicht')
            if case.endswith('short'):
                page.locator('#tmTitel').fill('Unfertiger synthetischer Entwurf')
                page.locator('#tmTitel').blur();page.wait_for_timeout(150)
            if case.endswith('save'):
                page.locator('#tmSpeichern').scroll_into_view_if_needed();page.wait_for_timeout(150)
        else:
            dest='einstellungen' if case.startswith('settings') else 'journal'
            page.tap('#menuKnopf');page.wait_for_timeout(1000)
            page.tap('[data-menue="'+dest+'"]');page.wait_for_timeout(1500)
            if case.startswith('settings'):
                page.evaluate('window.scrollTo(0,300)');page.wait_for_timeout(200)
        page.evaluate(r"""()=>{
          backCalls=[];window.highlightEvents=[];
          new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='attributes' && m.target.matches('.tm-zeile.leuchtet'))
            highlightEvents.push({time:performance.now(),id:m.target.getAttribute('data-termin'),temp:document.querySelectorAll('.tropfen-huelle').length});}))
          .observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
        }""")
        before=page.evaluate(SNAP);during=None;iterations=[]
        if case.endswith('arrow'):page.tap('#zurueckKnopf')
        elif case.endswith('title'):page.tap('#titelHeim')
        elif case.endswith('save'):page.tap('#tmSpeichern')
        elif case.endswith('repeat'):
            for i in range(5):
                iterations.append({'during':gesture(page,cdp),'end':None})
                page.wait_for_timeout(1500);iterations[-1]['end']=page.evaluate(SNAP)
                if i<4:
                    page.tap('#menuKnopf');page.wait_for_timeout(700)
                    page.tap('[data-menue="journal"]');page.wait_for_timeout(850)
                    gesture(page,cdp,'short');page.wait_for_timeout(120)
        else:
            kind=case.split('-')[-1]
            kind={'swipe':'commit','width':'full-width'}.get(kind,kind)
            if case.endswith('two-fingers'):kind='two-fingers'
            if case.endswith('two-before'):kind='two-before'
            during=gesture(page,cdp,kind,
              case+'-drag.png' if style=='ios' and case in ['journal-swipe','appointment-swipe','journal-full-width'] else None)
        page.wait_for_timeout(120);after=page.evaluate(SNAP)
        if case.endswith('save'):
            page.wait_for_timeout(1200)
            if page.evaluate("!$('hinweisBlatt').hidden"):page.evaluate('hinweisSchliessen()')
        page.wait_for_timeout(1800);end=page.evaluate(SNAP)
        if case.endswith('sheet'):
            page.evaluate('menueSchliessen()');page.wait_for_timeout(1800);end=page.evaluate(SNAP)
        if case.endswith(('short','cancel','rotate','sheet','fingers','vertical','two-before')):
            expected=before['view']
        else:expected='home'
        checks={'expectedView':end['view']==expected,'noRest':not end['temp'] and not end['drag'] and not end['appInlineTransform'],
                'uniqueIDs':not end['duplicates'],'noErrors':not errors}
        if during:
            follows=style=='ios' and not case.endswith(('vertical','two-before'))
            checks['fingerFollowing']=bool(during['drag'])==follows
            checks['uniqueIDsDuring']=not during['duplicates']
            if follows:checks['inertPreview']=bool(during['preview'] and during['preview']['inert'] and during['preview']['pointer']=='none')
        if case.startswith('appointment') and expected=='home' and not case.endswith('save'):
            checks['homeScroll']=end['scrollY']==opening['homeBefore']
        if case.startswith('appointment') and expected=='home' and style!='aus':
            checks['rowHighlighted']=any(e['id']=='t3' for e in page.evaluate('highlightEvents'))
        if case.endswith('short') and case.startswith('appointment'):checks['draftKept']=end['title']==before['title']
        if case.endswith('vertical'):checks['nativeScroll']=end['scrollY']>before['scrollY']
        if iterations:checks['repeatsClean']=all(i['end']['view']=='home' and not i['end']['temp'] and not i['end']['duplicates'] for i in iterations)
        row={'case':case,'style':style,'opening':opening,'before':before,'during':during,'after':after,'end':end,
             'highlights':page.evaluate('highlightEvents'),'iterations':iterations,'checks':checks,'errors':errors}
        rows.append(row);(OUT/'return-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
        print(json.dumps({'case':case,'style':style,'checks':checks,'errors':errors},ensure_ascii=False),flush=True)
        ctx.close()
    browser.close()
server.shutdown()
