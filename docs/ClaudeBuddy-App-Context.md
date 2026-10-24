# ClaudeBuddy — App Context

## What ClaudeBuddy is

ClaudeBuddy is a compact Chrome extension that helps people understand their Claude usage and service availability at a glance.

It brings three things together:

1. **Usage:** the most recently captured five-hour quota reading and its reset time.
2. **Peak hours:** an indication of the configured weekday peak-hours window.
3. **Outages:** public Claude service incidents affecting the products the user watches.

**Tagline:** Usage, peak hours & outage status for Claude.

ClaudeBuddy is a companion to using Claude, rather than a chatbot or an alternative chat interface. It is an independent product, not made by or affiliated with Anthropic.

## Who it helps

ClaudeBuddy is for people who use Claude regularly and want a quick way to check usage and availability without interrupting their work. This can include developers, writers, researchers, students, and other everyday Claude users.

It is also useful for people who use multiple Claude Accounts in the same Chrome profile and want to compare their last captured readings in one place.

## The problem it solves

While working with Claude, users may want to know:

- How much of my five-hour quota did my last reading show as used?
- When does that captured quota window reset?
- Which of my remembered Accounts have recent readings?
- Am I within the configured peak-hours window?
- Is there a public incident affecting a Claude product I use?

ClaudeBuddy puts these signals into a small browser popup and a recognizable toolbar icon. The experience is intended to feel helpful, calm, and easy to check.

## Main features

### Five-hour usage and reset timing

After the user sends a message on claude.ai, ClaudeBuddy captures a Usage reading when Claude supplies a supported numeric five-hour quota event.

The popup presents the percentage used, a progress bar, the captured reset time, and the age of the actual reading. Usage colors communicate increasing consumption:

| Usage in the Active Account's reading | Toolbar color |
| --- | --- |
| 0–60% used | Green |
| Above 60% through 85% used | Orange |
| Above 85% used | Red |

The **Active Account** is the Account that produced the newest Usage reading. Browsing another Account in the popup does not change Active. Logging in alone does not switch it; a new reading does.

Readings are observations, not continuously live quota measurements. After a captured reset passes, the interface briefly shows explicitly labelled estimates, then unknown current usage. Missing or expired readings use a neutral green toolbar icon; that does not prove full quota is available.

ClaudeBuddy does not track weekly usage or token totals, and it cannot increase Claude's limits.

### Multiple remembered Accounts

ClaudeBuddy remembers separate Account readings within the same Chrome profile. An Account corresponds to a Claude organization, so it is not necessarily identical to a login or a separate browser profile.

- **One Account:** a single detail view.
- **Two or three Accounts:** individual detail slides with arrow navigation.
- **Four or more Accounts:** Active detail plus a searchable comparison table of the other Accounts.

The table shows Account name, usage, reset timing, and reading age. Users can inspect a row and return to their previous search and scroll position. Rows stay stable while the user is browsing, even when readings update.

Accounts stay remembered until deliberately forgotten or cleared through reset. A non-Active Account can be forgotten with confirmation, followed by a **2.5-second Undo** opportunity. A later real Usage reading can add a forgotten Account again.

### Peak-hours information

ClaudeBuddy identifies the configured peak-hours window: **weekdays, 5 AM to 11 AM Pacific Time**.

It shows peak/off-peak information and relevant timing in the user's chosen timezone. A **PEAK** toolbar badge provides an additional signal.

This is a fixed schedule indicator, not a measurement or prediction of Claude's actual response speed. It does not guarantee that off-peak service will be faster.

### Public outage and incident information

ClaudeBuddy reads public status information from status.claude.com, normally refreshing it every five minutes.

Users can choose which supported product groups to watch: **Claude AI, Claude Code, Cowork, and Design**. Claude AI is selected by default.

When a watched product has a relevant incident, the popup shows outage information and the toolbar can display **DOWN**. DOWN takes priority over PEAK. The toolbar tooltip provides related status information.

Usage colors and availability badges communicate separate things: a red usage icon means high observed quota consumption, rather than necessarily an outage.

### Preferences and compact interface

- Fixed **260 × 340px** popup.
- Light and dark themes.
- Configurable timezone.
- Watched-product selection.
- Keyboard navigation and accessible controls.
- Internal scrolling for long Account lists.
- Reset to default, which clears remembered Accounts and restores default preferences.

The product is deliberately compact. It is a quick browser companion, rather than a large analytics dashboard.

## Privacy and trust

Account identities, names, readings, and temporary Undo recovery are encrypted in local extension storage. Account names can contain email addresses. Preferences may sync through Chrome, but Account readings do not.

ClaudeBuddy uses the existing signed-in Claude session for same-origin Account-name requests and HTTPS requests for public status information. It does not require an API key.

Copied completion responses can transiently contain conversation content while quota events are extracted. Conversation content is not retained or uploaded by the extension. ClaudeBuddy has no advertising, analytics, or developer-operated backend.

The product should communicate clarity and trust without claiming perfect security, guaranteed availability, or always-current quota readings.

## Brand personality and name

The name **ClaudeBuddy** expresses the idea of a helpful companion that keeps useful signals close at hand. “Buddy” fits the combination of usage, peak-hours, and outage information.

The desired personality is:

- Friendly and warm.
- Approachable and reassuring.
- Clear and practical.
- Cute and memorable, while still suitable for a productivity tool.
- Calm and helpful rather than loud or alarming.

The brand should feel like a small companion looking out for the user while they work with Claude.

## Logo design context

The current preferred direction is an **original friendly crab mascot**. The crab should have a warm expression, a recognizable silhouette, clean crisp edges, and cute eyes. A rounded body, expressive claws, and a gentle smile fit this direction. “Sharper” means a more precise graphic shape, rather than aggressive or spiky anatomy.

Warm coral is the current main brand-color direction. Dark facial features and small light eye highlights can help convey friendliness. Different visual treatments can be explored; this description is creative context rather than a requirement to reproduce an existing drawing.

The logo needs to work as:

- A recognizable icon on Chrome's extension management page.
- A larger app or Store icon, including at **128px**.
- A mark on both light and dark backgrounds.
- A mascot that can also appear in promotional imagery or motion.

The logo is reserved for the extension management page and Web Store listing. The browser toolbar uses the original simple green, orange, and red circular usage indicators. Do not replace those circles with the mascot or recolor the mascot to communicate usage levels.

The mascot must be an original ClaudeBuddy character. It should not imply that the extension is an official Anthropic product or simply reproduce an existing Claude, Clawd, or Anthropic character or logo.

## Product boundaries

ClaudeBuddy provides helpful usage observations and public availability signals. It does not send messages for the user, automatically switch Accounts, bypass limits, provide a separate AI assistant, or guarantee current quota or service performance.

The current product is a Chrome extension requiring Chrome 120 or later. Version 1.0.0 is prepared as a release candidate; a published Store listing is not assumed.

## Short reusable description

ClaudeBuddy is an independent Chrome extension for Claude usage, peak hours, and outage status. It shows captured five-hour quota readings and reset times, compares remembered Accounts, and surfaces public service incidents in a compact light/dark popup. Its circular toolbar indicator changes between green, orange, and red according to the Active Account's observed usage. The brand should feel like a friendly, warm, trustworthy little companion, with an original cute crab logo reserved for the extension management page and Web Store listing.
