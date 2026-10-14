import ast, functools, http.server, json, threading, time
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3])
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun/new'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
constants={n.targets[0].id:ast.literal_eval(n.value) for n in ast.parse((Path(__file__).with_name('measure.py')).read_text()).body
    if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id in ['SETUP','INSTALL']}
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
rows=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for cpu in [1,4]:
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,
            device_scale_factor=3,service_workers='block')
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        cdp=ctx.new_cdp_session(page);cdp.send('Emulation.setCPUThrottlingRate',{'rate':cpu})
        page.goto(base);page.evaluate(constants['INSTALL']);page.evaluate(constants['SETUP'],{'size':'normal','style':'ios','theme':'dunkel'})
        page.wait_for_timeout(3000)
        page.evaluate("document.querySelector('[data-haken=\"g1\"]').scrollIntoView({block:'center'})")
        page.wait_for_timeout(300);page.evaluate('auditBegin()');page.tap('[data-haken="g1"]');page.wait_for_timeout(1600)
        rows.append({'scenario':'timer-open','cpu':cpu,'frames':page.evaluate('auditEnd()'),'errors':errors.copy()})
        page.evaluate('auditBegin()');page.wait_for_timeout(2000)
        rows.append({'scenario':'timer-running','cpu':cpu,'frames':page.evaluate('auditEnd()'),'errors':errors.copy()})
        page.evaluate("timerPause();timerSchliessen();state.timer=null");page.wait_for_timeout(1800)
        page.evaluate("window.scrollTo(0,0);esReiter='fluessig';auditBegin();zeige('einstellungen')")
        page.wait_for_timeout(1800)
        rows.append({'scenario':'settings-fluid-open','cpu':cpu,'frames':page.evaluate('auditEnd()'),'errors':errors.copy()})
        ctx.close()
    # Same write-failure case through each of the two copy paths. Clipboard is
    # a local stub; it never accesses the user's clipboard or real app data.
    for path in ['ticket-sheet','ticket-page']:
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,service_workers='block')
        page=ctx.new_page();page.goto(base)
        row=page.evaluate(r"""(path)=>{
          auftrittEnde(true);state=grundStand();state.bewegung='aus';
          state.tickets=[ticketLesen({id:'test',titel:'Synthetisches Ticket',erstellt:1,stand:APP_VERSION})];
          speichern();zeige('home');
          if(path==='ticket-sheet'){ticketBlattOeffnen($('ticketKnopf'));$('tkAlle').click();}
          else zeige('tickets');
          const before=JSON.parse(localStorage.getItem(SPEICHER)).tickets[0].abgegeben;
          kopieren=function(text,done){done(true);};
          const original=Storage.prototype.setItem;
          Storage.prototype.setItem=function(key,value){if(key===SPEICHER)throw new DOMException('Test','QuotaExceededError');return original.call(this,key,value);};
          if(path==='ticket-sheet')$('tkListeKopieren').click();else ticketsKopieren();
          const result={scenario:'ticket-copy-write-failure',path,before,memory:state.tickets[0].abgegeben,
            stored:JSON.parse(localStorage.getItem(SPEICHER)).tickets[0].abgegeben,
            openTickets:offeneTickets().length,visibleList:$(path==='ticket-sheet'?'ticketKarte':'ansicht').innerText,
            warning:$('hinweisKarte').innerText};
          Storage.prototype.setItem=original;return result;
        }""",path)
        rows.append(row);ctx.close()
    # Current main, real touch events; coordinates remain anchored to touchStart.
    ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,service_workers='block')
    page=ctx.new_page();page.goto(base)
    page.evaluate("()=>{auftrittEnde(true);state=grundStand();state.fluessig={ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))};flDauernSetzen();state.gewohnheiten=[gewohnheitLesen({id:'g',name:'Lesen',rhythmus:{art:'taeglich'},angelegt:heuteSchluessel()})];zeige('home');}")
    page.wait_for_timeout(2000);cdp=ctx.new_cdp_session(page)
    for dx,dy,n,interval,expected in [(-100,0,10,.06,0),(-160,0,10,.06,1),(40,0,2,.02,-1),(0,90,5,.04,0)]:
        before=page.evaluate('kalVersatz');a=page.evaluate("()=>{const r=$('kalRaster').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}")
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[a]})
        for i in range(1,n+1):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a['x']+dx*i/n,'y':a['y']+dy*i/n}]});page.wait_for_timeout(interval*1000)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(700)
        after=page.evaluate('kalVersatz')
        rows.append({'scenario':'calendar-real-touch','dx':dx,'dy':dy,'before':before,'after':after,
            'expectedDelta':expected,'pass':after-before==expected})
    ctx.close();browser.close()
server.shutdown();(OUT/'additional-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
for row in rows:print(json.dumps(row,ensure_ascii=False),flush=True)
