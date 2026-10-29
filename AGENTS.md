## Agent skills

### Commit identity

Before committing in this repository, set the repository-local Git identity to `user.name=abhikmp` and `user.email=35632653+abhikmp@users.noreply.github.com`. Verify both `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` use that name and email, including any environment overrides. Keep global Git settings and existing commit history unchanged unless the user explicitly requests those changes.

### Issue tracker

Issues and specs live as local markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
