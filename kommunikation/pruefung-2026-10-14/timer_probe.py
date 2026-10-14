"""Uninstrumented timer replay in alternating old/new order."""
import ast,functools,http.server,json,threading
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
parser.add_argument('--old-root',type=Path,default=Path('/tmp/chilli-review-rerun/old-main'))
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun'))
args=parser.parse_args();ROOT=args.root.resolve();BASE=args.out.resolve();BASE.mkdir(parents=True,exist_ok=True)
src=ast.parse((Path(__file__).with_name('new')/'measure.py').read_text())
C={n.targets[0].id:ast.literal_eval(n.value) for n in src.body if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id in ['SETUP','INSTALL']}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
servers={}
for label,root in [('old',args.old_root.resolve()),('new',ROOT)]:
 s=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
 threading.Thread(target=s.serve_forever,daemon=True).start();servers[label]=s
rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for cpu,reps in [(1,3),(4,1)]:
  for rep in range(reps):
   for label in (['old','new'] if rep%2==0 else ['new','old']):
    ctx=b.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='block')
    page=ctx.new_page();cdp=ctx.new_cdp_session(page);cdp.send('Emulation.setCPUThrottlingRate',{'rate':cpu})
    page.goto(f'http://127.0.0.1:{servers[label].server_port}');page.evaluate(C['INSTALL'])
    page.evaluate(C['SETUP'],{'size':'normal','style':'ios','theme':'dunkel'});page.wait_for_timeout(2000)
    page.evaluate("document.querySelector('[data-haken=\"g1\"]').scrollIntoView({block:'center'})");page.wait_for_timeout(300)
    page.evaluate('auditBegin()');page.tap('[data-haken="g1"]');page.wait_for_timeout(1600)
    opening=page.evaluate('auditEnd()')
    page.evaluate('auditBegin()');page.wait_for_timeout(2000);running=page.evaluate('auditEnd()')
    row={'label':label,'cpu':cpu,'repeat':rep,'opening':opening,'running':running};rows.append(row)
    print(json.dumps(row),flush=True);ctx.close()
 b.close()
for s in servers.values():s.shutdown()
(BASE/'timer-probe-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
