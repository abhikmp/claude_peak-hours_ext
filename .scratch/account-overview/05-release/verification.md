# Ticket 05 release-candidate verification — 2026-10-24

Starting revision: fa3236f44f98fdeb7c44b54d76c5503fde373f8a, branch feature-usagebar. Scope: [ticket 05](../issues/05-verify-and-package-account-overview.md). Candidate only; no signed-in session, extension installation, policy hosting, GitHub migration or Store action was performed.

## Feature evidence

Reuse current [01 retention/detail](../01-validation/verification.md), [02 navigation](../02-validation/verification.md), [03 comparison](../03-validation/verification.md), [03a thresholds/estimates/ordering](../03a-validation/verification.md), [04 persisted actions](../04-validation/verification.md), [queue/button refinements](../04-validation/refinements-verification.md) and [complete footer replacement](../04-validation/footer-replacement.md). Later 04 refinements supersede the original prototype's 30px bottom inset and styling/removal navigation. Current slot is 16px from bottom. No design exploration was reopened.

[#08](../../multi-account-usage/issues/08-third-account-not-captured.md) records the original third-Account failure, gzip RPC cause, regression failing before fix, both transport coverage and reporter verification on 2026-10-23. The reporter confirmed the third Account Active and all three visible. Synthetic replays below are not new live evidence.

## Extracted artifact browser checks

The release server serves runtime files from extracted/, not the working source tree. Only Chrome APIs/storage/time/network are disposable. The injected worker is wrapped in a function to isolate its global scope from the popup, matching its separate production context. No extension storage, actual Claude Account or conversation was accessed.

| Suite | Result | Scope |
| --- | --- | --- |
| [Production matrix](evidence/matrix-results.txt) | 262 passed | 0/1/2/3/4/64 Accounts, both themes, exact 260 × 340, ordinary controls alignment, internal scrolling, menus/dialog, Cancel/Forget/Undo/count transitions, footer replacement and toolbar invariance |
| [Lifecycle](evidence/advanced-results.txt) | 36 passed | Frozen rows/search/scroll, inspection/Back, readings, original Undo deadline/reopening, rediscovery races, replacement/dismiss/reset and table restoration |
| [Accessibility](evidence/extra-results.txt) | 31 passed | Long international labels, dormant details, focus trapping/restoration, complete footer restoration, linear countdown and emulated reduced-motion numeric fallback |
| [Approved refinements](evidence/refinements-results.txt) | 42 passed | Queue successor/end fallback, table→slides successor, five→four table retention, softened red/white buttons and bounds in both themes |
| [Encrypted integration](evidence/secure-results.txt) | 26 passed | Actual extracted AccountStorage/worker/popup, real browser Web Crypto + IndexedDB, plaintext migration, ciphertext physical storage, trusted-context API calls, encrypted Forget, popup recreation/key reuse, exact Undo, incoming Active/icon updates, actual Reset after ciphertext corruption and subsequent capture |

Total: **397 browser assertions, zero failures**. [Measured bounds](evidence/matrix-measurements.json). Older synchronous visual harnesses use a plaintext storage-API adapter because they inspect fixture state directly; the dedicated encrypted suite uses the real production adapter. This distinction is intentional and does not claim real Chrome permission enforcement was exercised by a shim. That enforcement and signed-in package operation remain 06.

## Node/runtime validation

[Full suite](evidence/node-results.txt): **64 tests passed, zero failures**, including Account rules, comparison/reset boundaries, queue/concurrency/Undo, both capture transports/three Accounts, message authorization, encryption migration/reopen/tamper handling and status-worker regressions.

New storage tests were first run against the missing adapter and failed, then passed with AES-GCM persistence. Tests use existing AccountStore/storage/capture and worker-message/alarm seams. Capture replays keep the established synthetic storage boundary; encryption is independently tested at the adapter/queue boundary and with actual browser persistence above.

Status regressions simulate watched outage over peak (DOWN/title/color), exact weekday 05:00/11:00 Pacific boundaries, weekend/off-peak, unwatched incident and failed request. They preserve the red usage icon independently of status. No live outage/peak evidence is inferred. Earlier comparison/navigation tests cover all popup status presentations, preference persistence, reset and exact 15-minute/three-hour estimate boundaries.

All runtime/test JavaScript passes node --check; no separate typechecking configuration/build exists. Git whitespace checks pass after normalizing authored docs. tools/build-release.py validates manifest/version/45-character description, 30-file allowlist, every declared/HTML runtime path, 16/48/128 PNG sizes, ZIP integrity/root, byte equality with source and extraction, and extracted JavaScript syntax. [Package identity/file hashes](package.json), [SHA256SUMS](SHA256SUMS). Source revision is the committed runtime revision; later evidence-only commits need not alter package bytes.

## Visual and policy review

Production screenshots: [usage](assets/01-usage.png), [comparison](assets/02-compare.png), [Forget/Undo](assets/03-forget.png). All are 1280 × 800 RGB PNGs, actual extracted production popup rendered at 260 × 340 in both themes, with safe sample identities. The 128px RGBA icon is the warm coral ClaudeBuddy crab; packaged green/orange/red variants preserve the toolbar quota thresholds. Browser viewport was temporarily set to the required asset size then restored.

Visual inspection confirms the selected Compact table typography/relative resets/estimated and unknown values, fixed bounds, softened destructive controls and fixed Undo slot against current production references. Undo's visual countdown is paused at a representative point for its listing screenshot; its actual deadline remains unchanged in runtime. No labs/pickers, real emails/IDs, or user conversations appear.

[Policy audit](../../../docs/release/policy-audit.md) and [privacy policy](../../../docs/release/privacy-policy.md) describe resolved encryption/storage-access findings and remaining protection limits. Owner/legal/contact/hosting choices belong to 06. Code review is recorded in [review.md](review.md).

## Reproduce

Run python tools/build-release.py, then python .scratch/account-overview/05-release/serve.py. Open the secure checks at http://127.0.0.1:8768/.scratch/account-overview/05-release/checks.html and press Run. On the same server, run 04-validation/checks.html?matrix=1, ?advanced=1, extra.html and refinements.html; results save into this release's evidence directory. Assets are reproduced through assets.html?mode=usage, compare or forget. The server may require authorized loopback access in the Windows sandbox.

Run node --test tests/*.test.js and runtime syntax checks from the repo root. Do not install QA pages or include them in the ZIP.

Review follow-up: both axes identified explicit Reset failing on unreadable encrypted data. Regression failed before the 8d34de1 fix and passed afterward; the final 26-check secure browser run corrupts physical ciphertext, uses the actual Reset button and captures again. Ordinary failed reads/mutations still preserve data. All suites above were rerun against the rebuilt artifact; source revision/checksum updated.

## ClaudeBuddy branding follow-up — 2026-10-24

The user subsequently approved the ClaudeBuddy name and refined the crab toward warmth, crispness and cute eyes. Current metadata/package, product/privacy/Store copy, icons and screenshots now use ClaudeBuddy. See [branding brief and proof](../../claudebuddy-branding/brief.md). All 64 Node tests and 26 encrypted-popup assertions were rerun against this rebrand; the other 371 unchanged layout/lifecycle assertions above are reused evidence from ticket 05, not a newly claimed run. The package contains 30 runtime files, with a 45-character manifest description and 12 packaged green/orange/red icon variants. The initial toolbar crab was subsequently replaced with the original circles at the user's request; see the correction below. Quota thresholds and all Account/UI behavior stay intact. Encryption/key/bridge namespaces remain compatible. Current file hashes and source revision in package.json supersede the earlier package identity. The prior review.md is historical; branding review is recorded alongside the branding brief.

## Circular toolbar correction — 2026-10-24

Per the user's clarification, the crab logo is limited to extension management and Store branding. The toolbar uses antialiased circles with the original 8% inset and green/orange/red palette, including its manifest default. All 64 Node tests pass. All 12 PNGs were checked for dimensions, palette, transparent corners and horizontal/vertical symmetry; manifest branding/default separation and a native-size light/dark proof were checked. The release builder verified the 30-file allowlist, extracted syntax, source/ZIP/extraction equality and updated hashes. No service-worker logic changed. Prior browser evidence is reused, not rerun. See [correction and proof](../../claudebuddy-branding/toolbar-correction.md).

## User-selected logo and promo refresh — 2026-10-26

The exact attached paper-cut crab source now supplies the extension/Store logo. Verified source/master equality, 16/48/128px icon exports and unchanged toolbar PNGs/defaults. Four reference-based imagegen promos were inspected after export at 1400 × 560, 440 × 280, 820 × 300 and 440 × 254. Three 1280 × 800 RGB listing screenshots were recaptured with CUA from the extracted-production sample fixture; logo headers, comparison and Forget/Undo states were inspected. All 64 Node tests pass. The builder verified the 30-file allowlist, extracted syntax and source/ZIP/extraction equality. Current source revision and hashes are in package.json. Earlier browser assertion suites are reused evidence, not newly rerun or real signed-in verification. See [scope, prompts and review](../../claudebuddy-branding/selected-logo.md).
