# Ticket 03 verification — 2026-10-23

Baseline: `426c97e1b94f0f6ec57db0e94f57c8e038b3243b`, branch `feature-usagebar`.
Scope: [Compare many Accounts in one searchable table](../issues/03-searchable-account-table-and-details.md).

## Result

The production popup has at most two main pages. Two Accounts retain two detailed views and aligned status/preferences. At three or more, the second page contains every other Account in a searchable table with sticky Account / Used / Resets columns, reading age, complete-name titles, right-aligned tabular values, internal scrolling, and the approved saved-Account footer. The popup remains exactly **260 × 340 CSS pixels**. Status moves above the table/inspection; preferences remain on page one and theme stays accessible.

The table captures membership/order when opened, using the shared Account ordering. Refreshes update existing row nodes and inspected details without moving rows or changing the search/scroll position. A newly Active Account stays in the frozen list with an Active indicator. A new Account waits until reopening to change membership. The approved new-reading notice appears on the table and its inspection view, and clears on reopening. Clock-only expiry and label resolution do not invent new readings.

Back and Escape restore the same table DOM, query and scroll position. Hidden pages and covered controls cannot receive focus. Native buttons provide keyboard row selection and Back navigation. Inspection writes neither readings nor preferences and sends no messages that could change the toolbar. Account/storage/worker/capture rules are unchanged.

Expired table readings show a dash for unknown current usage and Window ended. Details preserve ticket 01's later amendments: a labeled green estimate during the first three hours after the observed reset, then No recent reading, with Last reset / Last recorded / Updated facts. Fresh zero readings remain 0%; missing reset times remain unknown and clear earlier countdowns.

## Test seams and red → green

The approved ticket/spec selects the existing rendered production-popup/storage seam. The loopback adapter supplies disposable Chrome storage/runtime boundaries and a controlled clock; actual popup HTML, CSS, scripts and shared Account rules run unchanged. No private navigation helpers are tested.

- Before implementation, three Accounts failed the comparison-table check and exposed three main pages.
- Reopening the table after leaving inspection initially failed keyboard focus because the list remained inert. Opening now clears its inert state.
- Clock-only expiry initially triggered the new-reading notice. Detection now compares captured observations rather than the derived expired percentage.
- Back preserved exact scroll position during incoming readings. An intermediate search-restoration failure was a fixture error: that scenario reopened the table (correctly clearing the query) before expecting the earlier query. The corrected scenario explicitly establishes its search before inspection.
- The replay creates a fresh iframe for each popup opening. Reusing one iframe for many rapid navigations caused browser loads to stall; this was test infrastructure, not a production-popup failure. Loads have bounded timeouts.

## Validation

- **153 rendered ticket-03 assertions**, zero failures: [results](browser-results.txt). Includes 2/3/64 Accounts in both themes; 65 remembered Accounts after a new reading; exact outer bounds; scrolling/sticky headers; filtering/empty search; complete long/international names as plain text; frozen row identity/membership/order; incoming readings during inspection and table browsing; immediate Active changes; Back restoration; expiry/estimate cutoff; unknown resets and observed zero; theme persistence; hidden-control focus; keyboard navigation; and all four status states. [Measured bounds](measurements.json).
- **94 ticket-02 browser regressions**: [results](ticket02-regressions.txt). The old larger-count assertion now expects two main pages and a table. Single/two-Account layout, no Full pill, preference persistence, status, expiry, keyboard controls and fixed dimensions remain covered.
- **105 ticket-01 browser regressions**: [results](ticket01-regressions.txt). Indefinite retention, estimate cutoff/colors, elapsed reset units, historical facts, fresh-reading cleanup, timezone formatting and reset-to-default pass.
- Final `node --test`: **43 passing**, zero failures: [results](node-results.txt). Account, worker-maintenance and capture integration files also passed individually during implementation.
- Production and harness JavaScript syntax checks pass. There is no separate typechecking/build configuration. Source design lint: **0 failures**, two warnings on pre-existing fallback status colors retained from the approved design.
- Native Chrome keyboard checks: search ArrowLeft stays on the table; Tab from the scroll region reaches the filtered row button; Enter opens its details; Escape returns to the filtered table with focus on its scroll region. No browser warnings/errors were recorded.

## Visual checks

The approved design supplies the layout, palette, type and compact metadata sizes; no new visual direction was drawn. Production screenshots were inspected against the approved table and two-Account references, accounting for the later dormant-detail and Full-pill amendments. Quiet row rules, right-aligned figures, 14px footer separation, reduced bottom padding, status placement and theme controls are retained. The bounded extension uses its actual 260px width; browser measurements and screenshots provide the visual evidence instead of a desktop-page inspector.

| View | Dark | Light |
| --- | --- | --- |
| Other Accounts table | [Screenshot](table-dark.png) | [Screenshot](table-light.png) |
| Two Accounts, Active | [Screenshot](two-first-dark.png) | Existing ticket-02 reference |
| Two Accounts, secondary detail | [Screenshot](two-second-dark.png) | [Screenshot](two-second-light.png) |
| Table-row inspection | Behavioral coverage | [Screenshot](row-details-light.png) |

Sample identities/readings are disposable fixtures. No live extension storage was edited, installed extension reloaded, release ZIP rebuilt, or publication performed. Forget/Undo belongs to ticket 04.

## Replay

```text
python .scratch/account-overview/03-validation/serve.py
```

Open `http://127.0.0.1:8766/.scratch/account-overview/03-validation/checks.html` and click **Run ticket 03 checks**. The same server serves the ticket-01 and ticket-02 check pages. The server injects adapters only into responses; production source/manifest and real extension storage are untouched. Stop the server after use. Windows sandbox socket restrictions may require running the loopback server outside the sandbox.

## Standards

Independent review found no documented-standard violations or confirmed functional defects. Two nonblocking smell heuristics were reported: numeric layout states obscured their meaning, and hero/table color expressions were duplicated. Both were resolved during review: `layoutKind` uses single/pair/table states, and `usageTone` centralizes presentation thresholds. Follow-up review confirms both resolved with no new findings.

## Spec

Independent review found no actionable gaps, incorrect requirements or unasked production scope. Named layout states preserve reset/threshold behavior. Shared color handling aligns hero/table thresholds with the existing toolbar rules, including fractional percentages. Forget/Undo remains correctly deferred to ticket 04. Reviewers inspected the diff, requirements and verification evidence; they did not independently rerun the browser checks.

Final review summary: **Standards 0 unresolved; Spec 0**. The full Node suite passes. The rendered table and ticket-01/02 regressions pass again after the review cleanups.
