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
- Detailed dormant views retain the existing three-hour `~0% estimated` duration, then No recent reading, plus Last reset / Last recorded / Updated facts.
- Estimates, time passing and browsing never write Usage readings or change Active/toolbar rules.

The current prototype default used for production is the 15-minute table estimate/priority policy. Its optional three-hour table-estimate selector remains an exploration comparison, not production UI. The existing three-hour **detail** policy is independent.

## Next work

Review the installed popup after reloading the unpacked extension. Ticket 03a is implemented; it does not rebuild/install/publish a release archive. Continue [04: Forget/Undo](issues/04-forget-undo-and-account-rediscovery.md), then [05: integrated verification/package](issues/05-verify-and-package-account-overview.md) when requested. Four-to-three becomes table-to-slides; three-to-two remains slides.

Tickets 01–03 were completed previously. The third-Account capture bug #08 was separately fixed and live-verified on 2026-10-23; current disposable popup fixtures are not new live capture evidence. Existing unrelated untracked files must not be staged wholesale.

## Reproduce

Run `python .scratch/account-overview/03-validation/serve.py` from the repo root (Windows sandbox may require the authorized loopback-server escalation). Open the [production checks](http://127.0.0.1:8766/.scratch/account-overview/03-validation/checks.html) or [production preview](http://127.0.0.1:8766/.scratch/account-overview/03a-validation/preview.html). These use disposable sample storage, never real extension readings.

The selected [prototype](reset-time-exploration/prototype.html) remains as design history. Do not restart design exploration or ask which variant was selected.
