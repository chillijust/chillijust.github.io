import http.server, threading, functools, json, re, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path('/workspace/chillijust.github.io')
OUT=Path('/tmp/chilli-audit')
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for file in sorted((ROOT/'tools/pruefstand/bau').glob('t-*.html')):
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,service_workers='block')
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        try:
            page.goto(base+'/tools/pruefstand/bau/'+file.name)
            deadline=time.monotonic()+25
            while time.monotonic()<deadline:
                if page.title().startswith(('ALLE ','FEHLGESCHLAGEN','SEITENFEHLER')): break
                time.sleep(.1)
        except Exception as e: errors.append(str(e).split('\n')[0])
        title=page.title()
        log=page.locator('#testlog').inner_text() if page.locator('#testlog').count() else ''
        bad=[line for line in log.splitlines() if line.startswith(('FAIL','AUSNAHME'))]
        row={'suite':file.stem[2:],'title':title,'errors':errors,'failures':bad,'checks':len(log.splitlines())}
        results.append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True)
        ctx.close()
    browser.close()
server.shutdown()
(OUT/'suite-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('SUMMARY',len(results),'Suiten,',sum(r['checks'] for r in results),'Prüfungen,',sum(not r['title'].startswith('ALLE ') for r in results),'rot',flush=True)
