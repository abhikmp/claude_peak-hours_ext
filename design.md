# QuotaBeacon — release design reference

This describes the implemented QuotaBeacon release. It supersedes the earlier single-Account architecture notes in project-context.md. [CONTEXT.md](CONTEXT.md) defines the domain language; [release QA](docs/release/manual-qa.md) records checks and remaining publication steps.

## Product and release identity

QuotaBeacon is a separate extension from Peak Hours for Claude. Its first store package is version 1.0.0 and must be uploaded as a **new item**. The existing listing is not updated or unpublished by this release preparation. Account readings and preferences do not migrate between extension IDs.

The popup gives priority to Claude quota usage. Peak hours and incidents appear as secondary signals in the pill, toolbar badge and tooltip.

## Toolbar icon, badge and tooltip

The toolbar circle follows only the **Active account**, whose most recent Usage reading determines page 1. Browsing another Account page does not change it.

| Active Usage reading | Circle |
| --- | --- |
| No Account, or an Expired reading | Green |
| 0–60% used | Green, #22c55e |
| Above 60% through 85% | Orange, #f97316 |
| Above 85% through 100% | Red, #ef4444 |

The toolbar icon is **never grey**. An unavailable public status response is shown in the popup, without overriding the usage color.

| Public status | Badge | Tooltip |
| --- | --- | --- |
| Incident affecting a Watched product | DOWN, #c2410c background | Affected products and incident title |
| Weekday 5–11 AM Pacific, without a watched incident | PEAK, #b91c1c background | Time until peak hours end |
| Off peak | Empty | Next peak, or existing status description for an unwatched incident |
| Status request failed | Empty | QuotaBeacon · Unknown |

DOWN takes priority over PEAK. Badge text is white. While the service worker remains running, its interval alternates the badge on/off every second. Chrome can suspend the worker; continuous blinking while suspended is not promised. Polling refreshes the resolved status every five minutes. Usage expiry checks update the icon without changing badge or tooltip behavior.

## Popup layout

The popup is 260px wide, with 16px horizontal content padding. Existing dark/light tokens in popup/popup.css define its colors. Dark is the default; the top-right theme toggle persists the preference.

Order: usage hero, public-status pill and aside/incident detail, divider, Watched product filter, divider, timezone/reset footer, timezone picker.

### One Account and no reading

With one Account, show its percentage, progress bar and reset countdown. Hide Account name, Active/Full tags, arrows, dots and reading age. With no readings, show “— %” and “Send a message to see usage.” The icon is green.

An Expired reading displays 0%, an empty bar and “Full quota available — your limit has reset.” Stored readings are retained until cleanup or reset; display expiry does not erase them.

### Multiple Accounts

Only the usage hero pages. The pill, filters, footer, timezone picker and theme toggle stay fixed while paging.

- Each page shows the Account name, tags, percentage, bar and reset text. Email-based organization labels display the username before @; stored labels remain unchanged. Other labels retain their names; unresolved names use “Account <first six ID characters>…”.
- Page 1 is always Active, even at 100%. Active changes only when another Account produces a new Usage reading.
- Remaining non-Full Accounts follow by most recent reading. Full accounts follow last, ordered by soonest reset.
- A Full account is at 100% with a Quota window that has not ended. Expiry removes Full and returns it to normal ordering.
- A non-Active reading at least 10 minutes old shows muted “Updated … ago” **beside the name**, at 9px. Active never shows reading age. Names truncate on one line; age and tags do not shrink or wrap.
- Previous/next arrows sit in the right gutter, previous above next. Dots sit below the hero. Navigation stops at either end.
- Left/right keys page unless the user is editing an input. Hidden pages are inert and excluded from accessibility navigation; a polite announcement identifies the selected page.
- Deliberate page changes slide in 300ms. Reduced-motion preferences remove the transition. Data refreshes do not animate.
- The flex track takes the tallest page's natural height; there is no fixed 100px minimum and no bottom age row.
- Open on Active. Preserve the selected Account during ordinary refreshes; return to Active when a new Account becomes Active.

Usage percentages use the green/orange/red thresholds above. Text and fills use theme tokens. Bars are 8px high with rounded ends. Countdown text uses the selected timezone, such as “Resets in 2h 18m · Fri 4:30 PM”.

### Public-status pill

| State | Pill | Adjacent text |
| --- | --- | --- |
| Off peak | Off peak, green | Next peak day/time, with countdown when under one hour |
| Peak hours | Peak, red | Ends in duration and local time |
| Watched incident | Outage, orange | Major/Partial severity and products; relevant incident sentence below |
| Request failed | Status unavailable | Inline Retry button |

The retry button requests a fresh poll. Outage text remains capped at 120 characters. An unwatched incident does not turn the pill into a watched outage. This release does not change the weekday Pacific peak window, incident matching or tooltip countdown rules.

## Preferences and lifecycle

Fresh installs default to Claude AI as the sole Watched product. Existing saved selections remain. At least one product must stay selected; the final checked checkbox is disabled. The timezone picker saves an IANA timezone and affects reset and peak-time displays.

“Reset to default” restores system timezone, Claude AI only and dark theme, forgets all Accounts, updates the icon and requests a status poll.

Accounts without a new reading for **more than 48 hours** are pruned by the existing 30-second alarm and when the popup opens. Exactly 48 hours is retained. The open popup refreshes its display every 30 seconds for age and expiry changes. If no Account remains, show the no-reading state and a green icon.

## Capture and storage

The pure Account module in shared/accounts.js owns identity, ordering, expiry, age, pruning and clearing. It takes time as an argument and uses no browser APIs.

The MAIN-world capture script observes quota events in completion responses and forwards the completion URL, percentage and reset time. Only the ISOLATED bridge loads the Account module, extracts the organization UUID and writes readings to local storage. This avoids Chrome deduplicating the same script path across worlds.

The bridge fetches an unresolved Account name independently from the signed-in same-origin organization endpoint, with a 10-second timeout. Failed names retry on a later reading. Label writes cannot restore a forgotten Account or change Active. Install/update injection supports Claude tabs already open.

| Storage | Contents |
| --- | --- |
| chrome.storage.local, accounts | Map keyed by organization UUID: nullable label, percent, reset time in Unix seconds, last-reading time in milliseconds and a reading-order tie breaker |
| chrome.storage.local, status fields | Public status, incident details, next peak/end time and last-check time |
| chrome.storage.sync | userTZ, watchedProducts and theme |

The old flat usagePercent, usageResetsAt and usageExpired keys are removed on update; there is no migration from a public usage-tracker release. The bridge applies readings/labels; the worker and popup may persist pruning; reset clears Accounts. Cross-tab simultaneous updates remain last-write-wins.

Account names, which may be email addresses, and Usage readings stay locally on the device. Only preferences use Chrome sync storage. See [the privacy disclosure](docs/release/privacy-disclosure.md) for network behavior and publisher copy.

## Visual evidence

Current multi-Account layout: [Active page](.scratch/multi-account-usage/05-validation/screenshots/inline-active.jpg), [inline age](.scratch/multi-account-usage/05-validation/screenshots/inline-updated.jpg). These are disposable fixture readings. Earlier prototype/QA screenshots document earlier layouts; the bottom-row age presentation is superseded.