# 03a: Refine Account navigation, reset estimates and ordering

**Status:** ready-for-human

**Blocked by:** None. Production implementation authorized on 2026-10-24.

**What to do next:** Reload the unpacked extension and review the production popup. See [production verification](../03a-validation/verification.md). The latest user instruction was “everything we have finalised for prototype should be made into production.” The current Compact default is a 15-minute table estimate/priority window; the existing three-hour detail estimate remains unchanged.

The user explicitly requested ticket naming such as 3a instead of the next sequential number. This follows completed ticket 03 and precedes pending tickets 04/05 in implementation order.

## Confirmed requirements

- [x] Use individual detailed slides at 1–3 total Accounts; at 4+ show Active plus one searchable table of at least three others. Three total Accounts require three slides/dots.
- [x] Preserve 260 × 340px bounds and shared lower-control positions across the smaller-count slides.
- [x] Use the selected Compact table with Account / Used / Reset, `in …` for upcoming resets and `… ago` for the last captured reset.
- [x] Match version 2's reset durations: existing system font, 11px, regular 400 weight.
- [x] Ordinary and dormant detail slides fit naturally without the unwanted scrollbar beside the arrows. Preserve long-table internal scrolling.
- [x] Show recently reset table Accounts as estimated `~0%`, preserving the actual Updated age and captured reading in storage.
- [x] Order recent resets first, newest reset first; then other non-Full Accounts by actual last reading, newest first; retain still-Full Accounts at the bottom by soonest reset.
- [x] Keep open-table row identity, membership/order snapshot, search and scroll stable through expiry, incoming readings and inspection/Back; reorder when reopening.
- [x] Browsing, reset estimates and promotion do not change Active, persisted readings or toolbar rules.

## Production policy

- Table estimate and promotion last from the captured reset instant until strictly less than 15 minutes afterward. At exactly 15 minutes current usage becomes unknown again; reorder only on reopening.
- Detailed-view estimates retain their existing three-hour duration, then show No recent reading.
- The prototype's optional three-hour table comparison was an exploration control; production uses its current 15-minute default. This choice was stated to the user when beginning the authorized promotion.

## Existing artifacts and evidence

- [Prototype](../reset-time-exploration/prototype.html), variant 1 Compact selected.
- [Prototype notes and scrollbar diagnosis](../reset-time-exploration/README.md).
- [28 detail-fit checks and typography comparison](../reset-time-exploration/refinement-checks.json).
- Production baseline: `48cfc73` on `feature-usagebar`; [ticket-03 verification](../03-validation/verification.md).

The prototype contains the navigation threshold, Compact copy/font, scrollbar correction, recent-reset table estimates and promotion. Its duration selector compares 15-minute vs three-hour table estimates, while promotion stays at 15 minutes. [16 passing prototype checks](../reset-time-exploration/recent-reset-checks.json). Production implementation and checks are recorded in [03a verification](../03a-validation/verification.md).

## Verification

Exercise real shared Account/popup/storage seams with 0/1/2/3/4/64 Accounts, both themes, long names, observed zero/100%, upcoming/ended windows, proposed promotion boundaries, estimate cutoff, stale reading ages, incoming readings, frozen ordering, filtering/Back, exact dimensions and keyboard focus. Preserve ticket 01's historical facts and three-hour detail estimate, capture semantics and toolbar behavior. Test fractional percentages and ensure estimates are never persisted. Update 04/05's threshold expectations before their work.

Completed: 45 Node tests, 239 production table/navigation checks, 105 retention/detail regressions, and 94 navigation/preference regressions pass. Syntax/whitespace checks pass. Both review axes have zero remaining findings after corrections. [Full evidence](../03a-validation/verification.md).

## Comments

2026-10-24: User authorized promotion of all finalized prototype behavior to production. Implemented the Compact default and retained three-hour details. Historical prototype-only restrictions below are superseded by this instruction. Packaging and Forget/Undo remain tickets 05 and 04 respectively.

2026-10-23: Saved at the user's request because their usage budget was nearly exhausted. The user asked to resume later without rereading the chat. `ready-for-human` records that design review is still required; this ticket is not an instruction to implement production autonomously. Resume with the continuation brief and the recent-reset prototype.

2026-10-23 resumed: Updated the isolated Compact prototype with recent-reset-first ordering, honest estimated ~0% cells/reading ages, exact promotion/estimate cutoff presets, two recent resets, and a 15-minute/three-hour table-estimate comparison. Incoming readings and expiry keep open row membership/order and inspection/Back search/scroll stable. All 16 browser checks pass with no runtime warnings/errors; syntax passes. Evidence and screenshots are in the prototype README. Waiting for the user's design review before production changes; all unchecked requirements above remain production acceptance criteria.
