# Restore circular toolbar usage indicators

User request: “dont use the icon here, i need the old format with circular icons. logo will be used only for extension logo in extesnion page and webstore listing”.

Keep the ClaudeBuddy name and coral crab in manifest.icons and the Store assets. Restore plain green/orange/red toolbar circles, including action.default_icon before the worker starts. Keep the original 8% inset, usage thresholds, PEAK/DOWN badges and tooltip behavior. Correct the standalone app context so future logo exploration respects this separation.

The existing worker's packaged icon paths stay unchanged; only their PNG pixels change. The renderer now draws antialiased circles independently of the mascot. No Account, capture, storage, popup or status code changes are needed.

Validation: all 64 existing Node tests pass. Inspect all 12 circular PNGs for correct dimensions, solid palette centers, transparent corners, and symmetry; verify the manifest separates the brand from the toolbar. Inspect a native-size light/dark proof. Rebuild the release candidate using the existing builder and verify exact ZIP/source equality. Prior browser lifecycle evidence is reused; no live browser/Claude session is claimed for this asset correction.

Review baseline: 411021e. Review spec: this file and the latest user correction.

## Results

- Standards review: 0 findings in 411021e...d9f9066; no documented-standard violations or baseline smells.
- Spec review: 0 findings; circular defaults and dynamic indicators restored, crab restricted to management/Store branding, behavior unchanged.
- Both reviewers independently verified PNG roles/pixels and rebuilt ZIP/source byte equality.
- [Native-size light/dark proof](toolbar-correction-proof.png) inspected. All 64 Node tests and all 12 PNG checks passed. No new browser lifecycle run.
- Runtime source: d9f9066856576c4ebf6ce4d37ae3eb8529076d19. ZIP SHA-256: e7c3f9e52dea3b348aeccf84022e4babde8d461ba10ad251768bc80bfae4aecf. Later documentation/evidence commits do not change runtime bytes.
