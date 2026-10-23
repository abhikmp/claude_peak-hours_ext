# Account overview implementation tickets

**Resume here: [continuation brief](continuation.md) and [ticket 03a](issues/03a-account-overview-refinements.md).** They capture the user's later decisions and pending recent-reset prototype work without requiring the chat history.

Source: [approved design spec](spec.md), with later refinements recorded in the continuation brief. Tickets 01–03 are implemented and verified as of 2026-10-23. Ticket 03a is implemented as of 2026-10-24; tickets 04/05 are not implemented. Ticket 01 also has the user's final installed-extension visual confirmation.

| Ticket | Delivers | Blocked by |
| --- | --- | --- |
| [01: Retention and honest expiry](issues/01-retain-accounts-and-show-observed-usage.md) | Accounts remain remembered; dormant details show a labeled estimate and historical reading facts | None |
| [02: Fixed popup and two-Account paging](issues/02-fixed-popup-and-two-account-navigation.md) | 260 by 340px popup, real preferences, shared lower controls for two Accounts | None |
| [03: Searchable table and row details](issues/03-searchable-account-table-and-details.md) | Many-Account comparison, search, Back restoration, stable refresh ordering | 01, 02 |
| [03a: Navigation, reset estimates and ordering](issues/03a-account-overview-refinements.md) | 1–3 slides / 4+ table, selected Compact refinements, recent-reset availability and priority | Complete; production review |
| [04: Forget, Undo, and rediscovery](issues/04-forget-undo-and-account-rediscovery.md) | Persisted removal/restoration, later capture, and count-threshold transitions | 03, 03a |
| [05: Verify and package](issues/05-verify-and-package-account-overview.md) | Production verification, accurate docs, and rebuilt release package | 03a, 04; #08 capture prerequisite verified |

Tickets 01–03 have Status: ready-for-human for completed implementation handoff, with [ticket 01 evidence](01-validation/verification.md), [ticket 02 evidence](02-validation/verification.md), and [ticket 03 evidence](03-validation/verification.md). Ticket 03a is ready-for-human for production review after reloading the unpacked extension; see [03a evidence](03a-validation/verification.md).

The [third-Account capture bug #08](../multi-account-usage/issues/08-third-account-not-captured.md) was fixed and live-verified on 2026-10-23 in its own ticket. Its earlier needs-info/release-blocker notes are historical. Ticket 05 still requires final integrated capture/release QA; ticket 01's disposable fixtures are not live capture evidence.

Remaining sequence: review [04's current Compact Forget-flow prototype](04-prototype/prototype.html), finalize confirmation and Undo behavior, implement 04, then 05. The user requested design first on 2026-10-24; ticket 04 has no production changes. The threshold is four total Accounts: four-to-three becomes table-to-slides, while three-to-two remains slides. Tickets 04/05 use these updated thresholds. No store publication is authorized by this index.
