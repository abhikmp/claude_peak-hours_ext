# Final signed-in package checklist

Owned by [ticket 06](../../.scratch/account-overview/issues/06-manual-repository-migration-and-store-launch.md), after [05 handoff](../../.scratch/account-overview/05-release/HANDOFF.md). These checks are **pending**. Agent fixtures are recorded separately in [verification](../../.scratch/account-overview/05-release/verification.md).

Use only the exact ZIP/checksum in [package.json](../../.scratch/account-overview/05-release/package.json). Extract it into a clean folder and load that folder in Chrome 120+. Use disposable test Accounts/readings for Forget/reset. Never copy real labels, IDs, cookies or chat text into evidence.

| Done | Check |
| --- | --- |
| [ ] | Verify ZIP SHA-256, manifest at root, QuotaBeacon 1.0.0, clean install, opening popup and no extension errors. Confirm this is a new Store item/ID, not the old Peak Hours item. |
| [ ] | Fresh install: no reading, green circle, public status/default Claude AI selection, dark/system timezone. Send a message to capture the first numeric five-hour event. |
| [ ] | Send messages from three distinct real Accounts in one Chrome profile. All appear; latest becomes Active. Browsing/login alone does not switch it. Use SSE and binary RPC where available; record unavailable transports honestly. |
| [ ] | Reload/update with Claude already open, send another message and verify capture/name resolution without losing prior readings. Existing local records migrate; DevTools sees ciphertext, not labels. |
| [ ] | Four-plus Accounts: searchable table, actual ages, Compact relative reset values, inspection/Back, stable rows during incoming readings; reopen refreshes membership/order. Two/three use slides; one has no navigation. |
| [ ] | Forget/Cancel, confirm/queue continuation, Undo within 2.5s, popup reopening with same deadline, expiry and rediscovery through a new message. Four→three→two→one and restoration behave correctly. Active has no Forget. |
| [ ] | Both themes, long labels, keyboard/focus, internal table scroll and 260 × 340 bounds. Undo replaces full timezone/reset footer with 16px bottom inset and restores it without movement. |
| [ ] | With disposable observations only, inspect reset boundaries: table estimate under 15m, unknown at 15m; detail estimate under 3h, unknown at 3h. Actual Updated/raw observations stay unchanged. No 48h deletion. |
| [ ] | Usage circle thresholds, expired/missing neutral green; badge/tooltip reflect status independently. Real watched outage if available; otherwise leave as simulated. DOWN precedes PEAK; unwatched incident does not trigger DOWN. |
| [ ] | Peak window weekday 5–11 AM Pacific, off-peak/weekend, unknown-status Retry, timezone/products/theme persistence, last selected product protection. Mark unavailable time/network conditions simulated. |
| [ ] | Disposable reset clears Accounts/recovery and restores system timezone, Claude AI and dark; expired Undo cannot recover. No extension errors afterward. |

## Existing live evidence — do not repeat the bug investigation

- 2026-10-22: reporter verified signed-in organization endpoint HTTP 200 and usable name, and capture in an already-open Claude document. [Label ticket](../../.scratch/multi-account-usage/issues/03-account-label-capture.md).
- Two real Accounts and age display were reporter-confirmed in [earlier verification](../../.scratch/multi-account-usage/05-validation/qa.md).
- 2026-10-23: after the binary-RPC fix, the reporter reloaded/refresh/sent a reply and confirmed Third Account Active and all three present. [#08 final reproduction, fix, regression and reporter result](../../.scratch/multi-account-usage/issues/08-third-account-not-captured.md). This predates the final encrypted release package.

Store/publisher/hosting/repository/migration actions are listed only in ticket 06. A defect or runtime-affecting owner decision returns to 05 for source fix, rebuild, checksum and validation. Never hand-edit a ZIP or reuse an earlier checksum. Unavailable live incidents/transport/plan cases remain pending or simulated, never inferred passed.
