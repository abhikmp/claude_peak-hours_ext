// Runs in the ISOLATED world — has access to chrome.storage.
// Listens for postMessage from the MAIN world script and writes directly to storage.
// (Avoids routing through the service worker, which may be suspended in MV3.)

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== 'claude-peak-extension') return;
  if (event.data?.type !== 'USAGE_UPDATE') return;

  // When the extension is reloaded/updated while the page stays open, the
  // isolated-world context is invalidated. Accessing chrome.runtime.id is the
  // cheapest way to detect this — it returns undefined on a dead context
  // instead of throwing, unlike chrome.storage calls.
  if (!chrome.runtime?.id) return;

  try {
    chrome.storage.local.set({
      usagePercent: event.data.percent,
      usageResetsAt: event.data.resetsAt ?? null
    });
  } catch (_) { }
});