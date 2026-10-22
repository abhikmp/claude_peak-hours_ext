// Pure Account rules shared by classic extension scripts and Node tests.
// Callers pass a map (initially {}) and valid Usage readings: accountId (UUID),
// percent (0–100), resetsAt (Unix seconds or null), and optionally label.
// All now arguments and lastReadingAt values are milliseconds. No function
// mutates its input or reads a clock. Persist the returned map after applying,
// pruning, or clearing; getAccounts returns display values, not stored readings.
// Its first result is Active. Pruning is explicit so callers control persistence.
// applyLabel updates only a known Account's name. Null stored labels are unresolved;
// getAccounts supplies their fallback while the bridge can retry a later reading.
(function () {
  const Accounts = (() => {
    const STALE_AFTER_MS = 10 * 60 * 1000;
    const DROP_AFTER_MS = 48 * 60 * 60 * 1000;

    function extractAccountId(url) {
      if (typeof url !== 'string') return null;
      try {
        const { pathname } = new URL(url, 'https://claude.ai');
        const match = pathname.match(/^\/api\/organizations\/([^/]+)\/.+\/completion$/);
        return match ? match[1] : null;
      } catch (_) {
        return null;
      }
    }

    function applyReading(accounts, reading, now) {
      const previous = accounts[reading.accountId];
      // A persisted ordinal breaks timestamp ties independently of map key order.
      const readingOrder = Object.values(accounts)
        .reduce((latest, account) => Math.max(latest, account.readingOrder ?? 0), 0) + 1;
      return {
        ...accounts,
        [reading.accountId]: {
          label: reading.label ?? previous?.label ?? null,
          percent: reading.percent,
          resetsAt: reading.resetsAt ?? null,
          lastReadingAt: now,
          readingOrder
        }
      };
    }

    function getAccounts(accounts, now) {
      return Object.entries(accounts)
        .sort((a, b) => b[1].lastReadingAt - a[1].lastReadingAt
          || (b[1].readingOrder ?? 0) - (a[1].readingOrder ?? 0))
        .map(([accountId, account], index) => {
          const isExpired = account.resetsAt !== null && now >= account.resetsAt * 1000;
          const ageMs = Math.max(0, now - account.lastReadingAt);
          return {
            accountId,
            // Null remains the retry marker in storage; callers always get a label.
            label: account.label ?? `Account ${accountId.slice(0, 6)}…`,
            percent: isExpired ? 0 : account.percent,
            resetsAt: account.resetsAt,
            lastReadingAt: account.lastReadingAt,
            isActive: index === 0,
            isExpired,
            isFull: account.percent === 100 && !isExpired,
            ageMs,
            isStale: ageMs >= STALE_AFTER_MS
          };
        }).sort((a, b) => {
          if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
          if (a.isFull !== b.isFull) return a.isFull ? 1 : -1;
          return a.isFull
            ? a.resetsAt - b.resetsAt
            : b.lastReadingAt - a.lastReadingAt;
        });
    }

    // A late name response must not create an Account or change its Usage reading.
    function applyLabel(accounts, accountId, label) {
      if (!accounts[accountId]) return accounts;
      return { ...accounts, [accountId]: { ...accounts[accountId], label } };
    }

    function pruneAccounts(accounts, now) {
      return Object.fromEntries(Object.entries(accounts)
        .filter(([, account]) => now - account.lastReadingAt <= DROP_AFTER_MS));
    }

    function clearAccounts() {
      return {};
    }

    function getIconColor(accounts, now) {
      const active = getAccounts(accounts, now)[0];
      if (!active || active.percent <= 60) return 'green';
      return active.percent <= 85 ? 'orange' : 'red';
    }

    return { extractAccountId, applyReading, applyLabel, getAccounts, pruneAccounts, clearAccounts, getIconColor };
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Accounts;
  } else {
    globalThis.Accounts = Accounts;
  }
})();
