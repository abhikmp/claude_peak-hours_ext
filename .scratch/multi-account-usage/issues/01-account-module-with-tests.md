# 01: Account module with tests

**What to build:** A single pure module that holds every rule about Accounts, plus a test suite that proves them. Given Usage readings and the current time it can tell you the ordered Accounts, which one is Active, each Account's display state (percent, expired, full, age), which Accounts to drop, and which toolbar icon color applies. It also extracts the organization ID from a `/completion` URL. It uses no browser APIs and no DOM, takes the time as an argument, and is written so the same file loads as a classic script in the extension and via `require` in Node tests.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

- [x] Tests run with `node --test` and need no dependencies or build step.
- [x] URL parsing handles a valid `/completion` URL, a URL without an organization ID, and malformed input.
- [x] A first reading from an unknown organization creates an Account; later readings update it.
- [x] The Active account is the one with the latest reading and changes only when a different Account produces a reading.
- [x] Ordering: Active first (even at 100%), then non-full by most recent reading, then Full accounts by soonest reset.
- [x] A Full account that stops being Active moves to the end; an Expired reading is not Full and re-enters the normal order.
- [x] Pruning drops Accounts at just over 48 hours and keeps those at just under; clearing removes everything.
- [x] Icon color: no Account or expired is green; 60 is green, 61 is orange; 85 is orange, 86 is red.
- [x] Vocabulary matches `CONTEXT.md` (Account, Usage reading, Active account, Full account, Expired reading).

## Comments

2026-10-21: Implemented in `shared/accounts.js`, tested through its public interface in `tests/accounts.test.js`. The classic-script global and CommonJS export are both `Accounts`.

The interface is `extractAccountId(url)`, `applyReading(accounts, reading, now)`, `getAccounts(accounts, now)`, `getIconColor(accounts, now)`, `pruneAccounts(accounts, now)`, and `clearAccounts()`. Callers begin with an empty map and persist returned maps. `now` and `lastReadingAt` use milliseconds; `resetsAt` uses Unix seconds. `getAccounts` returns display state with the Active account first; pruning is explicit. A persisted `readingOrder` ordinal resolves identical timestamps even when storage reorders map keys. A reading becomes stale at exactly 10 minutes; Accounts are kept through exactly 48 hours and dropped after that.

Implementation is complete. The full suite (`node --test`) passes all 11 tests, JavaScript syntax checks pass, and the Spec review found no issues. The ticket is ready for human review. Browser loading and callers are intentionally left for ticket 02.
