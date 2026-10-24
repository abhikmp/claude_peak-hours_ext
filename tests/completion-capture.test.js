const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Accounts = require('../shared/accounts.js');

const ROOT = path.resolve(__dirname, '..');
const NOW = 1800000000000;
const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';
const RPC_FIXTURE = require('./fixtures/bard-message-limit.json');

function createCapture({ organizationFetch, initialAccounts = {}, firstWorld = 'MAIN', injectAtStart = true } = {}) {
  let stored = { accounts: structuredClone(initialAccounts) };
  let onMutation;
  const mutationWorker = vm.createContext({ URL, Date: class extends Date { static now() { return NOW; } },
    setTimeout: (callback, delay) => setTimeout(callback, delay).unref(), clearTimeout,
    OffscreenCanvas: class {
      getContext() { return { clearRect() {}, beginPath() {}, arc() {}, fill() {}, getImageData() { return {}; } }; }
    }, chrome: {
      runtime: { id: 'usage-test', onMessage: { addListener(listener) { onMutation = listener; } },
        onInstalled: { addListener() {} }, onStartup: { addListener() {} } },
      storage: { local: {
        get: async () => structuredClone(stored),
        set: async value => { stored = { ...stored, ...structuredClone(value) }; }
      } },
      alarms: { onAlarm: { addListener() {} } },
      action: { setIcon: async () => {} }
    }
  });
  mutationWorker.importScripts = file => vm.runInContext(
    fs.readFileSync(path.resolve(ROOT, 'background', file), 'utf8'), mutationWorker);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'background/service-worker.js'), 'utf8'), mutationWorker);
  const mutate = command => new Promise(resolve => {
    assert.equal(onMutation({ type: 'ACCOUNT_MUTATION', command }, { id: 'usage-test' }, resolve), true);
  });
  const listeners = [];
  const requests = [];
  const notifications = [];
  let percent = 18;
  let originalResponse;
  let nextRpc;
  let onNotification;
  const window = {
    async fetch() {
      if (nextRpc) {
        const { bytes, encoding, chunkSize = 7, beforeResponse } = nextRpc;
        nextRpc = null;
        originalResponse = new Response(new ReadableStream({
          start(controller) {
            for (let offset = 0; offset < bytes.length; offset += chunkSize) {
              controller.enqueue(bytes.subarray(offset, offset + chunkSize));
            }
            controller.close();
          }
        }), { headers: { 'content-type': 'application/connect+proto', 'connect-content-encoding': encoding } });
        await beforeResponse?.();
        return originalResponse;
      }
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
    removeEventListener(type, listener) {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    },
    postMessage(message) {
      for (const listener of listeners) listener({ source: window, data: message });
    }
  };
  function createIsolatedWorld() {
    return vm.createContext({ URL, AbortSignal, window, Date: class extends Date {
      static now() { return NOW; }
    }, fetch: async (url, options) => {
      requests.push({ url, options });
      return organizationFetch(url, options);
    }, chrome: {
      runtime: { id: 'usage-test', sendMessage: async message => {
        const result = await mutate(message.command);
        if (message.command.action === 'reading') { notifications.push(message); onNotification?.(); }
        return result;
      } },
      storage: {
        local: {
          get: async () => structuredClone(stored),
          async set(value) { stored = { ...stored, ...structuredClone(value) }; }
        },
        sync: { set() { assert.fail('Account labels and readings must stay local'); } }
      }
    } });
  };
  const worlds = { MAIN: vm.createContext({ URL, TextDecoder, Headers, Response, Blob, DecompressionStream, window }), ISOLATED: createIsolatedWorld() };
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  const groups = [...manifest.content_scripts].sort((a, b) =>
    Number(b.world === firstWorld) - Number(a.world === firstWorld));
  const injected = new Set();
  for (const group of injectAtStart ? groups : []) {
    for (const file of group.js) {
      if (injected.has(file)) continue;
      injected.add(file);
      vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), worlds[group.world], { filename: file });
    }
  }
  return {
    requests,
    notifications,
    mutate,
    raw: () => structuredClone(stored),
    accounts: () => Accounts.getAccounts(stored.accounts, NOW),
    forgetAccounts() { stored.accounts = Accounts.clearAccounts(); },
    async sendRpcReading(accountId, { encoding = 'gzip', chunkSize = 7, bytes, beforeResponse,
      request = RPC_FIXTURE.path, init = { headers: { 'x-organization-uuid': accountId } } } = {}) {
      const body = bytes ?? Buffer.from(encoding === 'gzip' ? RPC_FIXTURE.gzipBase64 : RPC_FIXTURE.identityBase64, 'base64');
      nextRpc = { bytes: body, encoding, chunkSize, beforeResponse };
      let timer;
      const notified = new Promise(resolve => { onNotification = resolve; });
      const result = await window.fetch(request, init);
      assert.equal(result, originalResponse, 'Claude must still receive its original response');
      assert.deepEqual(Buffer.from(await result.arrayBuffer()), body, 'capture must not consume or rewrite Claude\'s response body');
      await Promise.race([notified, new Promise(resolve => { timer = setTimeout(resolve, 500); })]);
      clearTimeout(timer);
      onNotification = null;
      await new Promise(setImmediate);
    },
    async legacyReading() {
      window.postMessage({ source: 'claude-peak-extension', type: 'USAGE_UPDATE',
        completionUrl: `/api/organizations/${ACCOUNT_ID}/chat_conversations/test/completion`,
        percent: 99, resetsAt: 1800018000
      });
      await new Promise(setImmediate);
    },
    async install(reason) {
      if (reason === 'update') {
        worlds.ISOLATED.chrome.runtime.id = undefined;
        worlds.ISOLATED = createIsolatedWorld();
      }
      let onInstalled;
      let failure;
      const worker = vm.createContext({ URL, console, setTimeout, clearTimeout, fetch: () => new Promise(() => {}), chrome: {
        runtime: {
          getManifest: () => manifest,
          onInstalled: { addListener(listener) { onInstalled = listener; } },
          onMessage: { addListener() {} }, onStartup: { addListener() {} }
        },
        tabs: { query: async ({ url }) => {
          assert.deepEqual(Array.from(url), ['https://claude.ai/*']);
          return [{ id: 7 }, { id: 8 }];
        } },
        scripting: { async executeScript({ target, world = 'ISOLATED', func, files }) {
          assert.ok(manifest.permissions.includes('scripting'));
          if (target.tabId === 8) throw new Error('Tab was closed');
          if (func) return [{ result: vm.runInContext(`(${func.toString()})()`, worlds[world]) }];
          for (const file of files) {
            vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), worlds[world], { filename: file });
          }
          return [];
        } },
        storage: {
          local: {
            get: async () => structuredClone(stored),
            set: async value => { stored = { ...stored, ...structuredClone(value) }; },
            remove: async () => {}
          },
          sync: { get: async () => ({ userTZ: 'UTC' }) }
        },
        alarms: { create() {}, onAlarm: { addListener() {} } }
      } });
      worker.importScripts = file => vm.runInContext(
        fs.readFileSync(path.resolve(ROOT, 'background', file), 'utf8'), worker);
      vm.runInContext(fs.readFileSync(path.join(ROOT, 'background/service-worker.js'), 'utf8'), worker);
      onInstalled({ reason }).catch(error => { failure = error; });
      await new Promise(setImmediate);
      assert.equal(failure, undefined);
    },
    async sendReading(value = 18, accountId = ACCOUNT_ID) {
      percent = value;
      const result = await window.fetch(`/api/organizations/${accountId}/chat_conversations/test/completion?source=web`);
      assert.equal(result, originalResponse, 'Claude must still receive its original response');
      await new Promise(setImmediate);
    }
  };
}

test('a third Account becomes Active after a gzip RPC reply, preserving previous readings', async () => {
  const second = '22222222-2222-4222-8222-222222222222';
  const third = '33333333-3333-4333-8333-333333333333';
  let initialAccounts = Accounts.applyReading({}, { accountId: ACCOUNT_ID, label: 'First', percent: 12 }, NOW - 2000);
  initialAccounts = Accounts.applyReading(initialAccounts, { accountId: second, label: 'Second', percent: 75 }, NOW - 1000);
  const capture = createCapture({ initialAccounts,
    organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Third' }) })
  });
  await capture.sendRpcReading(third);
  const accounts = capture.accounts();
  assert.equal(accounts.length, 3, 'the third Account is saved alongside the previous two');
  assert.deepEqual(accounts.map(({ accountId, percent, isActive }) => ({ accountId, percent, isActive })), [
    { accountId: third, percent: 60, isActive: true },
    { accountId: second, percent: 75, isActive: false },
    { accountId: ACCOUNT_ID, percent: 12, isActive: false }
  ]);
  assert.equal(accounts[0].resetsAt, 1800018000);
  assert.equal(accounts[0].label, 'Third');
  assert.equal(capture.notifications.length, 1);
});

test('RPC capture handles byte-sized chunks and Request header overrides', async () => {
  for (const override of [false, true]) {
    const second = '22222222-2222-4222-8222-222222222222';
    const capture = createCapture({
      organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Observed' }) })
    });
    const request = new Request('https://claude.ai' + RPC_FIXTURE.path, {
      headers: { 'x-organization-uuid': override ? second : ACCOUNT_ID }
    });
    await capture.sendRpcReading(ACCOUNT_ID, { encoding: 'identity', chunkSize: 1, request,
      init: override ? { headers: new Headers({ 'X-Organization-UUID': ACCOUNT_ID }) } : {}
    });
    assert.equal(capture.accounts()[0]?.accountId, ACCOUNT_ID);
    assert.equal(capture.accounts()[0]?.percent, 60);
  }
});

test('RPC identity belongs to the sent request even when headers change before its response', async () => {
  const second = '22222222-2222-4222-8222-222222222222';
  for (const useRequest of [false, true]) {
    const capture = createCapture({
      organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Sent Account' }) })
    });
    const headers = new Headers({ 'x-organization-uuid': ACCOUNT_ID });
    const request = useRequest ? new Request('https://claude.ai' + RPC_FIXTURE.path, { headers }) : RPC_FIXTURE.path;
    await capture.sendRpcReading(ACCOUNT_ID, { request, init: useRequest ? {} : { headers },
      beforeResponse: async () => {
        (useRequest ? request.headers : headers).set('x-organization-uuid', second);
      }
    });
    assert.equal(capture.accounts()[0]?.accountId, ACCOUNT_ID);
    assert.equal(capture.accounts()[0]?.percent, 60);
  }
});

test('RPC capture preserves an explicit zero and caps exhausted quota at 100%', async () => {
  const capture = createCapture({
    organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Observed' }) })
  });
  await capture.sendRpcReading(ACCOUNT_ID, { encoding: 'identity', bytes: Buffer.from(RPC_FIXTURE.zeroBase64, 'base64') });
  assert.equal(capture.accounts()[0]?.percent, 0);
  await capture.sendRpcReading(ACCOUNT_ID, { encoding: 'identity', bytes: Buffer.from(RPC_FIXTURE.exhaustedBase64, 'base64') });
  assert.equal(capture.accounts()[0]?.percent, 100);
  assert.equal(capture.accounts()[0]?.isFull, true);
});

test('unusable RPC signals never replace the Active Account', async (t) => {
  const identity = Buffer.from(RPC_FIXTURE.identityBase64, 'base64');
  const scenarios = {
    'missing utilization': { encoding: 'identity', bytes: Buffer.from(RPC_FIXTURE.withoutUtilizationBase64, 'base64') },
    'weekly quota only': { encoding: 'identity', bytes: Buffer.from(RPC_FIXTURE.weeklyOnlyBase64, 'base64') },
    'truncated envelope': { encoding: 'identity', bytes: identity.subarray(0, -2) },
    'invalid compression': { bytes: Buffer.from([1, 0, 0, 0, 3, 1, 2, 3]) },
    'unsupported compression': { encoding: 'br', bytes: Buffer.from(RPC_FIXTURE.gzipBase64, 'base64') },
    'missing Account header': { init: { headers: {} } },
    'invalid Account header': { init: { headers: { 'x-organization-uuid': '../other' } } },
    'another origin': { request: 'https://example.com' + RPC_FIXTURE.path }
  };
  for (const [name, options] of Object.entries(scenarios)) {
    await t.test(name, async () => {
      const capture = createCapture({ initialAccounts: Accounts.applyReading({}, {
        accountId: ACCOUNT_ID, label: 'Kept', percent: 75
      }, NOW - 1000) });
      await capture.sendRpcReading('33333333-3333-4333-8333-333333333333', options);
      const accounts = capture.accounts();
      assert.equal(accounts.length, 1);
      assert.equal(accounts[0].accountId, ACCOUNT_ID);
      assert.equal(accounts[0].percent, 75);
      assert.equal(capture.notifications.length, 0);
    });
  }
});

test('install and update capture names in an already-open Claude document', async () => {
  for (const injectAtStart of [false, true]) {
    const capture = createCapture({ injectAtStart,
      organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Personal' }) })
    });
    await capture.install('install');
    await capture.sendReading();
    assert.equal(capture.accounts()[0]?.label, 'Personal');
    await capture.install('update');
    await capture.sendReading(25);
    assert.equal(capture.accounts()[0]?.label, 'Personal');
    assert.equal(capture.accounts()[0]?.percent, 25);
    assert.equal(capture.requests.length, 1);
    assert.equal(capture.notifications.length, 2, 'each reading reaches the worker once');
  }
});

test('an old MAIN interceptor cannot overwrite readings from the updated capture scripts', async () => {
  const capture = createCapture({
    organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Personal' }) })
  });
  await capture.install('update');
  await capture.sendReading(18);
  await capture.legacyReading();
  assert.equal(capture.accounts()[0].percent, 18);
  assert.equal(capture.notifications.length, 1);
});

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

test('synthetic SSE and RPC captures rediscover a forgotten Account through the real worker without Undo overwriting it', async () => {
  const work = '22222222-2222-4222-8222-222222222222';
  for (const transport of ['sse', 'rpc']) {
    const capture = createCapture({ organizationFetch: async () => ({ ok: true, json: async () => ({ name: 'Personal' }) }) });
    await capture.sendReading(18);
    await capture.sendReading(75, work);
    const kept = capture.raw().accounts[work];
    const result = await capture.mutate({ action: 'forget', accountId: ACCOUNT_ID });
    assert.equal(result.status, 'forgotten');
    await capture.mutate({ action: 'offerUndo', token: result.undo.token, offeredAt: NOW });
    assert.equal(capture.raw().accounts[ACCOUNT_ID], undefined);
    if (transport === 'rpc') await capture.sendRpcReading(ACCOUNT_ID);
    else await capture.sendReading(28);
    assert.equal((await capture.mutate({ action: 'undo', token: result.undo.token })).status, 'newer-kept');
    assert.equal(capture.accounts()[0].accountId, ACCOUNT_ID);
    assert.equal(capture.accounts()[0].percent, transport === 'rpc' ? 60 : 28);
    assert.deepEqual(capture.raw().accounts[work], kept);
  }
});

test('a label arriving after persisted Forget cannot recreate that Account or disturb Active', async () => {
  let resolveName;
  const work = '22222222-2222-4222-8222-222222222222';
  const capture = createCapture({ organizationFetch: url => url.endsWith(ACCOUNT_ID)
    ? new Promise(resolve => { resolveName = resolve; })
    : Promise.resolve({ ok: true, json: async () => ({ name: 'Work' }) }) });
  await capture.sendReading();
  await capture.sendReading(75, work);
  const { undo } = await capture.mutate({ action: 'forget', accountId: ACCOUNT_ID });
  await capture.mutate({ action: 'offerUndo', token: undo.token, offeredAt: NOW });
  resolveName({ ok: true, json: async () => ({ name: 'Delayed personal' }) });
  await new Promise(setImmediate);
  assert.equal(capture.raw().accounts[ACCOUNT_ID], undefined);
  assert.equal(capture.accounts()[0].accountId, work);
  assert.equal((await capture.mutate({ action: 'undo', token: undo.token })).status, 'restored');
  assert.equal(capture.accounts().find(account => account.accountId === ACCOUNT_ID).label, 'Account 111111…');
});
