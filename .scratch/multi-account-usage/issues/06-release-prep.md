# 06: Release prep

**What to build:** Prepare QuotaBeacon as a new Chrome Web Store extension, including the current popup redesign and blinking badge changes. Start the new listing at version 1.0.0, write the Chrome Web Store privacy-disclosure wording (account names, which may be email addresses, and Usage readings are stored locally on the device and never transmitted), update `design.md` to match the code (the icon is never grey; default Watched product is Claude AI only), and add a short manual QA checklist. Publishing the new listing and unpublishing the existing Peak Hours for Claude listing are separate actions.

**Blocked by:** 05.

**Status:** ready-for-human

- [x] The manifest uses the user-selected QuotaBeacon name and version 1.0.0 for a new listing, with no legacy listing key or update URL.
- [x] Privacy-disclosure text is written and ready to paste into the store listing.
- [x] `design.md` matches the code and the spec, including the multi-account hero.
- [x] A QA checklist covers: one account, two accounts, switching accounts, an account at 100%, an expired reading, the 48-hour drop, a failed label fetch, reset to default, light and dark themes, and an outage and peak-hours pass (pill, badge, tooltip unchanged).
- [x] The checklist records the result of the two assumptions from ticket 03.
- [x] `CONTEXT.md` is updated if any term changed during implementation.

## Comments

- 2026-10-22: Starting point `d3ce036` on `feature-usagebar`. The user changed the distribution plan from updating Peak Hours for Claude to creating a separate extension, including the existing working popup redesign and badge changes. The final selected name is **QuotaBeacon**. This supersedes intermediate naming choices and the original requirement to bump above the existing listing's version; the new listing starts at 1.0.0. No store submission or removal is part of this implementation.
- The legacy [store listing](https://chromewebstore.google.com/detail/peak-hours-for-claude/dbkdgeflnhcjhimmonjliogncicpcebb) displayed version 1.0.0 when checked on 2026-10-22. A new item must be created in the developer dashboard; changing a manifest name alone does not create a separate listing or migrate existing users.
- Prepared [privacy copy](../../../docs/release/privacy-disclosure.md), [manual release checklist](../../../docs/release/manual-qa.md), the current design reference and a runtime-only ZIP. Domain terms are unchanged; CONTEXT.md's heading now uses QuotaBeacon. The user-authorized existing popup/theme/badge changes are included so the committed release matches the tested working product.
- The checklist records the two ticket 03 live assumptions as passed (HTTP 200 and a non-empty organization name), plus the later stored-label, two-Account and age-display confirmations. It leaves final package/live timestamp/status passes and store publication steps unchecked; a prepared checklist is not a claim of completed publication QA.
- All 30 tests, JavaScript syntax checks, package/source hashes and local documentation links pass. The extracted package's popup was browser-checked with development fixtures. Spec review found no issues; a minor redundant helper from Standards review was removed without changing the outage presentation. See [verification evidence](../06-release/verification.md).
