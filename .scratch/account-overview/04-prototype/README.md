# Ticket 04: Forget Account design exploration

2026-10-24. The user explicitly asked to prototype and finalize the flow before implementing ticket 04. Production is unchanged by this exploration.

Open [prototype.html](prototype.html), served by the existing loopback server at [the live preview](http://127.0.0.1:8766/.scratch/account-overview/04-prototype/prototype.html?v=3). The selected Compact table, 1–3 slides / 4+ table threshold, 11px reset values, fifteen-minute table estimates/priority and three-hour detail estimates are retained. The user selected **Dialog** on 2026-10-24; it is now the default. The other directions remain for reference.

| Variant | Interaction axis | Strength | Cost |
| --- | --- | --- | --- |
| Anchored | Confirmation beside the Account action | Keeps the table context visible | Covers nearby rows until Cancel/Forget |
| Dedicated view | Confirmation replaces the usage/list area | Clear focus without covering content or moving preferences | Temporarily leaves the list; long names can require internal scrolling in slides |
| Dialog | Centered confirmation with dimmed popup | Strongest pause before removal | Interrupts the whole popup |

The fixed picker matches the prototype skill. Click its choices or press 1/2/3. Left/right inside the popup navigate Accounts; arrows are suspended during confirmation. Escape cancels confirmation or closes the menu and restores focus. Cancel is focused initially; confirmation focus cycles within its buttons.

## Try the flow

1. The sample starts with four Accounts on the table. Open ⋮ at the far right of Writing room, then Forget account.
2. Compare confirmation styles while the same confirmation remains open. Cancel restores the query and list position.
3. Confirm removal: the sample becomes three individual slides and offers Undo. Undo restores the saved reading and table/search context.
4. Remove again, select the forgotten Account in Receive a sample reading from, and receive a reading. It is rediscovered and becomes Active. Undo preserves that newer reading.
5. Try two Accounts (removal leaves one), three Accounts (removal leaves two slides), 64 Accounts (internal scrolling/search), long international names, both themes, and inspection/Back.

Active has no Forget action. If a sample reading makes the confirmation's Account Active, that confirmation closes. Data exists only in the page's sample state; no real Account state or extension storage is read or written.

## Feedback to decide

Undo now expires automatically. The prototype-only **Undo duration** slider sits directly below the popup, ranges from **1–5 seconds** in half-second steps, and defaults to **2.5 seconds**. Adjusting it while a notification is visible starts a fresh countdown with the new duration. Navigating pages, changing theme, inspecting/Back, or simulated Reopen preserves the original deadline.

The notification always uses the same full-width lower slot, 30px above the popup bottom, on the table, Active page, smaller-count slides and inspection. It does not cover quota details or shift preferences. On detail pages it temporarily overlays the preference footer; covered controls cannot receive focus while it is visible.

A 2px line along the notification's bottom edge shrinks linearly to indicate time remaining. Native animation uses transform only and resumes from the remaining fraction after a render. Reduced-motion users receive numeric time-left text instead of the moving line. Expiry removes the notification and its Undo action without rebuilding or shifting the underlying content. A second removal replaces the first notification with a new complete countdown. A later Usage reading can still rediscover the Account after Undo expires.

Dialog is selected. The requested hidden table scrollbar and far-right vertical action menus are present in the prototype; large tables retain wheel, touch and keyboard scrolling. Awaiting review of these refinements and review of the timed lower Undo notification and the prototype duration slider. Selection here does not authorize automatic production integration: the user requested design finalization first.

## Verification

[152 browser checks](browser-results.txt) pass, with zero failures. [Run them](checks.html) for every variant in both themes: fixed 260 × 340 bounds, three complete table rows, no horizontal overflow, hidden scrollbar with retained scrolling, far-right vertical menu placement, Active exclusion, confirmation copy/Cancel focus, Escape, query/order/scroll restoration, four-to-three/three-to-two/two-to-one transitions, Undo, original vs newer reading restoration, sample rediscovery, and long names. JavaScript syntax passes; the visible in-app preview reports no browser warnings/errors. Screenshots: [Anchored](anchored-dark.jpg), [Dedicated view](dedicated-dark.jpg), [Dialog](dialog-dark.jpg). These are prototype checks, not production/capture verification.

2026-10-24 refinement: the visible table scrollbar is hidden without disabling overflow/scrolling or reserving a scrollbar gutter. Account menus use three vertically stacked dots in a dedicated 20px rightmost column, after Reset. The action header remains accessible but visually hidden. The selected Dialog remains the confirmation flow. Native PageDown scrolling was also checked in the in-app preview. [Refined table screenshot](dialog-table-refined.jpg).

2026-10-24 timed Undo refinement: replaced indefinite feedback and page-dependent positioning with the shared lower slot and an expiring countdown. The user initially requested 3–5 seconds, then 2.5 seconds, then a prototype duration slider; 2.5 seconds is the slider default. Browser checks exercise real elapsed-time expiry separately from deterministic native-animation progress, because covered browser windows may suspend their animation clock.

Timed-feedback evidence: [table page](undo-countdown-table.jpg) and [Active page](undo-countdown-active.jpg). Both notifications measured the same 228 × 32px box at identical coordinates. The expanded checks cover slider defaults/adjustment, fixed placement, preserved deadlines across page changes, native linear animation progress, real-time automatic expiry at 1 and 2.5 seconds, a replacement removal receiving a new countdown, and unchanged underlying row identity/geometry on expiry. All 152 checks pass with no prototype errors.
