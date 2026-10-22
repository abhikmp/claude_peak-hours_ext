# 05: Stale, expired and dropped accounts

**What to build:** Accounts other than the Active one show old data honestly, and dead Accounts clean themselves up. A non-Active page shows a muted "Updated … ago" once its reading is at least 10 minutes old; the Active page never shows this line. A reading whose reset time has passed shows 0% and "Full quota available" for that Account, and the Account re-enters the normal order. An Account with no reading for 48 hours is forgotten, checked by the existing 30-second alarm and when the popup opens. "Reset to default" now also forgets all Accounts, leaving the "Send a message to see usage" state. The visual reference is screenshot 05 in `prototype/screenshots`.

**Blocked by:** 04.

**Status:** ready-for-human

- [x] The muted "Updated … ago" text appears beside the Account name at 10 minutes or more on non-Active pages and not before; it never appears on the Active page.
- [x] An expired reading shows 0% and "Full quota available" on its page, and the icon is green if it is the Active account.
- [x] An Account at 100% whose window has ended is no longer tagged Full and moves back into the normal order.
- [x] An Account with no reading for just over 48 hours is removed by the alarm and when the popup opens; one just under is kept.
- [x] If all Accounts are dropped the popup shows the no-reading state and the icon is green.
- [x] "Reset to default" forgets all Accounts as well as resetting timezone, products and theme.
- [ ] Manual check: edit stored timestamps in DevTools to exercise the 10-minute, expiry and 48-hour cases.

## Comments

- 2026-10-22: User approved the quieter age presentation above before starting ticket 05, replacing the original every-page "Last reading" requirement.
- Starting point for implementation/review: `8eb0daa`. User approved the worker alarm → local storage and toolbar icon integration test seam. Existing pure Account tests already cover time boundaries; popup behavior will be checked in a browser with controlled storage and time.
- Implementation and controlled browser checks are complete; all 30 tests pass. See [verification details](../05-validation/qa.md). The timestamp cases were exercised with disposable browser fixtures rather than changing the user's actual extension storage. The user reloaded the extension and confirmed the live age display: "Yes, it displays correctly." Full real-extension DevTools timestamp verification remains pending.
- Spec review caught a missing visible 0% in the original committed single-Account expired renderer; corrected and browser-verified that exact staged renderer. The existing working popup redesign already showed 0% and remains intact.
- User requested the age beside the Account name to remove the bottom age row and excess Active-page space. Moved it into the heading and removed the fixed minimum page height; browser-checked both themes, Full tags, long labels and stable controls while paging.
