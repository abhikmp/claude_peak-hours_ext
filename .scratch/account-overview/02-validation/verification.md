# Ticket 02 verification — 2026-10-23

Baseline: `dcfeeb25d364a78c93e60c682179722c6c0846e5`, branch `feature-usagebar`.
Scope: [ticket 02](../issues/02-fixed-popup-and-two-account-navigation.md). The user asked to complete this ticket and confirmed they could step away. Ticket 01's last installed-extension visual check was confirmed during this work and recorded in its own ticket; this record does not claim a live installed-extension check for ticket 02.

## Result

The real popup HTML/body/content are fixed at **260 × 340 CSS pixels**, including padding. A flexible usage region sits above one shared status/preferences group. Normal dormant facts fit without scrolling; longer details scroll inside their Account page. Incident text has a bounded scrolling region, and timezone choices open upward inside the viewport without expanding the popup.

One shared Account renderer now handles one or more remembered Accounts. One Account retains its identity and Active tag with no visible navigation/dots. Two Accounts open on Active and retain bounded stacked arrows and two dots. Inactive pages remain inert and aria-hidden. No section tabs, fake browser strip, brand heading, redundant email row, or fixed blank detail slab is introduced.

The Full pill markup/styles are removed from all detail views. Observed 100% usage, Active, Full classification/ordering and toolbar thresholds are unchanged. No Account module, worker or capture source changes were needed.

The user-approved dormant presentation remains: ~0% estimated until three hours after the observed reset, then No recent reading, plus compact Reset / Last recorded / Updated rows. Theme, status, products, timezone and reset semantics remain. Native timezone buttons support Tab/Enter. Global reduced-motion CSS disables transitions, animations and smooth scrolling when the system requests reduced motion.

## Red → green evidence

1. The first production-popup size check failed on the no-reading view: **260 × 266.390625**, instead of 260 × 340. It passed after fixed bounds and shared layout were applied.
2. The next check failed because the single-Account renderer omitted the identity/Active tag. Sharing the Account renderer fixed that omission and enabled consistent Full-pill removal for every count.
3. The timezone keyboard-control check failed because choices were click-only list items. Native buttons now pass; connected Chrome also confirmed real Tab/Enter selection saves Honolulu and leaves Account selection unchanged.
4. Visual inspection found ordinary dormant facts overflowing by two pixels alongside the one-product hint. A regression reproduced `scrollHeight 100 > clientHeight 98`. Reducing the shared-control gap from 10px to 9px freed enough room; the final ordinary dormant page measures **103px client height and 103px scroll height**. Longer content still scrolls, with theme-aware scrollbars.

## Validation

- `node --test`: **43 passing**, zero failures. Existing Account ordering/icon/retention and both capture-transport regressions remain green.
- **94 rendered browser assertions**: [results](browser-results.txt). Counts 0/1/2; both themes; exact content/body bounds and no outer overflow; identity and Active; single navigation hidden; two arrows/dots; both navigation boundaries; unchanged shared-control positions; no storage/messages from browsing; live announcements and hidden-page inertness; long names; long dormant content; normal dormant no-scroll regression; outage, peak and unavailable status/retry; expiry; persistence of real theme/product/timezone controls; and the existing three-Account paged path pending ticket 03.
- **86 ticket-01 browser regressions**: [results](ticket01-regressions.txt). The fixture now finds visible Account details by visibility rather than assuming the old single-Account template. Retention, estimate cutoff, fact rows, timezone formatting, fresh-reading cleanup and reset still pass.
- Syntax checks pass for the shared module, worker, popup scripts, all three content scripts, and the ticket-01/02 fixture/check scripts. Whitespace checks pass. There is no separate typechecking or build configuration.
- Connected Chrome native keyboard pass: ArrowLeft returns to Active, ArrowRight in the timezone input does not page, Tab focuses a filtered timezone button, and Enter saves the choice and closes the list. These supplement synthetic event checks in the replay harness.
- Reduced motion is implemented and source-reviewed through the preference media rules. The user's OS preference was not changed/emulated; no separate runtime OS-toggle pass is claimed.
- Production screenshots were compared with the approved two-Account reference, accounting for the later dormant/fact-row and Full-pill amendments. Existing theme/control styles and the approved compact frame are retained. Browser console: no warnings/errors on the final screenshot check. The visual pass was bounded to one inspection/fix/confirmation cycle. The standalone taste inspector was not used; connected browser measurements and screenshots provide the rendered evidence.
- The source design detector flags existing muted text, 11px compact metadata and the legacy bar-width transition; those belong to the retained approved style, and reduced motion now disables transitions. It also flags root overflow clipping: that is intentional for the extension's fixed viewport, while the timezone list's measured top/bottom remain inside it. These are distinct from browser console errors and review findings.

## Measurements and screenshots

[Measured values](measurements.json) use actual production markup with disposable storage/runtime adapters. In the matched one-product configurations, no-reading, one-Account, both two-Account pages and ordinary dormant detail all measure 260 × 340; the status pill stays at **y=139px** and product controls at **y=181px**. Different status/preference content can change the space available to usage, without moving shared controls during paging or growing the popup.

| View | Dark | Light |
| --- | --- | --- |
| No reading, status unavailable | [Screenshot](empty-dark.png) | [Screenshot](empty-light.png) |
| One Full Active Account, no navigation | [Screenshot](single-full-dark.png) | [Screenshot](single-full-light.png) |
| Two Accounts, Full Active first page | [Screenshot](two-first-dark.png) | [Screenshot](two-first-light.png) |
| Two Accounts, other 100% reading | Covered by browser checks | [Screenshot](two-second-light.png) |
| Other Account, approved dormant facts | [Screenshot](two-dormant-dark.png) | Covered by browser checks |
| Long labels/details and outage | Covered by browser checks | [Screenshot](outage-long-details-light.png) |

Long-content screenshots show the top of the internally scrollable Account region; facts below its edge are reachable by scrolling. Lower controls remain visible. Sample identities and dates are fixtures only.

## Replay

```text
node --test
python .scratch/account-overview/01-validation/serve-popup.py
```

Open `http://127.0.0.1:8765/.scratch/account-overview/02-validation/checks.html` and click **Run ticket 02 checks**. For retention/expiry regressions also run `http://127.0.0.1:8765/.scratch/account-overview/01-validation/checks.html`. The loopback server injects disposable Chrome/clock adapters into responses only; it does not modify runtime manifests or live extension storage. Stop it when finished. Sandbox socket restrictions may require approval to run it outside the sandbox.

## Standards

Independent Standards review: no actionable findings. The unified renderer removes duplicated rendering, retains Account-domain rules in the shared module, and preserves local storage boundaries. Final CSS/regression additions also have no findings.

## Spec

Independent Spec review: no findings. Fixed dimensions, shared positions, identity/navigation, Full-pill removal, long content, accessible keyboard behavior and current dormant amendments are implemented. Existing larger-count paging remains until ticket 03; its table and Forget/Undo are not part of this ticket.

Review summary: **Standards 0; Spec 0**. No code implementation work remains for ticket 02. A final installed-extension visual look can be performed when the user returns; the agent did not reload the installed extension or edit live readings, rebuild the release ZIP, submit or publish anything.
