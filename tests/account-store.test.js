const test = require('node:test');
const assert = require('node:assert/strict');
const Accounts = require('../shared/accounts.js');
const AccountStore = require('../shared/account-store.js');

const NOW = 1800000000000;
function fixture() {
  let now = NOW;
  let stored = { accounts: {
    saved: { label: 'Saved', percent: 100, resetsAt: NOW / 1000 - 60, lastReadingAt: NOW - 60000, readingOrder: 2 },
    active: { label: 'Active', percent: 75, resetsAt: NOW / 1000 + 3600, lastReadingAt: NOW, readingOrder: 3 }
  }, state: 'orange', incidentTitle: 'Kept incident' };
  const storage = {
    async get() { await new Promise(setImmediate); return structuredClone(stored); },
    async set(value) { await new Promise(setImmediate); stored = { ...stored, ...structuredClone(value) }; }
  };
  const store = AccountStore.create(storage, () => now);
  return { store, storage, now: () => now, snapshot: () => structuredClone(stored), advance: ms => { now += ms; },
    reopen: () => AccountStore.create(storage, () => now) };
}

async function forget(f, accountId) {
  const prepared = await f.store.mutate({ action: 'forget', accountId });
  if (prepared.status !== 'forgotten') return prepared;
  const offered = await f.store.mutate({ action: 'offerUndo', token: prepared.undo.token, offeredAt: f.now() });
  return { ...offered, status: prepared.status };
}

test('Forget guards Active and Undo restores the exact observation without changing Active or status', async () => {
  const f = fixture();
  const original = f.snapshot();
  assert.equal((await f.store.mutate({ action: 'forget', accountId: 'active' })).status, 'active');
  const result = await forget(f, 'saved');
  assert.equal(result.undo.expiresAt, NOW + 2500);
  assert.equal(f.snapshot().accounts.saved, undefined);
  const restored = await f.store.mutate({ action: 'undo', token: result.undo.token });
  assert.equal(restored.status, 'restored');
  assert.deepEqual(f.snapshot().accounts, original.accounts);
  assert.equal(Accounts.getAccounts(f.snapshot().accounts, NOW)[0].accountId, 'active');
  assert.equal(f.snapshot().state, 'orange');
  assert.equal(f.snapshot().incidentTitle, 'Kept incident');
});

test('concurrent capture, labels and Forget merge into the latest stored Accounts', async () => {
  const f = fixture();
  const [removed] = await Promise.all([
    forget(f, 'saved'),
    f.store.mutate({ action: 'reading', accountId: 'third', percent: 28, resetsAt: NOW / 1000 + 5000 }),
    f.store.mutate({ action: 'label', accountId: 'third', label: 'Third' }),
    f.store.mutate({ action: 'label', accountId: 'saved', label: 'Delayed lookup' })
  ]);
  assert.equal(f.snapshot().accounts.saved, undefined);
  assert.equal(f.snapshot().accounts.third.label, 'Third');
  assert.equal((await f.store.mutate({ action: 'undo', token: removed.undo.token })).status, 'restored');
  assert.equal(f.snapshot().accounts.third.percent, 28);
  assert.equal(f.snapshot().accounts.saved.label, 'Saved');
  assert.equal(Accounts.getAccounts(f.snapshot().accounts, NOW)[0].accountId, 'third');
});

test('rediscovery wins over Undo and preserves other readings and resolved labels', async () => {
  const f = fixture();
  const { undo } = await forget(f, 'saved');
  f.advance(100);
  await f.store.mutate({ action: 'reading', accountId: 'saved', percent: 28, resetsAt: NOW / 1000 + 9999 });
  await f.store.mutate({ action: 'label', accountId: 'saved', label: 'Rediscovered' });
  await f.store.mutate({ action: 'label', accountId: 'saved', label: 'Old delayed label' });
  assert.equal((await f.store.mutate({ action: 'undo', token: undo.token })).status, 'newer-kept');
  assert.equal(f.snapshot().accounts.saved.percent, 28);
  assert.equal(f.snapshot().accounts.saved.lastReadingAt, NOW + 100);
  assert.equal(f.snapshot().accounts.saved.label, 'Rediscovered');
});

test('persisted deadline survives worker restart, expires at exactly 2500ms, and rejects late Undo', async () => {
  const f = fixture();
  const { undo } = await forget(f, 'saved');
  f.advance(2499);
  assert.equal((await f.reopen().mutate({ action: 'getUndo' })).undo.expiresAt, NOW + 2500);
  f.advance(1);
  assert.equal((await f.reopen().mutate({ action: 'undo', token: undo.token })).status, 'unavailable');
  assert.equal(f.snapshot().accountUndo, null);
  assert.equal(f.snapshot().accounts.saved, undefined);
});

test('replacement offers have independent deadlines; old dismiss/Undo cannot affect the replacement', async () => {
  const f = fixture();
  const first = await forget(f, 'saved');
  await f.store.mutate({ action: 'reading', accountId: 'third', percent: 10 });
  f.advance(1000);
  const second = await forget(f, 'active');
  f.advance(1500);
  await f.store.mutate({ action: 'dismiss', token: first.undo.token });
  assert.equal((await f.store.mutate({ action: 'undo', token: first.undo.token })).status, 'unavailable');
  assert.equal((await f.store.mutate({ action: 'getUndo' })).undo.expiresAt, NOW + 3500);
  assert.equal((await f.store.mutate({ action: 'undo', token: second.undo.token })).status, 'restored');
  assert.equal(f.snapshot().accounts.saved, undefined);
});

test('clear or dismiss ends recovery; delayed labels cannot recreate a cleared Account', async () => {
  for (const action of ['clear', 'dismiss']) {
    const f = fixture();
    const { undo } = await forget(f, 'saved');
    await f.store.mutate({ action, token: undo.token });
    await f.store.mutate({ action: 'label', accountId: 'saved', label: 'Too late' });
    assert.equal((await f.store.mutate({ action: 'undo', token: undo.token })).status, 'unavailable');
    assert.equal(f.snapshot().accounts.saved, undefined);
    if (action === 'clear') assert.deepEqual(f.snapshot().accounts, {});
  }
});

test('a reading that wins the queue makes a stale Forget ineligible', async () => {
  const f = fixture();
  const [, forgotten] = await Promise.all([
    f.store.mutate({ action: 'reading', accountId: 'saved', percent: 29 }),
    f.store.mutate({ action: 'forget', accountId: 'saved' })
  ]);
  assert.equal(forgotten.status, 'active');
  assert.equal(f.snapshot().accounts.saved.percent, 29);
});

test('slow removal persistence does not consume the visible Undo window; activation cannot extend on reopening', async () => {
  const f = fixture();
  const set = f.storage.set;
  f.storage.set = async value => { f.advance(3000); await set(value); };
  const prepared = await f.store.mutate({ action: 'forget', accountId: 'saved' });
  assert.equal(prepared.undo.expiresAt, null, 'countdown awaits notification availability');
  const offeredAt = f.now();
  f.storage.set = set;
  const offered = await f.store.mutate({ action: 'offerUndo', token: prepared.undo.token, offeredAt });
  assert.equal(offered.undo.expiresAt, offeredAt + 2500);
  f.advance(500);
  const again = await f.reopen().mutate({ action: 'offerUndo', token: prepared.undo.token, offeredAt: f.now() });
  assert.equal(again.undo.expiresAt, offeredAt + 2500);
});

test('abandoned preparation is disposed on restart without creating a later Undo offer', async () => {
  const f = fixture();
  const { undo } = await f.store.mutate({ action: 'forget', accountId: 'saved' });
  f.advance(30000);
  const result = await f.reopen().mutate({ action: 'offerUndo', token: undo.token, offeredAt: f.now() });
  assert.equal(result.status, 'unavailable');
  assert.equal(f.snapshot().accountUndo, null);
  assert.equal(f.snapshot().accounts.saved, undefined);
});

test('a failed storage write leaves readings intact and does not poison the mutation queue', async () => {
  const f = fixture();
  const set = f.storage.set;
  f.storage.set = async () => { throw Error('Storage unavailable'); };
  await assert.rejects(f.store.mutate({ action: 'forget', accountId: 'saved' }), /Storage unavailable/);
  f.storage.set = set;
  await f.store.mutate({ action: 'reading', accountId: 'third', percent: 19 });
  assert.deepEqual(Object.keys(f.snapshot().accounts).sort(), ['active', 'saved', 'third']);
});
