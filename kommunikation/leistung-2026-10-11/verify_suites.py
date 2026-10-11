import functools, http.server, json, re, sys, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path('/workspace/chillijust.github.io')
OUT = Path('/tmp/chilli-performance')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/lib/chromium/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    for file in sorted((ROOT / 'tools/pruefstand/bau').glob('t-*.html')):
        if len(sys.argv)>1 and file.stem[2:] not in sys.argv[1:]: continue
        dimensions = re.search(r'pruefstand-fenster:(\d+),(\d+)', file.read_text())
        width, height = map(int, dimensions.groups()) if dimensions else (430, 932)
        # Explicit metadata describes the native Chrome outer window. That
        # suite compensates for its 87 px chrome; Playwright sets the viewport.
        if dimensions: height-=87
        ctx = browser.new_context(viewport={'width': width, 'height': height},
            is_mobile=True, has_touch=True, service_workers='block')
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e, errors=errors: errors.append(str(e)))
        page.goto(base + '/tools/pruefstand/bau/' + file.name)
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if page.title().startswith(('ALLE ', 'FEHLGESCHLAGEN', 'SEITENFEHLER')): break
            page.wait_for_timeout(100)
        title = page.title()
        log = page.locator('#testlog').inner_text() if page.locator('#testlog').count() else ''
        row = {'suite': file.stem[2:], 'title': title, 'viewport': [width, height], 'errors': errors,
            'checks': len(log.splitlines()), 'failures': [s for s in log.splitlines() if s.startswith(('FAIL', 'AUSNAHME'))]}
        results.append(row)
        if not title.startswith('ALLE ') or errors:
            print(json.dumps(row, ensure_ascii=False), flush=True)
        else:
            print(f'{row["suite"]}: {row["checks"]} bestanden', flush=True)
        ctx.close()
    browser.close()
server.shutdown()
(OUT / ('suite-results.json' if len(sys.argv)==1 else 'suite-selected.json')).write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps({'suites': len(results), 'checks': sum(r['checks'] for r in results),
    'failed': [r['suite'] for r in results if not r['title'].startswith('ALLE ') or r['errors']]}, ensure_ascii=False), flush=True)
