const frame = document.querySelector('iframe');
const results = document.getElementById('results');
const settle = () => new Promise(resolve => setTimeout(resolve, 80));
const open = async (name, options = {}, reopen = false) => {
  if (!reopen) localStorage.removeItem('ticket01-' + name);
  await new Promise(resolve => {
    frame.onload = resolve;
    frame.src = '/popup/popup.html?' + new URLSearchParams({ case: name, ...options });
  });
  await settle();
  return frame.contentWindow;
};
document.getElementById('run').onclick = async () => {
  results.textContent = '';
  const check = (condition, message) => {
    results.textContent += (condition ? 'PASS ' : 'FAIL ') + message + '\n';
    if (!condition) throw new Error(message);
  };
  try {
    let win = await open('retention', { old: '1' });
    check(Object.keys(win.ticket01.state.local.accounts).length === 1, 'popup startup retains a year-old Account');
    check(win.ticket01.state.local.accounts['11111111-1111-4111-8111-111111111111'].label === 'Studio', 'saved label survives');
    check(win.ticket01.writes.length === 0, 'opening popup writes no storage');
    await win.ticket01.advance(172800001);
    check(Object.keys(win.ticket01.state.local.accounts).length === 1, 'idle popup refresh retains the Account beyond 48 more hours');
    win = await open('retention', {}, true);
    check(Object.keys(win.ticket01.state.local.accounts).length === 1, 'closing/reopening preserves the Account');

    for (const theme of ['dark', 'light']) {
      for (const multi of ['', '1']) {
        win = await open('expiry-' + theme + multi, { theme, multi });
        const doc = win.document;
        const page = () => [...doc.querySelectorAll('.account-page')].find(page => page.getAttribute('aria-hidden') === 'false');
        if (multi) doc.getElementById('account-next').click();
        const text = () => page().innerText;
        const value = () => page().querySelector('.account-percent');
        check(text().includes('100%') && text().includes('Resets in 1h'), theme + ' ' + (multi ? 'paged' : 'single') + ': ordinary reading and countdown');
        check(text().includes('Updated 20m ago'), 'reading age is shown');
        const stored = JSON.stringify(win.ticket01.state.local.accounts);
        await win.ticket01.advance(3600000);
        check(value().innerText === '~0% estimated', 'idle refresh shows explicitly estimated usage at the reset boundary');
        const themeColor = token => {
          const probe = doc.createElement('span');
          probe.style.color = `var(${token})`;
          doc.body.append(probe);
          const color = win.getComputedStyle(probe).color;
          probe.remove();
          return color;
        };
        check(win.getComputedStyle(value()).color === themeColor('--green-pct'), 'recent reset estimate uses the theme green');
        check(value().title.includes('Last observed: 100%') && value().title.includes('Send a message'), 'hover text preserves the observation and refresh guidance');
        check(!text().includes('Last observed') && !text().includes('Send a message') && !text().includes('5h quota') && !text().includes('Window ended'), 'dormant detail avoids paragraphs and redundant quota labels');
        const facts = () => page().querySelector('.usage-facts');
        check([...facts().querySelectorAll('dt')].map(node => node.textContent).join('|') === 'Last reset|Last recorded usage|Updated', 'dormant detail has three labeled fact rows');
        check([...facts().querySelectorAll('dd')].map(node => node.textContent).join('|') === 'just now|100%|1h 20m ago', 'fact rows show relative reset time, last recorded percent and reading age');
        check(facts().querySelector('time').dateTime === '2026-10-23T11:00:00.000Z', 'reset timestamp comes from the actual last captured reading');
        await win.chrome.storage.sync.set({ userTZ: 'UTC' });
        await win.ticket01.advance(0);
        check(facts().querySelector('time').textContent === 'just now' && facts().querySelector('time').title.includes('11:00') && facts().querySelector('time').title.includes('2026') && facts().querySelector('time').title.includes('(UTC)'), 'relative reset is timezone-independent and full timestamp hover follows selected timezone');
        await win.chrome.storage.sync.set({ userTZ: 'Asia/Calcutta' });
        await win.ticket01.advance(0);
        check(value().getAttribute('aria-description') === value().title && value().tabIndex === 0, 'dormant context is available to assistive technology and keyboard focus');
        check(JSON.stringify(win.ticket01.state.local.accounts) === stored, 'expiry and browsing leave stored readings and Active unchanged');
        check(page().querySelector('.account-bar').hidden, 'expired reading hides the current-usage bar');
        await win.ticket01.advance(3 * 3600000 - 1);
        check(value().innerText === '~0% estimated', 'estimate remains until just before three hours after reset');
        await win.ticket01.advance(1);
        check(value().innerText === 'No recent reading', 'estimate ends at exactly three hours after reset');
        check(facts().querySelector('time').textContent === '3h ago', 'relative reset age refreshes while popup stays open');
        check(win.getComputedStyle(value()).color === themeColor('--text-secondary'), 'older dormant reading returns to neutral text');
        check(!facts().hidden && facts().querySelector('.usage-last-recorded').textContent === '100%' && facts().querySelector('.usage-reading-age').textContent === '4h 20m ago', 'fact rows remain visible and age refreshes after the estimate ends');
        check(JSON.stringify(win.ticket01.state.local.accounts) === stored, 'estimated display never overwrites a saved Usage reading');
        await win.ticket01.reading();
        await settle();
        const activeValue = doc.querySelector('.account-page .account-percent');
        check(activeValue.innerText.includes('28%') && !activeValue.hasAttribute('title') && !activeValue.hasAttribute('aria-description') && !activeValue.hasAttribute('tabindex'), 'new reading clears the expired presentation and stale hover context');
        check(doc.querySelector('.account-page .usage-facts').hidden, 'fresh readings hide the dormant fact block');
      }
    }

    for (const [resetAgoMinutes, expected] of [[0.5, 'just now'], [1, '1m ago'], [59, '59m ago'], [60, '1h ago'], [1439, '23h ago'], [1440, '1d ago'], [2880, '2d ago']]) {
      win = await open('reset-age-' + resetAgoMinutes, { expired: '1', resetAgoMinutes });
      check(win.document.querySelector('.usage-facts time').textContent === expected, `last reset at ${resetAgoMinutes} minutes displays ${expected}`);
    }

    win = await open('active-expiry', { multi: '1', expired: '1' });
    // Make the latest observation expire too, then exercise the actual refresh timer.
    await win.ticket01.advance(7200000);
    const activePage = win.document.querySelector('.account-page');
    check(!activePage.querySelector('.active').hidden && activePage.innerText.includes('~0% estimated') && activePage.querySelector('.account-percent').title.includes('Last observed: 45%'), 'expired Active detail remains Active and retains its observation');

    win = await open('reset', { multi: '1', theme: 'light', old: '1' });
    win.document.getElementById('tz-reset-btn').click();
    await settle();
    check(Object.keys(win.ticket01.state.local.accounts).length === 0, 'reset-to-default clears all retained Accounts');
    check(win.ticket01.state.sync.theme === 'dark' && win.ticket01.state.sync.watchedProducts.join() === 'ai', 'reset restores theme and watched products');
    check(win.ticket01.state.sync.userTZ === win.Intl.DateTimeFormat().resolvedOptions().timeZone, 'reset restores system timezone');
    check(win.ticket01.toolbar.length > 0 && win.ticket01.messages.includes('POLL_NOW'), 'reset refreshes the real worker icon and requests status refresh');
    check(win.document.getElementById('usage-sub').textContent === 'Send a message to see usage', 'reset restores the no-reading view');
    check(win.document.getElementById('account-hero').hidden && win.document.getElementById('account-track').children.length === 0, 'reset clears saved Account detail and its hover context');
    check(win.document.querySelectorAll('.usage-facts').length === 0, 'reset clears the dormant fact block');
    win = await open('reset', {}, true);
    check(Object.keys(win.ticket01.state.local.accounts).length === 0, 'cleared Accounts stay cleared after reopening');
    results.textContent += '\nAll lifecycle checks passed. Fixtures only; not a live extension capture test.\n';
  } catch (error) { results.textContent += '\nStopped: ' + error.message; }
};
