// Pure Account rules shared by classic extension scripts and Node tests.
// Callers pass a map (initially {}) and valid Usage readings: accountId (UUID),
// percent (0–100), resetsAt (Unix seconds or null), and optionally label.
// All now arguments and lastReadingAt values are milliseconds. No function
// mutates its input or reads a clock. Persist the returned map after applying
// or clearing; Accounts are retained until explicitly removed. getAccounts returns
// display values: percent is null after expiry; lastObservedPercent keeps the reading.
// Its first result is Active.
// applyLabel updates only a known Account's name. Null stored labels are unresolved;
// getAccounts supplies their fallback while the bridge can retry a later reading.
(function () {
  const Accounts = (() => {
    const STALE_AFTER_MS = 10 * 60 * 1000;
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isAccountId = value => typeof value === 'string' && UUID.test(value);
    // Unix seconds, including fractions. Bound by Date's supported range rather
    // than the current clock so historical observations remain usable.
    const isResetTimestamp = value => value === null ||
      (Number.isFinite(value) && value >= 0 && value <= 8640000000000);

    function extractAccountId(url, organizationId) {
      if (typeof url !== 'string' || url.length > 4096) return null;
      try {
        const { origin, pathname } = new URL(url, 'https://claude.ai');
        if (origin !== 'https://claude.ai') return null;
        if (pathname ===
            '/claudeai-rpc/anthropic.bard.api.v1alpha.ConversationService/StreamTimeline') {
          return isAccountId(organizationId) ? organizationId.toLowerCase() : null;
        }
        const match = pathname.match(/^\/api\/organizations\/([^/]+)\/.+\/completion$/);
        return match && isAccountId(match[1]) ? match[1].toLowerCase() : null;
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
          // Keep malformed legacy observations remembered; only their display
          // reset becomes unknown. Reading the popup never rewrites raw data.
          const resetsAt = isResetTimestamp(account.resetsAt) ? account.resetsAt : null;
          const isExpired = resetsAt !== null && now >= resetsAt * 1000;
          const ageMs = Math.max(0, now - account.lastReadingAt);
          return {
            accountId,
            // Null remains the retry marker in storage; callers always get a label.
            label: account.label ?? `Account ${accountId.slice(0, 6)}…`,
            percent: isExpired ? null : account.percent,
            lastObservedPercent: account.percent,
            resetsAt,
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

    // A display-only estimate, never a new Usage reading or a change to Active.
    function isRecentReset(account, now) {
      const elapsed = now - account.resetsAt * 1000;
      return account.resetsAt !== null && account.isExpired && elapsed >= 0 && elapsed < 15 * 60 * 1000;
    }

    // Takes getAccounts display values. Stable sorting retains their ordinary
    // recency/tie and Full ordering outside the recent-reset priority group.
    function orderComparisonAccounts(accounts, now) {
      return accounts.filter(account => !account.isActive).sort((a, b) => {
        const aRecent = isRecentReset(a, now);
        const bRecent = isRecentReset(b, now);
        if (aRecent !== bRecent) return aRecent ? -1 : 1;
        return aRecent ? b.resetsAt - a.resetsAt : 0;
      });
    }

    // A late name response must not create an Account or change its Usage reading.
    function applyLabel(accounts, accountId, label) {
      if (!accounts[accountId]) return accounts;
      return { ...accounts, [accountId]: { ...accounts[accountId], label } };
    }

    function clearAccounts() {
      return {};
    }

    function forgetAccount(accounts, accountId, now) {
      if (!Object.hasOwn(accounts, accountId) || getAccounts(accounts, now)[0]?.accountId === accountId) return accounts;
      const remaining = { ...accounts };
      delete remaining[accountId];
      return remaining;
    }

    function restoreAccount(accounts, accountId, reading) {
      // A real reading received after Forget always wins over recovery.
      return Object.hasOwn(accounts, accountId) ? accounts : { ...accounts, [accountId]: { ...reading } };
    }

    function getIconColor(accounts, now) {
      const active = getAccounts(accounts, now)[0];
      if (!active || active.isExpired || active.percent <= 60) return 'green';
      return active.percent <= 85 ? 'orange' : 'red';
    }

    return { isAccountId, isResetTimestamp, extractAccountId, applyReading, applyLabel, getAccounts, isRecentReset, orderComparisonAccounts, clearAccounts, forgetAccount, restoreAccount, getIconColor };
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Accounts;
  } else {
    globalThis.Accounts = Accounts;
  }
})();
