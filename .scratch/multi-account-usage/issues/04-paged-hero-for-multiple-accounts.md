# 04: Paged hero for multiple accounts

**What to build:** When there are two or more Accounts, the popup's usage hero becomes pages, one per Account, that the user steps through with arrows. Page 1 is always the Active account. Each page shows the label, an Active or Full tag, the percent, the bar and the reset line. Stacked previous and next arrows sit in the right-hand gutter under the theme toggle, position dots sit beneath, and pages slide horizontally. The pill, product filter, footer and theme toggle never move. With one Account nothing changes. The visual reference is in `prototype/` (screenshots 01, 02, 03, 04, 06, 07, 08).

**Blocked by:** 02, 03.

**Status:** ready-for-human

- [x] Order is Active first (even at 100%), then non-full by most recent reading, then Full accounts by soonest reset.
- [x] Switching to another account makes it page 1 and re-sorts the previous one (to the end if it was full).
- [x] Label, Active tag (green) and Full tag (red) show; long labels truncate with an ellipsis and the tag does not shrink.
- [x] Arrows are stacked in the gutter inside the 260px popup; previous is disabled on the first page and next on the last page (no wrap-around).
- [x] Position dots show the count and current page; the left and right arrow keys step between pages.
- [x] Pages slide in about 0.3 seconds; the popup always opens on page 1.
- [x] The pill, filter, footer, timezone input and theme toggle stay put when paging, in both themes.
- [x] Label, tags, arrows and dots are hidden with a single Account.
- [x] Manual check: with two logged-in accounts, compare the popup against the screenshots.

## Comments

2026-10-22: Implemented from `164241c` on `feature-usagebar`. `popup/account-pages.js` is a popup-only controller and renderer; it consumes the ordered display Accounts from the existing pure module. The popup mounts it only for two or more Accounts and keeps the original single-Account renderer otherwise. Navigation never writes storage or changes the Active account. A storage-change listener refreshes readings and names while the popup is open; an Active-account change returns to page 1. A render revision guard prevents older asynchronous reads from painting over a newer refresh.

The supplied prototype fixes the visual direction, including its compact tags, 260px width, existing theme tokens, right gutter, and control placement. Only the track moves, using a 300ms transform transition; reduced-motion preferences remove the travel. Inactive pages are inert and hidden from assistive technology, buttons have names and focus rings, and a live status announces the page and Account label. Arrow keys do not intercept editing in inputs or other editable fields.

Existing uncommitted popup redesign files were saved as a visual baseline before editing. The same independent paging component is integrated into both the committed popup layout and the working-tree redesign, so this ticket can be committed without absorbing the user's unrelated popup, worker, or version edits. No dependencies, permissions, Account rules, or lifecycle changes are introduced. Stale-age presentation and pruning remain ticket 05 work.

Browser verification uses development-only sample Accounts with the actual popup HTML/CSS/JS and a Chrome-storage facade; samples never enter extension storage. It covers five-Account ordering, a Full Active account, switching Accounts while browsing, arrow/keyboard boundaries, input editing, long Unicode names, single/no Account, and fixed global controls in both themes. Details and screenshots are in [the QA record](../04-validation/qa.md). Following the spec's testing decisions, no new fake-DOM unit seam was added; ordering remains covered by the existing Account module tests. A live check with two logged-in Accounts has been requested and remains pending.

Validation before review: `node --test` passes all 27 tests. JavaScript syntax checks pass for the working popup and for an independent export of the staged popup. The staged layout was also opened in the browser and paged successfully without overflow or runtime errors. No separate typechecking/build configuration exists in this plain-JavaScript extension.

2026-10-22 live verification: after the requested extension reload and messages from two Claude Accounts in the same Chrome profile, the user reported "Yes, both Accounts page correctly." This completes the pending real-site paging check and supersedes the earlier pending note. Final Standards review: no findings. Final Spec review: no findings. All ticket 04 acceptance checks are complete.

2026-10-22 user-requested UI follow-up: for an email-based organization label such as `abjts98@example.com's Organization`, show only its username (`abjts98`). This overrides the original full-label presentation for email-based names. The popup derives the display text without changing the locally stored organization name. Visible label, tooltip, and live announcement all use the same short form. Team names and fallback Account labels keep their existing text. Browser checks cover straight and curly apostrophes, a plain email with dots/plus addressing, and unchanged team/fallback labels. See the QA record's username follow-up.

Follow-up validation: all 27 tests pass, JavaScript syntax passes, Standards review has no findings, and Spec review has no findings.
