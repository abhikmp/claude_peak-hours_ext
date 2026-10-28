const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function poll({ time, watched = ['ai'], incident = false, fail = false, iconFails = false, percent = 88 }) {
  let listener, done;
  const completed = new Promise(resolve => { done = resolve; });
  let stored = { accounts: { sample: { percent, resetsAt: 2000000000, lastReadingAt: 1, readingOrder: 1 } } };
  const result = { badges: [] };
  const context = vm.createContext({ URL, Date: class extends Date {
    constructor(...args) { super(...(args.length ? args : [Date.parse(time)])); }
    static now() { return Date.parse(time); }
  }, setInterval() { return 1; }, clearInterval() {},
  fetch: async url => {
    assert.equal(url, 'https://status.claude.com/api/v2/summary.json');
    if (fail) throw Error('network unavailable');
    return { ok: true, json: async () => ({ status: { indicator: incident ? 'major' : 'none', description: 'Status sample' },
      components: [{ id: 'web', name: 'Claude AI', status: incident ? 'major_outage' : 'operational' }],
      incidents: incident ? [{ name: 'Sample outage', impact: 'major', components: ['web'],
        incident_updates: [{ status: 'investigating', body: 'Investigating sample' }] }] : [] }) };
  }, chrome: {
    runtime: { id: 'status-test', onInstalled: { addListener() {} }, onStartup: { addListener() {} },
      onMessage: { addListener(value) { listener = value; } } },
    alarms: { onAlarm: { addListener() {} } },
    storage: { local: { setAccessLevel: async () => {}, get: async () => structuredClone(stored),
      set: async value => { stored = { ...stored, ...value }; } },
    sync: { setAccessLevel: async () => {}, get: async () => ({ watchedProducts: watched }) } },
    action: { setIcon: async value => {
      if (iconFails) throw Error("Failed to set icon 'icons/usage-green-48.png': Failed to fetch");
      // Chromium's worker setIcon implementation fetches each path from the
      // worker context. Check the resolved resource, not just a mocked string.
      for (const iconPath of Object.values(value.path)) {
        const resolved = new URL(iconPath, 'chrome-extension://status-test/background/service-worker.js');
        assert.ok(fs.existsSync(path.join(__dirname, '..', resolved.pathname)), resolved.pathname);
      }
      result.icon = value.path[16];
    }, setBadgeText: value => result.badges.push(value.text),
      setBadgeBackgroundColor: value => { result.badgeColor = value.color; }, setBadgeTextColor() {},
      setTitle: value => { result.title = value.title; done(); } }
  } });
  context.importScripts = file => vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../background', file), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../background/service-worker.js'), 'utf8'), context);
  listener({ type: 'POLL_NOW' }, { id: 'status-test' });
  await completed;
  return { ...result, stored };
}

test('simulated status: watched outage outranks peak, with OUT and incident tooltip; icon stays usage-driven', async () => {
  const result = await poll({ time: '2026-10-23T13:00:00Z', incident: true });
  assert.equal(result.stored.state, 'orange');
  assert.equal(result.badges.at(-1), 'OUT');
  assert.equal(result.badgeColor, '#c2410c');
  assert.equal(result.title, 'Issue: Claude AI · Sample outage');
  assert.equal(result.icon, '/icons/usage-red-16.png');
});

test('an icon-loading failure does not suppress outage or peak badges and tooltips', async () => {
  const outage = await poll({ time: '2026-10-23T13:00:00Z', incident: true, iconFails: true });
  assert.equal(outage.stored.state, 'orange');
  assert.equal(outage.badges.at(-1), 'OUT');
  assert.match(outage.title, /^Issue: Claude AI/);
  const peak = await poll({ time: '2026-10-23T13:00:00Z', iconFails: true });
  assert.equal(peak.badges.at(-1), 'PEAK');
  assert.match(peak.title, /^Peak hours/);
});

test('every quota color resolves all packaged icon sizes from the nested worker URL', async () => {
  for (const [percent, color] of [[2, 'green'], [61, 'orange'], [86, 'red']]) {
    const result = await poll({ time: '2026-10-23T13:00:00Z', incident: true, percent });
    assert.equal(result.icon, `/icons/usage-${color}-16.png`);
    assert.equal(result.badges.at(-1), 'OUT');
  }
});

test('simulated status: peak boundary and weekend resolve badge/tooltip independently of usage', async () => {
  const peak = await poll({ time: '2026-10-23T12:00:00Z' }); // Friday 05:00 Pacific.
  assert.equal(peak.stored.state, 'red');
  assert.equal(peak.badges.at(-1), 'PEAK');
  assert.match(peak.title, /^Peak hours · Ends in /);
  const end = await poll({ time: '2026-10-23T18:00:00Z' }); // 11:00 Pacific.
  assert.equal(end.stored.state, 'green');
  assert.equal(end.badges.at(-1), '');
  assert.match(end.title, /^Off-peak · Next peak in /);
  const weekend = await poll({ time: '2026-10-24T13:00:00Z' });
  assert.equal(weekend.stored.state, 'green');
  assert.equal(weekend.icon, '/icons/usage-red-16.png');
});

test('simulated status: unwatched incident does not become OUT, and request failure keeps the usage icon', async () => {
  const unwatched = await poll({ time: '2026-10-23T13:00:00Z', watched: ['design'], incident: true });
  assert.equal(unwatched.stored.state, 'red');
  assert.equal(unwatched.badges.at(-1), 'PEAK');
  const failed = await poll({ time: '2026-10-23T13:00:00Z', fail: true });
  assert.equal(failed.stored.state, 'grey');
  assert.equal(failed.title, 'ClaudeBuddy · Unknown');
  assert.equal(failed.badges.at(-1), '');
  assert.equal(failed.icon, '/icons/usage-red-16.png');
});
