# Adopt the user-selected paper-cut crab

Date: 2026-10-26. Baseline: 2c9f55a.

User requests: “lets make this the logo” (attached `images/webstore_images/claudebuddy_logo.png`) and “also update other promo images with this new update”. Prior constraint persists: circular toolbar usage icons, logo only for extension management and Web Store branding.

Use the exact supplied image as the tracked brand master and resize it for 16/48/128px extension icons and the Store icon. Preserve the circular usage assets and manifest action defaults. Refresh the existing marquee, Store tile and two project promo exports, plus the three current production listing screenshots' logo headers. Preserve actual popup rendering; generated promos must not invent UI or imply continuously live usage. Keep the user's input unchanged.

Use built-in imagegen with the selected logo as the reference for four promotional compositions. Save final artwork in the existing image paths and in tracked release assets; export the existing pixel dimensions. Record prompts and provenance. Update app context/branding docs and rebuild the exact release ZIP. Source/ZIP verification and appropriate existing tests must pass. No Store upload or signed-in QA is part of this change.

## Validation

- Supplied logo and tracked brand master are byte-identical. Icon exports are 16/48/128px, with the selected dark slate background retained.
- All 12 toolbar PNGs match the baseline byte for byte; manifest action defaults and service worker are unchanged.
- Four final promo exports were inspected at target size for character consistency, complete claws, legible accurate copy and margins. Exact prompts and tracked high-resolution sources are in `assets/branding/promo-prompts.json`.
- Three 1280 × 800 RGB listing screenshots were recaptured with CUA from the extracted-production sample fixture. Comparison and Forget/Undo states were verified; these are synthetic sample renders, not signed-in QA or a rerun of prior browser assertion suites.
- Full Node suite: 64 tests passed, zero failures. No JS/typechecking configuration change.
