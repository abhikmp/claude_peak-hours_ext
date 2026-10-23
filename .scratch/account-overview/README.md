# Account overview implementation tickets

Source: [approved design spec](spec.md). Design approved on 2026-10-22. Tickets 01 and 02 are implemented and verified as of 2026-10-23; tickets 03–05 are pending. Ticket 01 also has the user's final installed-extension visual confirmation. Each ticket is a separate, verifiable behavior slice and carries its own acceptance criteria.

| Ticket | Delivers | Blocked by |
| --- | --- | --- |
| [01: Retention and honest expiry](issues/01-retain-accounts-and-show-observed-usage.md) | Accounts remain remembered; dormant details show a labeled estimate and historical reading facts | None |
| [02: Fixed popup and two-Account paging](issues/02-fixed-popup-and-two-account-navigation.md) | 260 by 340px popup, real preferences, shared lower controls for two Accounts | None |
| [03: Searchable table and row details](issues/03-searchable-account-table-and-details.md) | Many-Account comparison, search, Back restoration, stable refresh ordering | 01, 02 |
| [04: Forget, Undo, and rediscovery](issues/04-forget-undo-and-account-rediscovery.md) | Persisted removal/restoration, later capture, and count-threshold transitions | 03 |
| [05: Verify and package](issues/05-verify-and-package-account-overview.md) | Production verification, accurate docs, and rebuilt release package | 04; #08 capture prerequisite verified |

Tickets 01 and 02 have Status: ready-for-human for completed implementation handoff, with [ticket 01 evidence](01-validation/verification.md) and [ticket 02 evidence](02-validation/verification.md). Tickets 03–05 remain ready-for-agent. The next unblocked ticket is **03**.

The [third-Account capture bug #08](../multi-account-usage/issues/08-third-account-not-captured.md) was fixed and live-verified on 2026-10-23 in its own ticket. Its earlier needs-info/release-blocker notes are historical. Ticket 05 still requires final integrated capture/release QA; ticket 01's disposable fixtures are not live capture evidence.

Remaining sequence for a single implementer: 03, 04, then 05. No further ticket implementation or store publication is authorized merely by this index.
