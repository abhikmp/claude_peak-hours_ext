# ClaudeBuddy

A Chrome extension that tells a Claude user, at a glance, how much of their usage quota is left, whether Claude is likely to be slow, and whether a product they rely on has an incident.

## Language

**Account**:
A claude.ai organization whose usage the extension has observed in this Chrome profile, identified by its organization UUID and labelled by the organization's name.
_Avoid_: Profile, login, user, org

**Active account**:
The Account that produced the most recent Usage reading. It stays Active until a different Account produces a reading, regardless of its usage. It drives the toolbar icon color and is always the first page in the popup.
_Avoid_: Current account, selected account

**Full account**:
An Account whose latest Usage reading is 100% and whose Quota window has not yet ended. Once it stops being the Active account, it is listed after all non-full Accounts, soonest reset first; non-full Accounts are listed most recently used first. The Active account is never moved, even when full.
_Avoid_: Maxed out, exhausted, limited

**Usage reading**:
One observation of an Account's quota, captured when a message is sent from that Account: percent used plus the time the quota window resets.
_Avoid_: Usage data, usage snapshot

**Quota window**:
The rolling 5-hour period over which an Account's message usage is limited. It ends at the reset time carried by the latest Usage reading.
_Avoid_: Session, cycle

**Stale reading**:
A Usage reading for an Account that was not captured recently, because readings only arrive when that Account sends a message. Shown with its age.
_Avoid_: Old data, cached usage

**Expired reading**:
A Usage reading whose captured reset time has passed. It proves only that the observed Quota window ended, not current usage. Table/detail views label bounded zero estimates explicitly, then show unknown usage, retaining the actual observation and age. Accounts are retained until Forget/reset, never deleted for age.
_Avoid_: Reset, cleared

**Peak hours**:
Weekdays 5 AM to 11 AM Pacific Time, when Claude tends to be slower.
_Avoid_: Busy hours, rush

**Watched product**:
A Claude product (Claude AI, Claude Code, Cowork, Design) the user wants outage alerts for.
_Avoid_: Subscribed product, tracked product
