# 01: Retain Accounts and show honest expired readings

**What to build:** Remember Accounts until explicitly removed or cleared, and show reading age and unknown current usage when an observed Quota window ends. Users can return to an infrequently used Account without finding it deleted or being told an unverified 0% is current.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

## Context

Read the [approved spec](../spec.md), [approved prototype](../prototype/approved-design.html), and [accepted retention/observation decision](../../../docs/adr/0004-remember-accounts-and-show-observed-usage.md). This replaces the previous 48-hour deletion and Full quota available presentation. Account identity, local-only storage, Active selection, and existing toolbar color rules remain intact.

This slice works through the real Account rules, worker/popup lifecycle, persisted state, and existing detailed usage views. It must be demonstrable before the new table lands. It does not add manual Forget controls; ticket 04 does that.

## Acceptance criteria

- [x] A saved Account remains after 48 hours and beyond, including across the maintenance alarm and closing/reopening the popup.
- [x] Remove automatic time-based Account deletion from all real storage-writing callers; leaving an unused pruning helper is not sufficient.
- [x] Existing saved Accounts and labels survive this change; storage remains local to the Chrome profile.
- [x] A reading with an ended observed reset time shows unknown current usage and Window ended, rather than 0% or Full quota available.
- [x] Detailed views retain the last observed percentage and explain that a message produces a new reading. Normal percentages, reset countdowns, and reading age still render correctly.
- [x] A Full account ceases to be Full when its observed window ends; existing non-Full recency ordering then applies.
- [x] Active still means the Account with the latest Usage reading; browsing or expiry alone does not select another Account.
- [x] Existing reset-to-default still clears all Accounts and preferences as before.
- [x] Behavioral tests cover retention beyond the former boundary, alarm/popup persistence, expiry, ordering, and clearing. They exercise real callers rather than only testing a disconnected rule.
- [x] Browser evidence shows both ordinary and expired detailed usage views in both themes. Do not claim the third-Account capture bug is fixed from synthetic readings.

## Verification

Reuse the existing pure Account and maintenance integration seams, then exercise the production popup with disposable readings and a controlled clock. The new table will consume these established display states in ticket 03.

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented.

2026-10-23: Implemented ticket 01 from `19220b6` on `feature-usagebar`. Removed worker/popup pruning and the obsolete shared pruning API. Display Accounts expose `percent: null` after expiry and `lastObservedPercent` without changing stored readings. Both existing detail renderers show unknown usage, Window ended, age, and the last-observation/message explanation; the current-usage bar is hidden after expiry. Age is visible on Active and other details, following the approved prototype. Active selection, icon thresholds, storage schema and reset preferences are preserved.

All 43 Node tests pass, as do runtime syntax and whitespace checks. Chrome passed 45 lifecycle assertions against production popup sources with disposable Chrome/time adapters; eight screenshots cover ordinary/expired single/paged details in both themes. Separate Standards and Spec reviews each found zero issues. See [verification and replay instructions](../01-validation/verification.md). This does not reload or edit the user's live extension/storage, rebuild the release ZIP, or implement ticket 02. `ready-for-human` follows the completed implementation tickets' review-handoff convention.

2026-10-23 user amendment after trying the extension: the expired view was too dense. The user selected option B, explicitly permitting a labeled `~0% estimated` during the first three hours after the observed five-hour quota reset. After that, show `No recent reading`. This supersedes this ticket's original visible unknown/Window ended copy and always-visible expired age/explanation. Dormant detail now shows a single usage line; the last observed percentage, reading age and message guidance move to the label's native hover title and accessible description. The bar, quota label and helper lines are hidden for dormant readings. Ordinary observed readings keep their percentages/countdowns/age. Raw expired usage remains null and estimates are never persisted. Full suite: 43 passing; revised Chrome lifecycle checks: 61 passing; both review axes: zero findings. See the follow-up section in the verification record. Production popup sources are updated; the previous A/B comparison alone did not change the installed popup.

2026-10-23 subsequent user amendment: use the remaining dormant hero space for reset time, last recorded percentage and update age without a paragraph. Both production renderers now show a compact three-row definition list under the existing estimate/no-recent-reading heading. Labels align left and values align right, with 4px row gaps. Reset is the reset timestamp from the last captured reading in the selected timezone, with full date/year/timezone on hover; no later unobserved resets are inferred. Last recorded shows the stored observation and Updated shows its age. Facts remain through the estimate cutoff, refresh while open, and clear on new readings/reset. All 43 tests and 86 Chrome assertions pass; both review axes found zero issues. See the latest verification section and facts screenshots.

2026-10-23 final installed-extension visual check: the user supplied a screenshot of the updated live popup and confirmed “visual check is completed and everything is looking as intended.” The screenshot shows the estimate headline and all three aligned rows (Reset, Last recorded, Updated), with shared status/preferences visible. This completes the previously unconfirmed human visual check. Ticket 01 is complete; ready-for-human is retained as the repository's completed implementation handoff convention.

2026-10-23 visual follow-up: after considering a unified dormant headline, the user clarified that recent resets should show zero in green. Keep the existing three-hour `~0% estimated` rule and common three-row layout; color the estimated number green, leaving the qualifier secondary and older `No recent reading` neutral. All 94 browser lifecycle checks pass across both themes and single/paged views, including green/neutral computed colors and the exact cutoff. See the green-estimate section of the verification record.
