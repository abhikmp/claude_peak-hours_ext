# Ticket 04: Forget Account design exploration

2026-10-24. The user explicitly asked to prototype and finalize the flow before implementing ticket 04. Production is unchanged by this exploration.

Open [prototype.html](prototype.html), served by the existing loopback server at [the live preview](http://127.0.0.1:8766/.scratch/account-overview/04-prototype/prototype.html?v=1). The selected Compact table, 1–3 slides / 4+ table threshold, 11px reset values, fifteen-minute table estimates/priority and three-hour detail estimates are retained. This picker compares **confirmation**, not reset designs.

| Variant | Interaction axis | Strength | Cost |
| --- | --- | --- | --- |
| Anchored | Confirmation beside the Account action | Keeps the table context visible | Covers nearby rows until Cancel/Forget |
| Dedicated view | Confirmation replaces the usage/list area | Clear focus without covering content or moving preferences | Temporarily leaves the list; long names can require internal scrolling in slides |
| Dialog | Centered confirmation with dimmed popup | Strongest pause before removal | Interrupts the whole popup |

The fixed picker matches the prototype skill. Click its choices or press 1/2/3. Left/right inside the popup navigate Accounts; arrows are suspended during confirmation. Escape cancels confirmation or closes the menu and restores focus. Cancel is focused initially; confirmation focus cycles within its buttons.

## Try the flow

1. The sample starts with four Accounts on the table. Open ⋯ next to Writing room, then Forget account.
2. Compare confirmation styles while the same confirmation remains open. Cancel restores the query and list position.
3. Confirm removal: the sample becomes three individual slides and offers Undo. Undo restores the saved reading and table/search context.
4. Remove again, select the forgotten Account in Receive a sample reading from, and receive a reading. It is rediscovered and becomes Active. Undo preserves that newer reading.
5. Try two Accounts (removal leaves one), three Accounts (removal leaves two slides), 64 Accounts (internal scrolling/search), long international names, both themes, and inspection/Back.

Active has no Forget action. If a sample reading makes the confirmation's Account Active, that confirmation closes. Data exists only in the page's sample state; no real Account state or extension storage is read or written.

## Feedback to decide

Undo is common to all three directions. It remains available until dismissed, replaced by another removal, or the sample restarts; simulated Reopen preserves it. This is a review default, not a finalized production expiry policy. The notification uses the table's reserved footer space; in slides it reserves room inside the usage area and leaves the shared lower controls fixed. Details may scroll while this extra feedback is visible. Dismissing feedback restores the ordinary detail fit.

Still awaiting the user's choice of confirmation style and acceptance/refinement of Undo placement and lifetime. Selection here does not authorize automatic production integration: the user requested design finalization first.

## Verification

[115 browser checks](browser-results.txt) pass, with zero failures. [Run them](checks.html) for every variant in both themes: fixed 260 × 340 bounds, three complete table rows, no horizontal overflow, Active exclusion, confirmation copy/Cancel focus, Escape, query/order/scroll restoration, four-to-three/three-to-two/two-to-one transitions, Undo, original vs newer reading restoration, sample rediscovery, and long names. JavaScript syntax passes; the visible in-app preview reports no browser warnings/errors. Screenshots: [Anchored](anchored-dark.jpg), [Dedicated view](dedicated-dark.jpg), [Dialog](dialog-dark.jpg). These are prototype checks, not production/capture verification.
