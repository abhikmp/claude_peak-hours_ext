# Account overview: approved design

**Post-ticket-03 follow-up (2026-10-23):** Read the [continuation brief](continuation.md) and [ticket 03a](issues/03a-account-overview-refinements.md) for the user's later navigation, Compact reset-time and scrollbar decisions. Those supersede conflicting earlier requirements below. The user authorized all finalized prototype refinements for production on 2026-10-24. Ticket 03a implements the current Compact default: 15-minute table estimates and priority, with the existing three-hour detail estimate retained.

**ADR amendment:** This user-authorized 03a decision supersedes ADR-0004's three-Account table threshold and its “Window ended and unknown current usage” table presentation. The new threshold is four total Accounts; captured reset times use relative past/future copy and a clearly estimated fifteen-minute table zero. Retention, actual reading age, captured observations and Active semantics from ADR-0004 are preserved. Full release-documentation cleanup remains ticket 05.

Status: ready-for-agent
Design approved: 2026-10-22
Implementation: tickets 01–03a complete; Forget/Undo and release packaging remain tickets 04/05

## Problem Statement

One full usage page per Account is cumbersome for people rotating among dozens of Accounts. Earlier table proposals wasted space for small lists, repeated unnecessary headings and information, and changed the popup's dimensions during navigation. Automatic removal after 48 hours also makes infrequently used Accounts disappear from the comparison.

## Solution

Keep a compact popup at exactly **260px wide by 340px high** on every view. One Account has a single detailed usage view. Two or three Accounts retain arrow navigation between individual detailed slides, with lower status and preference controls aligned. At four or more remembered Accounts, page two is a searchable, internally scrolling table of at least three other Accounts. Three total Accounts have three slides/dots; the larger-count table mode has two main pages.

The user approved the final interactive prototype after refinements to dimensions, control placement, and table-footer spacing. The approved visual reference is authoritative where earlier discussion or prototypes disagree.

## User Stories

1. As a user, I want the popup to stay the same width and height, so that paging never makes it shrink or expand.
2. As a user with one Account, I want a single detailed view without navigation, so that the interface stays simple.
3. As a user with two or three Accounts, I want arrows to switch between their detailed usage views, so that the existing interaction remains familiar.
4. As a user with two or three Accounts, I want status, products, and timezone to stay in the same positions on both pages, so that only Account details change.
5. As a user with four or more Accounts, I want one table of the other Accounts, so that the list does not create more pages.
6. As a user with dozens of Accounts, I want the table to scroll inside the popup, so that the outer window stays compact.
7. As a user, I want to search remembered Accounts by name, so that I can quickly locate one.
8. As a user, I want Account, Used, and Reset columns, so that I can compare readings at a glance.
9. As a user, I want reading age beneath each name, so that I know how recent the displayed usage is.
10. As a user, I want ended captured resets to say how long ago they happened, with an explicitly estimated ~0% for the first 15 minutes and unknown current usage afterward.
11. As a user, I want to open a table row's detailed usage view and return to the same list position and search, so that inspection does not interrupt comparison.
12. As a user, I want browsing details to leave Active and the toolbar unchanged, so that viewing an Account is distinct from using it.
13. As a user, I want the popup to open on the Active account, so that it matches the toolbar's Account.
14. As a user, I want the status pill above the secondary table or its details, so that status remains visible without repeating product/timezone controls there.
15. As a user, I want theme available on every view, so that changing pages does not hide it.
16. As a user, I want new readings to update values without moving rows while I browse, so that the target beneath my pointer stays put.
17. As a user, I want meaningful ordering when I reopen the table, so that recent resets come first, then recently used non-Full Accounts, then still-Full Accounts.
18. As a user, I want Full accounts ordered by soonest reset, so that I can see which observed window ends first.
19. As a user, I want remembered Accounts retained until explicitly forgotten, so that infrequent use does not erase them.
20. As a user, I want to forget another Account through its menu, with confirmation and Undo, so that I can maintain the list and recover a mistake.
21. As a user, I want a later Usage reading to rediscover a forgotten Account, so that forgetting does not block future tracking.
22. As a user, I want forgetting to adjust the three/four-Account layout immediately, so that a table with fewer than three rows becomes detailed slides.
23. As a user, I want a saved-Account count clearly separated from the table, so that it does not look like another row.
24. As a keyboard user, I want usable arrows, search, row actions, and Back navigation, so that the complete flow is accessible.
25. As a user, I want names and readings kept in this Chrome profile's local storage, so that this redesign preserves existing privacy boundaries.

## Implementation Decisions

- **Fixed bounds:** the real popup content box is exactly 260 by 340 CSS pixels, including its padding. The prototype's 34px fake browser strip and surrounding lab are excluded. Long tables, extended details, confirmations, and feedback must fit or scroll internally without changing those bounds.
- **Page one:** the Active account's detailed usage view, then status, product controls, and timezone controls. Use the existing Account identity and latest-reading definition of Active.
- **Two or three Accounts:** only the detailed usage region changes on arrow navigation. The status and preference sections remain visible and vertically aligned. The non-Active Account's Forget action lives in its name-row menu, avoiding an extra action row beneath the hero.
- **Four or more Accounts:** the next arrow opens a table with at least three other Accounts. The status pill sits above this secondary content. Product/timezone controls remain on page one; the theme toggle remains accessible. Table-row inspection replaces the table temporarily and provides Back to accounts.
- **Navigation:** stacked previous/next arrows, one position dot per slide at two/three Accounts, or two dots in larger-count table mode, and no wraparound. No Active account / Other accounts section tabs, extra brand heading, redundant email row, or Last readings label. The small Active identity tag remains meaningful and is retained. Remove the redundant Full pill from every Account usage view, including row details: the displayed 100% and usage styling already communicate exhaustion. Preserve underlying Full classification and ordering. This user amendment of 2026-10-23 supersedes the pill shown in the frozen visual reference and is owned by ticket 02.
- **Table:** selected Compact version, Account / Used / Reset, with muted reading age under each Account name. Names truncate within their column and expose their complete label through the existing title/detail affordance. Numeric columns align right. Reset values use the existing system font at 11px regular 400: `in …` for future captured resets, `… ago` for past captured resets; exact captured date/year/timezone is available on hover and through accessible text. Search and an empty-search message remain inside the same bounded view.
- **Footer spacing:** only the saved-Account count remains below the table. It has 14px space above it and sits 6px lower than the earlier footer; the table page uses the approved reduced bottom padding. Dots remain below it. Do not restore the removed Last readings caption.
- **Freshness:** retained values are observations, not live queries. At an observed reset, table usage becomes green `~0%`, explicitly an estimate, until strictly less than 15 minutes afterward; at 15 minutes it becomes unknown. Keep the actual Updated age. Detailed views retain `~0% estimated` for three hours, then No recent reading, with Last reset / Last recorded / Updated facts. No future unobserved reset is invented and no estimate is persisted.
- **Retention:** remove automatic 48-hour Account deletion. Forget is available for non-Active Accounts. Confirmation precedes removal; Undo restores the saved reading. A subsequent real Usage reading can rediscover the Account. Existing reset-to-default behavior still clears all Accounts.
- **Ordering and updates:** when opening the table, put resets within the past 15 minutes first (newest reset first), then existing non-Full reading recency, followed by still-Full Accounts by soonest reset. Ordinary slide ordering is unchanged. Priority expiry updates values with a reopen notice, without moving open rows. Freeze table row positions while browsing, including while inspecting a row. New readings update values and Active immediately, with a notice that ordering updates when the list reopens. A row that becomes Active may remain in the frozen list with an Active indicator until reopening recalculates membership and order.
- **Threshold transitions:** recompute the view when an Account is forgotten or restored. Four to three Accounts replaces the table with three slides; Undo restores the table at four. Three to two remains slides. One Account has no navigation.
- **Architecture:** retain one shared Account module for Account rules, with thin browser/storage/popup callers. Reuse local Account identity/storage, themes, status resolution, and preference behavior. No build system, account synchronization, login automation, or new external service is introduced.

## Testing Decisions

- Test observable behavior, not private helper structure or the prototype's demo machinery.
- Build on the existing pure Account tests for arbitrary counts, recency/Full ordering, expiry, explicit forgetting/restoration, clearing, and indefinite retention. An Account remains remembered beyond 48 hours unless explicitly forgotten.
- Build on the existing manifest-to-capture/storage integration seam when verifying capture across three distinct Accounts. The separate missing-third-Account report still requires a reproduction of its real failure before claiming it fixed.
- Verify the real rendered popup at zero, one, two, three, four, and at least 64 Accounts. Measure width and height before and after paging, row inspection, expiry, search, confirmation, forgetting, Undo, and incoming readings.
- Assert exactly 260 by 340 pixels and internal scrolling rather than outer overflow. For two and three Accounts, also compare status and preference positions across slides. Ordinary and dormant details fit naturally without a scrollbar beside the arrows; preserve internal long-table scrolling.
- Verify table presence only at four or more Accounts; four-to-three, three-to-two and two-to-one forgetting transitions; and restoration through Undo or a new reading.
- Verify that row inspection leaves Active/toolbar unchanged, Back preserves search and scroll, and incoming readings do not move existing rows until reopening.
- Verify expired readings clearly distinguish estimated ~0% from observed zero and unknown usage; test reset instant, 14m59.999s, exactly 15m, and three-hour detail cutoff; check age, reset text, empty search, long names, both themes, and status states.
- Verify 100% readings on Active and non-Active Accounts show no Full pill across detailed views; retain the percentage, Active indicator where applicable, and existing Full ordering/toolbar behavior.
- Exercise keyboard focus and navigation; inactive or hidden content must not receive focus. Check that search input arrows do not trigger page navigation.
- Compare production screenshots with the approved prototype. Existing prototype checks are design evidence, not evidence that production has been implemented or its capture bug fixed.

## Out of Scope

- Forgetting the Active account individually; reset-to-default can still clear all Accounts.
- Fixing the reported missing-third-Account capture failure without its own reproduction and regression verification.
- Account sign-in/switching automation, cross-profile or cross-device synchronization, live quota refresh without a message, usage history/charts, and additional quota types.
- Redesigning incident, peak-hours, product-selection, timezone, or theme behavior beyond the approved placement changes.
- Shipping the prototype's lab, fake browser strip, sample identities, demo controls, or historical layout picker.

## Further Notes

- Approved visual source: [approved-design.html](prototype/approved-design.html). This is a frozen copy of the final reviewed prototype.
- Working preview: [prototype.html](prototype/prototype.html). The earlier three-direction exploration is historical, not the final design.
- Evidence: [two-Account first page](prototype/screenshots/fixed-two-first.png), [two-Account second page](prototype/screenshots/fixed-two-second.png), [final table/footer](prototype/screenshots/table-footer-spacing.png), and [verification](prototype/verification.md).
- This spec supersedes conflicting layout/retention details in the previous multi-account spec. The Account overview design decision supersedes ADR-0003's 48-hour deletion and inferred-full-quota presentation; retention and display implementation are complete; explicit Forget/Undo remains ticket 04.
- Capture report: [third Account does not update the popup](../multi-account-usage/issues/08-third-account-not-captured.md).
- Ticket 03a production integration is recorded in its verification. Release packaging/publication has not occurred as part of 03a.
