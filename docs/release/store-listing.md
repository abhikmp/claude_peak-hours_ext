# ClaudeBuddy Store listing

Prepared 24 October 2026; updated 28 October. Maintained listing copy and final assets. The publisher reports the new Store submission pending review; final uploaded text/assets are not independently verified. See [launch status](launch-checklist.md).

Title: **ClaudeBuddy – Usage & Peak Hours Tracker**

Short description (manifest, 45 characters): Usage, peak hours & outage status for Claude.

Recommended language: English. Recommended category: Productivity (use the matching Tools/productivity category offered by the dashboard). No mature content. Distribution visibility/regions and publisher identity are owner decisions in ticket 06.

Single purpose: Help Claude users assess quota and service availability through per-Account captured readings, reset times, peak hours and relevant incidents.

## Detailed description — paste this section

Meet your Claude companion: captured usage, reset times, remembered accounts, peak hours and service status, together in one compact popup. Pin ClaudeBuddy to keep useful signals a glance away while you work.

YOUR USAGE, IN COLOR
The toolbar circle and usage bar follow the account with the latest captured reading:
🟢 Green: 0–60% used.
🟠 Orange: above 60% through 85% used — your recorded usage is getting higher.
🔴 Red: above 85% used — your recorded usage is nearing the limit.
Open the popup for the percentage, captured reset countdown and how long ago the reading was updated.

PEAK HOURS WITHOUT THE GUESSWORK
🔴 A red PEAK badge draws attention to the configured weekday peak-hours window, 5–11 AM Pacific. Open the popup to see how long remains and the end time in your selected timezone.
🟢 Outside that window, the popup shows Off peak and the next scheduled peak time, unless a watched outage takes priority.
Peak hours follow a schedule; they are not a measurement of current traffic or a prediction of your account's quota.

SPOT SERVICE ISSUES FROM YOUR TOOLBAR
🟠 An orange OUT badge draws attention to a reported incident affecting a product you watch. It takes priority over PEAK, helping you notice a service issue before assuming you have run out of quota.
Open the popup for an Outage label, reported severity, affected products and a short incident message selected from the public status update. Longer messages can be scrolled within the popup.
Choose which products to watch: Claude AI, Claude Code, Cowork or Design. Status comes from status.claude.com. If the status request fails, the popup shows Status unavailable with a retry control.
PEAK and OUT badges blink while Chrome keeps the extension's background worker active. Chrome may pause the blinking when that worker sleeps. Badge alerts and the usage-circle color represent separate information.

ONE ACCOUNT OR SEVERAL? KEEP THEM IN VIEW
• One account: a focused detail view with usage, reset timing and reading age.
• Two or three accounts: slide between detailed account views using the arrows or left/right keyboard keys. Page dots show your position.
• Four or more accounts: keep the Active account's detail view and move to a searchable table to compare remembered accounts. Open a row for its details, then return to your search and scroll position.
Active means the account with the latest captured reading. Browsing a slide or row does not switch your Claude login or change Active.
Account names come from Claude. When the account label is based on your signed-in email, ClaudeBuddy displays the username before the @ sign: alexmorgan@example.com appears as alexmorgan. Named organizations or workspaces keep their supplied name. If a name is temporarily unavailable, a shortened Account ID is shown instead.

IDLE DOESN'T HAVE TO MEAN CONFUSING
Before the first reading, the popup prompts you to send a message to see usage.
After a captured reset passes, detail views briefly show ~0% estimated for up to three hours, then No recent reading. The last reset, last recorded usage and actual reading age remain available. Table estimates last only 15 minutes, then current usage is shown as unknown.
🟢 A green toolbar circle is also the neutral state when a reading is missing or expired. It does not confirm zero usage or available quota. Send a message from that account for a fresh reading when Claude supplies one.

MAKE IT YOURS
Switch between light and dark themes and display times in your preferred timezone. Remembered accounts stay until you forget them or reset the extension. Forget another account with confirmation and a 2.5-second Undo; a later captured reading can add it again.

PRIVATE BY DESIGN
Account names, identifiers, readings and temporary Undo recovery are encrypted locally in your Chrome profile. Preferences may sync through Chrome. Response streams are processed locally to extract quota readings; conversation content is not saved or uploaded by ClaudeBuddy. No API key, ads, analytics or developer backend.

HOW READINGS UPDATE
Send a message on claude.ai to capture a reading when Claude returns a supported numeric five-hour quota event. Readings are observations, not continuous real-time monitoring. A passed reset time does not prove your current quota; estimates are explicitly labelled.
Requires Chrome 120 or later and access to a signed-in Claude account. Some plans or changes to Claude may make readings unavailable. ClaudeBuddy does not track weekly usage or token totals, increase usage limits, automatically switch accounts or guarantee service availability.

ClaudeBuddy is an independent extension and is not affiliated with or endorsed by Anthropic.

## Assets and URLs

Required assets: [128px icon](../../images/store/icon-128.png), [usage](../../images/store/01-usage.png), [comparison](../../images/store/02-compare.png), [Forget/Undo](../../images/store/03-forget.png). The three screenshots are 1280 × 800 PNGs rendered from production UI with disposable sample readings. They include the selected brand logo. README screenshots show publisher-provided UI with a substituted sample Account name.

Additional browser screenshots: [Chrome overview](../../images/store/04-browser-overview.jpg) and [Peak badge example](../../images/store/05-browser-peak.jpg), both 1280 × 800 opaque JPEGs. Based on a publisher-provided capture: the Account name is replaced with alexmorgan, bookmarks, New Tab shortcuts and the GitHub tab are removed, and the Peak variant illustrates a matching badge/popup state. These edited illustrations are not evidence of a new live reading or peak-hours observation.

Optional final Store artwork: [marquee 1400 × 560](../../images/store/marquee_image.png), [Store tile 440 × 280](../../images/store/webstore_promo-tile.jpg). The coral crab identifies the brand; plain quota-color circles remain in the toolbar. Promotional videos are excluded from this release and repository.

Homepage/source: [ClaudeBuddy repository](https://github.com/abhikmp/claudebuddy-chrome-ext). Support: [GitHub Issues](https://github.com/abhikmp/claudebuddy-chrome-ext/issues). Legacy source: [Peak Hours branch](https://github.com/abhikmp/claudebuddy-chrome-ext/tree/legacy).

Policy source: [privacy-policy.md](privacy-policy.md). Public policy: [ClaudeBuddy Privacy Policy](https://abhikmp.github.io/claudebuddy-chrome-ext/privacy-policy.html). Unauthenticated HTTP 200 and exact source-byte equality verified on 28 October 2026. Use this URL in the new item's dashboard; the [launch checklist](launch-checklist.md) records the remaining Store steps. Keep the legacy product policy separate.
