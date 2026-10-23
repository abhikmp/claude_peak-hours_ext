# 02: Keep the popup fixed while navigating one or two Accounts

**What to build:** Bring the approved compact layout into the real extension. The popup stays exactly 260px wide and 340px high, and two-Account paging changes only the usage details while status and lower controls remain in identical positions.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

## Context

Read the [approved spec](../spec.md) and [frozen visual reference](../prototype/approved-design.html). Use the existing extension's renderer, themes, Account rules, status resolution, and real preference controls. The prototype is a visual/behavior reference, not production source to copy wholesale.

This slice covers the no-reading, single-Account, and two-Account paths end to end. Ticket 03 replaces the larger-list path with the new table. This ticket does not depend on retention changes: implement against the shared Account display contract present when the work starts, and preserve compatible expiry rendering.

The later user-approved [ticket 01 amendments](01-retain-accounts-and-show-observed-usage.md) govern dormant presentation: ~0% estimated for the first three hours after the observed reset, then No recent reading, with compact Reset / Last recorded / Updated rows. They supersede the frozen prototype's earlier expired copy.

## Acceptance criteria

- [x] The real popup content box measures exactly 260 by 340 CSS pixels, including padding, on no-reading, one-Account, and both two-Account pages. The demo browser strip is excluded.
- [x] One Account has a single detailed usage view with no page navigation. No-reading behavior remains usable within the same fixed bounds.
- [x] Two Accounts have stacked previous/next arrows and two position dots; navigation stops at the ends and opens on Active.
- [x] In two-Account mode, the status pill, product controls, and timezone remain visible at identical positions on both pages.
- [x] Theme is accessible on every page, and real product/timezone/theme settings still save and persist.
- [x] Remove the proposed section tabs/headings, extra brand header, redundant email row, and obsolete fixed blank detail region. Retain the Account identity and Active tag.
- [x] Remove the redundant Full pill from all Account usage views, including the Active Account and other Account details. A 100% reading and its existing usage styling communicate exhaustion. Preserve Full classification, ordering, reset behavior, and toolbar thresholds; this changes only the visible pill.
- [x] Longer names truncate without moving tags or controls; longer detail content scrolls internally without growing the popup or covering lower controls.
- [x] Browsing the other Account does not change Active, storage, or toolbar color.
- [x] Left/right keys navigate pages except while editing inputs. Inactive content is excluded from keyboard and accessibility navigation; navigation announcements identify the view.
- [x] Preserve existing status, outage, peak-hours, preference, and toolbar semantics. Motion respects reduced-motion preferences.
- [x] Verify actual dimensions and lower-control positions in both themes, including long labels and an expired reading. Check 100% on Active and non-Active Accounts: no Full pill, with the percentage and appropriate Active tag retained. Add meaningful rendered-popup checks at the highest practical existing seam.

## Verification

Use the production popup with disposable Account/status fixtures. Measure the outer box and status/preferences positions before and after paging; do not use the prototype's measurements as production proof.

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented.

2026-10-23: The user requested removing the Full pill because the displayed 100% already communicates it. Queue this with the popup implementation; do not change production now. This requirement supersedes the Full pill shown in the frozen prototype and earlier Active/Full-tag wording, and also applies to the shared usage details used by ticket 03. The Active tag and underlying Full ordering rules remain.

2026-10-23: Implemented from `dcfeeb2` on `feature-usagebar` after the user invoked implement for ticket 02. One Account now uses the same detail renderer as multiple Accounts, with navigation/dots hidden. The popup is exactly 260 × 340px; shared status/preferences stay below a flexible, internally scrolling usage area. Full pill markup/styles are removed without changing Account rules. Timezone choices open upward inside the fixed popup and expose native buttons for keyboard selection. A global reduced-motion rule disables transitions and animations. The approved dormant estimate and three fact rows are preserved.

Verification: 43 Node tests, 94 ticket-02 browser assertions and 86 ticket-01 browser regressions pass. Native browser keyboard checks confirm arrow paging, input-arrow exclusion and Tab/Enter timezone selection. Separate Standards and Spec reviews report zero findings, including the final spacing correction that avoids a two-pixel ordinary dormant overflow. [Verification, screenshots and replay](../02-validation/verification.md). The user can inspect the installed extension after reloading when they return; no installed-extension reload, live reading edit, package rebuild or publication is claimed. `ready-for-human` follows the completed implementation handoff convention. Ticket 03 is now unblocked but has not started.
