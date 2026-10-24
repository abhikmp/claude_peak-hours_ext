# Account overview — resume here

Updated: 2026-10-24. Branch: `feature-usagebar`.

The user explicitly authorized bringing every finalized prototype refinement into production. Ticket [03a](issues/03a-account-overview-refinements.md) implements these refinements; [verification and evidence](03a-validation/verification.md) describe the production-source checks. Earlier prototype-only restrictions are historical.

## Production behavior

- One Account: one detail view, no navigation.
- Two or three total Accounts: one detailed slide per Account, aligned status/preferences. Three Accounts have three dots/slides.
- Four or more: Active detail first, then a searchable table of every other Account (at least three initially).
- Fixed 260 × 340px. Ordinary and dormant details fit naturally after changing the five preference gaps from 9px to 7px. Long tables retain internal scrolling.
- Selected Compact table: Account / Used / Reset; upcoming captured reset `in …`, past captured reset `… ago`. Reset text uses the existing system font, 11px, regular 400. Exact captured date/year/timezone is available via title and accessible explanation.
- For the first 15 minutes after the captured reset, table usage is green `~0%`, explicitly explained as an estimate. At exactly 15 minutes it becomes a dash. Actual Updated age and raw observations remain unchanged.
- On table opening: recent resets first, newest reset first; then other non-Full Accounts by actual latest reading; then still-Full Accounts by soonest reset. Active remains page one. Ordinary slide ordering remains unchanged.
- Open table membership, order and row identity remain frozen through readings, expiry and inspection. Values/Active update immediately. Notices explain that order/priority updates on reopening. Back restores search/scroll and keyboard access.
- Detailed dormant views retain the existing three-hour `~0% estimated` duration, then No recent reading, plus Last reset / Last recorded usage / Updated facts.
- Estimates, time passing and browsing never write Usage readings or change Active/toolbar rules.

The current prototype default used for production is the 15-minute table estimate/priority policy. Its optional three-hour table-estimate selector remains an exploration comparison, not production UI. The existing three-hour **detail** policy is independent.

## Ticket 04 complete — ticket 05 is next

Latest user refinements on 2026-10-24 are implemented: both Forget controls have softened red fills and white text; removal continues to the next Account in the browsed queue rather than jumping to Active. Existing tables remain open while four or more Accounts remain; table→slides follows the frozen row successor, with a previous-Account fallback at the end. See [refinement verification](04-validation/refinements-verification.md). These user amendments supersede the original prototype's button styling and removal navigation.

The user requested implementation on 2026-10-24. The entire [finalized ticket 04](issues/04-forget-undo-and-account-rediscovery.md) is now implemented in production, tested and independently reviewed. See [production verification](04-validation/verification.md), [Standards/Spec review](04-validation/review.md), and the [production preview](04-validation/preview.html). Status is ready-for-human for review after reloading the unpacked extension.

Final choices: **Dialog** confirmation; **vertical ⋮ menus at the far right after Reset**; **no visible table scrollbar**, with scrolling preserved; Undo notification **fixed to the same lower slot on all pages** (16px side insets, 30px from bottom, 228 × 32px); **2,500ms deadline** and **2px linear shrinking bottom line**, with reduced-motion time-left text. Navigation, theme, inspection and reopening preserve the original deadline. Expiry/dismiss ends Undo; a second removal starts its own complete window. The 1–5 second slider and other demo controls remain prototype-only and must not ship.

Production uses one service-worker mutation queue across every tab and the popup for reading/label/Forget/Undo/clear and recovery lifecycle operations. Recovery retains the exact raw observation; newer rediscovered readings win. First display after successful removal activates the original 2,500ms deadline, so storage latency cannot shorten the visible interval. Reopening preserves that deadline, and Undo inserts the restored Account into an already-open table even without the original popup's browsing context. Reset and dismiss end recovery. All Compact/reset/layout rules above, including **Last recorded usage**, are retained. The [selected Dialog prototype](04-prototype/prototype.html?v=3) remains design history; [04 production checks](04-validation/verification.md) now supply implementation evidence.

Next sequence: **05** handles final integrated release verification, release docs and packaging. Four-to-three becomes table-to-slides; three-to-two remains slides. Ticket 04 produced no release package or publication. Its verification contains 57 passing Node tests, 305 new browser assertions and 438 existing production regression assertions, plus the two-axis review with zero remaining findings.

Tickets 01–03a were completed previously. The third-Account capture bug #08 was separately fixed and live-verified on 2026-10-23; disposable popup fixtures are not new live capture evidence. Preserve existing unrelated untracked files and do not stage them wholesale.

## Reproduce

Run `python .scratch/account-overview/04-validation/serve.py` from the repo root (Windows sandbox may require the authorized loopback-server escalation). Open the [production matrix](http://127.0.0.1:8767/.scratch/account-overview/04-validation/checks.html?matrix=1), [lifecycle checks](http://127.0.0.1:8767/.scratch/account-overview/04-validation/checks.html?advanced=1), [accessibility checks](http://127.0.0.1:8767/.scratch/account-overview/04-validation/extra.html), or [production preview](http://127.0.0.1:8767/.scratch/account-overview/04-validation/preview.html). The same server also runs the earlier 01/02/03 check pages against the current worker/runtime path. These use disposable sample storage, never real extension readings.

The selected [prototype](reset-time-exploration/prototype.html) remains as design history. Do not restart design exploration or ask which variant was selected.
