# Forget button and queue refinements — 2026-10-24

User amendments to ticket 04 after baseline `1cca5d1`:

- Both Forget account actions (menu and dialog) use softened red `#cf4545` with white text, and a modest hover adjustment. White/red contrast is approximately 4.57:1 in either theme.
- Removing the visible slide continues at its successor. If there is no successor, the preceding remaining Account is used. Removing Account 2 of three therefore opens Account 3.
- Removing a table row retains the open table when at least four Accounts remain. At four→three, the successor comes from the frozen table order, even when reset priority makes it different from ordinary slide order. Query/scroll and unrelated rows remain intact where table mode continues. Active and original readings are unchanged; Undo restores its original browsing context.

The cause of the reported jump was the layout-rebuild branch resetting `pageIndex` to zero whenever slide count changed. The production-popup test reproduced this exact failure before the fix. Rendering now chooses the continuation identity from the previous browsing order before rebuilding the slides. New readings that change Active retain their existing behavior.

## Verification

[42 targeted browser checks](refinements-results.txt) pass in dark/light: three→two middle/last removal, four→three at each row, nonstandard recent-reset table order, five→four staying in the table, inspection, two→one, Undo context restoration, expiry preserving the successor, Active invariance, both button colors, runtime errors and exact 260 × 340 bounds.

The existing [242 popup matrix checks](matrix-results.txt) and [36 lifecycle/race checks](advanced-results.txt) also pass with these changes. The [full Node suite](refinements-node-results.txt) passes all 57 tests. JavaScript syntax and diff whitespace checks pass. Independent Standards and Spec re-reviews found no actionable findings.

[Preview](refinements-preview.html) and [screenshot](refinements-preview.jpg) show both action stages in both themes. These use production scripts with the existing disposable storage/runtime/clock adapter; no installed Account readings were changed. Start the existing `serve.py` helper on loopback port 8767, then open `refinements.html` or `refinements-preview.html`.
