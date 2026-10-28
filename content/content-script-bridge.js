// Runs in the ISOLATED world. Runtime messages wake the MV3 service worker,
// which serializes Account writes across every Claude tab and popup.

  (function () {
  globalThis.__claudePeakBridgeCleanup?.();
  const Accounts = globalThis.Accounts;
  let active = true;

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
      if (!active || typeof details?.name !== 'string' || details.name.length > 1024 || !details.name.trim()) return;
      const label = details.name.trim();

      await chrome.runtime.sendMessage({ type: 'ACCOUNT_MUTATION',
        command: { action: 'label', accountId, label } });
    } catch (_) {
      // Leave an unresolved label eligible for a retry on a later reading.
    } finally {
      pendingLabels.delete(accountId);
    }
  }

  function onUsageMessage(event) {
    if (!active) return;
    if (event.source !== window) return;
    if (event.data?.source !== 'claude-peak-extension-v2') return;
    if (event.data?.type !== 'USAGE_UPDATE') return;

    // When the extension is reloaded/updated while the page stays open, the
    // isolated-world context is invalidated. Accessing chrome.runtime.id is the
    // cheapest way to detect this — it returns undefined on a dead context
    // instead of throwing, unlike chrome.storage calls.
    if (!chrome.runtime?.id) return;

    const { completionUrl, organizationId, percent, resetsAt = null } = event.data;
    const accountId = Accounts.extractAccountId(completionUrl, organizationId);
    if (!accountId) return;
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
    if (!Accounts.isResetTimestamp(resetsAt)) return;
    const now = Date.now();

    chrome.runtime.sendMessage({ type: 'ACCOUNT_MUTATION',
      command: { action: 'reading', accountId, percent, resetsAt, observedAt: now }
    }).then(result => {
      if (!active || result?.error) return;
      // Fetch independently: a slow name request must never hold up Usage readings.
      if (result?.needsLabel) captureLabel(accountId);
    }).catch(() => {});
  }
  window.addEventListener('message', onUsageMessage);
  globalThis.__claudePeakBridgeCleanup = () => {
    active = false;
    window.removeEventListener('message', onUsageMessage);
  };
})();
