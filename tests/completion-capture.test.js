const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Accounts = require('../shared/accounts.js');

const ROOT = path.resolve(__dirname, '..');
const NOW = 1800000000000;
const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

function createCapture({ organizationFetch, initialAccounts = {}, firstWorld = 'MAIN' } = {}) {
  let stored = { accounts: structuredClone(initialAccounts) };
  const listeners = [];
  const requests = [];
  let percent = 18;
  let originalResponse;
  const window = {
    async fetch() {
      let streamRead = false;
      originalResponse = { clone: () => ({ body: { getReader: () => ({
        async read() {
          if (streamRead) return { done: true };
          streamRead = true;
          return { done: false, value: new TextEncoder().encode('data: ' + JSON.stringify({
            type: 'message_limit', message_limit: {
              resolved: { limit: { percent } },
              windows: { '5h': { resets_at: 1800018000 } }
            }
          }) + '\n\n') };
        }
      }) } }) };
      return originalResponse;
    },
    addEventListener: (type, listener) => listeners.push(listener),
    postMessage(message) {
      for (const listener of listeners) listener({ source: window, data: message });
    }
  };
  const worlds = {
    MAIN: vm.createContext({ URL, TextDecoder, window }),
    ISOLATED: vm.createContext({ URL, AbortSignal, window, Date: class extends Date {
      static now() { return NOW; }
    }, fetch: async (url, options) => {
      requests.push({ url, options });
      return organizationFetch(url, options);
    }, chrome: {
      runtime: { id: 'usage-test', sendMessage: async () => {} },
      storage: {
        local: {
          get: async () => structuredClone(stored),
          async set(value) { stored = { ...stored, ...structuredClone(value) }; }
        },
        sync: { set() { assert.fail('Account labels and readings must stay local'); } }
      }
    } })
  };
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  const groups = [...manifest.content_scripts].sort((a, b) =>
    Number(b.world === firstWorld) - Number(a.world === firstWorld));
  const injected = new Set();
  for (const group of groups) {
    for (const file of group.js) {
      if (injected.has(file)) continue;
      injected.add(file);
      vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), worlds[group.world], { filename: file });
    }
  }
  return {
    requests,
    accounts: () => Accounts.getAccounts(stored.accounts, NOW),
    forgetAccounts() { stored.accounts = Accounts.clearAccounts(); },
    async sendReading(value = 18, accountId = ACCOUNT_ID) {
      percent = value;
      const result = await window.fetch(`/api/organizations/${accountId}/chat_conversations/test/completion?source=web`);
      assert.equal(result, originalResponse, 'Claude must still receive its original response');
      await new Promise(setImmediate);
    }
  };
}

test('a new Account gets its organization name once without a page reload', async () => {
  const capture = createCapture({
    organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Personal' }) })
  });
  await capture.sendReading();
  assert.equal(capture.accounts()[0].label, 'Personal');
  await capture.sendReading(25);
  assert.equal(capture.accounts()[0].label, 'Personal');
  assert.equal(capture.accounts()[0].percent, 25);
  assert.equal(capture.requests.length, 1);
  assert.equal(capture.requests[0].url, `/api/organizations/${ACCOUNT_ID}`);
  assert.equal(capture.requests[0].options.credentials, 'same-origin');
});

test('failed or unusable names show a fallback and retry only on a later reading', async (t) => {
  const failures = {
    'HTTP error': async () => ({ ok: false }),
    'network error': async () => { throw new TypeError('Network error'); },
    'request timeout': async () => { throw new DOMException('Timed out', 'TimeoutError'); },
    'invalid JSON': async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
    'missing name': async () => ({ ok: true, json: async () => ({}) }),
    'blank name': async () => ({ ok: true, json: async () => ({ name: '  ' }) }),
    'non-string name': async () => ({ ok: true, json: async () => ({ name: 42 }) }),
    'null details': async () => ({ ok: true, json: async () => null })
  };
  for (const [scenario, fail] of Object.entries(failures)) {
    await t.test(scenario, async () => {
      let failed = false;
      const capture = createCapture({ organizationFetch: async () => {
        if (!failed) { failed = true; return fail(); }
        return { ok: true, json: async () => ({ name: ' Personal ' }) };
      } });
      await capture.sendReading();
      assert.equal(capture.accounts()[0].label, 'Account 111111…');
      assert.equal(capture.accounts()[0].percent, 18);
      assert.equal(capture.requests.length, 1, 'no retry until the next reading');
      await capture.sendReading(25);
      assert.equal(capture.accounts()[0].label, 'Personal');
      await capture.sendReading(30);
      assert.equal(capture.requests.length, 2, 'a successful label is cached');
    });
  }
});

test('slow names do not delay readings, duplicate lookups, or change the Active account', async () => {
  let resolveName;
  const pendingName = new Promise(resolve => { resolveName = resolve; });
  const workId = '22222222-2222-4222-8222-222222222222';
  const capture = createCapture({ organizationFetch: async url => {
    if (url.endsWith(ACCOUNT_ID)) return pendingName;
    return { ok: true, json: async () => ({ name: 'Work' }) };
  } });
  await capture.sendReading();
  assert.equal(capture.accounts()[0].label, 'Account 111111…');
  assert.equal(capture.accounts()[0].percent, 18);
  await capture.sendReading(35);
  assert.equal(capture.accounts()[0].percent, 35);
  assert.equal(capture.requests.length, 1);
  await capture.sendReading(75, workId);
  resolveName({ ok: true, json: async () => ({ name: 'Personal' }) });
  await new Promise(setImmediate);
  const [active, personal] = capture.accounts();
  assert.equal(active.accountId, workId);
  assert.equal(active.label, 'Work');
  assert.equal(active.percent, 75);
  assert.equal(personal.label, 'Personal');
  assert.equal(personal.percent, 35);
  assert.equal(capture.requests.length, 2);
});

test('a late name cannot restore an Account forgotten while the fetch was pending', async () => {
  let resolveName;
  const capture = createCapture({ organizationFetch: () => new Promise(resolve => { resolveName = resolve; }) });
  await capture.sendReading();
  capture.forgetAccounts();
  resolveName({ ok: true, json: async () => ({ name: 'Personal' }) });
  await new Promise(setImmediate);
  assert.deepEqual(capture.accounts(), []);
});

test('saved names survive a new document and previously unlabeled Accounts get a name', async () => {
  for (const label of ['Saved name', null]) {
    const capture = createCapture({
      initialAccounts: Accounts.applyReading({}, { accountId: ACCOUNT_ID, percent: 10, label }, NOW - 1000),
      organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Fetched name' }) })
    });
    await capture.sendReading();
    assert.equal(capture.accounts()[0].label, label ?? 'Fetched name');
    assert.equal(capture.requests.length, label === null ? 1 : 0);
  }
});

test('a completion stores usage when Chrome deduplicates script paths across worlds', { timeout: 2000 }, async () => {
  // Chromium tracks executed file paths per extension, rather than per world.
  // Either world may run first; capture must work with both injection orders.
  for (const firstWorld of ['ISOLATED', 'MAIN']) {
    const capture = createCapture({ firstWorld,
      organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Personal' }) })
    });
    await capture.sendReading();
    const [active] = capture.accounts();
    assert.equal(active.accountId, ACCOUNT_ID);
    assert.equal(active.percent, 18);
    assert.equal(active.label, 'Personal');
  }
});
