# Account overview implementation tickets

**Resume here: [ticket 06 — manual migration and launch](issues/06-manual-repository-migration-and-store-launch.md).** Ticket 05 has prepared the [release candidate/handoff](05-release/HANDOFF.md), with verification, policy/copy/assets and ZIP/checksum. Ticket 04 is implemented, tested and reviewed; see [04 production evidence](04-validation/verification.md) and the [continuation brief](continuation.md).

Source: [approved design spec](spec.md), with later refinements recorded in the continuation brief. Tickets 01–03 are implemented and verified as of 2026-10-23. Tickets 03a and 04 are implemented as of 2026-10-24; tickets 05 and 06 remain. Ticket 01 also has the user's final installed-extension visual confirmation.

| Ticket | Delivers | Blocked by |
| --- | --- | --- |
| [01: Retention and honest expiry](issues/01-retain-accounts-and-show-observed-usage.md) | Accounts remain remembered; dormant details show a labeled estimate and historical reading facts | None |
| [02: Fixed popup and two-Account paging](issues/02-fixed-popup-and-two-account-navigation.md) | 260 by 340px popup, real preferences, shared lower controls for two Accounts | None |
| [03: Searchable table and row details](issues/03-searchable-account-table-and-details.md) | Many-Account comparison, search, Back restoration, stable refresh ordering | 01, 02 |
| [03a: Navigation, reset estimates and ordering](issues/03a-account-overview-refinements.md) | 1–3 slides / 4+ table, selected Compact refinements, recent-reset availability and priority | Complete; production review |
| [04: Forget, Undo, and rediscovery](issues/04-forget-undo-and-account-rediscovery.md) | Dialog, right-side vertical menus, hidden scrollbar, fixed lower 2.5-second Undo/countdown, persisted removal/restoration and rediscovery | Complete; ready-for-human production review |
| [05: Autonomous release preparation](issues/05-verify-and-package-account-overview.md) | Verification, product/privacy docs, store copy/assets, policy audit, ZIP/checksum and launch handoff | None; feature prerequisites and #08 fix complete; ready-for-agent |
| [06: Manual migration and launch](issues/06-manual-repository-migration-and-store-launch.md) | Owner decisions/account verification, real package QA, legacy preservation, GitHub migration, policy hosting and Store launch | 05; ready-for-human, done last |

Tickets 01–03 have Status: ready-for-human for completed implementation handoff, with [ticket 01 evidence](01-validation/verification.md), [ticket 02 evidence](02-validation/verification.md), and [ticket 03 evidence](03-validation/verification.md). Ticket 03a is ready-for-human for production review after reloading the unpacked extension; see [03a evidence](03a-validation/verification.md).

The [third-Account capture bug #08](../multi-account-usage/issues/08-third-account-not-captured.md) was fixed and live-verified on 2026-10-23 in its own ticket. Its earlier needs-info/release-blocker notes are historical. Ticket 05 reuses that evidence and prepares/verifies the release candidate; final signed-in/package/Store checks are in 06. Disposable fixtures are not new live capture evidence.

Remaining sequence: **05** is agent-owned preparation; **06** is the user's manual launch phase, done last. The linked tickets own their respective criteria; 05 completion means a prepared release candidate, not live verification or publication. No implementation, privacy-policy update, GitHub migration or Store action started with this planning update.

2026-10-24: Ticket 05 prepared and reviewed; see [handoff](05-release/HANDOFF.md). Earlier implementation-not-started planning text is historical. Ticket 06 remains pending and owns final signed-in package checks and manual launch; no Store or GitHub action has been performed.

Current product name: **ClaudeBuddy** (user-approved rebrand, 2026-10-24). Use the current handoff/package and [branding amendment](../claudebuddy-branding/brief.md); earlier QuotaBeacon references are historical.
