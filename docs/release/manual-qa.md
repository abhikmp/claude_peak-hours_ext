# Final signed-in package checklist

Publisher-reported **passed on 28 October 2026** for the latest ZIP, SHA-256 `b1b0f701be863b1da5dd95941d8c8a718495a85a14b2461a4e43a3ac81627cef`: real capture, Account switching and toolbar checks after the security and popup fixes. See [verification](verification.md) for the report scope and [launch checklist](launch-checklist.md) for Store status.

The broader rows below preserve the publisher's 27 October report for the earlier candidate (`098c1cea5006f33f694de23420772bb4add17bc24395f2882a1ed430785c8a72`). The later report is scoped to capture, Account switching and toolbar; no additional per-transport, timed-incident or lifecycle result is inferred.

Use the exact ZIP/checksum from the current GitHub Release or a verified `dist/` build. Extract into a clean folder and load it in Chrome 120+. Use disposable test Accounts for destructive checks; keep real labels, identifiers, credentials and chats out of evidence.

| Done | Check |
| --- | --- |
| [x] | Verify ZIP SHA-256, manifest at root, ClaudeBuddy 1.0.0, clean install, opening popup and no extension errors. Confirm this is a new Store item/ID, not the old Peak Hours item. |
| [x] | Fresh install: no reading, green circle, public status/default Claude AI selection, dark/system timezone. Send a message to capture the first numeric five-hour event. |
| [x] | Send messages from three distinct real Accounts in one Chrome profile. All appear; latest becomes Active. Browsing/login alone does not switch it. Use SSE and binary RPC where available; record unavailable transports honestly. |
| [x] | Reload/update with Claude already open, send another message and verify capture/name resolution without losing prior readings. Existing local records migrate; DevTools sees ciphertext, not labels. |
| [x] | Four-plus Accounts: searchable table, actual ages, Compact relative reset values, inspection/Back, stable rows during incoming readings; reopen refreshes membership/order. Two/three use slides; one has no navigation. |
| [x] | Forget/Cancel, confirm/queue continuation, Undo within 2.5s, popup reopening with same deadline, expiry and rediscovery through a new message. Four→three→two→one and restoration behave correctly. Active has no Forget. |
| [x] | Both themes, long labels, keyboard/focus, internal table scroll and 260 × 340 bounds. Undo replaces full timezone/reset footer with 16px bottom inset and restores it without movement. |
| [x] | With disposable observations only, inspect reset boundaries: table estimate under 15m, unknown at 15m; detail estimate under 3h, unknown at 3h. Actual Updated/raw observations stay unchanged. No 48h deletion. |
| [x] | Usage circle thresholds, expired/missing neutral green; badge/tooltip reflect status independently. Real watched outage if available; otherwise leave as simulated. OUT precedes PEAK; unwatched incident does not trigger OUT. |
| [x] | Peak window weekday 5–11 AM Pacific, off-peak/weekend, unknown-status Retry, timezone/products/theme persistence, last selected product protection. Mark unavailable time/network conditions simulated. |
| [x] | Disposable reset clears Accounts/recovery and restores system timezone, Claude AI and dark; expired Undo cannot recover. No extension errors afterward. |

## Current candidate and post-publication checks

- [x] Publisher confirms the latest candidate passed real capture, Account switching and toolbar checks after the 27 October fixes.
- [ ] Install the approved Store build under its actual new extension ID and verify capture, popup/preferences and toolbar. Record its Store URL/version/result in the launch checklist.

A runtime-affecting change requires rebuilding, a new checksum and affected verification before upload. Unavailable service conditions stay unavailable or simulated; fixture checks do not establish a real incident or transport result. Existing Chrome errors may predate a reload.
