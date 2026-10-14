"""Diagnostic trace, separate from timings to avoid profiler interference."""
import ast, functools, http.server, json, threading
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3])
parser.add_argument('--out',type=Path,default=Path('/tmp/chilli-review-rerun/new'))
args=parser.parse_args();ROOT=args.root.resolve();OUT=args.out.resolve();OUT.mkdir(parents=True,exist_ok=True)
source=ast.parse((Path(__file__).with_name('measure.py')).read_text())
constants={n.targets[0].id:ast.literal_eval(n.value) for n in source.body if isinstance(n,ast.Assign)
    and isinstance(n.targets[0],ast.Name) and n.targets[0].id in ['SETUP','INSTALL']}
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'

summary=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for style in ['chilli','ios','aus']:
        ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,
            device_scale_factor=3,service_workers='block')
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e,errors=errors:errors.append(str(e)))
        cdp=ctx.new_cdp_session(page);cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
        page.goto(base);page.evaluate(constants['INSTALL']);page.evaluate(constants['SETUP'],{'size':'normal','style':style,'theme':'dunkel'})
        page.wait_for_timeout(3500)
        # Capture only the ticket flow. Instrumentation is deliberately separate
        # from the uninstrumented benchmark, and is never put in index.html.
        page.evaluate(r"""()=>{
          window.auditCalls={};
          ['ticketBlattOeffnen','textWachsen','wahlenSetzen','geist','tropfenAuf','huelleFliesst',
            'teilSchritt','fpZeichnen','fpPunkte','fpHalsPfad','glasAmZiel'].forEach(name=>{
            const original=window[name];if(typeof original!=='function')return;
            window[name]=function(){const t=performance.now();try{return original.apply(this,arguments);}
              finally{const a=auditCalls[name]||(auditCalls[name]={count:0,totalMs:0,maxMs:0});
                const d=performance.now()-t;a.count++;a.totalMs+=d;a.maxMs=Math.max(a.maxMs,d);}}
          });
          window.auditTicketSamples=[];let start=performance.now();
          window.auditTicketSample=setInterval(()=>{
            const card=$('ticketKarte');const temp=Array.from(document.querySelectorAll('.tropfen-huelle,.fl-schicht'));
            auditTicketSamples.push({ms:performance.now()-start,opacity:getComputedStyle(card).opacity,
              waiting:card.classList.contains('glas-wartet'),cardBackdrop:getComputedStyle(card).backdropFilter,
              temp:temp.map(e=>({cls:e.className,backdrop:getComputedStyle(e).backdropFilter,
                shadow:getComputedStyle(e).boxShadow,filter:getComputedStyle(e).filter}))});
          },100);
        }""")
        events=[];finished=[]
        cdp.on('Tracing.dataCollected',lambda e,events=events:events.extend(e['value']))
        cdp.on('Tracing.tracingComplete',lambda e,finished=finished:finished.append(True))
        cdp.send('Tracing.start',{'categories':'devtools.timeline,disabled-by-default-devtools.timeline',
            'options':'record-as-much-as-possible','transferMode':'ReportEvents'})
        page.evaluate('auditBegin()');page.tap('#ticketKnopf');page.wait_for_timeout(1600)
        frames=page.evaluate('auditEnd()');page.evaluate('clearInterval(auditTicketSample)')
        cdp.send('Tracing.end')
        while not finished:page.wait_for_timeout(100)
        kinds={}
        for e in events:
            if e.get('ph')!='X' or e.get('name') not in ['Layout','UpdateLayoutTree','Paint','PrePaint','FunctionCall','RunTask']:continue
            k=kinds.setdefault(e['name'],{'count':0,'totalMs':0,'maxMs':0});d=e.get('dur',0)/1000
            k['count']+=1;k['totalMs']+=d;k['maxMs']=max(k['maxMs'],d)
        row={'style':style,'cpu':4,'frames':frames,'calls':page.evaluate('auditCalls'),
            'samples':page.evaluate('auditTicketSamples'),'traceSummary':kinds,'errors':errors,
            'endState':page.evaluate('auditState()')}
        summary.append(row)
        print(json.dumps({k:row[k] for k in ['style','calls','traceSummary','endState']},ensure_ascii=False),flush=True)
        ctx.close()
    # An attempted touch during launch includes Playwright actionability waiting
    # because the intro disables pointer events. Keep it separate and do not use
    # its duration as a ticket response measurement.
    ctx=browser.new_context(viewport={'width':430,'height':932},is_mobile=True,has_touch=True,
        device_scale_factor=3,service_workers='block')
    page=ctx.new_page();cdp=ctx.new_cdp_session(page)
    cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    page.goto(base);page.evaluate(constants['INSTALL']);page.evaluate(constants['SETUP'],{'size':'normal','style':'ios','theme':'dunkel'})
    page.reload();page.evaluate(constants['INSTALL']);page.wait_for_timeout(100)
    page.evaluate('auditBegin()');before=page.evaluate('auftrittLaeuft')
    page.tap('#ticketKnopf');page.wait_for_timeout(2200)
    summary.append({'style':'ios-first-touch-attempt','cpu':4,'launchWasRunning':before,
        'includesPlaywrightActionabilityWait':True,'usableAsTicketBenchmark':False,
        'frames':page.evaluate('auditEnd()'),'endState':page.evaluate('auditState()')})
    ctx.close();browser.close()
server.shutdown();(OUT/'ticket-trace-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
