const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Accounts = require('../shared/accounts.js');

const ROOT = path.resolve(__dirname, '..');
const NOW = 1800000000000;
const ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

test('a completion stores usage when Chrome deduplicates script paths across worlds', { timeout: 2000 }, async () => {
  // Chromium tracks executed file paths per extension, rather than per world.
  // Either world may run first; capture must work with both injection orders.
  for (const firstWorld of ['ISOLATED', 'MAIN']) {
    let stored = {};
    let signalStored;
    const persisted = new Promise(resolve => { signalStored = resolve; });
    const listeners = [];
    let streamRead = false;
    const response = {
      clone: () => ({ body: { getReader: () => ({
        async read() {
          if (streamRead) return { done: true };
          streamRead = true;
          return { done: false, value: new TextEncoder().encode('data: ' + JSON.stringify({
            type: 'message_limit', message_limit: {
              resolved: { limit: { percent: 18 } },
              windows: { '5h': { resets_at: 1800018000 } }
            }
          }) + '\n\n') };
        }
      }) } })
    };
    const window = {
      fetch: async () => response,
      addEventListener: (type, listener) => listeners.push(listener),
      postMessage(message) {
        for (const listener of listeners) listener({ source: window, data: message });
      }
    };
    const worlds = {
      MAIN: vm.createContext({ URL, TextDecoder, window }),
      ISOLATED: vm.createContext({ URL, window, Date: class extends Date {
        static now() { return NOW; }
      }, chrome: {
        runtime: { id: 'usage-test', sendMessage: async () => {} },
        storage: { local: {
          get: async () => structuredClone(stored),
          async set(value) { stored = structuredClone(value); signalStored(); }
        }, sync: { set() { assert.fail('Usage readings must stay local'); } } }
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
    const result = await window.fetch(
      `/api/organizations/${ACCOUNT_ID}/chat_conversations/test/completion?source=web`
    );
    assert.equal(result, response, 'Claude must still receive its original response');
    await persisted;
    const [active] = Accounts.getAccounts(stored.accounts, NOW);
    assert.equal(active.accountId, ACCOUNT_ID);
    assert.equal(active.percent, 18);
  }
});
