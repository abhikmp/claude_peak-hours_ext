# Production Undo footer replacement — 2026-10-24

User-approved follow-up to `201b723`, implemented directly in production without a prototype.

While Undo is available, both the timezone/reset row and the timezone picker are completely hidden. Their reserved layout space remains, so status, products and usage do not move. Existing inert behavior keeps these controls out of keyboard focus. The shared Undo cleanup restores both sections after Undo, expiry, dismissal, clear or activation failure. Navigation/theme changes retain the original 2.5-second deadline and bar position.

Latest placement refinement: lowered the bar by 14px, from a 30px bottom gap to 16px. It sits slightly below the center of the space under the footer divider, with a comfortable bottom inset. Bar dimensions, side insets and surrounding layout are unchanged. On table pages it also temporarily replaces the saved-Account count and refresh notice, so neither peeks through at the new position. These return when Undo ends. The existing exact-position matrix checks now require `x=16, y=292, width=228, height=32` at standard popup bounds.

Verification: [262 popup matrix assertions](matrix-results.txt), [31 accessibility/expiry assertions](extra-results.txt), [36 lifecycle/race assertions](advanced-results.txt), and [57 Node tests](footer-node-results.txt) pass. New assertions verify complete visual replacement in both themes, restoration after Undo/dismiss/reset/expiry and identical control coordinates before/after expiry. JavaScript syntax and diff whitespace checks pass. Standards and Spec reviewers report no actionable findings.

The checks and [screenshot](footer-replacement.jpg) use the actual production popup with the existing disposable storage/runtime/clock adapter. No installed Account readings were modified. The existing production preview supplies the screenshot; no new prototype or design picker was added.
