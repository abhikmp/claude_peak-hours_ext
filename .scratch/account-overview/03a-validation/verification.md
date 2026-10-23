# Ticket 03a production verification — 2026-10-24

Baseline: `48cfc73` on `feature-usagebar`. Scope: [03a](../issues/03a-account-overview-refinements.md), authorized by the user's instruction to put every finalized prototype refinement into production.

## Result

Production uses individual detail slides for one to three Accounts and Active plus a searchable table at four or more. Three Accounts have three slides/dots; the table initially contains at least three others. The selected Compact table has Account / Used / Reset columns, 11px regular reset values, upcoming `in …` and past `… ago` text, exact captured date/year/timezone titles and accessible descriptions.

Recent resets show green estimated `~0%` and receive priority for the first 15 minutes after the captured reset. At exactly 15 minutes table usage returns to unknown. The true Updated age, observed percentage and stored reading remain intact. Reopening orders recent resets newest first, other non-Full Accounts by reading recency, then still-Full Accounts by soonest reset. Active and ordinary slide ordering are unchanged.

Open rows retain identity, membership and order through time passing, new readings, inspection and Back. Values and Active update immediately. Reopen notices distinguish reset priority from incoming readings. Search, scroll and keyboard access are preserved. Detailed expired readings keep the existing three-hour estimate and historical facts. Reducing the five lower-control gaps from 9px to 7px gives ordinary/dormant details enough room without hiding or cropping a scrollbar. Long tables still scroll internally.

The prototype's default 15-minute table policy was stated when starting this authorized production promotion. Its optional three-hour table comparison remains an exploration option. The existing three-hour **detail** policy is independent.

## Checks

- Public shared Account tests first failed for the missing recent-reset/comparison behavior, then passed after implementation. They cover reset instant, one millisecond before and exactly at 15 minutes, missing resets, fractional observed usage, reading-order ties, recent-reset ordering, Full ordering, immutable inputs and unchanged Active/toolbar behavior.
- [239 production table/navigation assertions](browser-results.txt), zero failures: 1/2/3/4/64 Accounts, both themes, 0–4 count transitions, exact 260 × 340 bounds, natural detail fit, Compact typography/copy, exact reset metadata, frozen DOM/order/membership, live reading updates, inspection/Back, search/empty search, keyboard focus, long international names, unknown resets and observed zero, every status state, priority/estimate boundary and no estimate writes/messages. This includes stable row coordinates when reset/reading notices appear, notice separation from rows/count, and three complete rows at the four-Account threshold.
- [105 retention/detail regressions](ticket01-regressions.txt) and [94 navigation/preference regressions](ticket02-regressions.txt), zero failures. Historical facts, three-hour detail estimates, reset, preference persistence and keyboard interactions remain covered.
- [Measured popup bounds](measurements.json). Production preview reported no browser warnings/errors; the harness captured no popup errors or unhandled rejections.
- Final `node --test`: [45 passing, zero failures](node-results.txt). Production, test and harness JavaScript syntax checks passed for nine files; `git diff 48cfc73...HEAD --check` passed. No separate typechecking/build configuration exists.
- [Two-axis code review](review.md): zero remaining Standards findings and zero remaining Spec findings. The initial ADR-conflict documentation and row-position issues were corrected and re-reviewed. The latter was reproduced by a failing browser coordinate assertion before the fixed footer slot was added. Notices now remain until reopening, with the saved count still visible and inspection reserving the same space.

## Visual evidence

[Production preview](preview.html) embeds the real popup sources with disposable sample storage. [Screenshot](production-preview.jpg) shows three-Account slides, the Active detail with no unwanted scrollbar, and a four-Account Compact table with the six-minute reset first and the true Updated age intact.

Disposable adapters replace Chrome storage/runtime and provide a controlled clock. They are injected only by the QA server; no fixture code is included in the extension popup. These checks do not access installed extension storage or prove a new real Claude capture. Existing capture integration remains separately tested.

## Handoff

Reload the unpacked extension to apply the changed popup/shared scripts. This task updates production sources; it does not install/publish a new archive. Forget/Undo and final integrated release packaging remain tickets 04/05. Existing unrelated work is excluded from the scoped commit.

## Usage-label clarification

2026-10-24: At the user's request, dormant details now say **Last recorded usage**, so the observed percentage cannot be confused with remaining quota. The shared renderer covers slides and table inspection. The selected prototype was updated to match. All 105 lifecycle checks pass with the revised expected label; production JavaScript syntax passes. Both themes fit the longer label without horizontal or vertical overflow in the 196px detail column. [Dark-theme screenshot](usage-label-dark.jpg).
