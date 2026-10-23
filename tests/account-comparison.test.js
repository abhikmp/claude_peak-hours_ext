const { test } = require('node:test');
const assert = require('node:assert/strict');
const Accounts = require('../shared/accounts.js');
const NOW = Date.parse('2026-10-24T10:00:00Z');
const MINUTE = 60000;

test('recent reset estimates include the captured reset instant and end at fifteen minutes', () => {
  const raw = { studio: { label: 'Studio', percent: 99.5, resetsAt: NOW / 1000, lastReadingAt: NOW - 3 * 3600000 } };
  for (const [elapsed, recent] of [[-1, false], [0, true], [6 * MINUTE, true], [15 * MINUTE - 1, true], [15 * MINUTE, false], [3 * 3600000, false]]) {
    const account = Accounts.getAccounts(raw, NOW + elapsed)[0];
    assert.equal(Accounts.isRecentReset(account, NOW + elapsed), recent, `elapsed ${elapsed}`);
    assert.equal(account.lastObservedPercent, 99.5);
    assert.equal(account.lastReadingAt, NOW - 3 * 3600000);
    assert.equal(account.percent, elapsed < 0 ? 99.5 : null);
    assert.equal(account.isActive, true);
    assert.equal(Accounts.getIconColor(raw, NOW + elapsed), elapsed < 0 ? 'red' : 'green');
  }
  assert.equal(Accounts.isRecentReset(Accounts.getAccounts({ studio: { ...raw.studio, resetsAt: null } }, NOW)[0], NOW), false);
  assert.equal(raw.studio.percent, 99.5);
});

test('comparison excludes Active, promotes newest recent resets, then preserves recency and Full reset order', () => {
  const reading = (minutesOld, resetMinutes, percent = 50) => ({ percent, resetsAt: (NOW + resetMinutes * MINUTE) / 1000, lastReadingAt: NOW - minutesOld * MINUTE });
  const raw = {
    active: reading(0, 60, 100),
    fresh: reading(1, 60),
    tieEarlier: { ...reading(2, 60), readingOrder: 1 },
    tieLater: { ...reading(2, 60), readingOrder: 2 },
    oldReset: reading(10, -15),
    recentSix: reading(180, -6),
    recentThree: reading(240, -3),
    fullLater: reading(3, 90, 100),
    fullSooner: reading(4, 30, 100)
  };
  const before = structuredClone(raw);
  const slides = Accounts.getAccounts(raw, NOW);
  const slideIds = slides.map(account => account.accountId);
  assert.deepEqual(Accounts.orderComparisonAccounts(slides, NOW).map(account => account.accountId),
    ['recentThree', 'recentSix', 'fresh', 'tieLater', 'tieEarlier', 'oldReset', 'fullSooner', 'fullLater']);
  assert.deepEqual(slides.map(account => account.accountId), slideIds);
  assert.deepEqual(raw, before);
  assert.equal(slides[0].accountId, 'active');
  assert.equal(Accounts.getIconColor(raw, NOW), 'red');
  assert.deepEqual(Accounts.orderComparisonAccounts(Accounts.getAccounts(raw, NOW + 15 * MINUTE), NOW + 15 * MINUTE)
    .map(account => account.accountId), ['fresh', 'tieLater', 'tieEarlier', 'oldReset', 'recentSix', 'recentThree', 'fullSooner', 'fullLater']);
});
