# ClaudeBuddy design and data flow

Implemented release candidate: 1.0.0, 2026-10-24. [Domain](CONTEXT.md), [handoff](.scratch/account-overview/05-release/HANDOFF.md), [privacy](docs/release/privacy-policy.md). Earlier project-context.md/prototype states are design history.

The popup stays **260 × 340px**. One Account has one detail view; two/three have slides with aligned status/preferences; four-plus have Active detail and a searchable table. Navigation stops at the ends. Browsing never changes Active. Long tables scroll internally without a visible scrollbar; names truncate with full title/detail text.

Active is the latest observed Account, not necessarily the signed-in one. Only supported numeric five-hour quota events create readings; no weekly/token totals or continuous quota polling.

## Observations and comparison

Accounts remain until Forget/reset. Details show actual Updated age, Last reset and Last recorded usage. After the captured reset, details show explicitly estimated ~0% for three hours, then No recent reading. Tables estimate green ~0% for strictly less than 15 minutes, then unknown usage. Estimates never update stored readings.

Compact columns are Account / Used / Reset plus rightmost vertical actions. Reset text is 11px regular system font, relative past/future, with exact captured date/year/timezone accessible. On table opening: resets within 15 minutes first, newest first; then other non-Full by reading recency; then Full by soonest reset. Ordinary slides retain Active first, non-Full recency, then Full reset order.

Open-table membership, order and row identity freeze through readings, time boundaries and inspection. Values/Active update immediately; notices explain reopening. Back restores search, scroll and keyboard access.

## Forget and Undo

Only non-Active Accounts can be forgotten. Vertical menus open the selected Dialog naming the Account and explaining rediscovery. Cancel is initially focused; focus is trapped/restored safely. Both destructive buttons use softened red with white text.

Removal follows the next Account in the browsed queue, falling back to the preceding one at the end. Tables stay open at four-plus; four→three becomes slides, three→two stays slides, two→one removes navigation. Undo restores context where available and inserts restored membership into an already-open table.

Undo occupies one **228 × 32px** slot, **16px from bottom and sides**, on every view. It replaces the complete timezone/reset footer/picker visually, preserving space and blocking covered focus. The original 2,500ms deadline uses a 2px shrinking line, or numeric remaining time for reduced motion. Navigation, theme/reopening never restart it. Expiry/dismiss ends recovery; a replacement gets its own window. No prototype slider/picker ships.

## Toolbar and availability

The crab is green at 0–60%, orange above 60% through 85%, then red. Missing/expired Active observations use green as a neutral icon policy, never a guarantee of full quota; the icon is never grey. Browsing does not change it.

Public status refreshes every five minutes. Weekday 5–11 AM Pacific is the configured peak window, not a measured speed forecast. Watched incidents show DOWN ahead of PEAK. White badges blink once per second while the worker runs; suspension can stop blinking. Off-peak/error clears them. Tooltips follow incident/peak/next-peak/unknown status. Popup Retry requests a fresh poll.

Defaults: dark, system timezone, Claude AI watched. At least one watched product remains. Reset clears Accounts/recovery and restores preferences. The 30-second alarm updates expiry/icon, never deletes Accounts for age.

## Capture and persistence

Manifest MAIN scripts observe completion SSE or exact same-origin Bard StreamTimeline RPC. The decoder handles gzip/identity Connect envelopes and projects only numeric five-hour quota. Missing utilization is not zero; Claude retains its original response. Copied response bytes can transiently contain conversation content; none is retained or transmitted onward.

The isolated bridge validates identity/values and sends reading/label commands to one worker AccountStore queue. Same-origin signed-in organization-name requests run independently with a 10-second timeout. Late names cannot resurrect forgotten Accounts; newer rediscovery wins over Undo. All Account mutations serialize across tabs/popup.

AccountStorage encrypts the Account map and Undo value with AES-256-GCM, fresh 96-bit IVs and field-bound authentication. A non-extractable key persists separately in extension IndexedDB. The worker migrates pre-release plaintext. Authentication/key failures preserve ciphertext and fail ordinary operations. Explicit Reset clears records without decrypting old contents, so capture can recover with a replacement key. The popup decrypts and rereads encrypted change notifications. This is not an OS vault and cannot protect a fully compromised browser profile.

Local/sync storage use TRUSTED_CONTEXTS. Content senders from claude.ai may submit only readings/labels; replies exclude recovery. Popup commands manage Accounts. The MAIN bridge cannot authenticate observations against a compromised claude.ai page; readings are informational, never authorization/billing evidence.

| Location | Contents |
| --- | --- |
| Local storage | Encrypted accounts/accountUndo; plaintext public status cache |
| Extension IndexedDB | Non-extractable AES key, no labels/readings |
| Chrome sync | userTZ, watchedProducts, theme |
| HTTPS | Public status, same-origin signed-in organization details, existing completion responses |

All executable logic is bundled. Minimum Chrome 120 reflects the half-minute alarm requirement. No cookies/history/tabs API permission is used; host access supplies the matching-tab query. The unused web-accessible timezone declaration is removed; popup loads its bundled JSON directly.

Production evidence: [03a](.scratch/account-overview/03a-validation/verification.md), [04](.scratch/account-overview/04-validation/verification.md), [queue/button refinements](.scratch/account-overview/04-validation/refinements-verification.md), [footer replacement](.scratch/account-overview/04-validation/footer-replacement.md), [release](.scratch/account-overview/05-release/verification.md).

## ClaudeBuddy branding amendment — 2026-10-24

User approved renaming QuotaBeacon to ClaudeBuddy with an original warm, friendly crab and subsequently requested crisper edges and cuter eyes. Coral is the static brand icon; toolbar crabs use the unchanged green/orange/red quota thresholds. All toolbar pixels are bundled PNGs at 16/32/48/128px; the worker chooses local paths without fetching images or drawing a canvas. The existing `quotabeacon-aes-gcm-v1` storage format, `quotabeacon-private` key database and capture bridge namespaces remain intentionally unchanged so the rebrand preserves saved readings, recovery and keys.
