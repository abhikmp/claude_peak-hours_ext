"""Serve real production scripts against disposable storage, including the worker."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import time

ROOT = Path(__file__).resolve().parents[3]
QA = '/.scratch/account-overview/04-validation/'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        pathname = urlsplit(self.path).path
        regression = pathname in [f'/.scratch/account-overview/0{number}-validation/checks.html' for number in [1,2,3]]
        if pathname == '/popup/popup.html' or regression:
            if regression:
                html = (ROOT / pathname.lstrip('/')).read_text(encoding='utf-8')
                html += f'<script src="{QA}regression-save.js"></script>'
            else:
                html = self.popup_html()
            body = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def popup_html(self):
            html = (ROOT / 'popup/popup.html').read_text(encoding='utf-8')
            html = html.replace('<script src="../shared/accounts.js"></script>',
                '<script src="../shared/accounts.js"></script>'
                '<script src="../shared/account-store.js"></script>'
                '<script src="/.scratch/account-overview/01-validation/fixture.js"></script>'
                f'<script src="{QA}fixture.js"></script>'
                '<script src="../background/service-worker.js"></script>')
            return re.sub(r'((?:src|href)="[^"]+\.(?:js|css))"',
                          lambda match: match[1] + '?qa=' + str(time.time_ns()) + '"', html)

    def do_POST(self):
        name = urlsplit(self.path).path.removeprefix('/qa-save/')
        if name not in ['matrix', 'advanced', 'extra', 'ticket01', 'ticket02', 'ticket03']:
            self.send_error(404)
            return
        value = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        (ROOT / '.scratch/account-overview/04-validation' / (name + '-results.txt')).write_text(value['text'], encoding='utf-8')
        if value.get('measurements'):
            (ROOT / '.scratch/account-overview/04-validation' / (name + '-measurements.json')).write_text(json.dumps(value['measurements'], indent=2), encoding='utf-8')
        self.send_response(204)
        self.end_headers()

if __name__ == '__main__':
    print('Ticket 04: http://127.0.0.1:8767/.scratch/account-overview/04-validation/checks.html', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8767), Handler).serve_forever()
