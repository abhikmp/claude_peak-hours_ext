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
        const page = () => multi ? doc.querySelectorAll('.account-page')[1] : doc.querySelector('.usage-hero');
        if (multi) doc.getElementById('account-next').click();
        const text = () => page().textContent;
        check(text().includes('100%') && text().includes('Resets in 1h'), theme + ' ' + (multi ? 'paged' : 'single') + ': ordinary reading and countdown');
        check(text().includes('Updated 20m ago'), 'reading age is shown');
        const stored = JSON.stringify(win.ticket01.state.local.accounts);
        await win.ticket01.advance(3600000);
        check(text().includes('unknown') && text().includes('Window ended'), 'idle refresh shows unknown usage at the exact reset boundary');
        check(text().includes('Last observed: 100%') && text().includes('Send a message'), 'expired detail preserves observation and explains refresh');
        check(!text().includes('Full quota available') && !text().includes('0% used'), 'expiry makes no inferred quota claim');
        check(JSON.stringify(win.ticket01.state.local.accounts) === stored, 'expiry and browsing leave stored readings and Active unchanged');
        check((multi ? page().querySelector('.account-bar') : doc.querySelector('.bar-wrap')).hidden, 'expired reading hides the current-usage bar');
        await win.ticket01.reading();
        await settle();
        check(doc.body.textContent.includes('28%') && !doc.body.textContent.includes('Last observed: 100%'), 'new reading clears the expired presentation');
      }
    }

    win = await open('active-expiry', { multi: '1', expired: '1' });
    // Make the latest observation expire too, then exercise the actual refresh timer.
    await win.ticket01.advance(7200000);
    const activeText = win.document.querySelector('.account-page').textContent;
    check(activeText.includes('Active') && activeText.includes('unknown') && activeText.includes('Last observed: 45%'), 'expired Active detail remains Active and retains its observation');

    win = await open('reset', { multi: '1', theme: 'light', old: '1' });
    win.document.getElementById('tz-reset-btn').click();
    await settle();
    check(Object.keys(win.ticket01.state.local.accounts).length === 0, 'reset-to-default clears all retained Accounts');
    check(win.ticket01.state.sync.theme === 'dark' && win.ticket01.state.sync.watchedProducts.join() === 'ai', 'reset restores theme and watched products');
    check(win.ticket01.state.sync.userTZ === win.Intl.DateTimeFormat().resolvedOptions().timeZone, 'reset restores system timezone');
    check(win.ticket01.messages.includes('USAGE_UPDATE') && win.ticket01.messages.includes('POLL_NOW'), 'reset requests icon and status refresh');
    check(win.document.getElementById('usage-sub').textContent === 'Send a message to see usage', 'reset restores the no-reading view');
    check(win.document.getElementById('usage-updated').hidden && win.document.getElementById('usage-observation').hidden, 'reset clears reading age and observation text');
    win = await open('reset', {}, true);
    check(Object.keys(win.ticket01.state.local.accounts).length === 0, 'cleared Accounts stay cleared after reopening');
    results.textContent += '\nAll lifecycle checks passed. Fixtures only; not a live extension capture test.\n';
  } catch (error) { results.textContent += '\nStopped: ' + error.message; }
};
