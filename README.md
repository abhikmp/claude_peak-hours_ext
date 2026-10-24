# ClaudeBuddy

Usage, peak hours & outage status for Claude. Independent of Anthropic.

- Capture a five-hour Usage reading after sending a message on claude.ai. Readings are observations, not continuously live quota; weekly/token totals are not tracked.
- Compare one to three Accounts through detail slides. Four or more use Active detail and a searchable, internally scrolling table, within 260 × 340px.
- See actual reading age and captured reset times. After reset, table estimates last 15 minutes and detail estimates three hours, then usage is unknown. Estimates never become observations.
- Remember Accounts indefinitely. Forget another Account with confirmation and a 2.5-second Undo; a later reading can rediscover it. Reset clears Accounts and restores preferences.
- Check public incidents and the configured weekday Pacific peak window. Choose watched products, timezone and light/dark theme.

The toolbar follows Active: green through 60%, orange through 85%, then red. Missing/expired readings use green as a neutral policy, not proof of full quota. DOWN takes priority over PEAK; availability badges/tooltips are independent of usage. Browsing or logging in alone never switches Active; a new reading does.

![ClaudeBuddy Account comparison](.scratch/account-overview/05-release/assets/02-compare.png)

Screenshots use current production code with disposable sample identities/readings, not live Claude evidence.

## Try locally

Requires Chrome 120+. Open chrome://extensions, enable Developer mode and load this folder, or extract the [release ZIP](.scratch/account-overview/05-release/claudebuddy-1.0.0-rc.zip) and load its folder. Pin ClaudeBuddy, sign in to claude.ai and send a message yourself. Use another Account in the same Chrome profile and send a message to remember it.

Capture supports completion SSE and Bard StreamTimeline RPC, including gzip quota events. Claude must return a numeric five-hour quota event; missing data never implies zero. Site/plan changes can make capture unavailable. No API key is required; the extension cannot raise limits.

## Privacy and development

Account UUIDs, names (possibly emails), readings and Undo recovery are encrypted locally with AES-256-GCM; a non-extractable key is stored separately in extension IndexedDB. This is not a hardware-backed vault. Preferences may sync through Chrome. HTTPS public status and same-origin organization requests use the existing Claude session. Copied streams can transiently contain replies; conversation content is not retained/uploaded. No ads, analytics or developer backend.

[Privacy policy](docs/release/privacy-policy.md) · [data-use declarations](docs/release/privacy-disclosure.md) · [design/data flow](design.md) · [domain vocabulary](CONTEXT.md)

Run `node --test tests/*.test.js`. This plain-JavaScript project has no typechecking configuration or dependency/build installation. Run `python tools/build-release.py` for the allowlisted ZIP, integrity record and extracted-script syntax checks. Icon rasterization uses Pillow via `python tools/render-icons.py`; ZIP rebuilding uses checked-in PNGs and Python's standard library.

## Release candidate

Version 1.0.0 is prepared for a **new** Chrome Web Store item. [Handoff](.scratch/account-overview/05-release/HANDOFF.md), [release notes](docs/release/release-notes.md), [manual checklist](docs/release/manual-qa.md). Signed-in package QA, owner decisions, policy hosting, GitHub migration and Store launch remain [ticket 06](.scratch/account-overview/issues/06-manual-repository-migration-and-store-launch.md). Peak Hours for Claude is a separate legacy item; users/storage do not automatically migrate between extension IDs.

Peak hours was inspired by [PeakClaude](https://github.com/pforret/PeakClaude) by [@pforret](https://github.com/pforret). No repository-wide licence is currently declared; licensing/ownership confirmation belongs to ticket 06.
