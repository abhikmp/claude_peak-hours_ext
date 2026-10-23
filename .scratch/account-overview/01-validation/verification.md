# Ticket 01 verification — 2026-10-23

Baseline: `19220b6cd4a744feaae3233eaf092583cb518d1b`, branch `feature-usagebar`.
Scope: [ticket 01](../issues/01-retain-accounts-and-show-observed-usage.md) only.

## Result

Accounts are no longer pruned by the worker alarm or popup startup. The pruning API and 48-hour cutoff are removed. Stored identities, labels, percentages, reset timestamps and reading order keep their existing schema. Expired display Accounts return `percent: null` and retain `lastObservedPercent`; they cease to be Full without changing Active. Existing green/orange/red toolbar thresholds, including green after expiry, remain intact.

Both production detail renderers show a neutral unknown value, Window ended, reading age, and `Last observed: N%. Send a message from this Account for a new reading.` after expiry. The current-usage bar is hidden. Fresh readings show percentages/countdowns normally and clear the expired explanation. Age is shown on all detail views, matching the approved prototype. Reset-to-default still clears Accounts and restores timezone, watched products and theme.

## Red → green evidence

- The actual worker-alarm test first failed because a year-old Account was deleted, then passed after removal of worker pruning.
- The Account display-contract test first failed on `0 !== null`, then passed with unknown current usage and the preserved observation. Existing expiry ordering and icon boundary assertions pass.
- Chrome's production-popup fixture first failed `popup startup retains a year-old Account`. It passed after popup-open pruning was removed.
- The next browser run failed `reading age is shown` on the single-Account detail. The prior expired renderer was also visibly captured as `0%` / Full quota available in [before-expired.png](before-expired.png). Both renderers now pass the complete lifecycle run.

## Automated and browser checks

- `node --test`: **43 tests passed**, zero failures, including completion/RPC capture regressions. No capture-source changes were needed.
- `node --check` passes for the shared Account module, worker, both popup scripts and all three content scripts.
- `git diff --check`: passed. There is no separate typechecking/build configuration.
- [Chrome lifecycle output](browser-results.txt): **45 assertions passed**. The harness loads actual production popup HTML/scripts/styles, substituting only Chrome storage/runtime APIs and the clock. It checks retention after a year and a further 48 hours, read-only popup startup, saved label preservation, reopening, single/paged ordinary and expired details in dark/light themes, exact-boundary expiry through the actual refresh callback, unchanged stored readings/Active while browsing, bar hiding, new-reading recovery, expired Active detail, complete reset and persistence of the reset after reopening.
- Console warnings/errors on screenshot verification: none.
- Source taste lint reports two existing violet accents in untouched timezone controls and existing status-color warnings; those are outside this ticket. The dash in unknown usage is intentional missing-data notation from the approved design. No new palette or layout direction was introduced. Visual checks use connected Chrome through the approved browser tooling; the standalone inspector was not used.

## Browser geometry and screenshots

All checked views remain **260px wide**, with no horizontal overflow. The current popup's content height varies, as before; enforcing 340px and aligning the controls across states belongs to ticket 02.

| Detail renderer | State | Content height, both themes | Dark | Light |
| --- | --- | --- | --- | --- |
| Single | Ordinary | 286.78px | [Screenshot](single-ordinary-dark.png) | [Screenshot](single-ordinary-light.png) |
| Single | Expired | 307.56px | [Screenshot](single-expired-dark.png) | [Screenshot](single-expired-light.png) |
| Paged, other Account | Ordinary | 319.78px | [Screenshot](paged-ordinary-dark.png) | [Screenshot](paged-ordinary-light.png) |
| Paged, other Account | Expired | 339.56px | [Screenshot](paged-expired-dark.png) | [Screenshot](paged-expired-light.png) |

Screenshots use sample Studio / Research workspace identities and fixed October 23, 2026 timestamps, not personal readings. Crops include the 260px popup and some space below it. Visual inspection confirms unknown is neutral, last observation is legible, normal readings retain their status coloring, and lower controls are unobscured.

## Replay

From the repository root:

```text
node --test tests/accounts.test.js tests/account-maintenance.test.js
python .scratch/account-overview/01-validation/serve-popup.py
```

Open `http://127.0.0.1:8765/.scratch/account-overview/01-validation/checks.html` in Chrome and click **Run lifecycle checks**. The server listens only on loopback. Fixture storage lives in that localhost origin's localStorage and does not access extension storage. Stop the server after verification. The server injects the adapter into responses only; production popup HTML contains no fixture script. A sandbox that blocks local sockets may require approval to run the test server outside it.

## Standards

Independent Standards subagent: no actionable findings against repository conventions and the code-review smell baseline.

## Spec

Independent Spec subagent: no findings against ticket 01. Tickets 02–05 remain outside this implementation. Domain/release documentation reconciliation remains part of ticket 05.

Review summary: Standards **0** findings; Spec **0** findings.

## Limits

These browser checks use real popup sources with synthetic adapters, not an installed extension or new real Claude reply. They make no claim about repairing capture. The separate bug #08 already has its own live verification. No live stored readings were changed, no extension reload or package rebuild was performed, and no publication occurred. The ready-for-human status is a completed implementation handoff, consistent with earlier tickets in this repository.
