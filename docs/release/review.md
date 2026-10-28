# Release cleanup review — 28 October 2026

Fixed baseline: `e79f3f6bd932b252273a8143ad0e560addd53d10`. Two independent reviewers inspected the staged release changes against this baseline, ignoring representation-only line-ending changes. Scope: the previously authorized security/toolbar repairs and release cleanup, packaging and documentation. Existing runtime bytes were checked against the publisher-tested candidate.

## Standards

Initial review found a status-test seam regression and a duplicated privacy-policy source without a maintained renderer. Both were corrected: status tests trigger the captured public `POLL_NOW` listener; `tools/render-privacy-policy.py` regenerates the public HTML and checks for drift, with its workflow documented in `CONTRIBUTING.md`. The generated HTML uses LF on every platform.

Recheck: **no remaining actionable Standards findings**. Applicable sources were `AGENTS.md`, domain/ADR docs, local issue conventions and contributor guidance. The five affected status tests and the policy check pass.

## Spec

**No actionable Spec findings** in the completed cleanup/packaging/documentation scope. The implementation retains source, tests, build tools, final Store assets and maintained docs; excludes local scratch/output and promotional-video workflows; scopes the latest publisher report correctly; defers the timezone issue without changing runtime behavior; and distinguishes legacy runtime matches from package metadata/screenshot differences.

Unfinished remote/Store actions are tracked separately in the launch checklist. This review does not certify submission, approval or publication. The immutable source/package identity record is added after committing the reviewed runtime, so it can point to a real source commit.

Final result: Standards **0 unresolved findings**; Spec **0 actionable findings**.

## Store submission synchronization — 28 October 2026

Fixed baseline: `7608c4019dd4092b62fc660c30ddc7b3f3438910`; reviewed through `845cb97`. Independent Standards and Spec reviewers inspected the submitted-title, listing/assets and separate package-identity changes before push.

### Standards

**No actionable findings.** Final Store assets and maintained documentation stay tracked while generated ZIPs and working notes stay ignored. The original release identity is unchanged, and the separate submission record points to a real source commit whose runtime hashes match the record. Publisher-reported pending review is distinguished from independently verified evidence. Screenshot edits and the illustrated Peak state are documented. No applicable baseline code smell warrants a finding.

### Spec

**No actionable findings.** The diff matches the approved title, builder validation, expanded listing, two cleaned Store-sized browser screenshots, corrected privacy recommendations and publisher-reported review status. All 30 package hashes match the immutable source and prepared ZIP. The longer “for Claude” title, extension behavior and timezone code are unchanged. Approval, publication, uploaded digest and Store item ID remain unverified. No scope creep identified.

Result: Standards **0 findings**; Spec **0 findings**. Verification: 76 passing Node tests, exact title-only ZIP comparison, build/source/extraction checks, policy regeneration, maintained links and JPEG format/dimension checks.
