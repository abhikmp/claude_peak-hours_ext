const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const Accounts = require('../shared/accounts.js');

const PERSONAL = '11111111-1111-4111-8111-111111111111';
const WORK = '22222222-2222-4222-8222-222222222222';
const TEAM = '33333333-3333-4333-8333-333333333333';
const OTHER = '44444444-4444-4444-8444-444444444444';
const NOW = 1800000000000;
const RESET = 1800018000;

test('the same module works as a classic script without CommonJS, browser APIs, or a DOM', () => {
  const context = vm.createContext({ URL });
  vm.runInContext(readFileSync(require.resolve('../shared/accounts.js'), 'utf8'), context);
  const classic = vm.runInContext('Accounts', context);
  const accounts = classic.applyReading(classic.clearAccounts(), {
    accountId: PERSONAL, percent: 86, resetsAt: RESET
  }, NOW);

  assert.equal(classic.extractAccountId(
    `/api/organizations/${PERSONAL}/chat_conversations/chat/completion`
  ), PERSONAL);
  assert.equal(classic.getAccounts(accounts, NOW)[0].accountId, PERSONAL);
  assert.equal(classic.getIconColor(accounts, NOW), 'red');
  assert.equal(classic.getAccounts(accounts, NOW + 172800001).length, 1);
});

test('extracts the Account identity only from a completion URL', () => {
  assert.equal(Accounts.extractAccountId(
    `https://claude.ai/api/organizations/${PERSONAL}/chat_conversations/chat/completion`
  ), PERSONAL);
  assert.equal(Accounts.extractAccountId(
    `/api/organizations/${WORK}/chat_conversations/chat/completion?source=web`
  ), WORK);
  for (const url of [
    'https://claude.ai/completion',
    'https://claude.ai/api/organizations//chat_conversations/chat/completion',
    `https://claude.ai/api/organizations/${PERSONAL}`,
    'http://[',
    null,
    undefined
  ]) {
    assert.equal(Accounts.extractAccountId(url), null);
  }
});

test('readings in the same millisecond still switch Active when stored map keys are reordered', () => {
  let accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 100, resetsAt: RESET
  }, NOW);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 20, resetsAt: RESET
  }, NOW);
  accounts = JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(accounts).sort())));
  assert.equal(Accounts.getAccounts(accounts, NOW)[0].accountId, WORK);
  assert.equal(Accounts.getIconColor(accounts, NOW), 'green');

  accounts = Accounts.applyReading(accounts, {
    accountId: PERSONAL, percent: 100, resetsAt: RESET
  }, NOW);
  assert.equal(Accounts.getAccounts(accounts, NOW)[0].accountId, PERSONAL);
  assert.equal(Accounts.getIconColor(accounts, NOW), 'red');
});

test('the icon follows only the Active account at 60/61 and 85/86 and is green without a reading', () => {
  assert.equal(Accounts.getIconColor({}, NOW), 'green');
  for (const [percent, expected] of [
    [0, 'green'], [60, 'green'], [61, 'orange'],
    [85, 'orange'], [86, 'red'], [100, 'red']
  ]) {
    let accounts = Accounts.applyReading({}, {
      accountId: PERSONAL, percent: 100, resetsAt: RESET
    }, NOW - 1000);
    accounts = Accounts.applyReading(accounts, {
      accountId: WORK, percent, resetsAt: NOW / 1000 + 60
    }, NOW);
    assert.equal(Accounts.getIconColor(accounts, NOW + 59999), expected, `${percent}%`);
    assert.equal(Accounts.getIconColor(accounts, NOW + 60000), 'green');
  }
});

test('clearing forgets all Accounts without changing the previous state', () => {
  const accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 50, resetsAt: RESET
  }, NOW);
  const cleared = Accounts.clearAccounts();
  assert.deepEqual(Accounts.getAccounts(cleared, NOW), []);
  assert.equal(Accounts.getAccounts(accounts, NOW).length, 1);
});

test('remembered Accounts keep their labels and observations beyond 48 hours until cleared', () => {
  const boundary = NOW + 172800000;
  let accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, label: 'Personal', percent: 20, resetsAt: RESET
  }, NOW - 1);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 30, resetsAt: RESET
  }, NOW);
  accounts = Accounts.applyReading(accounts, {
    accountId: TEAM, percent: 40, resetsAt: RESET
  }, NOW + 1);

  for (const now of [boundary - 2, boundary, boundary + 2, NOW + 365 * 86400000]) {
    const remembered = Accounts.getAccounts(accounts, now);
    assert.deepEqual(remembered.map(account => account.accountId), [TEAM, WORK, PERSONAL]);
    assert.equal(remembered[2].label, 'Personal');
    assert.equal(remembered[2].lastObservedPercent, 20);
    assert.equal(remembered[0].isActive, true);
  }
  assert.equal(accounts[PERSONAL].percent, 20);
  assert.deepEqual(Accounts.getAccounts(Accounts.clearAccounts(), boundary), []);
});

test('every Account exposes its reading age and becomes stale at exactly 10 minutes', () => {
  const accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 25, resetsAt: null
  }, NOW);
  const before = Accounts.getAccounts(accounts, NOW + 599999)[0];
  assert.equal(before.ageMs, 599999);
  assert.equal(before.isStale, false);
  assert.equal(before.isExpired, false);
  assert.equal(before.percent, 25);
  const at = Accounts.getAccounts(accounts, NOW + 600000)[0];
  assert.equal(at.ageMs, 600000);
  assert.equal(at.isStale, true);
  assert.equal(at.isActive, true);
  const switched = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 5, resetsAt: RESET
  }, NOW + 600000);
  assert.deepEqual(Accounts.getAccounts(switched, NOW + 600000).map(account => account.isStale),
    [false, true]);
});

test('an Expired reading has unknown current usage, preserves its observation, and re-enters the normal order', () => {
  let accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 20, resetsAt: RESET
  }, NOW);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 100, resetsAt: NOW / 1000 + 60
  }, NOW + 1000);
  accounts = Accounts.applyReading(accounts, {
    accountId: TEAM, percent: 30, resetsAt: RESET
  }, NOW + 2000);
  assert.deepEqual(Accounts.getAccounts(accounts, NOW + 59999).map(account => account.accountId),
    [TEAM, PERSONAL, WORK]);

  const expired = Accounts.getAccounts(accounts, NOW + 60000);
  assert.deepEqual(expired.map(account => account.accountId), [TEAM, WORK, PERSONAL]);
  assert.equal(expired[1].percent, null);
  assert.equal(expired[1].lastObservedPercent, 100);
  assert.equal(expired[1].isExpired, true);
  assert.equal(expired[1].isFull, false);
  assert.equal(expired[0].isActive, true);
  assert.equal(Accounts.getAccounts(accounts, NOW + 59999)[2].percent, 100);

  const active = Accounts.applyReading({}, {
    accountId: WORK, percent: 100, resetsAt: NOW / 1000 + 60
  }, NOW);
  assert.equal(Accounts.getAccounts(active, NOW + 60001)[0].isActive, true);
  assert.equal(Accounts.getAccounts(active, NOW + 60001)[0].isExpired, true);
});

test('Active stays first at 100%, then Full accounts follow non-full Accounts by soonest reset', () => {
  let accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 25, resetsAt: RESET
  }, NOW);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 100, resetsAt: RESET + 60
  }, NOW + 1000);
  accounts = Accounts.applyReading(accounts, {
    accountId: TEAM, percent: 100, resetsAt: RESET
  }, NOW + 2000);
  assert.equal(Accounts.getAccounts(accounts, NOW + 2000)[0].accountId, TEAM);
  assert.equal(Accounts.getAccounts(accounts, NOW + 2000)[0].isFull, true);

  accounts = Accounts.applyReading(accounts, {
    accountId: OTHER, percent: 50, resetsAt: RESET
  }, NOW + 3000);
  const ordered = Accounts.getAccounts(accounts, NOW + 3000);
  assert.deepEqual(ordered.map(account => account.accountId), [OTHER, PERSONAL, TEAM, WORK]);
  assert.deepEqual(ordered.map(account => account.isFull), [false, false, true, true]);
  assert.deepEqual(ordered.map(account => account.isActive), [true, false, false, false]);
});

test('the latest Usage reading makes its Account Active and repeated reads keep the same order', () => {
  let accounts = Accounts.applyReading({}, {
    accountId: PERSONAL, percent: 100, resetsAt: RESET
  }, NOW);
  assert.equal(Accounts.getAccounts(accounts, NOW)[0].isActive, true);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 20, resetsAt: RESET
  }, NOW + 1000);
  accounts = Accounts.applyReading(accounts, {
    accountId: TEAM, percent: 30, resetsAt: RESET
  }, NOW + 2000);

  const ordered = Accounts.getAccounts(accounts, NOW + 3000);
  assert.deepEqual(ordered.map(account => account.accountId), [TEAM, WORK, PERSONAL]);
  assert.deepEqual(ordered.map(account => account.isActive), [true, false, false]);
  assert.deepEqual(Accounts.getAccounts(accounts, NOW + 4000).map(account => account.accountId),
    [TEAM, WORK, PERSONAL]);
  accounts = Accounts.applyReading(accounts, {
    accountId: WORK, percent: 35, resetsAt: RESET
  }, NOW + 5000);
  assert.equal(Accounts.getAccounts(accounts, NOW + 5000)[0].accountId, WORK);
});

test('a first Usage reading creates an Account and a later one updates it without mutation', () => {
  const first = Accounts.applyReading({}, {
    accountId: PERSONAL, label: 'Personal', percent: 25, resetsAt: RESET
  }, NOW);
  const updated = Accounts.applyReading(first, {
    accountId: PERSONAL, percent: 45, resetsAt: RESET + 60
  }, NOW + 1000);

  assert.deepEqual(Accounts.getAccounts(updated, NOW + 2000), [{
    accountId: PERSONAL, label: 'Personal', percent: 45, lastObservedPercent: 45,
    resetsAt: RESET + 60, lastReadingAt: NOW + 1000, isActive: true,
    isExpired: false, isFull: false, ageMs: 1000, isStale: false
  }]);
  assert.equal(Accounts.getAccounts(first, NOW)[0].percent, 25);
  assert.deepEqual(Accounts.getAccounts({}, NOW), []);
});
