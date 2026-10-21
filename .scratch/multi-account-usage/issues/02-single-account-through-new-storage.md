# 02: Single account through the new storage

**What to build:** The extension records each Usage reading against its Account (organization ID from the request URL) using the new per-account storage and the account module from ticket 01, and everything the user sees today still works with one Account. The popup hero looks and behaves exactly as it does now. The toolbar icon follows the Active account, is green when there is no reading or the reading has expired, and is never grey. The old flat usage keys are removed once on update. The manifest loads the account module for the content scripts, and the service worker and popup load it too.

**Blocked by:** 01.

**Status:** ready-for-human

- [x] Sending a message on claude.ai stores a reading under that organization's ID in local extension storage (never sync).
- [x] With one Account the popup is visually identical to the current popup (no label, arrows or dots).
- [x] The icon color follows the Active account at the 60/61 and 85/86 thresholds; no Account or an expired reading shows green; the icon is never grey.
- [x] The bridge is the only writer of readings; the service worker reads them.
- [x] The old flat usage keys and the expiry sentinel are cleaned up once; nothing else reads them.
- [x] Peak-hours, outage, badge, tooltip, product filter and timezone behavior are unchanged.
- [x] The manifest changes only to load the account module (no new permissions).
- [ ] Manual check: load the unpacked extension, send a message, confirm popup and icon update.

## Comments

2026-10-21: Implemented the Account storage integration. Both content-script worlds load `shared/accounts.js` first. The MAIN script extracts `accountId` from the completion URL and tags each Usage reading. The bridge validates incoming readings, serializes writes within its tab, applies the module to the `accounts` map in local storage, and notifies the service worker after persistence. Cross-tab writes remain last-write-wins as accepted in the spec.

The service worker derives icon color from the stored Active account, including on its existing 30-second alarm. It never rewrites readings from message payloads or deletes them on expiry. The popup derives percent and expiry from the same module. The update event removes only `usagePercent`, `usageResetsAt`, and `usageExpired`; there is no migration of the unpublished tracker and no recurring cleanup on normal polls. No permissions or version changes are included in this ticket.

Validation: the Account module's 11 tests pass. A separate development smoke check exercised completion SSE capture, two consecutive Account writes, invalid reading rejection, worker notification ordering, read-only icon refresh, expiry, update cleanup, and popup active/expired/empty states with browser API stand-ins. An in-app browser preview verified the existing popup in dark and light themes, including the expired and empty states. This does not replace the live check above: no Chrome browser or authenticated claude.ai session is connected, so loading the unpacked extension and sending a real message remains pending human verification.

Existing uncommitted UI, badge, default-setting, and version edits are preserved in the working tree. Integration changes are staged separately against the committed layout so this ticket does not absorb those edits.

Final review: Standards has no findings. Spec identified an unintended reuse of toolbar colors in the popup; this was corrected so each layout keeps its existing renderer and color thresholds, including fractional readings near 60% and 85%. Targeted smoke checks pass for both the staged layout and the working-tree layout. Spec has no remaining implementation findings. `node --test` passes all 11 tests; JavaScript syntax and staged whitespace checks pass. The live manual check above remains pending.
