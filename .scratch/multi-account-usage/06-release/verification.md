# QuotaBeacon release preparation verification

Date: 2026-10-22. Starting commit: `d3ce036`. User approved preparing a separate extension with the existing popup redesign and badge changes; final selected name: **QuotaBeacon**.

## Package

- New-item identity: QuotaBeacon, version 1.0.0. No manifest key or update URL ties it to the legacy listing.
- Local artifact: `quotabeacon-1.0.0.zip` in this directory. The generated ZIP is a workspace deliverable, not a committed binary; rebuild instructions are in [release QA](../../../docs/release/manual-qa.md).
- SHA-256: `3098430F47C3426853FA46EE0C14FF176A8D6FCF2B0D65313C6A38FB9AC6193B`.
- Exactly 14 runtime files: manifest; worker; two content scripts; five popup files; shared Account module; timezones; three icons. The manifest is at the ZIP root.
- Read every ZIP entry and compared its SHA-256 with its working source. All 14 match. No tests, fixtures, documentation, screenshots, Git data or legacy promotional graphics are in the ZIP.

## Checks

- `node --test tests/*.test.js`: all 30 tests pass.
- Individual completion-capture and worker-maintenance test files pass.
- `node --check`: all runtime and test JavaScript passes. No separate typechecking/build configuration exists.
- `git diff --check`: clean.
- Browser smoke check uses the **extracted ZIP's actual popup files**, with disposable development storage/status fixtures. Title is QuotaBeacon. Active and second Account pages render correctly, including inline reading age. Outage shows “Outage,” “Partial · Claude AI” and the incident line; peak shows “Peak” and its countdown. The checked browser tab has no warning/error entries.
- Screenshots: [Active](screenshots/active.jpg), [second Account](screenshots/second-account.jpg), [outage](screenshots/outage.jpg).

The fixtures do not establish actual Chrome toolbar badge behavior or a real installation under the future store ID. The [release checklist](../../../docs/release/manual-qa.md) leaves those final checks and actual timestamp edits pending. It records ticket 03's real-site session/name assumptions separately, including the user's HTTP 200 and `namePresent: true` result.

No new tests were added for documentation or metadata. The approved Account, completion-capture and alarm-to-storage/icon tests were reused. The popup redesign and blink implementation already existed in the working tree and were included with the user's authorization.

The README and design reference now describe usage-driven icon colors, AI-only defaults, multiple Accounts, username labels, inline age, expiry, cleanup and reset. Privacy wording discloses local names/readings, same-origin organization requests, public status requests and Chrome-synced preferences. Domain terms are unchanged; CONTEXT.md's product heading is updated.

The old store listing was not changed. No new store listing, hosted policy, submission, publication or unpublishing action has been performed. New store artwork and final manual package QA remain publisher steps, as listed in the checklist.

Review: Spec found no issues. Standards found no documented-standard breaches and one minor redundant constant-returning outage-label helper. Removed the helper, rebuilt the ZIP, and rechecked its Outage/severity/detail view in the browser with no warnings/errors.

Final re-review: Standards 0 remaining findings; Spec 0 findings.
