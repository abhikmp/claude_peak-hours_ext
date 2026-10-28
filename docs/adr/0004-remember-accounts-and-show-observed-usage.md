# Remember Accounts until forgotten, and distinguish observations from current usage

Status: implemented, 2026-10-24, including approved 03a/04 amendments.

Supersedes ADR-0003's automatic 48-hour deletion and inference that an Expired reading establishes full current quota. Production retains the actual observations and age, with later-approved bounded estimates (15-minute table / three-hour detail), then unknown usage.

## Decision

Keep remembered Accounts until explicitly forgotten or cleared through reset-to-default. Show reading age. An Expired reading establishes only that the observed Quota window has ended: show Window ended and unknown current usage, preserving the last observed percentage in detail. A subsequent Usage reading updates the Account normally or rediscovers it after forgetting.

The implemented Account overview uses a fixed 260px by 340px popup. Two or three Accounts have detailed slides and shared lower controls. Four-plus use a searchable table with frozen open rows. Forget includes Dialog confirmation, queue continuation and a fixed 2.5-second Undo replacing the complete footer. These later approved 03a/04 amendments supersede the original three-Account table threshold.

## Rationale and tradeoff

Automatic deletion removes infrequently used Accounts precisely when users want a comparison across many Accounts. Retention preserves that utility but also retains stale readings; explicit age and honest unknown-usage states avoid presenting those observations as current facts. A passed reset time does not prove the Account has not been used since the last observed reading.

## Alternatives

- Keep 48-hour deletion: rejected because infrequent Accounts disappear without an explicit user action.
- Display unqualified 0% after an observed reset: rejected because it implies known current usage. Later bounded estimates are explicitly labelled, never saved as observations.
- Permanently block forgotten Accounts: rejected; forgetting clears a saved observation and does not disable later tracking.

## Scope and reference

Individual forgetting remains limited to non-Active Accounts. Latest-reading Active and local-only retention remain. The release adds authenticated encryption and trusted-context storage access without changing these semantics. See the [implemented design](../../design.md) and [release verification](../release/verification.md). The third-Account capture bug was fixed and reporter-verified on 2026-10-23; publication work is tracked in the [launch checklist](../release/launch-checklist.md).
