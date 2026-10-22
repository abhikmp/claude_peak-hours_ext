// Runs in the ISOLATED world — has access to chrome.storage.
// Listens for postMessage from the MAIN world script and writes directly to storage.
// (Avoids routing through the service worker, which may be suspended in MV3.)

// Serialize readings within this tab so consecutive stream events cannot both
// read the same stored map before either writes it. Cross-tab races remain last-write-wins.
let readingQueue = Promise.resolve();
const pendingLabels = new Set();

async function captureLabel(accountId) {
  if (pendingLabels.has(accountId)) return;
  pendingLabels.add(accountId);
  try {
    const response = await fetch(`/api/organizations/${encodeURIComponent(accountId)}`, {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return;
    const details = await response.json();
    if (typeof details?.name !== 'string' || !details.name.trim()) return;
    const label = details.name.trim();

    // Re-read through the same queue so a late name cannot overwrite newer
    // readings, change Active, or restore an Account that has been forgotten.
    readingQueue = readingQueue.then(async () => {
      const { accounts = {} } = await chrome.storage.local.get('accounts');
      const updated = Accounts.applyLabel(accounts, accountId, label);
      if (updated !== accounts) await chrome.storage.local.set({ accounts: updated });
    }).catch(() => {});
    await readingQueue;
  } catch (_) {
    // Leave an unresolved label eligible for a retry on a later reading.
  } finally {
    pendingLabels.delete(accountId);
  }
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== 'claude-peak-extension') return;
  if (event.data?.type !== 'USAGE_UPDATE') return;

  // When the extension is reloaded/updated while the page stays open, the
  // isolated-world context is invalidated. Accessing chrome.runtime.id is the
  // cheapest way to detect this — it returns undefined on a dead context
  // instead of throwing, unlike chrome.storage calls.
  if (!chrome.runtime?.id) return;

  const { completionUrl, percent, resetsAt = null } = event.data;
  const accountId = Accounts.extractAccountId(completionUrl);
  if (!accountId) return;
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
  if (resetsAt !== null && (!Number.isFinite(resetsAt) || resetsAt < 0)) return;
  const now = Date.now();

  readingQueue = readingQueue.then(async () => {
    const { accounts = {} } = await chrome.storage.local.get('accounts');
    await chrome.storage.local.set({
      accounts: Accounts.applyReading(accounts, { accountId, percent, resetsAt }, now)
    });
    // Fetch independently: a slow name request must never hold up Usage readings.
    if (!accounts[accountId]?.label) captureLabel(accountId);
    // Wake the service worker only after storage contains the reading. It reads
    // the Active account itself; the notification carries no reading to rewrite.
    await chrome.runtime.sendMessage({ type: 'USAGE_UPDATE' }).catch(() => {});
  }).catch(() => {});
});
