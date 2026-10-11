import http.server,threading,functools,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/chillijust.github.io');OUT=Path('/tmp/chilli-audit')
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port)
SETUP="""() => {auftrittEnde(true);jetzt=()=>new Date('2026-10-11T12:00:00');state=grundStand();state.gewohnheiten=[gewohnheitLesen({id:'g1',name:'Lesen',rhythmus:{art:'taeglich'},angelegt:'2026-10-01',timer:{minuten:10,stumm:true}})];zeige('home');speichern();}"""
rows=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    def fresh():
        ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,service_workers='block');page=ctx.new_page();page.goto(base);page.evaluate(SETUP);page.wait_for_timeout(500);return ctx,page
    def record(name,page,value):
        rows.append({'test':name,'result':value});print(json.dumps(rows[-1],ensure_ascii=False),flush=True);page.screenshot(path=str(OUT/'bilder'/('risiko-'+name+'.png')))
    ctx,page=fresh()
    page.evaluate("() => {state.timer={id:'g1',tag:heuteSchluessel(),start:zeitJetzt(),ms:600000,stumm:true,pausiert:null};timerOeffnen('g1');}")
    page.wait_for_timeout(1000)
    cd=ctx.new_cdp_session(page)
    cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':424,'y':700}]})
    for x in [400,375,350,320]:
        cd.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':700}]});time.sleep(.03)
    cd.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(1000)
    record('timer-menue-geste',page,page.evaluate("() => ({timer:timerOffen(),menu:!$('menue').hidden,blockiert:blattOffen(),dialogs:Array.from(document.querySelectorAll('[aria-modal=true]')).filter(e=>e.getClientRects().length).map(e=>e.id||e.className)})"));ctx.close()
    ctx,page=fresh();page.evaluate("() => {hinweisZeigen('Eine Frage','Bitte antworte zuerst.',null,null,{frage:{ja:'Ja',beiJa:()=>{}}});}")
    focus=[]
    for i in range(5):
        page.keyboard.press('Tab');focus.append(page.evaluate('() => document.activeElement.id'))
    record('dialog-fokus',page,{'tabfolge':focus});ctx.close()
    for ios in [False,True]:
        ctx,page=fresh()
        if ios:page.evaluate("() => {state.fluessig={ios:{hinweis:true,menue:true,ansichten:true}};flDauernSetzen();}")
        page.evaluate("() => hinweisZeigen('Erster Hinweis','Erster Text',flaeche($('menuKnopf')))")
        page.wait_for_timeout(1000);page.evaluate('() => hinweisSchliessen()');page.wait_for_timeout(50)
        page.evaluate("() => hinweisZeigen('Zweiter Hinweis','Dieser muss sofort sichtbar sein.',flaeche($('menuKnopf')))")
        page.wait_for_timeout(100)
        record('hinweis-schnell-'+str(ios),page,page.evaluate("() => ({offen:$('hinweisBlatt').classList.contains('offen'),hidden:$('hinweisBlatt').hidden,opacity:getComputedStyle($('hinweisKarte')).opacity,titel:$('hinweisTitel').textContent,huellen:document.querySelectorAll('body>.tropfen-huelle').length})"));ctx.close()
    ctx,page=fresh();page.evaluate("() => {zeige('neu');$('gwName').value='Neue Gewohnheit';entwurf.name='Neue Gewohnheit';Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')};entwurfSpeichern();}");page.wait_for_timeout(1000)
    record('speichern-fehlschlag',page,page.evaluate("() => ({ansicht,entwurf:entwurf,angezeigt:state.gewohnheiten.map(g=>g.name),gespeichert:JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten.map(g=>g.name),meldung:$('meldung').textContent})"));ctx.close()
    ctx,page=fresh();page.evaluate("() => {state.timer={id:'g1',tag:heuteSchluessel(),start:zeitJetzt(),ms:600000,stumm:true,pausiert:null};timerOeffnen('g1');}");page.wait_for_timeout(1000)
    page.set_viewport_size({'width':430,'height':430});page.wait_for_timeout(300)
    record('timer-kurze-hoehe',page,page.evaluate("() => {var r=$('timerKarte').getBoundingClientRect();return {height:innerHeight,top:r.top,bottom:r.bottom,scroll:document.documentElement.scrollHeight,karteScroll:$('timerKarte').scrollHeight,karteClient:$('timerKarte').clientHeight};}"));ctx.close()
    ctx,page=fresh();page.evaluate("() => {state.fluessig={ios:{perle:true,menue:true}};flDauernSetzen();dashboardAuftropfen();}");page.wait_for_timeout(150)
    page.emulate_media(reduced_motion='reduce')
    before=page.evaluate("() => ({bewegungAus:bewegungAus(),fluss:!!document.querySelector('.held')._fluss,p:document.querySelector('.held')._fluss?.p.x})")
    page.wait_for_timeout(200)
    after=page.evaluate("() => ({bewegungAus:bewegungAus(),fluss:!!document.querySelector('.held')._fluss,p:document.querySelector('.held')._fluss?.p.x})")
    record('bewegung-waehrenddessen-aus',page,{'vorher':before,'nachher':after});ctx.close()
    ctx,page=fresh();page.evaluate("() => {state.fluessig={ios:{menue:true}};flDauernSetzen();menueOeffnen();}");page.wait_for_timeout(100)
    page.evaluate('() => menueSchliessen()');page.wait_for_timeout(100);page.evaluate('() => menueOeffnen()');page.wait_for_timeout(2000)
    record('menue-richtungswechsel',page,page.evaluate("() => ({offen:$('menue').classList.contains('offen'),hidden:$('menue').hidden,opacity:getComputedStyle($('menueListe')).opacity,fluss:!!document.querySelector('#menue .blatt')._fluss,schichten:document.querySelectorAll('.fl-schicht').length})"));ctx.close()
    b.close()
server.shutdown();(OUT/'risk-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
