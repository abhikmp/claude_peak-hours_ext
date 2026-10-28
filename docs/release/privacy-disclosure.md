# ClaudeBuddy dashboard declarations

Updated 28 October 2026 for 1.0.0. Use with the [policy](privacy-policy.md), [listing](store-listing.md) and [audit](policy-audit.md). These are recommendations based on the packaged code; the publisher reports submission pending review, but the actual dashboard selections have not been independently verified.

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

Disclose local and transient handling. [Google's User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) requires disclosure even for data processed or stored only on the user's device. Recommended selections for the actual flows:

| Category | Selection and scope |
| --- | --- |
| Personally identifiable information | Yes: Account UUID and organization name, possibly an email. Encrypted local retention, no developer collection. |
| User communications | Yes: cloned completion streams can transiently contain reply/chat content while extracting quota. No chat retention or onward transmission; prompt bodies are not inspected. |
| Website content | Yes: organization responses, quota events and transient completion bytes. Only quota/label projections retained. |
| Web history | Yes, limited: relevant Claude completion URLs/organization headers observed to identify readings. No general history access/retention; no history permission. |
| User activity | Yes, limited: network observation of supported Claude completion requests to extract Usage readings, including their received-reading timestamps. No keystroke/mouse logging or behavioral analytics. |
| Authentication information | No: organization requests use the browser-managed existing Claude session, but the extension does not extract or save authentication-cookie/token values, passwords or API keys. |
| Health, financial/payment, location | No intentional health/payment collection, geolocation or IP-based location tracking. Timezone is a display preference. |

The categories disclose transient handling as well as retained data. This corrects the earlier overbroad Authentication selection and makes the narrow network observation explicit under User activity. Map any changed dashboard definitions to these actual flows. Do not select blanket “no user data,” and do not claim Google has accepted these answers.

Affirm the three dashboard certifications for this build: no sale/unrelated transfers, no unrelated uses, and no creditworthiness/lending uses. No ads, brokers, analytics or developer backend. Owner must maintain these commitments after release.

Limited Use: ClaudeBuddy's use of user information adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.

The owner confirmed all publisher/contact decisions complete on 27 October 2026 and reported submission pending review on 28 October. Project: [claudebuddy-chrome-ext](https://github.com/abhikmp/claudebuddy-chrome-ext). Support: [GitHub Issues](https://github.com/abhikmp/claudebuddy-chrome-ext/issues). The [public privacy policy](https://abhikmp.github.io/claudebuddy-chrome-ext/privacy-policy.html) is hosted; the [launch checklist](launch-checklist.md) records the remaining review, publication and installation checks. Keep the legacy policy separate.
