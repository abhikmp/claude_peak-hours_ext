# ClaudeBuddy mascot

The current [claudebuddy-crab.png](claudebuddy-crab.png) is the exact user-selected image supplied on 26 October 2026 as `images/webstore_images/claudebuddy_logo.png`. It shows a warm coral paper-cut crab with cream eye highlights, cheeks, layered claws and soft shadows on a dark slate square. The source image is preserved without visual editing, including its background and corner detail; icon files are resized exports. Its external generation provenance is not recorded here.

`python tools/render-icons.py` exports this source to the 16/48/128px coral brand icons for the extension management page and Web Store listing. The toolbar uses separate 16/32/48/128px green/orange/red circles, matching the original 8% inset and quota palette. The mascot is not used in the toolbar, including its manifest default. The source asset is a development/branding resource and is excluded from the runtime ZIP; all exported runtime PNGs are included explicitly.

## Current promotional artwork

Four matching compositions were generated with built-in image_gen using the selected logo as reference. [Exact prompts](promo-prompts.json) record the reference, tracked high-resolution sources in `promo-sources/`, output paths and dimensions. The finished exports are in the [release assets](../../.scratch/account-overview/05-release/assets/): marquee 1400 × 560, Store tile 440 × 280, project banner 820 × 300 and compact tile 440 × 254. Copies replace the existing files under `images/webstore_images/` and `images/promo_tile/`. Generation defines the artwork; Pillow only exports the final dimensions without cropping. Original source files remain available.

The three listing screenshots were recaptured from the existing extracted-production sample fixture with the new logo header. Their popup pixels are rendered application UI, not generated artwork. Current copies use `01-usage.png`, `02-compare.png`, and `03-forget.png` under `images/webstore_images/scrshots/`; older differently named JPEGs there are historical exports and are not the current listing set.

## Previous logo — historical prompts

The earlier flat transparent crab was generated with the built-in image_gen tool on 24 October 2026 and is superseded by the user-selected image above. These prompts describe that earlier design, not the current asset.

Generation prompt:

Use case: logo-brand. Asset type: original app icon for ClaudeBuddy, an independent browser companion showing Claude usage, peak hours and outages. Create ONE charming, extremely simple, original friendly crab mascot on a genuinely transparent background. Flat vector-like raster mark with a broad rounded warm coral body (#E5795B), two chunky raised open claws and two simple small charcoal eyes, a tiny calm smile. Compact strong silhouette with balanced negative space, minimal legs, no thin strokes or fiddly detail; must remain recognizable at a 16px toolbar size. Front-facing, centered, symmetric overall but gently personable, ample transparent padding around all sides. Clean crisp edges, two colors only, no gradients, no shadows, no 3D, no texture, no badge/container, no text, no wordmark, no watermarks. A completely new character, not a copy of an existing Claude/Clawd/Anthropic mark. Only a single crab icon, no presentation board or multiple options. Square composition.

Refinement prompt:

Edit the attached ClaudeBuddy crab logo. Keep the single centered front-facing crab, warm coral color family, raised claws, rounded body, simple symmetrical silhouette and genuinely transparent background. Make it noticeably friendlier, warmer and cuter. Give it larger adorable rounded dark eyes with small warm-cream catchlights and a gentle happy expression; a small soft upturned smile. Make the drawing sharper and more intentional: crisp smooth clean vector-like edges, stronger well-defined claw tips and simple tidy leg shapes, flat solid color fills instead of painterly texture, remove all stray speckles and fuzzy edge artifacts. Sharper means graphic precision, not aggressive spiky anatomy. Preserve enough broad shape and clear negative space to read as a browser icon at 16px. A polished affectionate little companion, charming but restrained. No text, no wordmark, no gradients, no shadows, no 3D, no background, no badge/container, no watermark. Keep transparent padding on every side. Only one crab.
