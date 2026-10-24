# 05: Verify the Account overview and prepare the complete release candidate

**What to build:** Prepare a tested QuotaBeacon release candidate, accurate product/privacy documentation, store-ready text and images, and a verified ZIP. Complete this preparation autonomously before the user performs [ticket 06: manual launch](06-manual-repository-migration-and-store-launch.md).

**Owner:** Agent; autonomous preparation. This planning update does not start implementation.

**Blocked by:** None. Tickets 01–04, including 03a and the latest 04 refinements, are implemented. The [third-Account capture bug #08](../../multi-account-usage/issues/08-third-account-not-captured.md) was fixed and reporter-verified on 2026-10-23; final packaged-build live checks belong to 06.

**Status:** ready-for-human

## Context and completion boundary

Read the [continuation brief](../continuation.md), [approved spec](../spec.md), [03a follow-up](03a-account-overview-refinements.md), and [finalized 04 requirements](04-forget-undo-and-account-rediscovery.md). Later user amendments and their production evidence take precedence over the frozen prototype: queue continuation after Forget, softened red/white destructive buttons, complete footer replacement during Undo, and the 16px bottom inset are already implemented. Do not reopen design exploration or reimplement completed feature slices.

Existing [03a](../03a-validation/verification.md), [04](../04-validation/verification.md), [refinement](../04-validation/refinements-verification.md), [footer](../04-validation/footer-replacement.md), and #08 evidence should be reused where still valid. Rerun checks needed to validate the final artifact and any new fixes; do not duplicate completed investigations without a new failure or changed behavior.

Completion means **release candidate prepared**, not installed/live-verified/submitted/published. Record existing live evidence accurately and leave new signed-in/package/Store checks pending in 06. User decisions, GitHub changes, policy hosting and Store actions are owned only by 06; cross-link them rather than duplicating their checklist here.

## Acceptance criteria — autonomous work

### Production verification

- [x] All feature evidence is linked; relevant behavioral tests and runtime syntax/whitespace checks pass against the release candidate. New defects discovered during preparation are addressed and verified.
- [x] Verify the actual production popup with 0/1/2/3/4/64 remembered Accounts, both themes, long labels, observed/estimated/unknown usage, reset boundaries, search/no matches, row inspection/Back, frozen rows, incoming readings, confirmation, Undo/expiry, rediscovery and count transitions.
- [x] Confirm 260 × 340px bounds, aligned lower controls on small-count slides, internal long-table scrolling, and the latest approved navigation/footer behavior. Compare production screenshots with the applicable approved references, not superseded prototype states.
- [x] Status, peak-hours, outage, badge, tooltip, toolbar, reset and preferences pass appropriate automated/disposable-fixture regressions. Record simulated conditions as simulated; prepare only the remaining human-run checks for 06.
- [x] Reference #08's reproduction, fix, regression and reporter verification. Preserve coverage for both completion transports and three distinct Accounts; synthetic replays must not be labelled new live capture evidence.

### Product and privacy documentation

- [x] Update README, domain/design docs and release notes to describe current behavior: indefinite retention until Forget/reset, honest expiry estimates and unknown usage, actual reading age, one-to-three slides/four-plus table, and the latest 04 refinements. Correct the Expired reading definition, outdated implementation-pending notes and obsolete 48-hour deletion claims, preserving historical ADR context as appropriate.
- [x] Prepare a publication-ready QuotaBeacon privacy policy locally, based on actual code and data flows. Cover Account IDs/names (including possible emails), quota/reset/reading timestamps and temporary Undo recovery; local retention/deletion and rediscovery; preference syncing; HTTPS status/organization requests and existing signed-in Claude session use; whether prompts/replies, analytics, advertising or developer servers are involved. Do not claim no user-data handling merely because processing is local.
- [x] Prepare consistent dashboard data-use declarations and the Limited Use statement. Assess actual stored-data protection, content-script access, and network handling against current policy requirements; do not assume local storage alone establishes compliance or claim unverified encryption. Address technical findings and document genuine remaining owner decisions for 06.
- [x] Draft the policy and other copy without requiring supervision for routine wording. Use known product/publisher facts; flag only genuinely unknown legal/contact/ownership details for final confirmation in 06. Do not publish a policy URL or edit the existing hosted legacy policy in this ticket.

### Store content and policy review

- [x] Prepare the final store title/short and detailed descriptions, category/language recommendation and narrow single-purpose statement covering Claude quota and service availability. State captured-reading limitations accurately; make no official Anthropic endorsement or continuously live quota claim.
- [x] Prepare justifications for each actual API/host permission and the remote-code declaration. Audit minimum permissions, packaged executable logic, code readability, secure data use, accurate branding and existing licence/attribution obligations. Remove unnecessary access and resolve actionable technical issues; defer owner licence choices to 06.
- [x] Prepare compliant required listing assets: 128 × 128 PNG icon and one to five 1280 × 800 screenshots of current production behavior with safe sample identities. Exclude labs/pickers and real personal data. Optional video/promo tiles are not a prerequisite and need not be created unless justified by the release brief.
- [x] Prepare reviewer instructions for reaching a Usage reading, comparing Accounts, and exercising Forget/Undo, including any Claude access/plan limitations. Prepare the user-facing live/package checklist and launch handoff for 06 without creating accounts, sharing credentials or operating a real signed-in session.

### Package and handoff

- [x] Build the extension ZIP from an explicit runtime allowlist with `manifest.json` at its root. Validate manifest metadata/version/description length, runtime paths, required assets and applicable notices. Exclude prototypes, tickets, tests, screenshots, Git data, secrets and other development artifacts.
- [x] Verify ZIP contents against production sources and exercise the extracted artifact through agent-runnable checks. Record package filename, version, source revision and SHA-256 checksum, test results, screenshots, policy findings and the prepared copy/assets. Do not assume an old ZIP includes the final changes.
- [x] Deliver one handoff linking these artifacts to 06. Mark signed-in live QA, final hosted URLs, owner choices and publication as pending there. If a later manual decision changes runtime/package contents, rebuild and revalidate through 05 before upload; never hand-edit the ZIP or reuse a stale checksum.

## Current primary references

Recheck these at implementation because Store requirements can change. This is a preparation checklist, not a claim of Google approval.

- [Prepare/package](https://developer.chrome.com/docs/webstore/prepare), [listing fields/assets](https://developer.chrome.com/docs/webstore/cws-dashboard-listing), [image requirements](https://developer.chrome.com/docs/webstore/images).
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy), [local-data/privacy/security FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), [Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use).
- [Single purpose](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines), [minimum permissions](https://developer.chrome.com/docs/webstore/program-policies/permissions), [MV3 code requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements), [code readability](https://developer.chrome.com/docs/webstore/program-policies/code-readability), [branding/IP](https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property).
- [Reviewer instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions), [review process](https://developer.chrome.com/docs/webstore/review-process).

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented. Bug #08 is an external final-verification dependency, not a blocker for starting feature slices.

2026-10-24 PLAN APPROVED: User confirmed the split into autonomous release preparation in 05 and manual launch steps in 06, to be done last. Expanded the existing criteria in place, moved human-only execution to the linked ticket, and corrected #08's obsolete blocker wording. No release preparation, code/privacy-policy changes, GitHub operations or publication started with this planning update. The earlier unresolved-#08 comment above is historical.

2026-10-24 IMPLEMENTED: Release candidate prepared on feature-usagebar. See [single handoff](../05-release/HANDOFF.md), [verification](../05-release/verification.md), [package identity/checksum](../05-release/package.json), prepared policy/Store copy/assets and extracted-artifact evidence. 64 Node tests and 393 browser assertions pass. Storage audit findings addressed with AES-256-GCM Account/recovery persistence, trusted-context storage access and capture-command restrictions; unused web-accessible resource access removed and icon sizes corrected. Final Standards/Spec review is recorded in the release review. Signed-in package QA, publisher/ownership/contact/URLs, hosting, GitHub migration and Store actions remain pending only in 06. No publication or new live capture evidence is claimed.
