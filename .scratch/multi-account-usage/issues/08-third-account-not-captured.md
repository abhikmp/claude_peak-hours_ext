# 08: Third Account's reply does not update the popup

Status: ready-for-human
Resolution: fixed and reporter-verified; release packaging is a separate step

## Observed

On 2026-10-22, the reporter tested the new build with two Accounts successfully. After signing into a third Account, sending a message, and receiving a reply, the popup still showed the previous Account as Active with that previous Account's usage. The reporter's annotated screenshot shows the signed-in Account and popup Account differ, and the popup has two position dots.

The screenshot is evidence of the visible mismatch, not evidence of which capture stage failed. No personal Account labels or chat content are copied into this issue.

## Expected

A usable Usage reading from a distinct Account is saved alongside existing Accounts, becomes the latest reading, and makes that Account Active in the popup and toolbar icon.

## Established facts

- shared/accounts.js merges arbitrary organization-ID keys without an Account-count limit.
- popup/account-pages.js creates a page for every returned Account.
- Existing Account tests include four Accounts, while the capture integration test switches between two.
- Logging in alone is insufficient, but the reporter confirms a message and response occurred.
- Account identity is the organization ID. The signed-in Account's identity and the captured completion identity have not yet been compared for this failure.

## Missing feedback loop

There is not yet an agent-runnable command that reproduces this exact failure. The reporter has now confirmed that the failing Account does not use a `/completion` request. Obtain sanitized evidence of its actual message transport and any usable limit signal, then replay that transport through the actual capture and storage path. Do not collect cookies, authorization headers, full response bodies, or chat content. If the expected usage event is absent, record that absence as part of the evidence.

Do not select a root cause before a red-capable reproduction exists. The separately agreed Account overview feature is not a demonstrated fix for this capture issue.

## Investigation: 2026-10-23

### Scope and baseline

Started from `75a25a6` on `feature-usagebar`. The user approved the completion-to-popup integration test boundary. Production behavior is unchanged at the stopping point; no root-cause fix has been implemented. The separate Account overview remains outside this investigation.

### Reporter feedback and observed client

The reporter inspected Network and confirmed that this Account does not use `/completion`. A/B testing is the reporter's possible explanation, not an established fact.

The connected Account is displayed as Free. Its settings menu has no Usage navigation entry. The page loads Claude's v2 client and has these observed request shapes:

- `/edge-api/bootstrap/<id>/app_start`
- `/api/organizations/<account-id>/chat_conversations_v2`

These observations identify the client and some requests, not the actual reply transport or a numeric quota source. No preference, subscription, or payment changes were made.

### Verified usage endpoint

The loaded [limit module](https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/shared-m-0-HE8yxmEB.js) contains a GET request to:

```text
/api/organizations/<account-id>/usage?source=limit_probe
```

The same module uses `source=limit_revalidate` for revalidation. These are private web-client interfaces observed in this build, not a public API contract.

Opened the `limit_probe` route in the authenticated browser, using the Account identity from the page's observed organization request. The rendered JSON response contained this sanitized subset:

```json
{
  "five_hour": null,
  "seven_day": null,
  "seven_day_oauth_apps": null,
  "seven_day_opus": null,
  "seven_day_sonnet": null,
  "seven_day_cowork": null,
  "extra_usage": null,
  "limits": [],
  "spend": null,
  "member_dashboard_available": false,
  "seven_day_breakdown": null,
  "weekly_scoped_shares": null
}
```

Other returned quota fields were also null. This endpoint currently supplies no numeric Usage reading for this Account. Null must not be interpreted as 0% usage, full quota, or unlimited quota. The probe tab was closed afterward. No Account ID, credential, chat content, or full completion body was saved.

### Alternate transport candidates from client code

The loaded [session module](https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/shared-m-4-GuGNC9CE.js) constructs this WebSocket route:

```text
wss://claude.ai/v1/sessions/ws/<session-id>/subscribe?organization_uuid=<account-id>
```

It also supports session HTTP/SSE routes ending in `/events` and `/events/stream`, including code-session routes. Their presence in the loaded bundle does not prove this Account's chat uses them.

The module handles `type: rate_limit_event` with a `rate_limit_info` object. Relevant fields are `status`, `rateLimitType`, `resetsAt`, and `utilization`. Its statuses include `allowed`, `allowed_warning`, and `rejected`; window types distinguish `five_hour` from weekly and overage limits. Its `allowed` handling does not establish a numeric percentage. No real event with these fields was captured from this Account, so their availability, nesting, and numeric scale must be verified before implementation.

### Temporary diagnostics and their limits

Temporary `[DEBUG-ticket08]` probes were added to MAIN and the bridge, then extended to the candidate session WebSocket. They logged startup, finite numeric limit fields, validation/storage stages, and transport flags only; no request identifiers, credentials, names, or frame bodies were logged.

- MAIN and bridge startup were observed; the Account module was present.
- Fetch calls reached the diagnostic wrapper, but the inspected calls did not match `/completion` or the tested session-events patterns.
- One document-ready probe reported `interceptorInstalled: false`. This only means the top-level fetch function had changed since injection; another wrapper can preserve the interceptor underneath. It does not establish a root cause.
- Initial reads were from a previously bound Claude tab. The latest test was in another connected tab; its trace was checked separately after discovering that tab. Earlier missing-log observations must not be treated as complete evidence for all test messages.
- The latest tested tab showed a completed reply, but no `session-socket-opened`, `session-socket-received`, or `session-rate-limit` probe output was captured. This does not prove WebSockets or limit events are absent; the exact reply transport is still unknown.

All temporary probes have been removed from the source. Both content scripts match the starting commit. Already-open documents may still contain the diagnostic build until QuotaBeacon is reloaded and those documents are refreshed. Downloaded public client bundles were deleted after recording the source links and findings.

### Automated evidence

`node --test tests/completion-capture.test.js` passed all 16 tests, including subtests. JavaScript syntax checks passed for both diagnostic scripts while they were in use. The project has no separate typechecking configuration.

After removing the probes, `node --test tests/*.test.js` passed all 30 tests, the saved replay passed, its `node --check` passed, and `git diff --check` reported no whitespace errors. Standards and Spec review of a future implementation remain pending; no fix is being committed as part of this investigation record.

A development-only replay is saved at [replay-third-account.cjs](../debug/replay-third-account.cjs), with [a synthetic control fixture](../debug/third-account-control.json):

```text
node .scratch/multi-account-usage/debug/replay-third-account.cjs
node .scratch/multi-account-usage/debug/replay-third-account.cjs <sanitized-fixture.json>
```

Fixtures use synthetic Account IDs. Their `completionPath` selects the request path and `chunks` contains only sanitized SSE usage-event strings, preserving framing. Never supply a HAR or a full completion response.

The default positive control loads the actual manifest scripts with two saved synthetic Accounts, then a third synthetic completion. It passes with three Accounts, the third first in popup-facing ordering, both previous readings preserved, a worker notification, and the expected green icon color. It verifies that Claude receives the original response. It does not render the popup, observe the live toolbar, reproduce the alternate-transport failure, or establish a fix. Do not turn this green control into a claim that the reported bug is fixed.

### Resume checklist

1. Reload the clean extension and refresh the actual Claude tab used for the test. Confirm the correct tab is being inspected before collecting more evidence.
2. In that tab's Network panel, identify the actual request or WebSocket used for a reply. Record only a normalized route and transport. Do not assume the candidate session route is used.
3. Search that transport for `rate_limit_event` / `rate_limit_info`, `message_limit`, or another limit signal. Capture only sanitized limit fields, their nesting, and framing; record absence if no signal exists. Verify the Account identity locally without copying identifiers into the ticket.
4. If numeric five-hour usage is available, create a minimal failing replay at the approved capture-to-popup boundary, fix the supported transport, verify existing capture behavior, and test a real three-distinct-Account flow.
5. If the Account exposes no numeric reading, record that limitation and agree how the product should represent it. Do not invent a percentage or switch Active from login alone; ADR-0002 still defines Active by the latest usable Usage reading.
6. Run the appropriate checks, perform Standards and Spec review, and commit the implementation when justified. Keep the ticket open until a root-cause fix and real capture verification exist.

## Comments

2026-10-22: Reporter wants the scalable Account overview discussed in depth before implementation. Design decisions are recorded in ../../account-overview/discussion.md. No production code has been changed for this report.

2026-10-23: Investigation and sanitized source findings are consolidated above. The user requested recording all collected information and continuing tomorrow. Work is paused at the user's request; status remains `needs-info`. No production fix or real three-Account capture verification is claimed.

### Resumed investigation, 2026-10-23

The user resumed this ticket. A temporary transport probe (`content/ticket08-transport-probe.js`, temporarily registered before MAIN in the manifest) records only normalized routes, transport types, MIME categories, and allowlisted numeric quota fields. The first attempted `.scratch/` resource path failed Chrome loading with an invalid script MIME error; moving the probe into `content/` resolved that loading failure. This probe is temporary and must be removed from the manifest and source after the investigation.

The actual live reply trace contains a fetch response with MIME `application/connect+proto`. The user supplied the exact static RPC route from Network:

```text
/claudeai-rpc/anthropic.bard.api.v1alpha.ConversationService/StreamTimeline
```

This is evidence of the actual reply transport for this Account. The previously considered WebSocket route is not established as its transport.

Static inspection of the loaded public [generated Bard client bundle](https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/b3fb7763f081d90edd49ace94c37e47a44e68435c024e003-DdU681ka.js) found embedded `streaming.proto` and `bard_api.proto` descriptors. Bundle SHA-256: `b8c2035526567218d3babe63098259aea6c7f9dbe95d8bf8f65ce5bd57ff071d`. Client code was inspected as data, not executed.

Relevant protobuf field path:

| Message | Field | Number / wire representation |
| --- | --- | --- |
| StreamTimelineResponse | event | 1, nested message |
| StreamEvent | message_limit | 4, nested MessageLimit |
| MessageLimit | status | 1, enum: unspecified 0, within 1, approaching 2, exceeded 3 |
| MessageLimit | windows | 13, repeated map entries (key 1, value 2) |
| MessageLimitWindow | resets_at | 2, Timestamp with seconds at field 1 |
| MessageLimitWindow | utilization | 3, optional double / little-endian fixed64 |

The generated client preserves windows under keys including `5h`; its conversion code uses Timestamp seconds. Schema presence alone does not establish that this Account receives a numeric window. Missing utilization must not be inferred as zero. The temporary probe now decodes only this field path, skips chat fields, handles Connect envelopes and gzip message compression, and reports quota fields without saving response bytes. Awaiting a live decoded event before selecting or implementing a fix.

Wire references: [Connect streaming protocol](https://connectrpc.com/docs/protocol/) (five-byte envelope; data/compression/end-stream flags), [Protocol Buffers encoding](https://protobuf.dev/programming-guides/encoding/). The existing 16 completion-capture tests pass with the metadata probe enabled; no regression fixture for the actual numeric RPC event exists yet.

The subsequent live reply was decoded successfully. The response advertises `connect-content-encoding: gzip`; the probe observed heartbeat, update, append, and message-limit events. The actual quota projection was status 1 (within limit), five-hour utilization 0.6 with reset 1792754400, and weekly utilization 0.03 with reset 1793142000. No chat fields or response bytes were saved. This establishes that the affected Account does expose a usable five-hour reading even though its organization `/usage` endpoint returned null.

Root cause: production MAIN only recognized `/completion` and parsed text SSE; the affected Account supplies its reading through the binary, gzip-compressed Bard RPC instead. Its organization identity is in a request header rather than the URL. The replay `node --test --test-name-pattern="third Account becomes Active" tests/completion-capture.test.js` failed before the fix with `2 !== 3` saved Accounts, reproducing the reported mismatch.

Implementation in progress: `content/connect-usage.js` projects only the five-hour quota from Connect/protobuf envelopes, MAIN recognizes the exact same-origin RPC and forwards its organization header, and the existing Account module validates that identity before the bridge stores a reading. The original SSE path remains covered. Optional utilization is not defaulted to zero; weekly-only signals and malformed frames do not replace Active. Readers are cancelled when scripts are retired, and Claude retains its original response. ADR-0001 now records the request-header identity source; Account identity and local-only storage semantics are unchanged.

The regression fixture in `tests/fixtures/bard-message-limit.json` contains only the observed quota shape, with reset times normalized to the fixed test clock. It is generated from the documented field numbers by `../debug/build-rpc-fixture.cjs`. Both gzip and identity envelopes, byte-sized network chunks, Request/header overrides, explicit zero, exhausted quota, absent utilization, weekly-only data, malformed compression/framing, and invalid identity/origin cases are checked through the capture integration boundary. The 28 capture tests, including subtests, pass. Full-suite validation, final review, and real three-Account popup verification are pending.

### Final checks, 2026-10-23

The clean implementation removes the temporary transport probe from the manifest and source. Standards review identified comment ordering, which is corrected. Spec review identified a mutable request-header race: snapshotting identity only after the response could associate a reading with a later Account. A delayed-response integration test reproduced the wrong Account before the correction and passes afterward for both reused Headers and Request.headers. MAIN now snapshots the effective URL and organization header before calling fetch. Both reviewers report no remaining findings.

Full validation: node --test tests/*.test.js passed all 43 tests (including subtests). Syntax checks passed for the quota decoder, MAIN, bridge, Account module, and fixture generator. The saved legacy third-Account replay passed, and git diff --cached --check reported no whitespace errors. The project has no separate typechecking/build configuration. The clean-build live popup check has been requested; it remains pending and is not inferred from automated results.

### Reporter verification, 2026-10-23

After reloading the clean QuotaBeacon build, hard-refreshing the affected Claude tab, and sending another message, the reporter confirmed: Third Account is Active; all three Accounts appear. This verifies the originally failing live popup behavior with the production capture path. The earlier transport probe had been removed before this check. Automated validation also preserves the original completion transport and the two earlier readings. No full release-package QA or new store submission is claimed. The capture fix is complete; ticket triage follows the existing completed implementation tickets' ready-for-human handoff convention.
