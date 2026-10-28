# Account is keyed by organization UUID, stored locally only

An Account is identified by the organization UUID attached to the request that produced its Usage reading. The original transport carries it in the `/api/organizations/<uuid>/.../completion` URL. The verified Bard `ConversationService/StreamTimeline` transport carries it in the request's `x-organization-uuid` header instead. For that RPC, accept only the exact claude.ai method and a valid UUID; the Account module remains the canonical identity parser. This transport amendment was established in ticket 08 on 2026-10-23.

A login can in principle belong to several organizations, so Account means organization, not login. The label comes from the organization's name (for personal orgs, the owner's email), fetched same-origin from `/api/organizations/<uuid>` the first time an unknown UUID is seen, with "Account <first 6 of uuid>…" as the fallback label. Accounts, labels and readings live in `chrome.storage.local` only, never `chrome.storage.sync`: readings are per device, and the name contains an email address that must not leave the device. The Chrome Web Store privacy disclosure must mention this.

## Considered Options

- Key by login/email: rejected, no such identifier is present in the `/completion` traffic.
- Intercept the organization response in the MAIN world: rejected, it misses accounts already loaded when the extension installs or updates; a bridge-side fetch has no such gap.
- Support multiple Chrome profiles in one popup: rejected, `chrome.storage.local` is per profile, so it needs infrastructure we don't have.
