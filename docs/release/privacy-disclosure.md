# QuotaBeacon dashboard declarations

Prepared 2026-10-24 for 1.0.0. Use with the [policy](privacy-policy.md), [listing](store-listing.md) and [audit](policy-audit.md). No dashboard or hosted policy has been changed.

Single purpose: Help Claude users assess quota and service availability through captured per-Account quota readings, reset times, peak hours and relevant incidents.

| Permission | Justification |
| --- | --- |
| storage | Keep encrypted Account identities, names, readings and temporary Undo recovery locally; save timezone, watched-product and theme preferences with Chrome sync. |
| alarms | Refresh public status every five minutes and update the icon at observed quota expiry every 30 seconds. No age-based Account deletion. |
| scripting | Attach bundled capture scripts to Claude tabs already open during install/update. |
| https://claude.ai/* | Observe supported message-completion responses for quota events and obtain Account labels through the signed-in same-origin organization endpoint, across Claude chat routes. |
| https://status.claude.com/* | Read the public incident summary for the popup, badge and tooltip. |

Remote code: **No**. All executable logic ships as readable JavaScript in the ZIP. Network responses supply data, not executable logic. No remote scripts/imports, eval or remote WebAssembly.

## Data-use fields

Disclose local and transient handling. Conservative selections for the actual flows:

| Category | Selection and scope |
| --- | --- |
| Personally identifiable information | Yes: Account UUID and organization name, possibly an email. Encrypted local retention, no developer collection. |
| User communications | Yes: cloned completion streams can transiently contain reply/chat content while extracting quota. No chat retention or onward transmission; prompt bodies are not inspected. |
| Website content | Yes: organization responses, quota events and transient completion bytes. Only quota/label projections retained. |
| Web history | Yes, limited: relevant Claude completion URLs/organization headers observed to identify readings. No general history access/retention; no history permission. |
| Authentication information | Yes, limited: browser-managed existing Claude session authenticates organization requests. No cookie/token values, passwords or API keys read or saved. |
| Health, financial/payment, location, user activity | No health/payment/location, keystroke/mouse logging or behavioral analytics. A message-triggered quota observation is not general activity tracking. |

The broad categories intentionally disclose transient/session handling; the explanations distinguish it from retained data. Map any changed dashboard definitions to these actual flows. Do not select blanket “no user data,” and do not claim Google has accepted these answers.

Affirm the three dashboard certifications for this build: no sale/unrelated transfers, no unrelated uses, and no creditworthiness/lending uses. No ads, brokers, analytics or developer backend. Owner must maintain these commitments after release.

Limited Use: QuotaBeacon's use of user information adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.

Policy hosting, verified public URL and publisher/contact confirmation belong to [ticket 06](../../.scratch/account-overview/issues/06-manual-repository-migration-and-store-launch.md). Keep the legacy policy separate.
