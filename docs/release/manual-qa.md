# QuotaBeacon 1.0.0 release checklist

Run against the unpacked release ZIP in a disposable Chrome profile with test Claude Accounts. Use the same Chrome profile for both Accounts. Mark each check with a date and result; earlier evidence below is not a claim that the new store package has passed every live check.

## Before upload

Build the package from the repository root with PowerShell, after creating the output directory:

```powershell
Compress-Archive -LiteralPath manifest.json,background,content,popup,shared,data,icons -DestinationPath .scratch/multi-account-usage/06-release/quotabeacon-1.0.0.zip -Force
```

This allowlist excludes development fixtures, tests, documentation and legacy promotional images.

- [ ] Load the extracted ZIP; confirm QuotaBeacon 1.0.0, a working popup, and no extension errors. Confirm `manifest.json` is at the ZIP root and only runtime files are included.
- [ ] Run `node --test tests/*.test.js`; syntax-check scripts with `node --check`. This project has no separate typechecking/build configuration.
- [ ] Use **Add new item** in the Chrome Web Store dashboard, not an upload to the old Peak Hours for Claude item. The new item has its own ID and requires a separate installation; no settings or Account migration is provided.
- [ ] Fill the new listing and privacy-policy URL with [the disclosure](privacy-disclosure.md), permission justifications and accurate local-data handling. Replace legacy promotional images/captions with QuotaBeacon screenshots and usage-driven icon explanations.

## Manual scenarios

| Done | Scenario and expected result |
| --- | --- |
| [ ] | **One Account / no reading:** a fresh install shows “Send a message to see usage” and a green toolbar icon. Send a message; show its percentage and reset time, with no name, tags, arrows, dots or age line. |
| [ ] | **Two Accounts:** send a message from each. Both names/readings remain; arrows, dots and keyboard left/right navigate without wrapping. Long names truncate. Email-based names show the username. |
| [ ] | **Switching Accounts:** browsing another page changes neither Active nor icon. Logging in alone does not switch Active. Sending a message from another Account makes it page 1 and updates the icon. |
| [ ] | **100%:** the Active account stays first with Active and Full tags and a red icon. After switching, the former Active Full account follows non-Full Accounts; multiple Full accounts use soonest-reset order. |
| [ ] | **Reading age:** set a non-Active test reading to 9m 59s, then 10m old. Muted “Updated … ago” appears beside its name only at/after 10m; Active never shows it. Controls stay fixed while paging. |
| [ ] | **Expired reading:** set a test reading's reset time just in the past (Unix seconds). Show 0% and “Full quota available,” remove Full and restore normal order. An expired Active reading makes the icon green. Check with one Account and several. |
| [ ] | **48-hour drop:** set last-reading times (milliseconds) to just under and just over 48h. The existing 30-second alarm and reopening the popup each remove only the older entry. Removing all entries restores the no-reading state and green icon. |
| [ ] | **Failed label fetch:** block or fail only the organization-details request for a new test Account. Usage still saves; show `Account <first six ID characters>…`. Restore the request; a later reading retries and resolves the label. |
| [ ] | **Reset to default:** with test Accounts, custom timezone/products and light theme, reset. Forget Accounts, restore system timezone, Claude AI only and dark theme; show no-reading state and green icon. |
| [ ] | **Both themes:** toggle light/dark and reopen the popup. Check persistence, names, inline age, percentages, Full/Active tags, expiry text, disabled arrows and no clipping at 260px. |
| [ ] | **Outage pass:** use a watched-product incident. Show Outage plus severity/product and incident detail, blinking DOWN badge and incident tooltip. DOWN overrides PEAK. Paging and Usage updates leave pill, badge and tooltip semantics unchanged; the icon still follows Active usage. Also check an incident only on an unwatched product. |
| [ ] | **Peak-hours pass:** during weekday 5–11 AM Pacific without a watched outage, show Peak/countdown, blinking PEAK and the peak tooltip. Off peak, clear the badge and show the next peak. Simulate public status/time in a disposable development fixture when the live condition is unavailable; label that result as simulated. |
| [ ] | **Unavailable status:** fail the status request. Show “Status unavailable” with Retry and an unknown-status tooltip; keep the usage-driven icon green/orange/red, never grey. |

Inspect timestamps through DevTools → Application → Extension Storage in an extension context. Use only disposable test readings for edits and reset. Keep Account IDs, real names, cookies and chat text out of QA reports.

## Existing verification and ticket 03 assumptions

| Check | Recorded result |
| --- | --- |
| Content-script fetch carries the Claude session | **Pass, 2026-10-22:** user ran a same-origin organization fetch in the extension execution context and reported HTTP `200`. |
| Organization response contains a usable `name` | **Pass, same check:** user reported `namePresent: true`. No ID or name was recorded. |
| Capture in an already-open Claude page | **Pass, 2026-10-22:** user reloaded only the extension, sent a message and confirmed a non-empty label was saved locally. [Ticket 03](../../.scratch/multi-account-usage/issues/03-account-label-capture.md). |
| Two real Accounts | **Pass:** user confirmed both Accounts page correctly. [Ticket 04 evidence](../../.scratch/multi-account-usage/04-validation/qa.md). |
| Live age display | **Pass:** user confirmed age on the non-Active page and no age on Active. Inline placement was subsequently checked with browser fixtures. [Ticket 05 evidence](../../.scratch/multi-account-usage/05-validation/qa.md). |
| Age, expiry, cleanup and reset boundaries | Browser fixtures and worker integration checks passed for ticket 05. Full real-extension DevTools timestamp manipulation remains pending; do not mark those release rows passed from this record alone. |

## Publication sequence

1. Finish the unchecked package QA and new listing assets, then submit QuotaBeacon as a new item. [Chrome publishing instructions](https://developer.chrome.com/docs/webstore/publish).
2. After approval, install the store build separately and send a message to verify capture under its actual new extension ID.
3. Decide when to unpublish the old Peak Hours for Claude listing. That action hides the old listing; it does not migrate users to QuotaBeacon. [Chrome unpublishing instructions](https://developer.chrome.com/docs/webstore/account-deletion).

Release preparation does not submit either item or alter the old listing.
