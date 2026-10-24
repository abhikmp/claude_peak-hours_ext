# Ticket 04 production verification — 2026-10-24

Baseline: `670e8f7` on `feature-usagebar`. Scope: [Forget Accounts, Undo, and rediscover later readings](../issues/04-forget-undo-and-account-rediscovery.md). Implements the selected Dialog prototype and all finalized production requirements together.

## Result

Non-Active Accounts have vertical menus, with table actions after Reset. The centered modal names the Account, explains rediscovery, starts on Cancel, traps focus, supports Escape/backdrop dismissal, and closes safely if the target becomes Active. Internal table scrolling remains available with no visible scrollbar or reserved gutter.

Forget persists removal and offers Undo for exactly 2,500ms, starting when the successful removal can first be displayed. The 228 × 32px notification stays 16px from either side and 30px from the bottom on Active, table, inspection and slides. Its 2px line shrinks linearly with transform animation; reduced motion uses numeric time left. Navigation/theme/renders/reopening preserve the original deadline. Expiry/dismiss disposes recovery, late Undo is rejected, reset clears recovery, and replacements have independent deadlines. Covered preference controls are inert.

Undo restores the exact original observation into the latest map, preserving reading age/tie information and unrelated updates; a rediscovered reading wins and is announced. Four→three becomes slides, three→two stays slides, and two→one removes navigation. Undo restores membership/search/scroll where applicable, including into a table opened after popup reopening. Open-table unrelated rows retain identity and order. All retained-reading, Compact/reset-estimate and preference behavior remains covered by regressions.

## Mutation boundary

`shared/account-store.js` is instantiated once in the service worker. Reading, label, Forget, offer activation, Undo, dismiss, recovery expiry and clear commands all serialize their read/modify/write through that instance. The bridge sends validated captured readings through runtime messaging; runtime messaging wakes the worker and keeps its asynchronous response channel open. Label lookup remains independent, same-origin and local; a late name cannot recreate an absent Account or overwrite another tab's resolved label. Popup actions never perform competing whole-map writes.

Recovery is local only. First display activates its token with the display timestamp; repeated activation cannot extend it. An abandoned removal that never produced a visible offer has a bounded 30-second preparation lifetime, so it cannot leave indefinite raw recovery behind. Normal expiry checks dispose it on the worker timer or next persisted operation/reopening. No timer slider, settings control, blocklist, external service or build system ships.

## Checks

- [242 production matrix checks](matrix-results.txt): both themes, 0/1/2/3/4/64 Accounts, exact popup bounds, hidden-bar internal scrolling, right-side menus, modal focus, Cancel, persisted Forget/Undo, raw observation equality, Active/toolbar invariance, count transitions, fixed feedback bounds, covered controls and theme/deadline continuity. Forget/Undo do not misannounce maintained observations as new readings. [Measurements](matrix-measurements.json).
- [36 lifecycle/race checks](advanced-results.txt): frozen row identity, original query/order/scroll, inspected removal, equal notification bounds across pages, reopening/progress, automatic expiry, newer rediscovery, Active guards, independent replacements, dismiss/reset, reopened-table Undo three-second delayed persistence, and delayed non-Active capture with a truthful reopening notice.
- [27 accessibility/long-name checks](extra-results.txt): both themes, international long names, dormant detail fit and Last recorded usage, modal background focus blocking, cancellation, trigger focus, truncation/title, unchanged linear animation across navigation/theme, late Undo and expiry focus. Reduced-motion preference is emulated at the media-query boundary using the production fallback rules; it is not a changed OS preference.
- Existing production regressions: [105 lifecycle checks](ticket01-results.txt), [94 navigation/preferences checks](ticket02-results.txt), [239 comparison/03a checks](ticket03-results.txt). All pass. The lifecycle assertion now observes the real worker's icon instead of requiring the old notification name; comparison expects the added accessible Actions header and waits for initial render completion.
- Full `node --test`: [57 passing, zero failures](node-results.txt), including shared Account rules, persisted queue concurrency, delayed labels, Active races, exact restore, newer readings, clear/dismiss, replacement/stale tokens, slow persistence, abandoned preparation and failed-write recovery. Manifest-declared SSE/RPC capture scripts replay through the real bridge and worker listener, including rediscovery before Undo.
- `node --check` passes for all 14 production/test JavaScript files. No separate typechecking/build configuration exists. Git diff whitespace checks pass. [Independent Standards/Spec review](review.md): zero remaining findings after both repairs and re-review.

These are synthetic production-source replays using disposable Chrome storage/runtime boundaries and controlled time. No installed extension storage, real Account readings or Claude conversation was modified. They do not claim a new live capture verification; ticket 05 owns final integrated release checks. The earlier live capture evidence for #08 remains separate.

## Visual evidence and reproduction

[Production screenshot](production-preview.jpg) shows both themed Dialogs plus table/Active Undo in identical lower slots. [Preview](preview.html) uses the real popup/worker/shared scripts; only the browser boundaries and sample clock are disposable. Countdown motion is paused at a sample fraction in this screenshot fixture.

Run `python .scratch/account-overview/04-validation/serve.py`, then open `http://127.0.0.1:8767/.scratch/account-overview/04-validation/preview.html`. Run `checks.html?matrix=1`, `checks.html?advanced=1` and `extra.html` for the new flows. The same server supports the existing 01/02/03 check pages and their Save regression evidence buttons. It cache-busts production assets to avoid stale browser scripts. Use foreground or in-app tabs so background timer throttling does not stall the harness.

Reload the unpacked extension for normal production review. Ticket 04 does not package or publish a release; ticket 05 remains next. Unrelated pre-existing untracked files are excluded from this implementation commit.
