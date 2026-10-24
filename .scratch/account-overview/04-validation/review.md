# Ticket 04 code review

Baseline: `670e8f7206d633a8d862c06d3d5d7e51702bfb8a`, the initial HEAD on `feature-usagebar`. Two independent review agents examined the implementation against that baseline. The first pass used the staged diff; the repair pass inspected the current files and worktree diff before the scoped commit.

## Standards

No documented-standard violations or substantial baseline smells. Account identity/storage remain local, shared Account rules remain centralized, and explicit forgetting agrees with ADR-0004. No CODING_STANDARDS.md or CONTRIBUTING.md exists. Sources: AGENTS.md, docs/agents/, CONTEXT.md, relevant ADRs, and the code-review skill's smell baseline.

The Standards reviewer also identified the duration-start correctness risk below. It was repaired and independently re-reviewed; no remaining material correctness finding.

## Spec

Two initial findings were repaired:

1. Undo after reopening during an offer could restore an Account in storage without inserting it into an already-open table when the layout remained table mode. Undo now reconciles the explicit restored identity independently of optional original browsing context, retaining unrelated rows. A six-Account browser regression verifies the reopened-table case.
2. Computing the Undo deadline before the removal write allowed storage latency to consume the visible interval. Removal now persists an unstarted recovery record. First notification display establishes and persists the original 2,500ms deadline through the serialized mutation boundary. Repeated activation cannot extend it. A slow-storage test failed before the repair, then passed; a three-second delayed browser persistence replay also passes. Never-displayed abandoned preparation is bounded and disposed, and activation/expiry/dismiss/clear use the same queue.

The Spec reviewer rechecked replacement timers, pending activation, clear/dismiss, stale tokens, count reconciliation and the repaired paths: no further actionable Spec findings or scope creep.

Final notice refinement was also reviewed: Forget/Undo use a truthful membership-change notice instead of claiming a new reading. A delayed captured reading from another tab can introduce a non-Active Account; it retains frozen table membership while showing the same reopening notice. The added browser regression passes, and re-review found no further actionable issue.

Final findings: Standards **0**; Spec **0**. The initial Spec findings were both P2 and are resolved.
