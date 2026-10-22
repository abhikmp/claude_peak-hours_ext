# Ticket 04 browser verification

Date: 2026-10-22. Source baseline: `164241c` plus the user's existing uncommitted popup redesign. All Account names and percentages below are development fixtures, not user data.

## Checks

| Check | Result |
| --- | --- |
| Five Accounts | Active 42%, Work 78%, backup 12%, Full Studio resetting in 30m, Full Side Project resetting in 90m. |
| Active at 100% | Stays first with both Active and Full tags. |
| New reading from Work while browsing | Returns to page 1; previous Full Active moves behind the other Full Accounts. |
| Arrows and keyboard | Previous disabled at page 1; Next disabled at page 5; repeated right arrows at page 5 stay there. |
| Editing timezone | Left-arrow key edits the input without changing the current Account page. |
| Width | Body is 260px; no horizontal overflow in normal or long-Unicode-name cases. |
| Labels | Ellipsis enabled; long label scroll width 1554px is clipped to 146px; Active tag retains 43.94px width with flex-shrink 0. Both tags retain their widths for a Full Active Account. |
| Fixed controls | Across pages and a theme toggle: theme button (230,5,24,24), pill (16,136,228,23), filter (16,180,228,76), footer (16,277,228,15), timezone picker (16,302,228,28). Popup height remains 342px. |
| Outage pill | Text and rectangle unchanged while paging: (16,136,228,42.39). |
| Single Account | Visible text and all measured section rectangles exactly match the saved working-tree baseline; paging controls are absent. |
| No Account | Existing no-reading state remains; paged hero is hidden. |
| Motion | Computed transition: transform 0.3s cubic-bezier(0.77,0,0.175,1). CSS includes a reduced-motion override; browser tooling did not emulate the OS preference. |
| Browser logs | No warning/error entries in the checked popup tab. |
| Staged layout | Exported the exact staged popup sources and loaded them independently: width 260px, no horizontal overflow, correct first/second page and dots, original usage renderer hidden only in multi-Account mode, no browser errors. |
| Live two-Account check | User reloaded the extension, sent messages from two Accounts in the same Chrome profile, and confirmed: "Yes, both Accounts page correctly." |

The 9px tag size, uppercase tag styling, fixed 260px width, existing colors and existing single-Account presentation follow the user-approved prototype and ticket constraints. No new art direction, font, or dashboard-style shell is introduced.

## Screenshots

- [Active Account](screenshots/dark-active.jpg)
- [Second Account](screenshots/dark-page-2.jpg)
- [Full Account in light mode](screenshots/light-full-account.jpg)
- [Full Active Account](screenshots/active-full.jpg)
- [Long label](screenshots/long-label.jpg)

The browser preview uses actual popup sources with a development-only Chrome-storage facade. Controlled browser checks and the separate user-confirmed live check are distinguished above; preview sample values are not real Account readings.

`node --test` passes all 27 existing tests. Syntax checks pass for the working and staged popup scripts and the new page controller. There is no separate typechecking/build configuration.

Final review: Standards 0 findings; Spec 0 findings.
