# ClaudeBuddy 1.0.0 release verification

Candidate SHA-256: `b1b0f701be863b1da5dd95941d8c8a718495a85a14b2461a4e43a3ac81627cef`.

The ZIP contains 30 explicitly allowlisted files. `python tools/build-release.py` writes the ZIP, per-file/source record and checksums to ignored `dist/`. Release artifacts belong in [GitHub Releases](https://github.com/abhikmp/claudebuddy-chrome-ext/releases); `release-identity.json` records the maintained candidate identity.

## Automated evidence

The existing Node suite has 76 passing tests covering completion SSE and identity/gzip RPC quota events, three-Account capture and label races, Account retention/ordering, comparison estimates, encrypted storage/migration, authorization boundaries, Forget/Undo deadlines and rediscovery, malformed metadata, bounded capture/decompression, toolbar icon paths and OUT/PEAK precedence.

The builder checks archive integrity, the exact allowlist, source/ZIP/extraction equality, manifest references/metadata, PNG dimensions and extracted JavaScript syntax. This plain-JavaScript project has no typechecking configuration.

Final cleanup validation on 28 October 2026: **76 tests passed, 0 failed**. The five status tests run through the public worker message interface. The policy renderer's `--check` passes, all staged documentation links resolve, and all 30 staged runtime file hashes match the publisher-tested candidate. The rebuilt ZIP retains the SHA-256 above. [Standards/Spec review](review.md) has no unresolved findings.

Historical real-Chrome fixture checks used disposable identities and real encryption: 397 original extracted-popup assertions; 44 security/lifecycle assertions after the security repair; and 16 popup/toolbar regression assertions after the later spacing/icon fixes. Those counts describe separate runs on their recorded candidates, not a newly executed combined suite. Raw historical evidence remains local in ignored working notes.

## Publisher evidence

On 27 October 2026 the publisher reported successful final live testing on the earlier candidate. On **28 October 2026**, asked specifically whether the current candidate beginning `b1b0f701` passed real capture, Account switching and toolbar checks after the 27 October fixes, the publisher answered **“Yes, the latest build passed.”** This verifies that scoped publisher report for the current ZIP; it does not imply unavailable transport/incident conditions were independently exercised by the agent.

Repository cleanup and moving build output to `dist/` must preserve the candidate ZIP checksum. A runtime-byte change requires a new identity and renewed affected validation. README screenshot account names use a sample identity; the original dimensions and pixels outside the name areas were preserved.

## Limits

The [timezone report](../issues/timezone-offset.md) is deferred until after release by the publisher. It does not block 1.0.0. Store submission/approval/publication and installation under the actual new Store ID are separate from these checks; see the [launch checklist](launch-checklist.md). No Store publication follows merely from a source merge or GitHub Release.
