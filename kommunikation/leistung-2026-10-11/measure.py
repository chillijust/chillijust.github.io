"""Read-only audit of the unmodified main app, served over loopback HTTP.
Wall time is real; CDP CPU throttling is a comparison, not iPhone emulation.
"""
import functools, http.server, json, math, statistics, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path('/workspace/chillijust.github.io')
OUT = Path('/tmp/chilli-performance')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

SETUP = r"""({size,style,theme}) => {
  auftrittEnde(true); state=grundStand(); state.schwachHinweis=false;
  const today=heuteSchluessel(), days=size==='normal'?365:1095;
  const habits=size==='normal'?8:40, appointments=size==='normal'?8:120;
  const records=[]; for(let d=days;d>=1;d--) if(d%5!==0)records.push(tagPlus(today,-d));
  for(let i=0;i<habits;i++)state.gewohnheiten.push(gewohnheitLesen({
    id:'g'+i,name:'Gewohnheit '+i,rhythmus:{art:'taeglich'},angelegt:tagPlus(today,-days),
    erledigt:records.slice(),timer:i===1?{minuten:10,stumm:true}:null}));
  for(let i=0;i<2;i++)state.abgewoehnen.push(lasterLesen({id:'a'+i,name:'Abgewöhnen '+i,
    start:Date.now()-7*86400000,rueckfaelle:[],draenge:[]}));
  for(let i=0;i<appointments;i++)state.termine.push(terminLesen({id:'t'+i,titel:'Termin '+i,
    tag:today,von:'09:00',wiederholung:'taeglich',notiz:'Eine kurze Notiz zum Termin.'}));
  for(let i=0;i<(size==='normal'?52:156);i++)state.journal.push(reflexionLesen({
    woche:wochenAnfang(tagPlus(today,-i*7)),gut:'Das lief gut. '.repeat(20),
    stoerte:'Das möchte ich ändern. '.repeat(20),zeit:Date.now()-i*7*86400000}));
  for(let i=0;i<(size==='normal'?20:200);i++)state.tickets.push(ticketLesen({
    id:'k'+i,titel:'Ticket '+i,text:'Beschreibung '.repeat(25),erstellt:Date.now()+i,stand:APP_VERSION}));
  state.thema=theme;
  state.fluessig=style==='ios'?{ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))}:null;
  state.bewegung=style==='aus'?'aus':'auto';
  speicherSperre=null; themaAnwenden();flDauernSetzen();zeige('home');
  localStorage.setItem(SPEICHER,JSON.stringify(state));
  return {bytes:new Blob([JSON.stringify(state)]).size,habits,appointments,historyDays:days,
    nodes:document.querySelectorAll('*').length};
}"""

INSTALL = r"""() => {
  window.auditTasks=[];
  try {new PerformanceObserver(l=>l.getEntries().forEach(e=>auditTasks.push({start:e.startTime,duration:e.duration})))
    .observe({type:'longtask',buffered:true});}catch(e){}
  window.auditFrames=[];window.auditRunning=false;window.auditRaf=0;
  window.auditBegin=()=>{
    auditFrames=[];auditRunning=true;window.auditStart=performance.now();let previous=auditStart;
    function frame(t){if(!auditRunning)return;auditFrames.push(t-previous);previous=t;auditRaf=requestAnimationFrame(frame);}
    auditRaf=requestAnimationFrame(frame);
  };
  window.auditEnd=()=>{
    auditRunning=false;cancelAnimationFrame(auditRaf);
    const a=auditFrames.filter(x=>x>0).sort((a,b)=>a-b);
    const pct=p=>a.length?a[Math.min(a.length-1,Math.floor(p*(a.length-1)))]:null;
    const tasks=auditTasks.filter(x=>x.start>=auditStart);
    return {windowMs:performance.now()-auditStart,frames:a.length,frameMedianMs:pct(.5),frameP95Ms:pct(.95),
      frameMaxMs:a.length?a[a.length-1]:null,gapsOver34Ms:a.filter(x=>x>34).length,
      longTasks:tasks.length,longTaskTotalMs:tasks.reduce((s,e)=>s+e.duration,0),
      longTaskMaxMs:tasks.length?Math.max(...tasks.map(x=>x.duration)):0};
  };
  window.auditState=()=>({nodes:document.querySelectorAll('*').length,
    temporary:document.querySelectorAll('.tropfen-huelle,.fl-schicht').length,
    open:Array.from(document.querySelectorAll('[aria-modal=true]')).filter(e=>!e.hidden&&e.getClientRects().length).map(e=>e.id),
    ticketOpen:ticketBlattOffen(),ticketOpacity:$('ticketKarte').style.opacity,
    flows:Array.from(document.querySelectorAll('*')).filter(e=>e._fluss).length});
}"""

rows=[]; meta={'main':'2dcfd420cf9364ea2897cdd6788912942d75299b','version':'0.17.0T15',
  'viewport':[430,932],'deviceScaleFactor':3,'repetitionsTicket':3,'profiles':[]}

def metrics(cdp):
    return {x['name']:x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}

def measure(page,cdp,expr,name,group,duration=1400,rep=0):
    before=metrics(cdp)
    row=page.evaluate(r"""async (ms)=>{
      auditBegin();const start=performance.now();
    """+expr+r""";
      const dispatchMs=performance.now()-start;
      await new Promise(r=>setTimeout(r,ms));return {...auditEnd(),dispatchMs,state:auditState()};
    }""",duration)
    after=metrics(cdp)
    for key in ['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration']:
        row[key+'Ms']=(after.get(key,0)-before.get(key,0))*1000
    for key in ['LayoutCount','RecalcStyleCount']:
        row[key]=after.get(key,0)-before.get(key,0)
    row.update({'scenario':name,'group':group,'repeat':rep})
    rows.append(row)
    print(json.dumps({k:row[k] for k in ['group','scenario','repeat','dispatchMs','TaskDurationMs',
        'frameP95Ms','frameMaxMs','gapsOver34Ms','longTasks']},ensure_ascii=False),flush=True)
    return row

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    meta['browser']=browser.version
    try:
        info=browser.new_browser_cdp_session().send('SystemInfo.getInfo')
        meta['gpu']={'devices':info['gpu']['devices'],'auxAttributes':{
            k:v for k,v in info['gpu'].get('auxAttributes',{}).items() if k in ['glRenderer','glVendor','displayType']}}
    except Exception as e:meta['gpuError']=str(e)

    # Ticket form: both themes and styles, same stored data, three opens per group.
    for cpu in [1,4]:
        for theme in ['hell','dunkel']:
            for style in ['chilli','ios'] + (['aus'] if cpu==4 else []):
                group=f'normal-{style}-{theme}-cpu{cpu}'
                ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,
                    has_touch=True,device_scale_factor=3,service_workers='block')
                page=ctx.new_page();errors=[]
                page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
                cdp=ctx.new_cdp_session(page);cdp.send('Performance.enable');
                cdp.send('Emulation.setCPUThrottlingRate',{'rate':cpu})
                page.goto(base);page.evaluate(INSTALL)
                setup=page.evaluate(SETUP,{'size':'normal','style':style,'theme':theme})
                page.wait_for_timeout(1600)
                idle=measure(page,cdp,'','idle',group,800)
                for rep in range(3):
                    measure(page,cdp,"$('ticketKnopf').click();",'ticket-open',group,1400,rep)
                    measure(page,cdp,'ticketBlattSchliessen();','ticket-close',group,1400,rep)
                meta['profiles'].append({'group':group,'setup':setup,'errors':errors})
                ctx.close()

    # Ordinary navigation and a deliberately larger local history, all styles on iOS.
    for size,cpu in [('normal',1),('normal',4),('gross',4)]:
        group=f'{size}-ios-dunkel-cpu{cpu}-flows'
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,
            has_touch=True,device_scale_factor=3,service_workers='block')
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        cdp=ctx.new_cdp_session(page);cdp.send('Performance.enable')
        cdp.send('Emulation.setCPUThrottlingRate',{'rate':cpu})
        page.goto(base);page.evaluate(INSTALL)
        setup=page.evaluate(SETUP,{'size':size,'style':'ios','theme':'dunkel'})
        page.wait_for_timeout(1600)
        actions=[('menu-open',"$('menuKnopf').click();"),('menu-close','menueSchliessen();'),
          ('journal-open',"zeige('journal');"),('home-return',"zeige('home');"),
          ('calendar-next',"$('kalVor').click();"),('calendar-back',"$('kalZurueck').click();"),
          ('habit-check',"document.querySelector('[data-haken=\"g0\"]').click();"),
          ('habit-uncheck',"document.querySelector('[data-haken=\"g0\"]').click();"),
          ('ticket-open',"$('ticketKnopf').click();"),('ticket-close','ticketBlattSchliessen();')]
        for name,expr in actions:measure(page,cdp,expr,name,group,1400)
        # Smooth scrolling over the existing long list: browser-generated touch gesture.
        page.evaluate('auditBegin()');before=metrics(cdp)
        cdp.send('Input.synthesizeScrollGesture',{'x':200,'y':800,'yDistance':-650,'speed':550,
            'gestureSourceType':'touch','repeatCount':2,'repeatDelayMs':100})
        page.wait_for_timeout(300);row=page.evaluate('auditEnd()');after=metrics(cdp)
        row.update({'scenario':'touch-scroll','group':group,'repeat':0,'state':page.evaluate('auditState()')})
        row['TaskDurationMs']=(after['TaskDuration']-before['TaskDuration'])*1000
        rows.append(row)
        page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(200)
        # Actual repeated touches, rather than replacing an animation with its end state.
        page.evaluate('auditBegin()');before=metrics(cdp)
        for _ in range(10):
            page.tap('#ticketKnopf');page.wait_for_timeout(90)
            page.evaluate('ticketBlattSchliessen()');page.wait_for_timeout(110)
        page.wait_for_timeout(1800);row=page.evaluate('auditEnd()');after=metrics(cdp)
        row.update({'scenario':'ticket-rapid-10','group':group,'repeat':0,'state':page.evaluate('auditState()')})
        row['TaskDurationMs']=(after['TaskDuration']-before['TaskDuration'])*1000
        rows.append(row)
        meta['profiles'].append({'group':group,'setup':setup,'errors':errors})
        print(json.dumps({'group':group,'rapidEndState':row['state'],'errors':errors},ensure_ascii=False),flush=True)
        ctx.close()

    # Cold start vs installed/offline local SW: original app and original worker.
    startup=[]
    ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,
        has_touch=True,device_scale_factor=3,service_workers='allow')
    page=ctx.new_page()
    page.add_init_script("window.startTasks=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>startTasks.push({start:e.startTime,duration:e.duration}))).observe({type:'longtask',buffered:true});")
    for mode in ['network-cold','sw-online','sw-offline']:
        if mode=='sw-offline':ctx.set_offline(True)
        page.goto(base) if mode=='network-cold' else page.reload()
        page.wait_for_timeout(1000)
        nav=page.evaluate("()=>({navigation:performance.getEntriesByType('navigation')[0].toJSON(),paints:performance.getEntriesByType('paint').map(e=>e.toJSON()),tasks:startTasks,version:APP_VERSION,controller:!!navigator.serviceWorker.controller,storage:localStorage.getItem(SPEICHER)})")
        startup.append({'mode':mode,**nav})
        if mode=='network-cold':
            page.evaluate("navigator.serviceWorker.ready")
            page.wait_for_function('navigator.serviceWorker.controller!==null')
    ctx.set_offline(False);ctx.close();meta['startup']=startup
    browser.close()

server.shutdown()
(OUT/'performance-results.json').write_text(json.dumps({'metadata':meta,'measurements':rows},ensure_ascii=False,indent=2))
print('DONE',len(rows),'measurements',flush=True)
