// Development-only replay. Input: a JSON file with completionPath and chunks
// (SSE strings containing only sanitized message_limit events). Never use a HAR
// or a full completion response. No browser session or network access is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../..');
const Accounts = require(path.join(root, 'shared/accounts.js'));
const now = 1800000000000;
const first = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';
const third = '33333333-3333-4333-8333-333333333333';
const fixture = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'third-account-control.json'), 'utf8'));
let accounts = Accounts.applyReading({}, { accountId: first, label: 'First', percent: 12 }, now - 2000);
accounts = Accounts.applyReading(accounts, { accountId: second, label: 'Second', percent: 75 }, now - 1000);
const listeners = [];
let notifications = 0;
const response = { clone: () => ({ body: { getReader() {
  const chunks = fixture.chunks[Symbol.iterator]();
  return { async read() {
    const chunk = chunks.next();
    return chunk.done ? { done: true } : { done: false, value: new TextEncoder().encode(chunk.value) };
  } };
} } }) };
const window = {
  fetch: async () => response,
  addEventListener(type, listener) { listeners.push(listener); },
  removeEventListener() {},
  postMessage(data) { for (const listener of listeners) listener({ source: window, data }); }
};
const worlds = {
  MAIN: vm.createContext({ window, URL, TextDecoder, console }),
  ISOLATED: vm.createContext({ window, URL, AbortSignal, console,
    Date: class extends Date { static now() { return now; } },
    fetch: async () => ({ ok: true, json: async () => ({ name: 'Third' }) }),
    chrome: {
      runtime: { id: 'replay', sendMessage: async () => { notifications++; } },
      storage: { local: {
        get: async () => ({ accounts: structuredClone(accounts) }),
        set: async value => { accounts = structuredClone(value.accounts); }
      } }
    }
  })
};
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
for (const group of manifest.content_scripts) {
  for (const file of group.js) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), worlds[group.world], { filename: file });
  }
}

(async () => {
  assert.equal(await window.fetch(fixture.completionPath), response, 'Claude receives its original response');
  await new Promise(setImmediate);
  const displayed = Accounts.getAccounts(accounts, now);
  const summary = {
    accountCount: displayed.length,
    thirdIsActive: displayed[0]?.accountId === third,
    thirdPercent: displayed.find(account => account.accountId === third)?.percent ?? null,
    previousReadingsPreserved: displayed.some(account => account.accountId === first && account.percent === 12)
      && displayed.some(account => account.accountId === second && account.percent === 75),
    workerNotified: notifications > 0,
    iconColor: Accounts.getIconColor(accounts, now)
  };
  console.log(JSON.stringify(summary));
  assert.equal(summary.accountCount, 3, 'a third distinct Account is saved');
  assert.equal(summary.thirdIsActive, true, 'popup-facing ordering starts with the third Account');
  assert.equal(summary.previousReadingsPreserved, true);
  assert.equal(summary.workerNotified, true);
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
