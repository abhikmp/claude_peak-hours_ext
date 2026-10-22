# 03: Account label capture

**What to build:** Each Account gets a human label. The first time the bridge sees an organization ID it has no name for, it fetches that organization's details from claude.ai (same origin, with the user's session) and stores the organization's name as the label. If the fetch fails or the name is missing, the label is "Account" plus the first six characters of the ID and an ellipsis. This works even when claude.ai was already open when the extension was installed or updated, and the label is stored locally only.

**Blocked by:** 02.

**Status:** ready-for-human

- [x] First, verify two assumptions on the real site and record the result in the ticket's Comments: a content-script fetch to claude.ai carries the user's session, and the response includes the organization's `name`.
- [x] If either assumption fails, ship the fallback label and say so in Comments rather than inventing another mechanism.
- [x] A new Account gets its label without reloading claude.ai.
- [x] The label is fetched once per Account, not on every reading.
- [x] A failed fetch produces the fallback label and retries on a later reading.
- [x] Labels are stored in local extension storage only.
- [ ] Manual check: inspect extension storage in DevTools and confirm the label for the logged-in account.

## Comments

2026-10-22: Implementation started from `6abde7f` on `feature-usagebar`. The user approved extending the existing completion-capture integration seam (completion response through the real scripts to local storage) for label, fallback, and retry coverage. Existing popup, worker, and manifest edits are outside this ticket's commit.

The connected Chrome tab is signed in to claude.ai. The browser tool cannot execute a fetch in the extension's isolated content-script world, so this alone does not establish either assumption. The user has opened the Console and confirmed that the extension context is available; the same-origin fetch check is awaiting its result. No account IDs, names, cookies, or response bodies are requested for the ticket.

2026-10-22 live assumption check: in the claude.ai Console with the "Peak Hours for Claude" execution context selected, the user fetched `/api/organizations/<stored Account ID>` with `credentials: 'same-origin'` and reported `status: 200, namePresent: true`. This verifies that the content-script fetch carries the existing session and that the response has a non-empty string `name`. No alternate lookup mechanism is needed.

Implementation: the bridge stores Usage readings immediately and fetches missing names independently, with one in-flight request per Account per tab and a 10-second request timeout. Successful names are trimmed and saved locally; later readings and later documents reuse them. HTTP/network/timeout/JSON failures and missing or unusable names leave the stored label null so the next reading can retry. `Accounts.getAccounts` derives `Account <first six characters>…` for these unresolved labels, following the spec's nullable storage schema. `Accounts.applyLabel` updates only an existing Account's name without changing its reading or Active ordering. Label writes share the reading queue and re-read current storage; late responses cannot overwrite newer readings or restore forgotten Accounts.

Automated coverage uses the approved completion-capture seam with actual manifest scripts and external browser/network stand-ins. It covers successful and cached names, fallback and recovery for eight failure cases, slow requests with consecutive readings and Account switching, forgetting an Account during a fetch, persisted names across documents, previously unlabeled Accounts, and Chrome script-path deduplication in either injection order. No permissions, popup UI, or outage/peak-hours behavior changes are included. Final live storage verification has been requested after extension reload and a fresh Claude message; it is still pending.

Review correction: Standards found no issues in the initial implementation. Spec identified that manifest-only injection did not satisfy the requirement for Claude documents already open during installation/update. The earlier no-reload test covered a loaded bridge, not the install/update lifecycle. A new completion-capture regression reproduces the lifecycle gap, then verifies actual service-worker installation/update events loading the real scripts into the existing document, including a document already running manifest scripts and a second tab closing during injection. The scripts now tolerate reinjection; replaced bridge listeners and interceptors are retired, and legacy MAIN messages are ignored. This supersedes the earlier note about no permission changes: `scripting` is necessary for `chrome.scripting.executeScript` on install/update, using the existing claude.ai host access with no new host patterns. See [Chrome's scripting API](https://developer.chrome.com/docs/extensions/reference/api/scripting). The spec's statement that shared-module loading requires no new permission remains true; this extra permission is for the already-open-tab requirement. Popup UI and outage/peak-hours behavior remain outside the change.

The first post-implementation manual attempt was inconclusive: the user reported a Claude tab continuing to load and a Console that would not submit the expression. No saved-label result was obtained; this is not recorded as a pass. A fresh no-page-reload check will follow the lifecycle fix.

Final automated validation: `node --test` passes all 27 tests (19 top-level tests plus eight failure-case subtests). `node --check` passes for the Account module, both content scripts, the service worker, and the capture tests. The repository has no separate typechecking/build configuration. Final Standards review: no findings. Final Spec review: no findings; the already-open-tab issue is resolved. The live storage check remains pending and is not implied by the automated results.
