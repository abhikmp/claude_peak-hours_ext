# 04: Forget Accounts, Undo, and rediscover later readings

**What to build:** Let users remove a non-Active Account from the remembered list, confirm the action, Undo it, and track that Account again when a new Usage reading arrives. The layout adjusts immediately as the Account count crosses the table threshold.

**Blocked by:** None. Tickets 03 and 03a are complete; design finalized by the user on 2026-10-24.

**Status:** ready-for-agent

**Next action:** When the user next asks to implement ticket 04, implement **all finalized behavior below together** in production, including persistence, concurrency, capture integration, verification, review and a scoped commit. Do not reopen design selection, ask the user to repeat decisions, or deliver only part of this ticket. The user intends to resume in the morning; this update records the handoff and does not start production implementation now. No ticket 04 production changes have been made.

**Authoritative design:** [current Compact prototype, Dialog / v=3](../04-prototype/prototype.html?v=3), at commit `20a08bb`, with **Undo fixed at 2.5 seconds in production**. The duration slider is prototype-only. This finalized section supersedes earlier exploratory comments and older prototype/spec wording wherever they disagree.

## Finalized design and implementation contract

### Menus and confirmation

- Only non-Active Accounts can be forgotten. Use **vertical three-dot menus (⋮)**. In the table, put them in the **far-right action column after Reset**, matching the prototype's 20px column; the action header is visually hidden but accessible. Remove the old horizontal dots beside names. Non-Active slides and inspected details use the vertical name-row menu, without adding an action/footer row or moving lower controls.
- Hide the **visible table scrollbar and its reserved gutter**, while retaining internal wheel, trackpad, touch and keyboard scrolling. Do not disable scrolling, crop away Accounts, or introduce horizontal overflow. Search/header alignment must remain intact.
- Menu action: **Forget account**. Use the selected **centered Dialog** over a dimmed popup, not Anchored or Dedicated view confirmation. Match the existing theme, typography and compact sizing; stay inside the 260 × 340px popup, with long names wrapping/scrolling inside the dialog.
- Dialog copy: **“Forget [Account name]?”**, followed by **“A later Usage reading can add it again.”** Buttons: **Cancel** and **Forget account**, with the latter using the prototype's destructive styling.
- Focus Cancel initially. Keep Tab/Shift+Tab inside confirmation; Escape, Cancel and backdrop dismissal cancel without writing storage. Restore the originating menu control and preserve the query, scroll and browsing context. Background controls must be inert while confirmation is open.
- If a new reading makes the target Active while its menu/confirmation is open, close that action safely. Recheck eligibility against current persisted state when committing Forget; stale UI must not remove Active.

### Forget and truthful restoration

- Confirming Forget removes the Account's saved state through the real local storage path, then updates the real popup. Browsing/forgetting another Account must not change Active, its reading, toolbar color, badge or status.
- Preserve the exact removed raw reading for the temporary Undo offer: identity, label, observed percentage, captured reset, actual reading timestamp and reading-order tie information. Do not turn Undo into a new Usage reading or reset its Updated age.
- Undo restores only the forgotten Account into the **latest** stored state. Never overwrite an Account rediscovered with a newer reading, discard unrelated Accounts/updates, or roll back label changes/new readings elsewhere. Explain/announce that the newer reading was kept when applicable.
- A delayed label lookup must not resurrect a removed Account or change Active. Real subsequent capture can rediscover it normally; forgetting is not a permanent tracking block. Preserve the existing manifest-to-capture behavior and both supported completion transports.
- Reset-to-default clears remembered Accounts **and any pending Undo recovery state**; Undo cannot resurrect a reset. Keep existing reset/preference/status semantics.

### Undo duration, location and countdown

- **Final production duration: exactly 2,500ms (2.5 seconds).** Start when removal succeeds and the Undo notification becomes available. The earlier indefinite / five-second defaults are superseded. Ship no duration slider or user setting.
- Notification copy: **“Forgot [Account name]”**, **Undo**, and a dismiss × control. Long names truncate and expose the full label. Keep the same compact visual treatment as the approved prototype.
- **Always use the same lower slot on every page**, including Active, table, inspection and one/two/three-Account slides. Match the prototype: left/right 16px, bottom 30px, 228 × 32px at the standard popup bounds. Do not anchor it to the top/usage area, narrow it on page one, cover quota details, or move it when navigating. Do not add usage padding or shift preferences to make room. On detail pages this short-lived overlay may cover the preference footer; covered controls must not receive focus until it is gone.
- Show a **2px shrinking line along the notification's bottom edge**, linear from full remaining time to zero. Use transform-based motion and the existing colors. This indicates expiring Undo, not a loading request. Respect reduced motion with numeric time-left text instead of the moving line.
- Navigation, theme changes, inspection/Back, renders, incoming readings and reopening must **preserve the original deadline and remaining progress**; they cannot restart or extend the 2.5-second window. Reopening after expiry must not bring Undo back. The prototype slider can restart a countdown for experimentation only; that behavior/control does not ship.
- At expiry, remove the notification and Undo capability automatically; reject late Undo even if a callback was delayed. Dispose of expired recovery state. Expiry does not restore the Account, redraw/reorder underlying rows, move controls, or steal unrelated focus. If focus was inside the disappearing notification, return it to an appropriate visible control.
- Dismiss ends the current Undo offer. A second successful Forget replaces the first offer and starts its **own complete 2.5-second window**. An earlier timer must never dismiss or undo the replacement operation.
- “Permanent” means the old saved observation can no longer be recovered with Undo after that offer ends. A later real Usage reading can still rediscover the Account; never introduce a permanent blocklist.

### Layout, transitions and previous decisions to preserve

- Fixed **260 × 340px** in all states and both themes. Zero Accounts keep the existing no-reading state; one has no navigation; two/three have one detail slide per Account with aligned status/preferences; four or more have Active plus a searchable table of all the others. Three Accounts require three dots/slides. The table initially has at least three non-Active Accounts.
- **Four → three** changes table to slides; **three → two** stays slides; **two → one** removes navigation. Undo or new capture reconciles counts immediately, including returning to table mode at four. Preserve useful browsing/search/scroll context where still applicable.
- Keep Compact **Account / Used / Reset** (plus the accessible action column), 11px regular reset values, `in …` for upcoming captured reset and `… ago` for past captured reset, and full captured date/year/timezone explanations. Keep actual reading age under the name and the clarified **Last recorded usage** detail label.
- Preserve the **15-minute** table estimate/priority window: green explicitly estimated `~0%` until strictly before 15 minutes after the captured reset, then unknown usage. Order recent resets newest reset first, other non-Full Accounts by true reading recency, and still-Full Accounts last by soonest reset. Active stays first separately; ordinary slide ordering stays unchanged.
- Preserve the independent **three-hour detail estimate**, then No recent reading with Last reset / Last recorded usage / Updated facts. Never persist estimates or invent a later reset/reading timestamp.
- Preserve frozen open-table row identity/membership/order through readings, clock expiry and inspection; update displayed values and Active immediately, and reorder on reopening. Explicit Forget/Undo/count reconciliation intentionally changes membership; do not move unrelated rows needlessly. Keep Back/Escape/search/scroll restoration, status above secondary content, real preference behavior, theme access, long-name safety and keyboard accessibility.
- Ordinary details must continue fitting naturally without the previously rejected scrollbar. Long tables remain internally scrollable with their scrollbar hidden as above.

### Deliver as one complete implementation

- Read this ticket, the current prototype and continuation brief; **do not require chat-history reconstruction or another design round**. Carry out the whole authorized slice when the user asks to implement. Internal testing, review and repairs are part of that work, not a reason to hand back a partial implementation.
- Use shared Account rules and a safe mutation boundary. The existing bridge serializes whole-map writes only within each tab; simply adding a competing popup read/modify/write is insufficient. Serialize or otherwise reconcile reading, label, Forget, Undo and clear operations across their real storage contexts so none loses unrelated updates. Choose the implementation approach without reopening finalized UX.
- Test the agreed shared Account, persisted storage and manifest-to-capture/popup seams. Cover both themes; 0/1/2/3/4/64 Accounts; confirmation/Cancel; Active guards; concurrent updates; delayed labels; newer readings before Undo; rediscovery; count transitions; automatic expiry; stale/late Undo; independent replacement timers; progress/deadline continuity across page changes/reopening; focus; fixed bounds; hidden-bar scrolling; and unchanged retained-reading/toolbar behavior.
- Prototype evidence is **152 passing browser checks**, [results](../04-prototype/browser-results.txt), with equal Undo bounds in [table](../04-prototype/undo-countdown-table.jpg) and [Active](../04-prototype/undo-countdown-active.jpg). Baseline production has 45 passing Node tests from 03a. Re-run appropriate production regressions and the full suite at completion; prototype checks alone are not production proof. Label synthetic replay as synthetic and distinguish it from any live Claude capture.
- Complete the implement skill's Standards/Spec review, resolve findings, update tickets/evidence and commit only this work on the current branch. Do not stage existing unrelated untracked files.
- Ship none of the picker, alternate confirmation variants, timer slider, seed identities, fake runtime, sample clock, preview controls or QA machinery in production. Release packaging/publication remains ticket 05.

## Context

Read the [continuation brief](../continuation.md) and [03a follow-up](03a-account-overview-refinements.md) first. Later user decisions supersede the old threshold: 1–3 total Accounts use slides, and 4+ use Active plus a table. Therefore four-to-three replaces the table with slides; three-to-two remains slides. Ticket 03a is implemented; preserve its 15-minute table estimate/priority and three-hour detail policy.

Read the [approved spec](../spec.md), the **current Dialog prototype linked above**, and [retention decision](../../../docs/adr/0004-remember-accounts-and-show-observed-usage.md). The older frozen prototype is historical where it conflicts with the finalized section above. Forgetting the Active account individually is out of scope; reset-to-default still clears all Accounts.

This slice must go through persisted extension storage and the real capture/refresh path, not just remove a rendered row. Preserve the single Account-rule module and avoid reintroducing automatic deletion.

## Acceptance criteria

- [ ] Non-Active table rows expose Forget account through their action menu. Non-Active slides at two or three total Accounts expose it in the name-row menu without adding a footer row or moving lower controls.
- [ ] Confirmation identifies the Account and states that a later Usage reading can add it again; Cancel leaves both storage and display unchanged.
- [ ] Selected Dialog, far-right vertical menus and hidden table scrollbar match the finalized design above; scrolling remains fully available.
- [ ] Undo expires after 2.5 seconds in the same lower slot on every page, with a shrinking bottom countdown line/reduced-motion fallback and no production duration slider.
- [ ] Page changes/reopening preserve the original deadline; stale Undo is rejected, reset clears recovery state, and replacement offers have independent timers.
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

2026-10-24 FINAL APPROVAL: User finalized the design at **2.5 seconds**, asked for every finalized point to be saved in the upcoming implementation ticket, and intends to resume in the morning. On the next implementation request, deliver this whole ticket together without further design iterations. Status is ready-for-agent; all production acceptance boxes remain unchecked because this session only finalized/saved the design. Earlier “awaiting review” comments below are historical and superseded.

2026-10-22: Created from the finalized Account overview design. Not implemented.

2026-10-24: Built an isolated three-direction confirmation picker on the current Compact design, with sample removal, Cancel, Undo, rediscovery, count transitions, keyboard handling, both themes and long-name cases. Awaiting design selection; production acceptance criteria above remain unchecked.

2026-10-24 design review: User selected Dialog, requested removal of the visible table scrollbar and movement of row menus to the far right as vertical dots. Updated the prototype accordingly; scrolling remains available. Dialog is now the default. No production changes; awaiting review of these refinements and Undo behavior.

2026-10-24 Undo review: User requested automatic expiry, a consistent lower position on every page, and a countdown line along the bottom. They then requested 2.5 seconds and a prototype slider to compare durations. Implemented a 1–5 second slider with 2.5-second default, original deadlines across navigation, linear shrinking bottom line, reduced-motion fallback, and automatic removal of the Undo action. Prototype only; awaiting review.
