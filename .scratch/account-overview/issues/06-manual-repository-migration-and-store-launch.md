# 06: Complete manual verification, repository migration and Store launch

**What to do:** Execute the user-owned launch steps after [05: autonomous release preparation](05-verify-and-package-account-overview.md). Use 05's prepared package, text, policy, assets and instructions rather than recreating them.

**Owner:** User; manual launch phase, done last. Assistance can be requested when implementing this ticket; this planning update authorizes no execution.

**Blocked by:** 05's complete release-candidate handoff.

**Status:** ready-for-human

## Execution order and acceptance criteria

### 1. Confirm remaining owner decisions and publisher access

- [ ] Confirm the final repository name, licence choice if needed, distribution visibility/regions, and accurate Trader/Non-Trader status. Use 05's recommendations and flagged questions; do not classify trader status solely from whether the extension is free.
- [ ] Confirm the publishing account, publisher/contact details and email verification, 2-Step Verification, any required identity/trader verification, and any outstanding registration/payment steps. Complete credential, identity and legal/account steps personally; keep credentials and verification documents out of tickets/reports.

### 2. Verify the prepared package in a real signed-in environment

- [ ] Load/exercise the exact extracted ZIP identified by 05's checksum using the prepared live checklist. Confirm clean installation and actual extension/site/storage/popup behavior, including three distinct Accounts, capture on supported transports where available, Active/toolbar behavior, and Forget/Undo/rediscovery. Use disposable test readings for destructive/reset scenarios.
- [ ] Record only safe results, package identity and evidence references. #08 already has a verified production fix; this checks the final packaged build rather than reopening its resolved investigation. Leave unavailable live incident/time scenarios marked simulated or pending as appropriate; do not relabel fixtures as live evidence.
- [ ] Return defects or package-affecting decisions to 05 for correction/rebuild/revalidation before continuing. Use the resulting current checksum for every later upload.

### 3. Preserve the legacy product, then migrate GitHub

- [ ] Fetch/compare the real remote state and identify the commit matching the published Peak Hours for Claude build. Local `main` and cached `origin/main` differed during planning; do not assume either is the verified release without checking.
- [ ] Preserve the old ZIP/checksum; create the requested `legacy` branch and an annotated, product-specific release tag at the verified old commit (for example `peak-hours-v1.0.0`). Push and verify those references before merging new code. Product-specific tags distinguish the old/new products even if both have a `1.0.0` manifest version.
- [ ] Merge the reviewed `feature-usagebar` work into `main` through a PR, preserving history. Keep `main` as the default maintained branch; no force-push/history replacement is planned. Give the legacy branch/release a clear maintenance status and retain applicable attribution/licence notices.
- [ ] Rename the repository, update local remotes, repository description/settings, and actual external/support links using the prepared documentation. Verify redirects; do not later reuse the old repository name. Check any GitHub Pages project-site URLs separately because normal repository redirects do not cover them.
- [ ] Associate the verified ClaudeBuddy source/release tag and ZIP/checksum with the release handoff. If both products will instead remain independently developed, revisit the repository strategy before this migration rather than silently changing the agreed successor plan.

### 4. Host the policy and complete the new Store item

- [ ] Publish 05's prepared ClaudeBuddy privacy policy at its final public URL and verify access while logged out, including after the repository rename. Keep the old extension's policy accurate and accessible; do not blindly replace it with statements about a different product.
- [ ] Create the **new ClaudeBuddy Chrome Web Store item**, select visibility/regions, upload the verified ZIP and prepared listing text/assets, enter permission/remote-code/data-use declarations and the hosted privacy-policy URL, and provide the prepared reviewer instructions/access if needed. Confirm all declarations match the package; do not upload ClaudeBuddy to the old Peak Hours item by mistake.
- [ ] Submit for review, handle any review feedback, and publish at the chosen time after approval. Preserve actual submission/approval/publication status; no preparation step counts as a published release.

### 5. Verify launch and handle existing users

- [ ] Install the approved Store build under its actual new extension ID and verify capture, popup and preferences. Record its Store URL, version and verification result without personal Account details.
- [ ] Decide and carry out communication to existing Peak Hours users, maintain useful legacy/source/support links, and decide whether/when to unpublish the old item. A GitHub merge/rename and a new Store listing do not automatically migrate existing users, readings or preferences.

## Completion boundary

Complete only when the required manual checks and chosen launch actions have actually happened and their outcomes are recorded. Keep 05's prepared artifacts/evidence as the source of truth; link them rather than copying their full test or drafting checklists here. If publication is deliberately deferred, leave this ticket open with that status rather than marking it published.

## Primary references

- [Publisher setup](https://developer.chrome.com/docs/webstore/set-up-account), [registration](https://developer.chrome.com/docs/webstore/register), [2-Step Verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification), [Trader/Non-Trader requirements](https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq).
- [Publishing and deferred release](https://developer.chrome.com/docs/webstore/publish), [review process](https://developer.chrome.com/docs/webstore/review-process).
- [GitHub rename/redirect exceptions](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository), [Git tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging), [licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Comments

2026-10-24: Created after the user approved keeping autonomous preparation in 05 and grouping manual GitHub/publisher/live-QA/launch work into a separate final ticket. No branch/tag/merge/rename, account setup, policy hosting or Store action has been performed by this planning update.
