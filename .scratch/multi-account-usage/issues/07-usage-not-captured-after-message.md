# 07: Usage reading is missing after a Claude message

**Status:** ready-for-human

**Observed:** After sending a Claude message, the popup still shows the no-reading state ("Send a message to see usage"). The reporter confirmed reloading the extension and refreshing the Claude tab before sending the message. This is a failed live verification of ticket 02.

**Expected:** A completion response containing a usable Usage reading updates that Account in local extension storage, and opening the popup shows it.

## Evidence and feedback loop

- The screenshot shows the no-reading state; it does not establish which capture step failed.
- The affected Claude tab is connected through the browser tool. Its available warning/error log returned no entries. This is not proof that the extension has no errors.
- Browser policy blocks access to `chrome://extensions`, so the extension's own error report must be supplied by the user.
- A development replay at `../debug/replay-completion.cjs` drives the actual MAIN script, message bridge, and local-storage write with a sanitized SSE fixture. The existing sample event passes (`updates: 1`, `persisted: true`). The real failing response has not yet been captured, so this is only a positive control, not a reproduction of the reported bug.

## Initial information requested

1. Error text from the extension's Errors view, or confirmation that none is reported.
2. Only the `message_limit` event JSON from the failing `/completion` response, or confirmation that no such event is present. Exclude cookies, headers, chat content, and other unrelated response events.

Replay command after a sanitized failing fixture is available:

```text
node .scratch/multi-account-usage/debug/replay-completion.cjs <sanitized-sse-fixture>
```

No production code has been changed for this report. Record the actual failing signal before choosing a fix.

## Comments

2026-10-21: The user reports no extension errors. The unpacked extension is loaded from this project's folder. The request uses `fetch` and the expected `/api/organizations/<id>/chat_conversations/<id>/completion` path. The supplied `message_limit` JSON has a numeric `resolved.limit.percent` of 18 and a numeric `windows['5h'].resets_at`; replaying it with standard SSE framing emits one update and persists the Account. That eliminates this event's JSON shape as the demonstrated failure, but does not reproduce the actual browser failure or verify the original stream framing.

Temporary production diagnostics tagged `[DEBUG-usage-capture]` were added to the MAIN script and bridge to build the live feedback loop. They log stage names and error types only, with no chat text, IDs, headers, or response bodies. The user reloaded both extension and Claude and chose to send test messages themselves. Awaiting the tagged Console lines after a new message; the browser log API has returned no lines. Remove all tagged diagnostics once the cause is established and a fix is verified.

The browser's unfiltered runtime log reports `ReferenceError: Accounts is not defined` at the call to `Accounts.extractAccountId` in the MAIN script. Both scripts started, and the fetch interceptor saw the completion request, but execution failed before inspecting the response. An initial explicit-global-export change passed a scoped-script test but failed the live check, disproving that as a complete fix. That change and its test were removed.

Root cause: the manifest listed `shared/accounts.js` in both MAIN and ISOLATED content-script entries. Chrome deduplicates script paths per extension across worlds, skipping the repeated file and leaving one world without its module. This is tracked in [Chromium issue 324096753](https://issues.chromium.org/issues/324096753) and visible in [Chromium's injection code](https://raw.githubusercontent.com/chromium/chromium/main/extensions/renderer/user_script_injector.cc) (`GetJsSources`, path-only executed-script check). The missing Account binding and the manifest's duplicate path match that documented behavior.

Fix: MAIN forwards `completionUrl` with percent and reset time. The ISOLATED bridge alone loads the shared module, extracts the Account ID through it, and persists the reading. This retains one canonical module, requires no build step or generated copies, and avoids loading the same file in both worlds. The spec's implementation detail was adjusted accordingly; Account identity, storage, and UI rules are unchanged.

`tests/completion-capture.test.js` injects the actual manifest files into two script worlds with Chrome's shared set of executed paths, drives the real MAIN and bridge scripts with a minimal usage event, and asserts that Claude receives its original response and the Account reading is persisted. It reproduced the same ReferenceError before the fix and passes afterward with either world injected first. This is the durable regression: `node --test tests/completion-capture.test.js`.

Temporary runtime logs, replay artifacts, and the superseded export change have been removed. Live verification after reloading the fixed extension and Claude is pending; the user will send the test message themselves. Historical replay commands above describe the investigation and are no longer available.

Final live result, 2026-10-21: initial retries still reported the old MAIN interceptor's `Accounts` error. The corrected MAIN file has no Account-module reference. After a full reload of the connected page (preserving the user's draft), the user sent the message themselves and confirmed "Usage appears." This verifies the actual site-to-popup flow. Final review: Standards has no findings; Spec has no findings. All temporary source diagnostics are removed. The regression and the existing Account suite total 12 passing tests; syntax and whitespace checks pass.
