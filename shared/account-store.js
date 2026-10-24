// Instantiate once in the service worker. Every Account writer sends commands to
// that instance; the queue covers reads AND writes across popup and Claude tabs.
(function () {
  const rules = typeof module !== 'undefined' && module.exports ? require('./accounts.js') : globalThis.Accounts;
  const UNDO_MS = 2500;
  // An abandoned removal that never reached a popup has no visible Undo clock.
  // Bound that preparation state too, including across worker restarts.
  const recoveryDeadline = record => record.expiresAt ?? record.preparedAt + 30000;

  function create(storage, clock = () => Date.now()) {
    let queue = Promise.resolve();

    async function apply(command) {
      const stored = await storage.get(['accounts', 'accountUndo']);
      let accounts = stored.accounts ?? {};
      let undo = stored.accountUndo ?? null;
      let dirty = false;
      const now = clock();
      if (undo && now >= recoveryDeadline(undo)) { undo = null; dirty = true; }
      let status = 'unchanged';
      switch (command.action) {
        case 'reading': {
          const { accountId, percent, resetsAt = null, observedAt = now } = command;
          if (typeof accountId !== 'string' || !accountId || !Number.isFinite(percent) || percent < 0 || percent > 100
              || (resetsAt !== null && (!Number.isFinite(resetsAt) || resetsAt < 0)) || !Number.isFinite(observedAt)) {
            throw new Error('Invalid Usage reading');
          }
          if (accounts[accountId]?.lastReadingAt > observedAt) break;
          accounts = rules.applyReading(accounts, { accountId, percent, resetsAt }, observedAt);
          dirty = true;
          status = 'recorded';
          break;
        }
        case 'label':
          // Only unresolved names are eligible: another tab's resolved name wins.
          if (Object.hasOwn(accounts, command.accountId) && !accounts[command.accountId].label
              && typeof command.label === 'string' && command.label.trim()) {
            accounts = rules.applyLabel(accounts, command.accountId, command.label.trim());
            dirty = true;
          }
          break;
        case 'forget': {
          const remaining = rules.forgetAccount(accounts, command.accountId, now);
          if (remaining === accounts) {
            status = Object.hasOwn(accounts, command.accountId) ? 'active' : 'missing';
            break;
          }
          undo = {
            token: `${now}:${Math.random().toString(36).slice(2)}`,
            accountId: command.accountId, reading: accounts[command.accountId],
            preparedAt: now, expiresAt: null
          };
          accounts = remaining;
          dirty = true;
          status = 'forgotten';
          break;
        }
        case 'offerUndo':
          if (!undo || undo.token !== command.token) { status = 'unavailable'; break; }
          // The popup starts the clock when it can first display the successful
          // removal. Repeated activation (navigation/reopening) cannot extend it.
          if (undo.expiresAt === null && Number.isFinite(command.offeredAt) && command.offeredAt <= now) {
            undo = { ...undo, expiresAt: command.offeredAt + UNDO_MS };
            if (now >= undo.expiresAt) undo = null;
            dirty = true;
          }
          break;
        case 'undo':
          if (!undo || undo.expiresAt === null || undo.token !== command.token) { status = 'unavailable'; break; }
          status = Object.hasOwn(accounts, undo.accountId) ? 'newer-kept' : 'restored';
          accounts = rules.restoreAccount(accounts, undo.accountId, undo.reading);
          undo = null;
          dirty = true;
          break;
        case 'dismiss':
          if (undo?.token === command.token) { undo = null; dirty = true; }
          break;
        case 'clear':
          accounts = rules.clearAccounts();
          undo = null;
          dirty = true;
          status = 'cleared';
          break;
        case 'getUndo': break;
        default: throw new Error('Unknown Account action');
      }
      if (dirty) await storage.set(accounts === stored.accounts
        ? { accountUndo: undo } : { accounts, accountUndo: undo });
      return { status, undo, needsLabel: command.action === 'reading' && !accounts[command.accountId]?.label };
    }

    function mutate(command) {
      const result = queue.then(() => apply(command));
      // A failed write must not poison later commands.
      queue = result.catch(() => {});
      return result;
    }
    return { mutate };
  }

  const api = { create, UNDO_MS, recoveryDeadline };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.AccountStore = api;
})();
