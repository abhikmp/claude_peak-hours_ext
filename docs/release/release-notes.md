# ClaudeBuddy 1.0.0 release candidate

Prepared 24 October 2026; not submitted/published by ticket 05.

A fixed 260 × 340px popup compares one to three Accounts through slides and four-plus through a searchable table with stable rows, internal scrolling and Back restoration. Readings retain their actual age; passed captured resets show explicitly bounded estimates, then unknown usage. Accounts remain until Forget/reset.

Non-Active menus offer confirmation, queue continuation and a 2.5-second Undo replacing the complete footer. Later readings rediscover forgotten Accounts. One worker queue preserves concurrent captures, names and recovery without overwriting newer observations.

Completion SSE and gzip/identity Bard RPC quota events remain supported, including the resolved third-Account capture bug. Absent numeric/weekly-only usage never implies zero. Usage icon colors remain separate from incident/peak badges/tooltips.

Account/recovery storage now uses AES-256-GCM with a separate non-extractable local key. Capture contexts cannot read extension storage or invoke deletion/recovery. The popup rereads decrypted changes. Permissions remain alarms/storage/scripting and the two HTTPS hosts; unused web-accessible timezone access is removed. Chrome 120+ required. An original warm coral crab identifies ClaudeBuddy on the extension management page and Web Store listing; green/orange/red circles retain the original toolbar appearance and usage thresholds. Branding was renamed from QuotaBeacon before launch.

Limitations: quota depends on supported Claude events, not live guarantees; no weekly/token tracking or limit increases. Badge blinking depends on worker lifetime. Encryption cannot protect complete profile compromise. The publisher confirmed current-build capture, Account switching and toolbar checks passed on 28 October 2026. The repository release and public policy are available; Store submission/approval/publication remain in the [launch checklist](launch-checklist.md). A new extension ID does not migrate Peak Hours users/storage.


Pre-release security hardening, 27 October 2026: invalid capture identifiers/reset timestamps are rejected, malformed older reset values display as unknown, and pending capture writes are bounded. Gzip quota frames and partial SSE lines stop at bounded sizes while preserving the site's original response. Permissions and data handling purposes remain unchanged.

Store preparation, 28 October 2026: the package title is now **ClaudeBuddy – Usage & Peak Hours Tracker**, with no other packaged file changes. Updated listing copy and two cleaned 1280 × 800 browser screenshots are maintained in the repository. The publisher reports the new Store submission is pending review; approval, publication and Store-install checks remain pending. The original GitHub prerelease and [release identity](release-identity.json) are preserved; the title-only package has a separate [submission identity](store-submission-identity.json).


Pre-release popup/toolbar correction, 27 October 2026: rooted circle-icon paths prevent worker image-load failures, and icon errors no longer interrupt availability badge/tooltip updates. Watched outages use **OUT** (ahead of PEAK). Dormant Account facts fit alongside outage details without unnecessary vertical scrolling.
