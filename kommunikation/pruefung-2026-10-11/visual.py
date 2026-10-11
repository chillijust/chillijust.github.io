import http.server, threading, functools, json, time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/chillijust.github.io');OUT=Path('/tmp/chilli-audit');(OUT/'bilder').mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port)
SETUP="""() => {
  auftrittEnde(true); jetzt=()=>new Date('2026-10-11T12:00:00');
  state=grundStand(); state.schwachHinweis=false;
  for(var i=0;i<8;i++) state.gewohnheiten.push({id:'g'+i,name:i===0?'W'.repeat(40):['Lesen','Meditation','Wasser trinken','Spazierengehen'][i%4],rhythmus:{art:'taeglich'},angelegt:'2026-07-01',erledigt:[],archiviert:null,erinnerung:'08:00',timer:i===1?{minuten:10,stumm:true}:null,zaehler:i===2?{schritt:.3,einheit:'Liter'}:null,zaehlung:{}});
  for(var i=0;i<2;i++) state.abgewoehnen.push({id:'a'+i,name:i?'Am Abend keine Süßigkeiten':'Z'.repeat(40),start:jetzt().getTime()-5*86400000,rueckfaelle:[],draenge:[],archiviert:null});
  for(var i=0;i<8;i++) state.termine.push({id:'t'+i,titel:i?'Termin '+i:'W'.repeat(60),tag:heuteSchluessel(),ganztags:false,von:'1'+i+':00',bis:null,wiederholung:'taeglich',wiederholungBis:null,vorlauf:15,ort:'Musterstraße 123, Raum 456',notiz:'Lange Notiz '.repeat(10),erledigt:[]});
  state.journal=[{woche:'2026-10-05',gut:'Das lief gut. '.repeat(12),stoerte:'Das hat gestört. '.repeat(12),zeit:jetzt().getTime()}];
  for(var i=0;i<20;i++)state.tickets.push({id:'k'+i,art:'fehler',titel:'Langer Tickettitel mit Umbruch '+i,text:'Beschreibung '.repeat(25),ort:'dashboard',grund:'',erstellt:jetzt().getTime()+i,stand:APP_VERSION,abgegeben:null});
  speicherSperre=null; zeige('home');
}"""
SCENES={
 'home':"zeige('home');",
 'monat':"state.kalender='monat';kalTag=heuteSchluessel();zeige('home');",
 'neu':"zeige('neu');entwurf.weise='timer';entwurf.art='wochentage';entwurf.erinnern=true;render();",
 'ab-neu':"zeige('neu',{richtung:'ab'});",
 'gewohnheit':"zeige('bearbeiten','g0');",
 'abgewoehnen':"zeige('abgewoehnen','a0');",
 'rueckfall':"zeige('rueckfall','a0');",
 'welle':"state.welle={id:'a0',start:zeitJetzt()};zeige('welle');",
 'termin':"zeige('termin','t0');",
 'termin-neu':"zeige('terminNeu');",
 'journal':"zeige('journal');",
 'lesen':"zeige('lesen','2026-10-05');",
 'reflexion':"zeige('reflexion','2026-10-05');",
 'export':"zeige('export');",
 'sicherung':"zeige('sicherung');",
 'tickets':"zeige('tickets');",
 'einstellungen':"zeige('einstellungen');",
 'fluessig':"esReiter='fluessig';zeige('einstellungen');",
 'ticket-blatt':"ticketBlattOeffnen($('ticketKnopf'));",
 'ticket-liste':"ticketBlattOeffnen($('ticketKnopf'));ticketBlattWechseln(true,$('tkAlle'));",
 'timer':"state.timer={id:'g1',tag:heuteSchluessel(),start:zeitJetzt(),ms:600000,stumm:true,pausiert:null};timerOeffnen('g1');",
 'menue':"menueOeffnen();",
 'hinweis':"hinweisZeigen('Langer Titel zur Prüfung','Ein Hinweis mit mehreren Sätzen. '.repeat(8),flaeche($('menuKnopf')),null,{frage:{ja:'Löschen',beiJa:()=>{}}});",
}
METRICS="""() => {
  function rect(el){var r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right};}
  var wide=[],small=[],ids={};
  document.querySelectorAll('[id]').forEach(el=>ids[el.id]=(ids[el.id]||0)+1);
  document.querySelectorAll('#app button,#app input,#app select,#app textarea,.hinweis-karte,.ticket-karte,#menue .blatt').forEach(el=>{
    if(!el.getClientRects().length)return;var r=el.getBoundingClientRect();
    if(r.left<-.5||r.right>innerWidth+.5)wide.push({id:el.id,cls:el.className,text:el.textContent.slice(0,50),rect:rect(el)});
    if(el.tagName==='BUTTON'&&(r.width<43.5||r.height<43.5))small.push({id:el.id,text:el.textContent.slice(0,50),rect:rect(el)});
  });
  return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,wide,small,duplicateIds:Object.keys(ids).filter(k=>ids[k]>1),dialogs:Array.from(document.querySelectorAll('[aria-modal=true]')).filter(el=>el.getClientRects().length).map(el=>({id:el.id,rect:rect(el)})),chili:document.querySelectorAll('#chiliFigur').length};
}"""
ios='--ios' in sys.argv
if ios: SCENES={k:v for k,v in SCENES.items() if k in ['home','monat','neu','gewohnheit','export','fluessig','ticket-blatt','timer','menue']}
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for theme in ['hell','dunkel']:
        for name,code in SCENES.items():
            ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=1,service_workers='block')
            page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(base);page.evaluate(SETUP)
            if ios: page.evaluate("() => {state.fluessig={ios:Object.fromEntries(FP_STELLEN.map(s=>[s[0],true]))};flDauernSetzen();}")
            page.evaluate("() => {state.thema='"+theme+"';themaAnwenden();"+code+"}")
            page.wait_for_timeout(1500)
            row={'scene':name,'theme':theme,'errors':errors,'metrics':page.evaluate(METRICS)}
            prefix='ios-' if ios else ''
            page.screenshot(path=str(OUT/'bilder'/f'{prefix}{theme}-{name}.png'))
            if name in ['neu','gewohnheit','termin','export','tickets','einstellungen','fluessig']:
                page.evaluate('() => window.scrollTo(0,document.documentElement.scrollHeight)');page.wait_for_timeout(100)
                page.screenshot(path=str(OUT/'bilder'/f'{prefix}{theme}-{name}-unten.png'))
            results.append(row)
            print(json.dumps(row,ensure_ascii=False),flush=True)
            ctx.close()
    browser.close()
server.shutdown();(OUT/('visual-ios-results.json' if ios else 'visual-results.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2))
