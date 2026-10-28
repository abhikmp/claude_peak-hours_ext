# ClaudeBuddy Store listing

Prepared 24 October 2026; copy only. Upload assets/text during ticket 06.

Title: **ClaudeBuddy**

Short description (manifest, 45 characters): Usage, peak hours & outage status for Claude.

Recommended language: English. Recommended category: Productivity (use the matching Tools/productivity category offered by the dashboard). No mature content. Distribution visibility/regions and publisher identity are owner decisions in ticket 06.

Single purpose: Help Claude users assess quota and service availability through per-Account captured readings, reset times, peak hours and relevant incidents.

## Detailed description — paste this section

See your last captured Claude quota and service availability in one compact popup.

ClaudeBuddy observes supported five-hour quota events after you send messages on claude.ai. Compare up to three remembered Accounts through detailed slides, or four or more through a searchable table. Each reading keeps its actual age and captured reset time so you can distinguish observations from estimates and unknown usage.

• Usage-driven toolbar colors: green, orange and red follow the Account with the latest reading.
• Account comparison: stable table rows, search, reset timing and detailed inspection.
• Remembered Accounts stay until you forget them or reset the extension. Confirm removal, Undo for 2.5 seconds, and rediscover an Account through a later message.
• Service availability: public Claude incidents, watched-product alerts and the configured weekday 5–11 AM Pacific peak-hours window.
• Light/dark themes, timezone preferences and a fixed 260 × 340px popup.

Readings update only when Claude returns a supported numeric five-hour quota event. This is not continuously live quota monitoring. A passed captured reset does not prove full current quota: short estimates are labelled, then usage becomes unknown. No weekly/token tracking, usage-limit increases or performance guarantees.

Account names (which may include emails), identifiers, readings and temporary Undo recovery are encrypted locally. Preferences may sync through Chrome. Capture temporarily processes copied Claude response streams to extract quota; chat content is not saved or uploaded. Organization labels use your existing signed-in Claude session; public availability comes from status.claude.com. No API key, ads, analytics or developer backend.

Requires Chrome 120 or later, access to claude.ai, and Claude returning a supported quota event. Some plans or site changes may not expose one. ClaudeBuddy is independent of Anthropic and is not an official Claude product.

## Assets and URLs

Required assets: [128px icon](../../images/store/icon-128.png), [usage](../../images/store/01-usage.png), [comparison](../../images/store/02-compare.png), [Forget/Undo](../../images/store/03-forget.png). The three screenshots are 1280 × 800 PNGs rendered from production UI with disposable sample readings. They include the selected brand logo. README screenshots show publisher-provided UI with a substituted sample Account name.

Optional final Store artwork: [marquee 1400 × 560](../../images/store/marquee_image.png), [Store tile 440 × 280](../../images/store/webstore_promo-tile.jpg). The coral crab identifies the brand; plain quota-color circles remain in the toolbar. Promotional videos are excluded from this release and repository.

Homepage/source: [ClaudeBuddy repository](https://github.com/abhikmp/claudebuddy-chrome-ext). Support: [GitHub Issues](https://github.com/abhikmp/claudebuddy-chrome-ext/issues). Legacy source: [Peak Hours branch](https://github.com/abhikmp/claudebuddy-chrome-ext/tree/legacy).

Policy source: [privacy-policy.md](privacy-policy.md). Public policy: [ClaudeBuddy Privacy Policy](https://abhikmp.github.io/claudebuddy-chrome-ext/privacy-policy.html). Unauthenticated HTTP 200 and exact source-byte equality verified on 28 October 2026. Use this URL in the new item's dashboard; the [launch checklist](launch-checklist.md) records the remaining Store steps. Keep the legacy product policy separate.
