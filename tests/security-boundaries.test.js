const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { gzipSync } = require('node:zlib');
const Accounts = require('../shared/accounts.js');
const AccountStore = require('../shared/account-store.js');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const ID = '11111111-1111-4111-8111-111111111111';
const NOW = 1800000000000;
const RESET = NOW / 1000 + 18000;
const URL_PATH = `/api/organizations/${ID}/chat_conversations/sample/completion`;
const BAD_RESETS = [1e14, Number.MAX_VALUE, Infinity, NaN, -1, '1800018000'];

function workerFixture(waitForStorage = Promise.resolve()) {
  let disk = {}, receive;
  const raw = { get: async () => { await waitForStorage; return structuredClone(disk); },
    set: async value => { disk = { ...disk, ...structuredClone(value) }; }, setAccessLevel: async () => {} };
  const worker = vm.createContext({ URL, Date: class extends Date { static now() { return NOW; } },
    setTimeout: (fn, ms) => setTimeout(fn, ms).unref(), clearTimeout,
    chrome: { runtime: { id: 'security-test', onMessage: { addListener(fn) { receive = fn; } },
      onInstalled: { addListener() {} }, onStartup: { addListener() {} } },
    storage: { local: raw, sync: { setAccessLevel: async () => {} } },
    alarms: { onAlarm: { addListener() {} } }, action: { setIcon: async () => {} } }
  });
  worker.importScripts = file => {
    if (file.endsWith('/account-storage.js')) worker.AccountStorage = { create: () => raw };
    else vm.runInContext(read(path.posix.normalize('background/' + file)), worker);
  };
  vm.runInContext(read('background/service-worker.js'), worker);
  const sender = { id: 'security-test', tab: { id: 1 }, url: 'https://claude.ai/new' };
  const dispatch = command => new Promise(resolve => {
    if (receive({ type: 'ACCOUNT_MUTATION', command }, sender, resolve) !== true) resolve({ rejected: true });
  });
  return { dispatch, disk: () => structuredClone(disk) };
}

test('capture metadata requires the Claude origin and a UUID for both transports', () => {
  assert.equal(Accounts.extractAccountId(URL_PATH), ID);
  assert.equal(Accounts.extractAccountId(URL_PATH.replace(ID, ID.toUpperCase())), ID);
  for (const url of ['https://outside.invalid' + URL_PATH, '//outside.invalid' + URL_PATH,
    'http://claude.ai' + URL_PATH, URL_PATH.replace(ID, 'not-a-uuid'), URL_PATH.replace(ID, '__proto__')]) {
    assert.equal(Accounts.extractAccountId(url), null, url);
  }
});

test('worker rejects invalid resets without replacing a good saved observation, and recovers on the next valid reading', async () => {
  const f = workerFixture();
  const reading = { action: 'reading', accountId: ID, percent: 37, resetsAt: RESET };
  assert.equal((await f.dispatch(reading)).status, 'recorded');
  const before = f.disk();
  for (const resetsAt of BAD_RESETS) {
    const result = await f.dispatch({ ...reading, resetsAt });
    assert.ok(result.error || result.rejected, String(resetsAt));
    assert.deepEqual(f.disk(), before);
  }
  assert.equal((await f.dispatch({ ...reading, resetsAt: RESET + 0.125, observedAt: Number.MAX_VALUE })).status, 'recorded');
  assert.equal(f.disk().accounts[ID].resetsAt, RESET + 0.125, 'fractional Unix seconds retain millisecond precision');
  assert.equal(f.disk().accounts[ID].lastReadingAt, NOW, 'capture cannot supply a future observation timestamp');
  assert.equal((await f.dispatch({ ...reading, resetsAt: null })).status, 'recorded');
});

test('worker rejects fabricated Account IDs and oversized labels at its own boundary', async () => {
  const f = workerFixture();
  for (const accountId of ['not-a-uuid', '__proto__', 'x'.repeat(100000)]) {
    const result = await f.dispatch({ action: 'reading', accountId, percent: 50, resetsAt: RESET });
    assert.ok(result.error || result.rejected);
  }
  assert.equal(Object.keys(f.disk().accounts ?? {}).length, 0);
  await f.dispatch({ action: 'reading', accountId: ID, percent: 50, resetsAt: RESET });
  const bad = await f.dispatch({ action: 'label', accountId: ID, label: 'x'.repeat(1025) });
  assert.ok(bad.error || bad.rejected);
  assert.equal(f.disk().accounts[ID].label, null);
  await f.dispatch({ action: 'label', accountId: ID, label: '<img src=x onerror=alert(1)>' });
  assert.equal(f.disk().accounts[ID].label, '<img src=x onerror=alert(1)>', 'labels remain plain strings for text rendering');
});

test('capture bursts have a bounded pending queue and ordinary capture resumes after draining', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const f = workerFixture(gate);
  const reading = { action: 'reading', accountId: ID, percent: 37, resetsAt: RESET };
  const pending = Array.from({ length: 64 }, () => f.dispatch(reading));
  try {
    const overflow = await Promise.race([f.dispatch(reading), new Promise(resolve => setImmediate(resolve))]);
    assert.ok(overflow?.error || overflow?.rejected, 'overflow must be rejected before storage becomes available');
  } finally { release(); }
  assert.ok((await Promise.all(pending)).every(result => result.status === 'recorded'));
  assert.equal((await f.dispatch(reading)).status, 'recorded');
});

test('mutation store validates resets even when the caller bypasses capture', async () => {
  let disk = {};
  const store = AccountStore.create({ get: async () => structuredClone(disk),
    set: async value => { disk = { ...disk, ...value }; } }, () => NOW);
  for (const resetsAt of BAD_RESETS) {
    await assert.rejects(store.mutate({ action: 'reading', accountId: ID, percent: 20, resetsAt }));
  }
  assert.equal((await store.mutate({ action: 'reading', accountId: ID, percent: 20, resetsAt: RESET })).status, 'recorded');
});

test('legacy malformed reset observations remain remembered and render as an unknown reset', () => {
  const source = read('popup/account-pages.js');
  const updatePage = source.slice(source.indexOf('  function updatePage('), source.indexOf('  function makeTablePage('));
  const node = { classList: { remove() {} }, removeAttribute() {}, dataset: {}, style: {} };
  const ui = vm.createContext({ Date, Intl, displayLabel: x => x, usageTone: () => 'green',
    updateMenuButton() {}, renderUsageFacts() {}, formatReadingAge: () => 'Updated just now',
    formatDuration: () => '5h', toLocalTimeStr: x => x, page: { dataset: {}, querySelector: () => node } });
  vm.runInContext(updatePage, ui);
  for (const resetsAt of BAD_RESETS) {
    const disk = { [ID]: { label: 'Saved', percent: 38, resetsAt, lastReadingAt: NOW, readingOrder: 1 } };
    const account = Accounts.getAccounts(disk, NOW)[0];
    assert.equal(account.accountId, ID);
    assert.equal(account.resetsAt, null);
    assert.equal(account.lastObservedPercent, 38);
    assert.equal(disk[ID].resetsAt, resetsAt, 'raw observation is not rewritten by display');
    ui.account = account;
    assert.doesNotThrow(() => vm.runInContext("updatePage(page, account, 'UTC')", ui));
  }
});

async function captureStream(chunks, { rpc = false, encoding = 'identity', Decompress = DecompressionStream, url = URL_PATH } = {}) {
  let reads = 0, cancellations = 0, cloned = false, finish;
  const completed = new Promise(resolve => { finish = resolve; });
  const messages = [];
  const reader = { async read() {
    const value = chunks[reads++]; return value ? { done: false, value } : { done: true };
  }, async cancel() { cancellations++; finish(); } };
  const original = { ok: true, headers: new Headers({ 'content-type': 'application/connect+proto', 'connect-content-encoding': encoding }),
    clone: () => { cloned = true; return { body: { getReader: () => reader } }; } };
  const window = { fetch: async () => original, postMessage: message => messages.push(message) };
  const context = vm.createContext({ URL, TextDecoder, Headers, Blob, Response, DecompressionStream: Decompress, window });
  vm.runInContext(read('content/connect-usage.js'), context);
  vm.runInContext(read('content/content-script-main.js'), context);
  const response = await window.fetch(rpc ? '/claudeai-rpc/anthropic.bard.api.v1alpha.ConversationService/StreamTimeline' : url,
    rpc ? { headers: { 'x-organization-uuid': ID } } : undefined);
  assert.equal(response, original, 'capture returns the untouched original response');
  if (cloned) await completed;
  return { reads, cancellations, messages };
}

const quotaLine = 'data: ' + JSON.stringify({ type: 'message_limit', message_limit: {
  resolved: { limit: { percent: 24 } }, windows: { '5h': { resets_at: RESET } } } }) + '\n';

test('oversized fragmented SSE lines stop the clone before reading a later quota event', async () => {
  const result = await captureStream([Buffer.alloc(1024 * 1024, 120), Buffer.from('x'), Buffer.from('\n' + quotaLine)]);
  assert.equal(result.reads, 2);
  assert.equal(result.cancellations, 1);
  assert.equal(result.messages.length, 0);
});

test('SSE permits a boundary-size line and subsequent fragmented quota events', async () => {
  const result = await captureStream([Buffer.alloc(1024 * 1024, 120), Buffer.from('\n' + quotaLine.slice(0, 7)), Buffer.from(quotaLine.slice(7))]);
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].percent, 24);
  assert.equal(result.cancellations, 1);
});

test('SSE interception ignores completion-looking URLs from another origin', async () => {
  const result = await captureStream([Buffer.from(quotaLine)], { url: 'https://outside.invalid' + URL_PATH });
  assert.equal(result.reads, 0);
  assert.equal(result.messages.length, 0);
});

test('oversized gzip stops decompressed consumption at the limit and cancels both cloned readers', async () => {
  let delivered = 0, cancelled = 0;
  class ObservedDecompressionStream {
    constructor(format) {
      const stream = new DecompressionStream(format), reader = stream.readable.getReader();
      this.writable = stream.writable;
      this.readable = new ReadableStream({ async pull(controller) {
        const item = await reader.read();
        if (item.done) controller.close();
        else { delivered += item.value.length; controller.enqueue(item.value); }
      }, cancel() { cancelled++; return reader.cancel(); } }, { highWaterMark: 0 });
    }
  }
  const compressed = gzipSync(Buffer.alloc(33 * 1024 * 1024));
  const envelope = Buffer.alloc(5 + compressed.length);
  envelope[0] = 1; envelope.writeUInt32BE(compressed.length, 1); compressed.copy(envelope, 5);
  const result = await captureStream([envelope], { rpc: true, encoding: 'gzip', Decompress: ObservedDecompressionStream });
  assert.ok(delivered > 32 * 1024 * 1024);
  assert.ok(delivered <= 32 * 1024 * 1024 + 65536, `received ${delivered} decompressed bytes`);
  assert.ok(delivered < 33 * 1024 * 1024, 'must not collect the whole expanded message');
  assert.equal(cancelled, 1);
  assert.equal(result.cancellations, 1);
  assert.equal(result.messages.length, 0);
});
