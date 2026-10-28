"""Build and verify the explicit ClaudeBuddy runtime allowlist (Python stdlib)."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
FILES = '''manifest.json
background/service-worker.js
content/connect-usage.js
content/content-script-main.js
content/content-script-bridge.js
popup/popup.html
popup/popup.css
popup/popup.js
popup/account-pages.css
popup/account-pages.js
popup/account-actions.js
shared/accounts.js
shared/account-store.js
shared/account-storage.js
data/timezones.json
icons/logo_16.png
icons/logo_48.png
icons/logo_128.png'''.splitlines()
FILES += [f'icons/usage-{color}-{size}.png'
          for color in ['green', 'orange', 'red'] for size in [16, 32, 48, 128]]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    assert manifest['manifest_version'] == 3
    assert manifest['name'] == 'ClaudeBuddy \u2013 Usage & Peak Hours Tracker'
    assert len(manifest['name']) <= 75 and len(manifest['description']) <= 132
    assert re.fullmatch(r'\d+\.\d+\.\d+(?:\.\d+)?', manifest['version'])
    assert all(0 <= int(number) <= 65535 for number in manifest['version'].split('.'))
    assert manifest['permissions'] == ['alarms', 'storage', 'scripting']
    references = [manifest['background']['service_worker'], manifest['action']['default_popup']]
    references += list(manifest['icons'].values()) + list(manifest['action']['default_icon'].values())
    references += [file for group in manifest['content_scripts'] for file in group['js']]
    html = (ROOT / manifest['action']['default_popup']).read_text(encoding='utf-8')
    references += [(Path('popup') / file).as_posix() for file in re.findall(r'(?:src|href)="([^"]+\.(?:js|css))"', html)]
    references = [str(Path(file)).replace('\\', '/') for file in references]
    for file in references:
        assert (ROOT / file).resolve().is_relative_to(ROOT)
        assert (ROOT / file).resolve().relative_to(ROOT).as_posix() in FILES, file
    content = {file: (ROOT / file).read_bytes() for file in FILES}
    for size in [16, 48, 128]:
        data = content[f'icons/logo_{size}.png']
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        assert int.from_bytes(data[16:20], 'big') == int.from_bytes(data[20:24], 'big') == size
    for color in ['green', 'orange', 'red']:
        for size in [16, 32, 48, 128]:
            data = content[f'icons/usage-{color}-{size}.png']
            assert data[:8] == b'\x89PNG\r\n\x1a\n'
            assert int.from_bytes(data[16:20], 'big') == int.from_bytes(data[20:24], 'big') == size
    archive = OUT / f'claudebuddy-{manifest["version"]}-rc.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as package:
        for file, data in sorted(content.items()):
            info = zipfile.ZipInfo(file, (2026, 10, 24, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            package.writestr(info, data)
    extracted = OUT / 'extracted'
    with zipfile.ZipFile(archive) as package:
        assert package.testzip() is None
        assert set(package.namelist()) == set(FILES)
        assert len(package.namelist()) == len(FILES)
        for file in FILES:
            assert package.read(file) == content[file], file
        package.extractall(extracted)
    # Exercise the exact extracted executable files, not only the working sources.
    for file in FILES:
        assert (extracted / file).read_bytes() == content[file]
        if file.endswith('.js'):
            subprocess.run(['node', '--check', str(extracted / file)], check=True, capture_output=True)
    hashes = {file: sha(data) for file, data in sorted(content.items())}
    # HEAD is a base revision when packaging reviewed, uncommitted repairs.
    # Record that distinction explicitly; per-file hashes identify exact bytes.
    changes = subprocess.check_output(['git', 'status', '--porcelain', '--', *FILES], cwd=ROOT, text=True).splitlines()
    record = {
        'package': archive.name, 'version': manifest['version'], 'sha256': sha(archive.read_bytes()),
        'sourceRevision': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'sourceState': 'working-tree' if changes else 'commit',
        'runtimeChanges': changes,
        'runtimeSha256': sha(json.dumps(hashes, sort_keys=True).encode()), 'files': hashes,
        'checks': f'{len(FILES)} allowlisted files; source/ZIP/extraction equality; manifest paths/metadata; PNG dimensions; extracted JS syntax'
    }
    (OUT / 'package.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    (OUT / 'SHA256SUMS').write_text(f'{record["sha256"]}  {archive.name}\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in record.items() if key != 'files'}, indent=2))

if __name__ == '__main__':
    main()
