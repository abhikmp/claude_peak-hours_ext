// Disposable Chrome API boundary; all application files come from the ZIP.
(() => {
  const access = [];
  chrome.storage.local.setAccessLevel = chrome.storage.sync.setAccessLevel = async value => access.push(value.accessLevel);
  const secure = location.pathname.startsWith('/secure-popup/');
  const productionStorage = AccountStorage;
  // Prior feature harnesses inspect raw fixture state synchronously. Keep that
  // seam for those regressions; the dedicated secure suite uses the real adapter.
  if (!secure) globalThis.AccountStorage = { create: storage => storage };
  const storage = productionStorage.create(chrome.storage.local);
  window.ticket05 = { access, read: () => storage.get(['accounts', 'accountUndo']) };
})();
