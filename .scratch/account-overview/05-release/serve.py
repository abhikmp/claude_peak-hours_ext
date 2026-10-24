"""Serve extracted production files with disposable browser API fixtures only."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[3]
RELEASE = Path(__file__).resolve().parent
ARTIFACT = RELEASE / 'extracted'
QA = '/.scratch/account-overview/'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def translate_path(self, path):
        name = urlsplit(path).path.lstrip('/').replace('secure-popup/', 'popup/', 1)
        if name.split('/')[0] in ['popup', 'shared', 'background', 'content', 'data', 'icons']:
            resolved = (ARTIFACT / name).resolve()
            if resolved.is_relative_to(ARTIFACT):
                return str(resolved)
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/background/service-worker.js':
            body = ('(() => {\n' + (ARTIFACT / 'background/service-worker.js').read_text(encoding='utf-8') + '\n})();').encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif path in ['/popup/popup.html', '/secure-popup/popup.html']:
            html = (ARTIFACT / 'popup/popup.html').read_text(encoding='utf-8')
            html = html.replace('<script src="../shared/account-storage.js"></script>', '')
            html = html.replace('<script src="../shared/accounts.js"></script>',
                '<script src="../shared/accounts.js"></script>'
                '<script src="../shared/account-storage.js"></script>'
                '<script src="../shared/account-store.js"></script>'
                f'<script src="{QA}01-validation/fixture.js"></script>'
                f'<script src="{QA}04-validation/fixture.js"></script>'
                f'<script src="{QA}05-release/boundary.js"></script>'
                '<script src="../background/service-worker.js"></script>')
            body = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def do_POST(self):
        name = urlsplit(self.path).path.removeprefix('/qa-save/')
        if name not in ['matrix', 'advanced', 'extra', 'refinements', 'secure']:
            self.send_error(404)
            return
        value = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        (RELEASE / 'evidence' / (name + '-results.txt')).write_text(value['text'], encoding='utf-8')
        if value.get('measurements'):
            (RELEASE / 'evidence' / (name + '-measurements.json')).write_text(json.dumps(value['measurements'], indent=2), encoding='utf-8')
        self.send_response(204)
        self.end_headers()

if __name__ == '__main__':
    print('Extracted release QA: http://127.0.0.1:8768/.scratch/account-overview/05-release/checks.html', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8768), Handler).serve_forever()
