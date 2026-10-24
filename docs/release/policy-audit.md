# Policy and technical audit — 24 October 2026

Scope: ClaudeBuddy 1.0.0 release candidate. This records preparation and code findings, not Google approval. Store policy pages were rechecked during ticket 05.

## Data and security findings

The [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) applies disclosure to local handling and calls for strong encryption at rest and secure transmission. [Chrome storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage) exposes local/sync to content scripts by default and provides trusted-context restriction. Local-only is not an exemption.

Resolved: Account/recovery plaintext is replaced with AES-256-GCM ciphertext, fresh 96-bit IVs and field-bound authentication. The non-extractable key persists in extension-owned IndexedDB, separate from records. The worker migrates existing development records; queue semantics and exact Undo observations remain. Tampered/wrong-key data fails closed without overwrite during ordinary operations. Explicit Reset bypasses old-record decryption to clear both records, allowing capture with a replacement key; this review finding has a passing regression. Both storage areas now use TRUSTED_CONTEXTS. Capture messages permit only reading/label from claude.ai and exclude recovery from responses. Popup handles encrypted change events by decrypting storage afresh. No claim of OS, hardware-backed or independent key-at-rest encryption: full-profile compromise can defeat protection; old plaintext disk blocks/backups are not securely erased. Those limits are disclosed.

All extension-origin network requests are HTTPS. Organization requests are same-origin, use browser-managed existing credentials, and time out after 10 seconds. No cookie API, secret store, API key or developer endpoint. Copied completion bytes can transiently contain replies; the projection alone is retained. MAIN postMessage cannot authenticate a compromised site's observations; quota is informational, never a billing/security decision. No injected label HTML: names are rendered as text.

[Privacy policy](privacy-policy.md) and [dashboard categories](privacy-disclosure.md) disclose local identities/emails, timestamps, indefinite retention, temporary recovery, preferences syncing, session use and transient stream content. The feature is directly user-facing and described prominently in listing/UI (Account names, percentages, ages, reset/Forget). The separate prominent-consent mechanism for unrelated/unexpected collection is not invoked: no unrelated/background purpose is present. This is an implementation assessment, not a legal determination.

The [Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use) restricts purposes/transfers; prepared policy/listing reflect no sale, advertising or unrelated uses. The affirmative statement is ready for the product's public policy website, hosting pending 06.

## Permissions and executable logic

[Minimum permissions](https://developer.chrome.com/docs/webstore/program-policies/permissions): alarms/storage/scripting and claude.ai/status.claude.com host access each support a shipped feature. No tabs/history/cookies/activeTab/unlimitedStorage permission. Claude's host permission permits the filtered tabs query without broad tabs access. Scripting remains needed for already-open install/update capture. Content scripts need claude.ai route access at document start; status access is separate. Host match patterns use whole hosts because Chrome host grants are origin-scoped.

Removed unused web_accessible_resources entry for timezone JSON: only the popup needs it. Declared Chrome 120 minimum for half-minute alarms. No new permission or remote service.

[MV3 code requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements) and [readability](https://developer.chrome.com/docs/webstore/program-policies/code-readability): all executable JS is packaged, readable and unobfuscated, without eval, remote imports/scripts, dynamic executable configuration or remote Wasm. Network content is parsed as data; no external fonts/CDN dependencies. No extension CSP override.

## Branding, assets and attribution

[Single purpose](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines): quota and service availability for Claude form one narrow decision-support purpose. [Branding/IP](https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property): independent product name and explicit non-affiliation, no official/endorsed claims, rankings or fake browser warnings. The previous star mark was replaced by the existing runtime green crab, rasterized at true 16/48/128 sizes, with transparent padding. No Anthropic logo is used in prepared assets.

No bundled third-party library, font or imported third-party image/code notice was identified in runtime sources. The mascot was generated with the built-in imagegen tool; its source and prompts are recorded in assets/branding, outside the runtime ZIP. PeakClaude inspiration credit remains in README; no copied PeakClaude code was identified in this local review. Attribution does not establish ownership. No repository-wide LICENSE/COPYING exists; actual ownership and the publisher's licence choice remain owner decisions in 06, not fabricated permission to relicense. There is no applicable third-party runtime notice to add based on this local evidence.

## Listing and package

[Listing fields](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) and [image requirements](https://developer.chrome.com/docs/webstore/images): prepared title/manifest description, detailed description, English/productivity recommendation, true 128px PNG icon, and three 1280 × 800 PNG screenshots. Required icon and screenshot assets supplied; optional promotional tiles/video intentionally omitted. Screenshots show extracted production UI with safe samples and no lab controls. [Reviewer instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions) explain access/plan/event limits; no credentials invented.

[Package preparation](https://developer.chrome.com/docs/webstore/prepare): explicit 30-file runtime allowlist, manifest root, no tests/labs/tickets/secrets/screenshots/Git content. Source/ZIP/extraction equality and hashes are recorded. Final publication is not implied.

## Owner-only confirmations — ticket 06

Confirm publisher/legal/contact identity and the listing contact/Support hub route used by the prepared policy; final policy/support URLs after hosting/rename; licence/ownership, distribution and trader/account status. Provide an approved reviewer-access arrangement if needed, and complete signed-in extracted-build checks. These are genuine external/owner decisions; the technical encryption/access findings above are addressed in the candidate.
