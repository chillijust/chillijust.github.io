import http.server,threading,functools,time,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/chillijust.github.io');OUT=Path('/tmp/chilli-audit')
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
rows=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,service_workers='block');page=ctx.new_page();page.goto('http://127.0.0.1:'+str(server.server_port));page.evaluate("() => {auftrittEnde(true);state=grundStand();state.gewohnheiten=[gewohnheitLesen({id:'g',name:'Lesen',rhythmus:{art:'taeglich'},angelegt:heuteSchluessel()})];zeige('home');}");page.wait_for_timeout(700)
    cd=ctx.new_cdp_session(page)
    for dx,dy,n,interval in [(-100,0,10,.06),(-160,0,10,.06),(40,0,2,.02),(0,90,5,.04)]:
        before=page.evaluate('() => kalVersatz');a=page.evaluate("() => {var r=$('kalRaster').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}")
        cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[a]})
        for i in range(1,n+1):
            cd.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a['x']+dx*i/n,'y':a['y']+dy*i/n}]});time.sleep(interval)
        cd.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(700)
        row={'dx':dx,'dy':dy,'before':before,'after':page.evaluate('() => kalVersatz'),'pageScroll':page.evaluate('() => scrollY')};rows.append(row);print(json.dumps(row),flush=True)
    page.screenshot(path=str(OUT/'bilder'/'kalender-nach-echten-gesten.png'));b.close()
server.shutdown();(OUT/'calendar-touch-results.json').write_text(json.dumps(rows,indent=2))
