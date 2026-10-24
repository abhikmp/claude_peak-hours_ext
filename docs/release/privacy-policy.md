# QuotaBeacon Privacy Policy

Effective date: 24 October 2026. Applies to QuotaBeacon 1.0.0.

QuotaBeacon is an independent browser extension for Claude quota and service availability. It is not made by or affiliated with Anthropic. This policy covers information handled by the extension, including information processed only on your device.

## Information used

When you send a message on claude.ai, QuotaBeacon observes supported completion responses to extract the five-hour quota percentage and captured reset time. Copied response streams can transiently contain reply or conversation content while parsed. The extension does not retain or transmit that conversation content, inspect prompt/request bodies, or build conversation history.

It observes the organization identifier from relevant request URLs or organization headers. It requests the organization's name from claude.ai using your browser's existing signed-in Claude session. Names can contain email addresses. QuotaBeacon does not read or save cookie values, passwords, session tokens or API keys, and never asks you to provide them.

Saved Account records contain organization identifier, name when available, observed percentage, captured reset time, received-reading timestamp and a reading-order value. Temporary Undo recovery additionally contains the removed observation, a recovery token and recovery deadlines. These support comparison, freshness, Forget, Undo and rediscovery.

Timezone, watched-product and theme preferences use Chrome sync storage and may synchronize through your browser account when sync is enabled. Account identities, names, readings and recovery never use Chrome sync.

## Requests and sharing

QuotaBeacon requests public incident information from https://status.claude.com/api/v2/summary.json and organization details from the HTTPS claude.ai organization endpoint. These requests disclose normal connection metadata, including IP address, to the receiving service. Organization requests include the relevant identifier and browser-managed signed-in session. The receiving services and Chrome operate under their own policies.

QuotaBeacon does not send saved Accounts, readings or conversation content to its developer, analytics providers, advertisers or data brokers. It has no developer server, analytics or advertising. Information is used only for quota, Account management, preferences and service availability. It is not sold or used for profiling, ads or credit decisions.

## Storage, retention and deletion

Account and Undo records are encrypted with AES-256-GCM before writing to local extension storage. A non-extractable browser cryptographic key is stored separately in the extension's local IndexedDB database. Local/sync storage access is restricted to extension-owned contexts; capture scripts submit reading/label commands. Preferences and public status cache are not application-encrypted.

This is not a password-protected or hardware-backed vault. Access to the complete browser profile, a compromised browser/extension or malware running as you can defeat this protection. No additional Chrome/OS disk encryption is promised. Older development plaintext records migrate when the updated worker initializes or processes an Account command; secure erasure of previous disk blocks/backups is not promised.

Accounts remain remembered indefinitely until Forget, reset or uninstall. A passed reset time does not establish current quota; estimates do not create observations. Forget removes a non-Active Account from the list. A later captured reading can rediscover it; forgetting is not a permanent block.

Undo is offered for 2.5 seconds from first display. Encrypted recovery is removed on expiry/dismissal, replacement removal, Undo or reset. If Chrome suspends the worker, physical cleanup occurs on its next recovery operation/reopening; expired recovery cannot be used. A removal never displayed has a bounded 30-second preparation lifetime, cleaned on the next recovery operation.

Reset to default clears all Accounts/recovery and restores default preferences. It does not delete Claude accounts or chats. The empty-record encryption key can remain for future readings. Uninstall removes local extension storage/database; synced preferences and backups remain subject to Chrome's controls and retention.

## Limited Use and contact

QuotaBeacon's use of user information adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.

For privacy questions, use the publisher contact or Support hub on QuotaBeacon's Chrome Web Store listing. Do not send passwords, cookies or chat transcripts. Policy changes will be published with an updated effective date.
