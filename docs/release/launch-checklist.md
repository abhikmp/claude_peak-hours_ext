# Ticket 06: repository migration and Store launch

Status: in progress. Updated 28 October 2026. Publication is complete only when the real Store outcome and installation check are recorded.

## Verified preparation

- [x] Publisher decisions complete; repository renamed to `abhikmp/claudebuddy-chrome-ext` and `legacy` branch created.
- [x] Publisher confirms latest candidate `b1b0f701be863b1da5dd95941d8c8a718495a85a14b2461a4e43a3ac81627cef` passed real capture, Account switching and toolbar checks after the fixes.
- [x] Timezone issue retained separately and explicitly deferred until after release.
- [x] Remote branches fetched; pre-migration `main` and `legacy` point to `acfeac154aaed56d2ce354fd9f4614064f0cfeb7`.
- [x] Published legacy CRX checked against that source: executable/data/icon files match exactly; manifest matches after removing Store-added `update_url`; one packaged screenshot differs. Preserve the exact old package independently rather than claiming full source/package byte equality.

## Repository release

- [x] Preserve the published legacy ZIP/CRX, source archive, checksums and comparison record in the [legacy GitHub Release](https://github.com/abhikmp/claudebuddy-chrome-ext/releases/tag/peak-hours-v1.0.0), with annotated tag `peak-hours-v1.0.0` at the verified source commit. All five assets are uploaded with matching SHA-256 digests.
- [x] Keep the current source tree focused on the extension, tests, tools, final Store assets and maintained docs. Local working notes and generated artifacts remain ignored; promotional videos are excluded. The confirmed promotional MP4 was deleted locally; supporting workflow files remain local and ignored.
- [ ] Commit to `feature-usagebar` after verification: 76 Node tests pass, all 30 runtime hashes match the publisher-tested ZIP, the rebuild reproduces its SHA-256 exactly, documentation links and policy regeneration pass, and [Standards/Spec review](review.md) has no unresolved findings.
- [ ] Merge the reviewed feature branch through a PR without replacing history. Keep `main` as default and preserve `legacy` as the archived Peak Hours source.
- [ ] Associate the verified ClaudeBuddy source tag, ZIP, checksums and source record with a GitHub prerelease. Mark Store publication separately.
- [ ] Host the ClaudeBuddy privacy policy at a final public URL and verify logged-out access. Retain the old product's policy independently.

## Chrome Web Store

Use [listing copy and final assets](store-listing.md), [data-use declarations](privacy-disclosure.md), [privacy policy](privacy-policy.md) and [reviewer instructions](reviewer-instructions.md).

- [ ] Confirm publisher account/access requirements are complete.
- [ ] Create a **new ClaudeBuddy item**, upload the verified ZIP, and enter the listing, assets, declarations, policy/support URLs, reviewer access and owner-selected visibility/regions. Keep the old Peak Hours item separate.
- [ ] Submit for review and record its actual item ID/status. After approval, publish at the publisher's chosen time.
- [ ] Install the approved Store build under its new ID; verify capture, popup/preferences and toolbar. Record the Store URL/version/result without Account details.
- [ ] Decide and carry out communication to existing Peak Hours users, and record whether the legacy listing remains published. GitHub migration and a new item do not transfer installed users or saved readings.

Browser automation stopped during the prior attempt because it could not reliably determine Chrome's current URL for safety checks. No Store transaction was completed. Use a supported browser session or publisher-run steps for the remaining dashboard work. The original local ticket/history remains in ignored `.scratch/account-overview/`.
