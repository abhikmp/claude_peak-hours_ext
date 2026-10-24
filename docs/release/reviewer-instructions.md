# Reviewer instructions — QuotaBeacon 1.0.0

Prepared for the new QuotaBeacon Store item; no credentials are included.

1. Install the submitted build in Chrome 120+, pin it and open the popup. Without an Account reading it shows “Send a message to see usage.” Public status and preferences are usable without Claude sign-in.
2. Sign in to claude.ai using your own authorized access and send a message. When Claude supplies a supported numeric five-hour quota event, reopen the popup to see percentage, captured reset and actual reading age. Logging in alone is insufficient.
3. Use another Claude Account in the same Chrome profile and send a message. Active follows the newest reading; browsing slides does not switch Active or toolbar color.
4. Two/three remembered Accounts use slides; four-plus use Active detail and a searchable table. Open the table with the next arrow, search, inspect a row, and use Back. Existing rows remain stable when readings change.
5. On a non-Active Account, open its vertical menu, choose Forget account, then Cancel to verify confirmation. Repeat and confirm: removal continues along the queue. Click Undo within 2.5 seconds to restore the saved observation; reopening does not extend the deadline.
6. Forget a non-Active test Account again, allow Undo to expire, then send a new Claude message from that Account. A new numeric quota event rediscovers it and makes it Active.
7. Toggle theme, timezone and watched products. Reset to default is destructive to saved extension readings/preferences: use disposable test data only. It does not erase Claude chats/accounts.

Access limitations: the extension supplies no Claude subscription/access. Claude availability, plan/account eligibility and quota-event exposure are controlled by Anthropic; no particular paid tier or event transport is guaranteed. It supports both completion SSE and the exact Bard StreamTimeline RPC when available, including gzip. Weekly-only/missing numeric events do not imply zero. Quota data cannot be demonstrated by merely signing in.

For final submission, the publisher must ensure reviewers can reach restricted functionality through an approved access arrangement if needed, using the dashboard's private test-instructions mechanism. Do not put personal credentials in this repo, policy, screenshots or support tickets. No accounts or credentials have been created/shared by ticket 05.

Peak/outage timing may be unavailable during review. Fixtures used in agent QA are development evidence and are excluded from the package; they are not a hidden production demo mode.
