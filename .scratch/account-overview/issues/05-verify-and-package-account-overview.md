# 05: Verify the complete Account overview and prepare its release package

**What to build:** Produce a verified production extension and updated release package implementing the approved design, with accurate documentation and evidence for the real multi-Account capture flow.

**Blocked by:** 04 (all feature slices transitively); external bug [multi-account-usage #08](../../multi-account-usage/issues/08-third-account-not-captured.md) for final live capture verification and release readiness.

**Status:** ready-for-agent

## Context

Read the [continuation brief](../continuation.md) and [03a follow-up](03a-account-overview-refinements.md) first. Include 03a in the feature-completion prerequisite and verify the revised four-total-Account table threshold, three-Account slides, Compact reset typography, natural detail fit, and the finally approved recent-reset estimate/order policy. Include four Accounts explicitly in the rendered-count matrix. Older design text below is superseded where these later decisions conflict.

Read the [approved spec](../spec.md), [frozen approved prototype](../prototype/approved-design.html), and the linked capture bug. The final approved design replaces prior 48-hour cleanup and inferred-full-quota rules. Prototype fixtures establish the intended UI, not a fix for a real capture failure.

Feature implementation can proceed independently of bug #08. This final ticket cannot be declared complete while the reported failure remains unverified. Actual store submission/publication is outside this ticket.

## Acceptance criteria

- [ ] All feature slices are complete and their acceptance evidence is available; run the relevant existing and new behavioral tests and runtime syntax/whitespace checks.
- [ ] Verify the real rendered popup with 0/1/2/3/4/64 remembered Accounts, both themes, long labels, expired readings, search/no matches, row inspection/Back, incoming readings, confirmation/Undo, and rediscovery.
- [ ] Confirm 260 by 340px dimensions throughout; the two/three-Account lower controls stay aligned, larger-list status/preferences placement matches the approval, and long content scrolls internally.
- [ ] Compare production screenshots with the approved first page, two-Account second page, and final table/footer; ship no historical picker, fake browser strip, sample identities, or demo controls.
- [ ] Bug #08 has its own exact reproduction, root-cause fix, regression evidence, and a real three-distinct-Account capture verification. The third Account becomes Active and all readings remain remembered after a real reply.
- [ ] Existing status, peak-hours, outage, badge, tooltip, toolbar, reset, and preference behavior passes appropriate regression/manual checks. Clearly separate live evidence from fixtures and leave genuinely unchecked scenarios marked pending.
- [ ] Domain and release documentation describes permanent retention, explicit forgetting, unknown current usage after observed expiry, and the count-dependent popup layout. Update superseded descriptions, including the Expired reading definition and the implementation-pending ADR note.
- [ ] Rebuild the extension ZIP from an explicit runtime allowlist and verify its contents against production sources. Exclude prototypes, tickets, tests, screenshots, Git data, and other development artifacts.
- [ ] Record the package identity, checksum, test results, screenshots, remaining publisher steps, and real-capture evidence. Do not imply that a rebuilt ZIP was installed, submitted, or published unless that separately authorized action occurred.

## Verification

Reuse the repository's release preparation practice and behavioral tests; extend the checklist for the approved feature. Final capture evidence must exercise the actual extension/site/storage/popup path. Do not mark this ticket complete based solely on prototype screenshots or a positive-control replay.

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented. Bug #08 is an external final-verification dependency, not a blocker for starting feature slices.
