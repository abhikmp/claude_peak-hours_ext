# Contributing to ClaudeBuddy

Use Chrome 120+, Node.js with the built-in test runner, and Python 3.9+ for release packaging. The extension uses bundled JavaScript with no dependency installation or compilation step. Icon regeneration additionally requires Pillow.

## Repository layout

- `manifest.json`, `background/`, `content/`, `popup/`, `shared/`, `data/`, `icons/`: packaged extension.
- `tests/`: capture, Account, encryption, recovery and availability regressions with disposable fixtures.
- `tools/`: release builder and icon exporter.
- `images/`: README screenshots and final Store assets.
- `assets/branding/`: editable mascot source and provenance.
- `CONTEXT.md`, `design.md`, `docs/adr/`: domain vocabulary, behavior and decisions.
- `docs/release/`: privacy, Store copy, verification and launch state.

Generated ZIPs, extracted builds, local experiments and AI working notes stay in ignored `dist/`, `output/` and `.scratch/`. Downloadable release ZIPs and checksums belong in GitHub Releases. Promotional videos are excluded.

## Develop and verify

Before committing, follow the repository-local identity and author/committer verification rule in [AGENTS.md](AGENTS.md#commit-identity) to keep personal email out of new commits.

1. Load this repository as an unpacked extension at `chrome://extensions`.
2. Run the affected test file while changing behavior, for example `node --test tests/status.test.js`.
3. Run `node --test tests/*.test.js` before submitting a PR.
4. Run `python tools/build-release.py`. The builder verifies all 30 allowlisted entries, manifest references, icon sizes, archive/source/extraction equality and extracted JavaScript syntax. It writes `dist/claudebuddy-<manifest-version>-rc.zip`, `dist/package.json` and `dist/SHA256SUMS` using the version in `manifest.json`.

There is no TypeScript/typechecking configuration. Runtime paths preserve their byte representation in Git so a checkout can reproduce the publisher-tested ZIP. Keep the runtime allowlist in the builder current when adding packaged files.

For popup layout changes, also run `node tests/popup-layout.browser.cjs` with `playwright-core` available on Node's module search path and Microsoft Edge installed. Set `POPUP_BROWSER_CHANNEL=chrome` to use Chrome instead. This renders the real popup at 260 × 340px with disposable extension API fixtures and checks outage length, reading states, themes, modal behavior, and stable product-hint spacing. It runs separately from the dependency-free Node suite.

After editing `docs/release/privacy-policy.md`, run `python tools/render-privacy-policy.py` to update the public HTML. Run `python tools/render-privacy-policy.py --check` before submitting policy changes; the Markdown is the source of truth for both formats.

Use disposable identities/readings in tests and screenshots. Report public bugs through [GitHub Issues](https://github.com/abhikmp/claudebuddy-chrome-ext/issues). Include reproduction steps, expected/actual behavior, Chrome version and extension version; omit credentials, Account IDs and conversation content. See the [release checklist](docs/release/launch-checklist.md) for publication work and the [deferred timezone report](docs/issues/timezone-offset.md) before duplicating that issue.
