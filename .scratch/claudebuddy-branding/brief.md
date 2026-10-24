# ClaudeBuddy branding amendment

Current amendment: the user later restricted the crab to extension management and Store branding, restoring the original toolbar circles. [Toolbar correction and validation](toolbar-correction.md) supersede the toolbar-crab scope and package identity below, which describe the initial rebrand. The active package record is in ticket 05's package.json/SHA256SUMS.

Status: complete; ready-for-human review and the existing manual launch phase.
Starting revision: c9213bdc5e3dce34252322d3709c4a0f58124f34 on feature-usagebar.

User approved renaming QuotaBeacon to ClaudeBuddy because it covers usage, peak hours and outages. User requested a crab-like companion, then refined it: friendlier and warmer, sharper/crisper, with cuter eyes. Product tagline: “Usage, peak hours & outage status for Claude.”

Scope: original coral crab source asset, manifest/install/Store icons, recognizable green/orange/red toolbar variants retaining quota thresholds, current product/docs/privacy/Store branding and regenerated listing screenshots, refreshed verified release candidate/checksum/source record. Retain encrypted storage format/database and capture bridge namespaces so existing readings, labels, recovery and key remain usable. Do not change popup layout, Account semantics or feature behavior. No remote repository rename, policy hosting, signed-in operation or Store publication.

Validation: run existing Account/worker/status/capture tests, syntax/whitespace checks, inspect real-size icons in both themes, exercise encrypted production popup with the extracted new artifact, rebuild required 1280 × 800 listing assets. Reuse unaffected ticket 05 evidence explicitly, rather than labelling earlier checks as rerun. Final review uses Standards/Spec axes. Commit on current branch.

The active package and final handoff remain in [ticket 05 release](../account-overview/05-release/HANDOFF.md); manual launch remains [ticket 06](../account-overview/issues/06-manual-repository-migration-and-store-launch.md).

## Verification

- Existing full Node suite: 64 passing, zero failures ([result](node-results.txt)). Runtime syntax checks pass through the release builder; no typechecking configuration exists.
- Extracted ClaudeBuddy popup: 26 encrypted lifecycle assertions pass, including migration, saved-key reuse after recreation, Forget/Undo, Active/icon update, unreadable-record Reset and subsequent capture. Result is saved in the active release evidence; earlier unaffected layout evidence is reused explicitly.
- [Icon proof](icon-proof.png): coral at 16/48/128px and quota crabs at native 16px, on light/dark backgrounds. All exported PNGs retain alpha transparency. Green/orange/red body hues preserve the existing thresholds and dark/catchlight facial features.
- Three 1280 × 800 production Store screenshots were regenerated with ClaudeBuddy name/crab, safe sample readings and no design controls.
- Build validates 30 explicit runtime files, manifest name/45-character description, all PNG sizes, extraction/source byte equality and checksums. Original generated source/prompt notes stay outside the runtime package.
- Encrypted format/database and bridge identifiers remain unchanged by inspection; both capture transports pass the full suite.

Independent [Standards/Spec review](review.md): zero findings on both axes. Final runtime source revision is 15fb678964a0c230bc891a5041e398c2a1785f9d. Current ZIP SHA-256: `483c891b8fcf31d9a629eb23e8f1e106e0387dc036c4eccbee060b5eeadb71bf`. The final active candidate is [claudebuddy-1.0.0-rc.zip](../account-overview/05-release/claudebuddy-1.0.0-rc.zip). Earlier QuotaBeacon candidate remains available in Git history and is removed from the active release directory.
