# QuotaBeacon Store listing

Prepared 24 October 2026; copy only. Upload assets/text during ticket 06.

Title: **QuotaBeacon**

Short description (manifest, 89 characters): Track Claude usage across accounts, with quota reset times, peak hours and outage status.

Recommended language: English. Recommended category: Productivity (use the matching Tools/productivity category offered by the dashboard). No mature content. Distribution visibility/regions and publisher identity are owner decisions in ticket 06.

Single purpose: Help Claude users assess quota and service availability through per-Account captured readings, reset times, peak hours and relevant incidents.

## Detailed description — paste this section

See your last captured Claude quota and service availability in one compact popup.

QuotaBeacon observes supported five-hour quota events after you send messages on claude.ai. Compare up to three remembered Accounts through detailed slides, or four or more through a searchable table. Each reading keeps its actual age and captured reset time so you can distinguish observations from estimates and unknown usage.

• Usage-driven toolbar colors: green, orange and red follow the Account with the latest reading.
• Account comparison: stable table rows, search, reset timing and detailed inspection.
• Remembered Accounts stay until you forget them or reset the extension. Confirm removal, Undo for 2.5 seconds, and rediscover an Account through a later message.
• Service availability: public Claude incidents, watched-product alerts and the configured weekday 5–11 AM Pacific peak-hours window.
• Light/dark themes, timezone preferences and a fixed 260 × 340px popup.

Readings update only when Claude returns a supported numeric five-hour quota event. This is not continuously live quota monitoring. A passed captured reset does not prove full current quota: short estimates are labelled, then usage becomes unknown. No weekly/token tracking, usage-limit increases or performance guarantees.

Account names (which may include emails), identifiers, readings and temporary Undo recovery are encrypted locally. Preferences may sync through Chrome. Capture temporarily processes copied Claude response streams to extract quota; chat content is not saved or uploaded. Organization labels use your existing signed-in Claude session; public availability comes from status.claude.com. No API key, ads, analytics or developer backend.

Requires Chrome 120 or later, access to claude.ai, and Claude returning a supported quota event. Some plans or site changes may not expose one. QuotaBeacon is independent of Anthropic and is not an official Claude product.

## Assets and URLs

Required assets: [128px icon](../../.scratch/account-overview/05-release/assets/icon-128.png), [usage](../../.scratch/account-overview/05-release/assets/01-usage.png), [comparison](../../.scratch/account-overview/05-release/assets/02-compare.png), [Forget/Undo](../../.scratch/account-overview/05-release/assets/03-forget.png). Screenshots are 1280 × 800 PNGs, safe samples rendered with extracted production code; no labs/pickers. Do not upload the QA HTML pages.

Policy source: [privacy-policy.md](privacy-policy.md). Final public policy/support/homepage URLs and publisher contact are confirmed in ticket 06 after hosting/rename. No fake or unverified URL is provided. Optional promo/video assets are not required.
