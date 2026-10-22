# QuotaBeacon privacy disclosure

Prepared for version 1.0.0, 2026-10-22. The following text is ready to paste into the new listing and its privacy policy.

## Disclosure text

QuotaBeacon shows Claude quota usage, reset times, peak hours and outage status. It uses quota information returned when you send messages on claude.ai and reads organization details from Claude using your existing signed-in session to label each Account.

Account IDs, Account names (which may be email addresses), usage percentages, quota reset times and last-reading times are stored locally on your device in this extension's Chrome profile. Account names and Usage readings are never uploaded or transmitted by QuotaBeacon to the developer or other third parties, and are never stored in Chrome sync storage. QuotaBeacon does not save or upload your prompts, replies or conversation history. It has no analytics, advertising or developer-operated backend.

The extension requests public incident information from status.claude.com and organization details from claude.ai over HTTPS. Organization-detail requests include the relevant organization ID and use the browser's existing Claude session; QuotaBeacon does not save your session cookies or ask for an API key. Your timezone, Watched products and theme preferences use Chrome sync storage and may sync through Chrome if browser sync is enabled. Account names and Usage readings do not sync.

Accounts without a new Usage reading for more than 48 hours are removed when the extension next runs its cleanup. “Reset to default” forgets all stored Accounts and restores the default preferences. Removing the extension clears its local extension storage.

QuotaBeacon uses this information only to provide its displayed features. It does not sell user data or use it for advertising, profiling or credit decisions. Its use of user information follows the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Developer Dashboard copy

**Single purpose:** Show Claude quota usage and availability at a glance, with per-Account readings, reset times, peak hours and relevant incident status.

| Requested permission | Justification |
| --- | --- |
| `storage` | Keep Account names and Usage readings locally; save timezone, Watched products and theme preferences in Chrome sync storage. |
| `alarms` | Refresh public incident/peak status every five minutes and check quota expiry and inactive Accounts every 30 seconds. |
| `scripting` | Attach bundled capture scripts to Claude tabs already open when QuotaBeacon is installed or updated. |
| `https://claude.ai/*` | Read quota information from completion responses and fetch the corresponding Account label through the signed-in Claude session. |
| `https://status.claude.com/*` | Read the public incident summary for the status pill, badge and tooltip. |

**Remote code:** No remotely hosted executable code. All scripts ship in the extension package; network responses are data.

Account names and email addresses are handled locally, so do not reuse a blanket “does not handle user data” disclosure. Complete the dashboard's data-use fields for the actual local handling above and use the same wording in the published privacy-policy URL. Chrome requires disclosure even for local processing. [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), [Privacy practices fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

Storage behavior follows [Chrome's storage API](https://developer.chrome.com/docs/extensions/reference/api/storage). Publishing or editing the existing Google Docs policy is a separate publisher action; this file does not claim that any hosted policy or store field has been updated.
