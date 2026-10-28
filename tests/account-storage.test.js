const test = require('node:test');
const assert = require('node:assert/strict');
const AccountStorage = require('../shared/account-storage.js');
const AccountStore = require('../shared/account-store.js');

async function fixture() {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  let disk = { accounts: {
    saved: { label: 'Sample@example.invalid', percent: 71, resetsAt: 1900000000, lastReadingAt: 100, readingOrder: 1 },
    active: { label: 'Active', percent: 24, resetsAt: 1900000000, lastReadingAt: 200, readingOrder: 2 }
  }, accountUndo: null, state: 'green' };
  const raw = {
    get: async () => structuredClone(disk),
    set: async value => { disk = { ...disk, ...structuredClone(value) }; }
  };
  return { raw, key, disk: () => disk, open: () => AccountStorage.create(raw, async () => key) };
}

test('existing observations migrate to authenticated ciphertext and remain readable after reopening', async () => {
  const f = await fixture();
  const original = structuredClone(f.disk());
  await f.open().migrate();
  assert.equal(JSON.stringify(f.disk()).includes('Sample@example.invalid'), false);
  assert.equal(JSON.stringify(f.disk()).includes('saved'), false);
  assert.deepEqual(await f.open().get(['accounts', 'accountUndo', 'state']), original);
  assert.equal(f.key.extractable, false);
});

test('Forget and Undo retain exact observations across storage reopen without plaintext recovery on disk', async () => {
  const f = await fixture();
  const original = structuredClone(f.disk().accounts);
  const store = AccountStore.create(f.open(), () => 1000);
  const removed = await store.mutate({ action: 'forget', accountId: 'saved' });
  await store.mutate({ action: 'offerUndo', token: removed.undo.token, offeredAt: 1000 });
  assert.equal(JSON.stringify(f.disk()).includes('Sample@example.invalid'), false);
  const reopened = AccountStore.create(f.open(), () => 1100);
  assert.equal((await reopened.mutate({ action: 'undo', token: removed.undo.token })).status, 'restored');
  assert.deepEqual((await f.open().get(['accounts'])).accounts, original);
  await reopened.mutate({ action: 'clear' });
  assert.deepEqual((await f.open().get(['accounts'])).accounts, {});
  assert.equal((await f.open().get(['accountUndo'])).accountUndo, null);
});

test('unreadable observations reject ordinary mutations but explicit reset clears them and capture recovers', async () => {
  const f = await fixture();
  await f.open().migrate();
  const otherKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await assert.rejects(AccountStorage.create(f.raw, async () => otherKey).get(['accounts']));
  f.disk().accounts.ciphertext[0] ^= 1;
  const before = structuredClone(f.disk());
  await assert.rejects(AccountStore.create(f.open()).mutate({ action: 'reading', accountId: 'new', percent: 24 }));
  assert.deepEqual(f.disk(), before);
  // A reopened profile may have a replacement key. Reset must not need the old one.
  const recovered = AccountStorage.create(f.raw, async () => otherKey);
  const store = AccountStore.create(recovered, () => 1000);
  assert.equal((await store.mutate({ action: 'clear' })).status, 'cleared');
  const empty = await recovered.get(['accounts', 'accountUndo']);
  assert.deepEqual(empty.accounts, {});
  assert.equal(empty.accountUndo, null);
  assert.equal((await store.mutate({ action: 'reading', accountId: 'new', percent: 24 })).status, 'recorded');
  assert.equal((await recovered.get(['accounts'])).accounts.new.percent, 24);
  assert.equal(JSON.stringify(f.disk()).includes('Sample@example.invalid'), false);
});
