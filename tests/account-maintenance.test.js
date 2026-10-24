const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Accounts = require('../shared/accounts.js');

const ROOT = path.resolve(__dirname, '..');
const NOW = 1800000000000;
const OLD = '11111111-1111-4111-8111-111111111111';
const KEPT = '22222222-2222-4222-8222-222222222222';
const TWO_DAYS = 172800000;

function startWorker(accounts) {
  let stored = { accounts, state: 'orange', incidentTitle: 'Existing incident' };
  let onAlarm;
  let icon;
  let writes = 0;
  class Canvas {
    constructor(width, height) { this.width = width; this.height = height; }
    getContext() {
      const { width, height } = this;
      return {
        clearRect() {}, beginPath() {}, arc() {}, fill() {},
        getImageData() {
          const data = new Uint8ClampedArray(width * height * 4);
          const rgb = this.fillStyle.match(/\w\w/g).map(hex => parseInt(hex, 16));
          data.set([...rgb, 255], ((height / 2) * width + width / 2) * 4);
          return { width, height, data };
        }
      };
    }
  }
  const context = vm.createContext({ URL, OffscreenCanvas: Canvas, Date: class extends Date {
    static now() { return NOW; }
  }, chrome: {
    storage: {
      local: {
        get: async () => structuredClone(stored),
        setAccessLevel: async () => {},
        set: async value => { writes++; stored = { ...stored, ...structuredClone(value) }; }
      },
      sync: { setAccessLevel: async () => {}, set() { assert.fail('Account cleanup must not write sync storage'); } }
    },
    alarms: { onAlarm: { addListener(listener) { onAlarm = listener; } } },
    action: {
      setIcon: async value => { icon = value; },
      setBadgeText() { assert.fail('Usage cleanup must not change the badge'); },
      setTitle() { assert.fail('Usage cleanup must not change the tooltip'); }
    },
    runtime: {
      onInstalled: { addListener() {} }, onStartup: { addListener() {} }, onMessage: { addListener() {} }
    }
  } });
  context.importScripts = file => vm.runInContext(
    fs.readFileSync(path.resolve(ROOT, 'background', file), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'background/service-worker.js'), 'utf8'), context);
  return {
    async tick() { onAlarm({ name: 'usageExpiryCheck' }); await new Promise(setImmediate); },
    accounts: () => Accounts.getAccounts(stored.accounts, NOW),
    local: () => stored,
    writes: () => writes,
    iconColor: () => {
      const image = icon.imageData[16];
      const center = ((image.height / 2) * image.width + image.width / 2) * 4;
      return [...image.data.slice(center, center + 4)];
    }
  };
}

test('the 30-second alarm retains Accounts and their labels beyond 48 hours without rewriting readings', async () => {
  let accounts = Accounts.applyReading({}, { accountId: OLD, label: 'Saved workspace', percent: 100, resetsAt: NOW / 1000 + 3600 }, NOW - 365 * 86400000);
  accounts = Accounts.applyReading(accounts, { accountId: KEPT, percent: 90, resetsAt: NOW / 1000 + 3600 }, NOW - TWO_DAYS + 1);
  const worker = startWorker(accounts);
  await worker.tick();
  assert.deepEqual(worker.accounts().map(account => account.accountId), [KEPT, OLD]);
  assert.deepEqual(worker.local().accounts, accounts);
  assert.equal(worker.writes(), 0);
  assert.deepEqual(worker.iconColor(), [239, 68, 68, 255]);
  assert.equal(worker.local().state, 'orange');
  assert.equal(worker.local().incidentTitle, 'Existing incident');
});

test('a lone Account remains remembered beyond 48 hours and keeps driving the icon', async () => {
  const accounts = Accounts.applyReading({}, {
    accountId: OLD, percent: 100, resetsAt: NOW / 1000 + 3600
  }, NOW - TWO_DAYS - 1);
  const worker = startWorker(accounts);
  await worker.tick();
  assert.equal(worker.accounts()[0].accountId, OLD);
  assert.deepEqual(worker.iconColor(), [239, 68, 68, 255]);
  assert.equal(worker.writes(), 0);
  await worker.tick();
  assert.equal(worker.writes(), 0);
});

test('an expired Active reading turns the icon green without deleting its stored reading', async () => {
  const accounts = Accounts.applyReading({}, {
    accountId: KEPT, percent: 100, resetsAt: NOW / 1000
  }, NOW - 600000);
  const worker = startWorker(accounts);
  await worker.tick();
  assert.deepEqual(worker.iconColor(), [34, 197, 94, 255]);
  assert.equal(worker.accounts()[0].percent, null);
  assert.equal(worker.accounts()[0].lastObservedPercent, 100);
  assert.equal(worker.accounts()[0].isFull, false);
  assert.equal(worker.local().accounts[KEPT].percent, 100);
  assert.equal(worker.writes(), 0);
});
