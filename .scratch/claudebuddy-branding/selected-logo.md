# Adopt the user-selected paper-cut crab

Date: 2026-10-26. Baseline: 2c9f55a.

User requests: “lets make this the logo” (attached `images/webstore_images/claudebuddy_logo.png`) and “also update other promo images with this new update”. Prior constraint persists: circular toolbar usage icons, logo only for extension management and Web Store branding.

Use the exact supplied image as the tracked brand master and resize it for 16/48/128px extension icons and the Store icon. Preserve the circular usage assets and manifest action defaults. Refresh the existing marquee, Store tile and two project promo exports, plus the three current production listing screenshots' logo headers. Preserve actual popup rendering; generated promos must not invent UI or imply continuously live usage. Keep the user's input unchanged.

Use built-in imagegen with the selected logo as the reference for four promotional compositions. Save final artwork in the existing image paths and in tracked release assets; export the existing pixel dimensions. Record prompts and provenance. Update app context/branding docs and rebuild the exact release ZIP. Source/ZIP verification and appropriate existing tests must pass. No Store upload or signed-in QA is part of this change.

Typography amendment: the user found the initial promo lettering generic. Refine all four promo compositions with a warm editorial serif wordmark and quieter humanist sans-serif feature copy, with better hierarchy, spacing and margins. Preserve the selected logo and circular toolbar assets. This concerns promotional typography; no popup font change is requested.

## Validation

- Supplied logo and tracked brand master are byte-identical. Icon exports are 16/48/128px, with the selected dark slate background retained.
- All 12 toolbar PNGs match the baseline byte for byte; manifest action defaults and service worker are unchanged.
- Four final promo exports were inspected at target size for character consistency, complete claws, legible accurate copy and margins, including the user's later typography refinement. Current prompts and high-resolution sources are recorded in `assets/branding/typography-prompts.json`; initial composition prompts/history are in `promo-prompts.json`.
- Three 1280 × 800 RGB listing screenshots were recaptured with CUA from the extracted-production sample fixture. Comparison and Forget/Undo states were verified; these are synthetic sample renders, not signed-in QA or a rerun of prior browser assertion suites.
- Full Node suite: 64 tests passed, zero failures. No JS/typechecking configuration change.

- Rebuilt 30-file ZIP/source/extraction equality and checksums pass. Runtime source is a397d2a22d7f067dde792ceb1fd5e94f4dbda430; later typography/promotional/documentation changes are outside runtime. ZIP SHA-256: `9b0e6fdc8d7a1757b3eab03ec2c5e221a2f440f7d828d0fbacd279e90debb76d`.
