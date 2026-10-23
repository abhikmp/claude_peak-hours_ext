"""Serve production popup sources with disposable browser adapters for ticket 01 QA."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import re
import time

ROOT = Path(__file__).resolve().parents[3]
QA = '/.scratch/account-overview/01-validation/'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if urlsplit(self.path).path == '/popup/popup.html':
            html = (ROOT / 'popup/popup.html').read_text(encoding='utf-8')
            html = html.replace('<script src="../shared/accounts.js">',
                                f'<script src="{QA}fixture.js"></script>\n  <script src="../shared/accounts.js">')
            html = re.sub(r'((?:src|href)="[^"]+\.(?:js|css))"',
                          lambda match: match[1] + '?qa=' + str(time.time_ns()) + '"', html)
            body = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif urlsplit(self.path).path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
        else:
            super().do_GET()


if __name__ == '__main__':
    print('Ticket 01 QA: http://127.0.0.1:8765' + QA + 'checks.html', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
