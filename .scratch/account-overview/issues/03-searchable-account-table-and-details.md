# 03: Compare many Accounts in one searchable table

**What to build:** At three or more remembered Accounts with readings, the next arrow opens one table of the other Accounts. Users can search, compare, inspect a row, and return without adding pages, changing Active, or losing their place.

**Blocked by:** 01 (retention and truthful display states), 02 (fixed popup and main-page navigation).

**Status:** ready-for-human

## Context

Read the [approved spec](../spec.md) and [approved prototype](../prototype/approved-design.html). The complete feature has no more than two main pages: Active details first, then either the other Account's hero at two total Accounts or a table at three or more. Row details are a temporary inspection view of the second page.

Ticket 01 establishes the retained/expired reading behavior; ticket 02 establishes the real fixed container and shared controls. This slice includes stable refresh behavior and preserving search/scroll on Back, so comparison is usable as soon as it lands. Ticket 04 adds removal controls.

## Acceptance criteria

- [x] Exactly two Accounts continue to use two detailed views. At three or more, the second page contains a table of the other Accounts, initially excluding Active.
- [x] The table has Account / Used / Resets columns, muted reading age beneath names, right-aligned numeric values, complete-name affordances, and honest unknown/Window ended display states.
- [x] At least 64 remembered Accounts are supported without more main pages or a stored/display count cap.
- [x] The table scrolls internally within the unchanged 260 by 340px popup. Header labels remain visible while scrolling; the page does not overflow horizontally.
- [x] Search locates remembered Accounts and has a clear empty result state. Input arrow keys do not change main pages.
- [x] Status sits above the table and its detail view; product/timezone controls are absent from this secondary view and remain on page one. Theme remains available.
- [x] Selecting a row opens its full usage details. Back restores the same search, list membership/order snapshot, and scroll position.
- [x] Inspecting a row does not modify Active, Account readings, or toolbar color. Covered or inactive controls cannot receive focus.
- [x] Initial/reopened ordering uses non-Full recency, followed by Full accounts ordered by soonest reset. The popup itself opens on Active.
- [x] Incoming readings update values and Active immediately without moving rows while the table is open or temporarily replaced by row details. Show the approved refresh notice; recompute membership/order when reopening the table.
- [x] A row that becomes Active can stay in the frozen list with an Active indicator until reopening. Reopening excludes the new Active and includes the previous Active when applicable.
- [x] Show only the saved-Account count beneath the table, with the approved 14px gap above it and lowered placement. Do not restore Last readings, heading tabs, a redundant email line, or demo controls.
- [x] Rendered-popup checks cover 2/3/64 Accounts, filtering, Back restoration, expiry, long names, incoming readings, both themes, status states, fixed dimensions, keyboard access, and no runtime errors.

## Verification

Use real popup/storage refresh paths with disposable readings. Assert row identity/order stability and toolbar/Active behavior through user-visible output. Capture production screenshots corresponding to the approved two-Account and final table references.

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented.

2026-10-23: Implemented from 426c97e on feature-usagebar. The popup now uses at most two main pages: a second detailed view for exactly two Accounts, and a searchable internally scrolling table at three or more. Table row identity/membership/order remain frozen through incoming readings and inspection; values and Active update immediately, with the approved notice. Back preserves search/scroll, reopening recomputes ordering, and hidden controls cannot receive focus. The latest dormant-reading amendments are preserved. Validation: 153 ticket-03, 94 ticket-02 and 105 ticket-01 rendered assertions pass, alongside all three Node test files (43 tests total), syntax checks, and native keyboard checks. Production screenshots and replay are in [verification](../03-validation/verification.md). Independent Standards/Spec review and the final full-suite run follow before handoff. Forget/Undo, release packaging and live installed-extension changes remain outside this ticket.

2026-10-23 final verification: `node --test` passes all 43 tests. Standards review reported two nonblocking readability/duplication suggestions; both are resolved, with zero remaining Standards findings. Spec review and its follow-up report zero actionable findings. All 153 table, 94 navigation and 105 retained-reading browser assertions pass after review cleanup. Ticket 03 is complete and ready for human review; the installed extension can be inspected after reloading it.
