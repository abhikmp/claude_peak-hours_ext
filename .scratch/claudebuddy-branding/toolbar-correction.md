# Restore circular toolbar usage indicators

User request: “dont use the icon here, i need the old format with circular icons. logo will be used only for extension logo in extesnion page and webstore listing”.

Keep the ClaudeBuddy name and coral crab in manifest.icons and the Store assets. Restore plain green/orange/red toolbar circles, including action.default_icon before the worker starts. Keep the original 8% inset, usage thresholds, PEAK/DOWN badges and tooltip behavior. Correct the standalone app context so future logo exploration respects this separation.

The existing worker's packaged icon paths stay unchanged; only their PNG pixels change. The renderer now draws antialiased circles independently of the mascot. No Account, capture, storage, popup or status code changes are needed.

Validation: all 64 existing Node tests pass. Inspect all 12 circular PNGs for correct dimensions, solid palette centers, transparent corners, and symmetry; verify the manifest separates the brand from the toolbar. Inspect a native-size light/dark proof. Rebuild the release candidate using the existing builder and verify exact ZIP/source equality. Prior browser lifecycle evidence is reused; no live browser/Claude session is claimed for this asset correction.

Review baseline: 411021e. Review spec: this file and the latest user correction.
