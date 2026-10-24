# ClaudeBuddy 1.0.0 — release-candidate handoff

Ticket 05 prepares the candidate; [ticket 06](../issues/06-manual-repository-migration-and-store-launch.md) owns final live/package checks, owner decisions and launch. No Store submission/publication, real signed-in QA, policy hosting or GitHub migration has occurred.

## Use these artifacts

- [Release ZIP](claudebuddy-1.0.0-rc.zip), [SHA-256](SHA256SUMS), [source revision and per-file hashes](package.json). Explicit 30-file allowlist with manifest at root; exact extraction verified.
- [Verification/evidence](verification.md): 64 Node tests and 397 browser assertions; synthetic conditions are identified, existing #08 reporter evidence linked.
- [Privacy policy](../../../docs/release/privacy-policy.md), [dashboard declarations/permissions](../../../docs/release/privacy-disclosure.md), [policy/security/branding/licensing audit](../../../docs/release/policy-audit.md).
- [Store title/descriptions/category/language/assets](../../../docs/release/store-listing.md), [reviewer instructions](../../../docs/release/reviewer-instructions.md), [release notes](../../../docs/release/release-notes.md).
- Required assets: [128px PNG icon](assets/icon-128.png), [usage screenshot](assets/01-usage.png), [comparison screenshot](assets/02-compare.png), [Forget/Undo screenshot](assets/03-forget.png). Three 1280 × 800 PNGs with safe samples.
- [Final signed-in extracted-build checklist](../../../docs/release/manual-qa.md). Every row remains pending for 06.

## What remains in 06

Confirm publisher/contact identity, access and trader/distribution/licence decisions; validate the contact/Support hub route used by the policy. Exercise the exact extracted ZIP with real authorized Claude access and three distinct Accounts, including encryption/storage restrictions and both transports where available. Then follow 06's legacy preservation, reviewed migration/rename, public policy hosting, new Store item submission/review/publication and existing-user transition sequence. No credentials or private verification documents belong in these artifacts.

Runtime encryption uses AES-256-GCM and a separate non-extractable local key, not a hardware/OS vault; full-profile compromise remains a limit. Policy wording discloses transient reply-stream processing and browser-managed session use. No unrelated collection, developer backend or analytics is present.

If QA or an owner decision changes runtime contents, return to 05: fix sources, commit the runtime, rebuild with python tools/build-release.py, rerun affected checks and update this evidence/checksum before upload. Never edit the ZIP manually. The runtime aggregate/per-file hashes establish byte identity even when later commits only update documentation/evidence.

## ClaudeBuddy rebrand follow-up

User approved the name and a friendly, warm, crisp crab with cute eyes. See [branding brief/proof](../../claudebuddy-branding/brief.md) and [source/prompt notes](../../../assets/branding/README.md). Current screenshots and active ZIP are ClaudeBuddy. The runtime allowlist has 30 files, including 12 packaged quota-color circle PNGs. The user subsequently clarified that the crab belongs only on the extension management page and Web Store listing. Toolbar indicators, including the manifest default, are plain circles. The rebrand reran all 64 Node tests and the 26 encrypted-popup checks; unaffected layout evidence from ticket 05 remains reused. Internal storage/key/bridge identifiers remain intentionally compatible.

Branding [Standards/Spec review](../../claudebuddy-branding/review.md) covers the initial rebrand. The toolbar correction is documented [separately](../../claudebuddy-branding/toolbar-correction.md), with native-size proof and current validation. Current runtime source is d9f9066; SHA256SUMS/package.json identify its ZIP. All 64 Node tests pass for the correction; the 12 circle assets and manifest role separation were checked, and the rebuilt ZIP/extraction exactly match source. Earlier browser evidence is reused; no new live browser run is claimed for this asset correction.
