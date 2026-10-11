import http.server,threading,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/chillijust.github.io');OUT=Path('/tmp/chilli-audit')
old='0.17.0T9';new='0.17.0T10-audit';deployed=False
class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        source='sw.js' if self.path.split('?')[0]=='/sw.js' else 'index.html'
        text=(ROOT/source).read_text()
        if deployed:text=text.replace(old,new)
        self.send_response(200);self.send_header('Content-Type','text/javascript' if source=='sw.js' else 'text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(text.encode())
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port)
VERSION="""() => new Promise(resolve => {var c=navigator.serviceWorker.controller;if(!c){resolve(null);return;}var m=new MessageChannel();m.port1.onmessage=e=>resolve(e.data.version);c.postMessage({art:'version'},[m.port2]);setTimeout(()=>resolve('timeout'),1000);})"""
rows=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True);page=ctx.new_page();page.goto(base);page.wait_for_timeout(2000)
    def row(step):
        data={'step':step,'app':page.evaluate('() => APP_VERSION'),'controller':page.evaluate(VERSION),'registration':page.evaluate('() => navigator.serviceWorker.getRegistration().then(r=>({waiting:!!r.waiting,active:!!r.active,installing:!!r.installing}))'),'caches':page.evaluate('() => caches.keys()')};rows.append(data);print(json.dumps(data),flush=True)
    row('initial')
    deployed=True
    page.reload();page.wait_for_timeout(2000);row('reload-1-ohne-uebernehmen')
    page.reload();page.wait_for_timeout(2000);row('reload-2-ohne-uebernehmen')
    page.screenshot(path=str(OUT/'bilder'/'risiko-sw-ohne-uebernehmen.png'))
    b.close()
server.shutdown();(OUT/'sw-results.json').write_text(json.dumps(rows,indent=2))
