# 04: Forget Accounts, Undo, and rediscover later readings

**What to build:** Let users remove a non-Active Account from the remembered list, confirm the action, Undo it, and track that Account again when a new Usage reading arrives. The layout adjusts immediately as the Account count crosses the table threshold.

**Blocked by:** 03 and 03a (the table/detail flow and its later navigation/reset refinements).

**Status:** ready-for-agent

## Context

Read the [continuation brief](../continuation.md) and [03a follow-up](03a-account-overview-refinements.md) first. Later user decisions supersede the old threshold: 1–3 total Accounts use slides, and 4+ use Active plus a table. Therefore four-to-three replaces the table with slides; three-to-two remains slides. Ticket 03a is implemented; preserve its 15-minute table estimate/priority and three-hour detail policy.

Read the [approved spec](../spec.md), [approved prototype](../prototype/approved-design.html), and [retention decision](../../../docs/adr/0004-remember-accounts-and-show-observed-usage.md). Forgetting the Active account individually is out of scope; reset-to-default still clears all Accounts.

This slice must go through persisted extension storage and the real capture/refresh path, not just remove a rendered row. Preserve the single Account-rule module and avoid reintroducing automatic deletion.

## Acceptance criteria

- [ ] Non-Active table rows expose Forget account through their action menu. Non-Active slides at two or three total Accounts expose it in the name-row menu without adding a footer row or moving lower controls.
- [ ] Confirmation identifies the Account and states that a later Usage reading can add it again; Cancel leaves both storage and display unchanged.
- [ ] Confirming Forget removes that Account's saved state locally and refreshes the real popup. Active and the toolbar remain unchanged.
- [ ] Undo restores the removed Account and reading without overwriting a newer captured reading or undoing an unrelated storage update.
- [ ] A subsequent Usage reading from a forgotten Account recreates it and makes it Active through the existing latest-reading rules. Forget is not a permanent block.
- [ ] A delayed label fetch cannot resurrect a forgotten Account or change Active. Competing reading/label/Undo updates do not lose unrelated Accounts.
- [ ] Four to three Accounts replaces the table with three detailed slides and shared lower controls. Undo returns to the table at four; three to two stays slides.
- [ ] Two to one Account removes navigation and leaves the single-Account view. A later reading or Undo restores the appropriate count-dependent navigation.
- [ ] Confirmation, feedback, Undo, rediscovery, and count transitions retain the exact 260 by 340px outer bounds. Longer content scrolls inside.
- [ ] Behavioral tests exercise real persisted forget/restore/reading interactions and threshold transitions, including a fresh reading arriving before Undo and a delayed label result after Forget.
- [ ] Browser verification covers row menus, cancellation, confirmation, Undo, keyboard focus, both themes, and a complete forgotten-Account rediscovery flow. Synthetic capture is labeled as such.

## Verification

Prefer existing Account/storage/capture seams and meaningful user flows over implementation-mirroring tests. Verify four-to-three and three-to-two transitions and Undo against the actual production popup, then replay a new reading for the forgotten identity through the real bridge/storage path.

## Comments

2026-10-22: Created from the finalized Account overview design. Not implemented.
