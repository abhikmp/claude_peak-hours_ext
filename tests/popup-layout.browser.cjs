// Browser regression for the real popup, with only extension APIs mocked.
// Run: node tests/popup-layout.browser.cjs (requires playwright-core + Chromium).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const ROOT = path.resolve(__dirname, '..');
const NOW = Date.parse('2026-10-29T06:00:00Z');
const REPORTED = 'Elevated errors affecting the Google Calendar connector';

async function run() {
  const browser = await chromium.launch({ channel: process.env.POPUP_BROWSER_CHANNEL || 'msedge',
    headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] });
  try {
    const page = await browser.newPage({ viewport: { width: 260, height: 340 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://popup.test/**', route => {
      const file = path.resolve(ROOT, new URL(route.request().url()).pathname.slice(1));
      if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.abort();
      return route.fulfill({ body: fs.readFileSync(file), contentType: {
        '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json'
      }[path.extname(file)] });
    });
    await page.addInitScript(({ now, reported }) => {
      const RealDate = Date;
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [now])); }
        static now() { return now; }
      };
      window.popupFixture = { local: { state: 'orange', incidentTitle: reported,
        incidentImpact: 'minor', affectedProducts: ['ai', 'code'], accounts: {} },
      sync: { theme: 'dark', userTZ: 'Asia/Calcutta', watchedProducts: ['ai'] } };
      window.chrome = {
        storage: { local: { get: async () => structuredClone(popupFixture.local) },
          sync: { get: async () => structuredClone(popupFixture.sync),
            set: async values => Object.assign(popupFixture.sync, values) }, onChanged: { addListener() {} } },
        runtime: { sendMessage: async () => ({}), getURL: value => 'https://popup.test/' + value }
      };
    }, { now: NOW, reported: REPORTED });
    await page.goto('https://popup.test/popup/popup.html');
    await page.waitForFunction(() => document.querySelector('#pill-text').textContent === 'Outage');

    const fixture = config => page.evaluate(async ({ config, now }) => {
      const reading = config.reading || 'expired';
      popupFixture.local = { state: config.state || 'orange', incidentTitle: config.message,
        incidentBody: config.body || '', incidentImpact: 'minor', affectedProducts: ['ai', 'code'],
        accounts: Object.fromEntries(Array.from({ length: config.count ?? 2 }, (_, i) => [`sample-${i}`, {
          label: i ? 'Work ' + i : 'Sample', percent: i ? 42 : 26,
          resetsAt: now / 1000 + (reading === 'current' ? 299 : reading === 'unknown' ? -240 : -38) * 60,
          lastReadingAt: now - (6 + i) * 3600000, readingOrder: 10 - i
        }])) };
      popupFixture.sync.watchedProducts = config.products === 'all' ? ['ai', 'code', 'cowork', 'design'] : ['ai'];
      popupFixture.sync.theme = config.theme || 'dark';
      applyTheme(popupFixture.sync.theme);
      await render(); await initProductFilter();
    }, { config, now: NOW });

    const measure = () => page.evaluate(() => {
      const hint = document.querySelector('#product-filter-hint');
      return {
        pages: [...document.querySelectorAll('.account-track > .account-page')].map(e => ({
          client: e.clientHeight, scroll: e.scrollHeight })),
        popupFits: document.querySelector('.container').scrollHeight <= document.body.clientHeight,
        footerTop: document.querySelector('.tz-picker').getBoundingClientRect().top,
        footerFits: document.querySelector('.tz-picker').getBoundingClientRect().bottom <= document.body.clientHeight,
        hintHeight: hint.getBoundingClientRect().height, hintVisible: getComputedStyle(hint).visibility === 'visible',
        details: !!document.querySelector('.incident-sub button:not([hidden])')
      };
    });
    await fixture({ message: REPORTED });
    const original = await measure();
    assert.ok(original.pages.every(p => p.scroll <= p.client),
      'Reported outage must not produce an Account scrollbar: ' + JSON.stringify(original.pages));

    const messages = [
      ['Elevated errors', false], [REPORTED, false], ['Line one\nLine two', false],
      ['Line one\nLine two\nLine three', true], ['CalendarFailure'.repeat(240), true],
      [('We are investigating elevated errors affecting connected services.\n').repeat(60), true]
    ];
    let cases = 0;
    for (const [message, details] of messages) for (const reading of ['current', 'expired', 'unknown']) {
      for (const count of [0, 1, 2, 3, 6]) for (const theme of ['dark', 'light']) {
        let footerTop;
        for (const products of ['one', 'all']) {
          await fixture({ message, reading, count, theme, products });
          const result = await measure();
          const name = `${message.length} chars, ${reading}, ${count} Accounts, ${theme}, ${products}`;
          assert.ok(result.pages.every(p => p.scroll <= p.client), name + ': Account overflow ' + JSON.stringify(result.pages));
          assert.ok(result.popupFits && result.footerFits, name + ': popup/footer overflow');
          assert.equal(result.details, details, name + ': wrong incident presentation');
          assert.ok(result.hintHeight > 0, name + ': hint space collapsed');
          assert.equal(result.hintVisible, products === 'one', name + ': hint visibility');
          if (products === 'one') footerTop = result.footerTop;
          else assert.equal(result.footerTop, footerTop, name + ': footer shifted');
          if (details) {
            await page.locator('#incident-details-btn').click();
            assert.equal(await page.locator('#incident-dialog-message').textContent(), message);
            await page.locator('#incident-close').click();
          }
          cases++;
        }
      }
    }

    await fixture({ message: REPORTED, count: 3 });
    const before = (await measure()).footerTop;
    await page.locator('#pf-code').check();
    assert.equal((await measure()).hintVisible, false);
    assert.equal((await measure()).footerTop, before);
    await page.locator('#pf-code').uncheck();
    assert.equal((await measure()).hintVisible, true);
    assert.equal((await measure()).footerTop, before);

    // Character limit is an independent guard, even when text has no visual width.
    for (const length of [3000, 3001]) {
      await fixture({ message: '\u200b'.repeat(length) });
      assert.equal((await measure()).details, length > 3000);
    }
    await fixture({ message: '' });
    assert.equal(await page.locator('#incident-sub').isVisible(), false);

    // Full body text and markup-looking content must survive as plain text.
    const body = 'Claude AI: ' + '<img src=x onerror=alert(1)> '.repeat(130);
    await fixture({ message: 'Incident update', body, count: 6 });
    await page.locator('#account-next').click();
    await page.locator('#incident-details-btn').click();
    assert.equal(await page.locator('#incident-dialog-message').textContent(), body);
    assert.equal(await page.locator('#incident-dialog-message img').count(), 0);
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.container').evaluate(e => e.classList.contains('account-secondary')), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#incident-dialog').evaluate(e => e.open), false);
    assert.equal(await page.locator('#incident-details-btn').evaluate(e => e === document.activeElement), true);
    await page.locator('#account-previous').click();
    assert.equal((await measure()).details, true);

    // Periodic reading refreshes must not close the dialog or reset its scroll.
    await page.locator('#incident-details-btn').click();
    const scrollTop = await page.locator('#incident-dialog-message').evaluate(e => { e.scrollTop = 80; return e.scrollTop; });
    assert.ok(scrollTop > 0);
    await page.evaluate(() => render());
    assert.equal(await page.locator('#incident-dialog').evaluate(e => e.open), true);
    assert.equal(await page.locator('#incident-dialog-message').evaluate(e => e.scrollTop), scrollTop);
    await fixture({ message: 'Recovered', state: 'green' });
    assert.equal(await page.locator('#incident-dialog').evaluate(e => e.open), false);
    assert.equal(await page.locator('#incident-sub').isVisible(), false);
    for (const state of ['red', 'grey']) {
      await fixture({ message: '', state });
      assert.ok((await measure()).popupFits);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS: original outage; ${cases} layouts; full-message safety, modal keyboard/focus, refresh, table navigation, stable checkbox spacing.`);
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error.stack); process.exitCode = 1; });
