"""Reuse the production-popup adapter on a separate, quiet loopback server."""
from http.server import ThreadingHTTPServer
from pathlib import Path
import runpy

adapter = runpy.run_path(str(Path(__file__).resolve().parents[1] / '01-validation/serve-popup.py'))


class Handler(adapter['Handler']):
    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    print('Ticket 03 QA: http://127.0.0.1:8766/.scratch/account-overview/03-validation/checks.html', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8766), Handler).serve_forever()
