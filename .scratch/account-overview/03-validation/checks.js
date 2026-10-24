let frame = document.querySelector('iframe');
const results = document.getElementById('results');
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const visibleRows = doc => [...doc.querySelectorAll('tbody tr')].filter(row => !row.hidden);
const sendKey = (win, target, key) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const bounds = element => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
};
const measurements = [];
const errors = [];
const open = async (name, options = {}, reopen = false) => {
  if (!reopen) localStorage.removeItem('ticket01-' + name);
  const previousFrame = frame;
  frame = document.createElement('iframe');
  frame.title = 'Production popup';
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Popup load timed out: ' + name)), 30000);
    frame.onload = () => { clearTimeout(timeout); resolve(); };
    frame.src = '/popup/popup.html?' + new URLSearchParams({ case: name, ...options, load: Date.now() });
    previousFrame.replaceWith(frame);
  });
  await settle();
  for (let attempt = 0; attempt < 100 && !frame.contentDocument.getElementById('tz-label')?.textContent; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  frame.contentWindow.addEventListener('error', event => errors.push(event.message));
  frame.contentWindow.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
  return frame.contentWindow;
};
document.getElementById('run').onclick = async () => {
  results.textContent = '';
  const check = (condition, message) => {
    results.textContent += (condition ? 'PASS ' : 'FAIL ') + message + '\n';
    if (!condition) throw new Error(message);
  };
  try {
    const win = await open('ticket03-four', { count: 4 });
    const doc = win.document;
    doc.getElementById('account-next').click();
    check(!!doc.querySelector('table') && doc.querySelector('table').getBoundingClientRect().height > 0,
      'four Accounts open a comparison table on page two');
    check(doc.querySelectorAll('tbody tr').length === 3 && doc.getElementById('account-dots').children.length === 2,
      'page two contains three other Accounts, with only two main pages');
    const many = await open('ticket03-stable', { count: 64 });
    const listDoc = many.document;
    listDoc.getElementById('account-next').click();
    const search = listDoc.getElementById('account-search');
    search.value = 'Workspace';
    search.dispatchEvent(new many.Event('input', { bubbles: true }));
    const scroller = listDoc.querySelector('.account-table-scroll');
    scroller.scrollTop = 280;
    const scroll = scroller.scrollTop;
    const ids = () => [...listDoc.querySelectorAll('tbody tr')].map(row => row.dataset.accountId).join();
    const order = ids();
    const stored = JSON.stringify(many.ticket01.state.local.accounts);
    listDoc.querySelector('tr[data-account-id="account-7"] button').click();
    check(listDoc.querySelector('.account-inspection').innerText.includes('Workspace 07'), 'row opens full usage details');
    listDoc.querySelector('.account-back').click();
    check(search.value === 'Workspace' && ids() === order && scroller.scrollTop === scroll,
      'Back restores search, row snapshot and exact scroll position');
    check(JSON.stringify(many.ticket01.state.local.accounts) === stored && many.ticket01.writes.length === 0 && many.ticket01.messages.length === 0,
      'inspection leaves stored readings, Active and toolbar unchanged');
    listDoc.querySelector('tr[data-account-id="account-7"] button').click();
    listDoc.getElementById('account-previous').click();
    listDoc.getElementById('account-next').click();
    search.focus();
    check(listDoc.activeElement === search, 'reopening the table after leaving details restores keyboard access');
    search.value = 'Workspace';
    search.dispatchEvent(new many.Event('input', { bubbles: true }));
    await many.ticket01.advance(5 * 60000);
    check(listDoc.querySelector('.account-refresh-notice').textContent === 'Reset priority updates when you reopen this list.', 'clock-only expiry announces priority without inventing a new reading');
    check(listDoc.querySelector('tr[data-account-id="account-5"] .account-row-used').textContent === '~0%'
      && listDoc.querySelector('tr[data-account-id="account-5"] .account-row-reset').textContent === 'just now',
      'recently reset observations show estimated availability and elapsed reset age');
    scroller.scrollTop = 280;
    const refreshScroll = scroller.scrollTop;
    const rowSeven = listDoc.querySelector('tr[data-account-id="account-7"]');
    const rowSevenTop = rowSeven.getBoundingClientRect().top;
    listDoc.querySelector('tr[data-account-id="account-7"] button').click();
    const beforeReading = ids();
    await many.chrome.storage.local.set({ accounts: many.Accounts.applyReading(many.ticket01.state.local.accounts,
      { accountId: 'account-7', percent: 97, resetsAt: many.Date.now() / 1000 + 3600 }, many.Date.now() + 1) });
    await settle();
    check(listDoc.querySelector('.account-detail').innerText.includes('97%')
      && !listDoc.querySelector('.account-detail .active').hidden, 'incoming reading updates inspected usage and Active immediately');
    check(!listDoc.querySelector('.account-refresh-notice').hidden, 'approved refresh notice stays visible while inspecting');
    check(listDoc.querySelector('.account-detail').getBoundingClientRect().top > listDoc.querySelector('.pill-row').getBoundingClientRect().bottom,
      'status remains above row details');
    listDoc.querySelector('.account-back').click();
    check(ids() === beforeReading && scroller.scrollTop === refreshScroll && search.value === 'Workspace'
      && listDoc.querySelector('tr[data-account-id="account-7"]') === rowSeven,
      `incoming reading preserves row identity, order, search and scroll through Back (scroll ${scroller.scrollTop}/${refreshScroll}, order ${ids() === beforeReading}, same row ${listDoc.querySelector('tr[data-account-id="account-7"]') === rowSeven})`);
    check(rowSeven.innerText.includes('97%') && rowSeven.innerText.includes('Active · Updated'),
      'the newly Active Account remains in its frozen row with an Active indicator');
    check(rowSeven.getBoundingClientRect().top === rowSevenTop, 'incoming-reading notice preserves the same row coordinates through inspection/Back');
    const readingNotice = listDoc.querySelector('.account-refresh-notice');
    check(readingNotice.getBoundingClientRect().bottom <= listDoc.querySelector('.account-table-foot').getBoundingClientRect().bottom - 12
      && readingNotice.getBoundingClientRect().top >= scroller.getBoundingClientRect().bottom, 'refresh notice fits between rows and saved count without covering either');
    check(listDoc.querySelector('.account-track').children[0].querySelector('.account-name').textContent === 'Workspace 07',
      'page one follows the new Active while the table remains open');
    await many.chrome.storage.local.set({ accounts: many.Accounts.applyReading(many.ticket01.state.local.accounts,
      { accountId: 'account-new', label: 'New workspace', percent: 80, resetsAt: many.Date.now() / 1000 + 3600 }, many.Date.now() + 2) });
    await settle();
    check(ids() === beforeReading && listDoc.querySelectorAll('tbody tr').length === 63,
      'newly discovered Account does not alter open table membership');
    listDoc.getElementById('account-previous').click();
    listDoc.getElementById('account-next').click();
    check(!listDoc.querySelector('tr[data-account-id="account-new"]') && !!listDoc.querySelector('tr[data-account-id="account-0"]')
      && listDoc.querySelectorAll('tbody tr').length === 64,
      'reopening excludes new Active, includes previous Active and recomputes membership without a count cap');
    check(listDoc.querySelector('tbody tr').dataset.accountId === 'account-5'
      && listDoc.querySelectorAll('tbody tr')[1].dataset.accountId === 'account-7' && listDoc.querySelector('.account-refresh-notice').hidden,
      'reopening promotes recent resets before non-Full recency and clears the refresh notice');
    let reopened = await open('ticket03-stable', {}, true);
    check(!reopened.document.querySelector('.account-track').children[0].inert && reopened.document.querySelector('.account-track').children[1].inert
      && reopened.document.querySelector('.account-track').children[0].innerText.includes('New workspace'),
      'reopened popup starts on the latest Active Account');

    for (const theme of ['dark', 'light']) {
      for (const count of [1, 2, 3, 4, 64]) {
        const win = await open(`ticket03-${theme}-${count}`, { theme, count });
        const doc = win.document;
        const fixed = stage => {
          const box = bounds(doc.querySelector('.container'));
          check(box.width === 260 && box.height === 340 && doc.body.scrollWidth === 260 && doc.body.scrollHeight === 340,
            `${theme} ${count} Accounts ${stage}: exactly 260 × 340, no outer overflow`);
          measurements.push({ theme, count, stage, box });
        };
        fixed('Active');
        const activePage = doc.querySelector('.account-track').children[0];
        check(activePage.scrollHeight === activePage.clientHeight, 'ordinary Active detail fits without a scrollbar');
        if (count === 1) {
          check(doc.getElementById('account-dots').hidden && doc.querySelector('.account-nav').hidden, 'single Account has no navigation');
          continue;
        }
        const controlPositions = JSON.stringify(['.pill-row', '.product-filter', '.footer', '.tz-picker'].map(selector => bounds(doc.querySelector(selector))));
        check(doc.getElementById('account-dots').children.length === (count <= 3 ? count : 2) && doc.getElementById('account-previous').disabled,
          'multiple Accounts open with the appropriate dot count and a bounded previous arrow');
        doc.getElementById('account-next').click();
        fixed('secondary');
        check(doc.getElementById('account-next').disabled === (count !== 3), 'next arrow reflects the actual page boundary');
        if (count <= 3) {
          check(!doc.querySelector('table') && doc.querySelector('.account-track').children[1].innerText.includes('Workspace 01'),
            'two or three Accounts retain individual detailed views');
          check(controlPositions === JSON.stringify(['.pill-row', '.product-filter', '.footer', '.tz-picker'].map(selector => bounds(doc.querySelector(selector)))),
            'small-count status and preferences remain aligned');
          if (count === 3) {
            const next = doc.getElementById('account-next');
            next.focus();
            sendKey(win, next, 'ArrowLeft');
            sendKey(win, next, 'ArrowRight');
            check(doc.activeElement === next && !next.disabled, 'intermediate slide retains next-arrow focus');
            next.click();
            check(doc.querySelector('.account-track').children[2].inert === false && next.disabled
              && doc.getElementById('account-dots').children[2].classList.contains('current')
              && doc.getElementById('account-announcement').textContent.includes('3 of 3'), 'third Account is reachable with correct dots and announcement');
            check(controlPositions === JSON.stringify(['.pill-row', '.product-filter', '.footer', '.tz-picker'].map(selector => bounds(doc.querySelector(selector)))), 'third slide preserves shared control positions');
          }
          continue;
        }
        check(doc.querySelectorAll('tbody tr').length === count - 1 && !doc.querySelector('tr[data-account-id="account-0"]'),
          'table includes every other Account and excludes Active initially');
        check([...doc.querySelectorAll('th')].map(node => node.textContent).join('|') === 'Account|Used|Reset|Actions',
          'comparison exposes Account / Used / Reset and accessible Actions headers');
        const resetCell = doc.querySelector('.account-row-reset');
        check(resetCell.textContent.startsWith('in ') && win.getComputedStyle(resetCell).fontSize === '11px'
          && win.getComputedStyle(resetCell).fontWeight === '400' && resetCell.title.includes('2026') && resetCell.title.includes('Asia/Calcutta'), 'Compact reset copy and typography include exact captured date and timezone');
        const scroll = doc.querySelector('.account-table-scroll');
        if (count === 4) check(scroll.scrollHeight === scroll.clientHeight, `three saved Accounts fit fully while reserving notice space (${scroll.scrollHeight}/${scroll.clientHeight})`);
        const header = doc.querySelector('th');
        const headerTop = header.getBoundingClientRect().top;
        scroll.scrollTop = 500;
        check(header.getBoundingClientRect().top === headerTop && scroll.scrollWidth === scroll.clientWidth,
          'sticky column labels stay visible with no horizontal table overflow');
        if (count === 64) {
          check(scroll.scrollTop > 0 && scroll.scrollHeight > scroll.clientHeight, '64 Accounts scroll internally');
          check([...doc.querySelectorAll('tbody tr')].slice(-12).map(row => row.dataset.accountId).join() ===
            'account-5,account-10,account-15,account-20,account-25,account-30,account-35,account-40,account-45,account-50,account-55,account-60',
            'initial ordering places Full Accounts last by soonest reset');
        }
        check(doc.querySelector('.pill-row').getBoundingClientRect().bottom < doc.querySelector('.account-search').getBoundingClientRect().top
          && doc.querySelector('.lower-controls').hidden, 'status sits above table and preferences are absent');
        doc.getElementById('pf-code').focus();
        check(doc.activeElement !== doc.getElementById('pf-code'), 'covered preferences cannot receive focus');
        const input = doc.getElementById('account-search');
        input.focus();
        input.value = 'WORKSPACE 01';
        input.dispatchEvent(new win.Event('input', { bubbles: true }));
        check(visibleRows(doc).length === 1 && visibleRows(doc)[0].dataset.accountId === 'account-1', 'search finds Accounts case-insensitively');
        sendKey(win, input, 'ArrowLeft');
        sendKey(win, input, 'ArrowRight');
        check(doc.querySelector('.account-track').children[0].inert && doc.activeElement === input,
          'search arrow keys do not change main pages or focus');
        input.value = 'No such Account';
        input.dispatchEvent(new win.Event('input', { bubbles: true }));
        check(visibleRows(doc).length === 0 && !doc.querySelector('.account-search-empty').hidden
          && doc.querySelector('.account-table-foot').textContent === `${count - 1} saved Accounts`,
          'empty search has a clear message and only the saved-Account count beneath the table');
        fixed('empty search');
        input.value = '';
        input.dispatchEvent(new win.Event('input', { bubbles: true }));
        check(win.getComputedStyle(doc.querySelector('.account-table-foot')).paddingTop === '14px'
          && win.getComputedStyle(doc.querySelector('.container')).paddingBottom === '6px', 'footer has approved 14px separation and lowered placement');
        const name = 'Full Account name <b>plain text</b> · 研究と開発 · ' + 'x'.repeat(120);
        await win.chrome.storage.local.set({ accounts: win.Accounts.applyLabel(win.ticket01.state.local.accounts, 'account-1', name) });
        await settle();
        const rowName = doc.querySelector('tr[data-account-id="account-1"] button');
        check(rowName.title === name && rowName.textContent === name && rowName.scrollWidth > rowName.clientWidth
          && !rowName.querySelector('b'), 'long international names truncate, expose the full name and remain plain text');
        rowName.click();
        check(doc.activeElement === doc.querySelector('.account-back'), 'inspection moves focus to Back');
        input.focus();
        check(doc.activeElement !== input, 'covered table input cannot receive focus');
        fixed('details');
        sendKey(win, doc.querySelector('.account-back'), 'Escape');
        check(!doc.querySelector('.account-list').hidden && doc.activeElement === doc.querySelector('.account-table-scroll'),
          'Escape returns to the table and restores keyboard focus');
        doc.getElementById('theme-toggle').click();
        await settle();
        check(doc.documentElement.dataset.theme !== theme && win.ticket01.state.sync.theme !== theme,
          'theme remains available and saves on the table');
        sendKey(win, doc.body, 'ArrowLeft');
        check(!doc.querySelector('.lower-controls').hidden && !doc.querySelector('.account-track').children[0].inert,
          'left arrow returns to Active and restores preference controls');
      }
      const dormant = await open(`ticket03-dormant-${theme}`, { theme, count: 6 });
      const dormantDoc = dormant.document;
      dormantDoc.getElementById('account-next').click();
      await dormant.ticket01.advance(5 * 60000);
      dormantDoc.querySelector('tr[data-account-id="account-5"] button').click();
      check(dormantDoc.querySelector('.account-detail .account-percent').textContent === '~0% estimated'
        && dormantDoc.querySelector('.account-detail .usage-last-recorded').textContent === '100%',
        `${theme}: row details preserve the approved estimate and last captured reading`);
      await dormant.ticket01.advance(3 * 3600000);
      check(dormantDoc.querySelector('.account-detail .account-percent').textContent === 'No recent reading'
        && !dormantDoc.querySelector('.account-refresh-notice').textContent.startsWith('New reading'),
        'row details refresh at the estimate cutoff without inventing a new reading');
      dormantDoc.querySelector('.account-back').click();
      check(dormantDoc.querySelector('tr[data-account-id="account-5"] .account-row-used').textContent === '—'
        && dormantDoc.querySelector('tr[data-account-id="account-5"] .account-row-reset').textContent === '3h ago',
        'Back retains honest expired table values after inspecting dormant details');
      await dormant.chrome.storage.local.set({ accounts: dormant.Accounts.applyReading(dormant.ticket01.state.local.accounts,
        { accountId: 'account-5', percent: 0, resetsAt: null }, dormant.Date.now() + 1) });
      await settle();
      check(dormantDoc.querySelector('tr[data-account-id="account-5"] .account-row-used').textContent === '0%'
        && dormantDoc.querySelector('tr[data-account-id="account-5"] .account-row-reset').textContent === '—',
        'a captured zero stays zero while an unknown reset stays a dash');
      dormantDoc.getElementById('account-previous').click();
      check(dormantDoc.querySelector('.account-track').children[0].querySelector('.account-reset').textContent === '',
        'a reading without reset time clears the previous countdown on the persistent Active detail');
      for (const state of ['green', 'red', 'orange', 'grey']) {
        const win = await open(`ticket03-status-${theme}-${state}`, { theme, count: 4, status: state });
        const doc = win.document;
        doc.getElementById('account-next').click();
        check(doc.getElementById('pill-text').textContent === ({ green: 'Off peak', red: 'Peak', orange: 'Outage', grey: 'Status unavailable' })[state],
          `${theme}: ${state} status is preserved on secondary page`);
        doc.querySelector('tbody button').click();
        check(doc.querySelector('.pill-row').getBoundingClientRect().bottom < doc.querySelector('.account-back').getBoundingClientRect().top,
          'status is above row details in every status state');
        check(doc.body.scrollWidth === 260 && doc.body.scrollHeight === 340, 'status and details fit the fixed popup');
      }
    }
    for (const theme of ['dark', 'light']) {
      const win = await open(`ticket03a-boundary-${theme}`, { theme, count: 11 });
      const doc = win.document;
      const stored = JSON.stringify(win.ticket01.state.local.accounts);
      const row = id => doc.querySelector(`tr[data-account-id="account-${id}"]`);
      const used = id => row(id).querySelector('.account-row-used');
      const order = () => [...doc.querySelectorAll('tbody tr')].map(row => row.dataset.accountId).join();
      doc.getElementById('account-next').click();
      const initialOrder = order();
      const initialRowTop = row(1).getBoundingClientRect().top;
      await win.ticket01.advance(16 * 60000);
      check(order() === initialOrder && used(5).textContent === '~0%' && used(10).textContent === '~0%', `${theme}: clock expiry updates estimates without moving open rows`);
      check(row(1).getBoundingClientRect().top === initialRowTop, 'showing a reset-priority notice does not shift rows vertically');
      check(row(10).querySelector('.account-row-reset').textContent === '6m ago'
        && row(10).querySelector('.account-row-age').textContent === 'Updated 26m ago'
        && used(10).title.includes('Estimated 0%') && used(10).title.includes('Last observed: 100%')
        && used(10).getAttribute('aria-label').includes('Estimated'), 'six-minute reset retains truthful reading age and accessible estimate explanation');
      check(used(10).dataset.tone === 'green', 'estimated table zero uses the green usage tone');
      doc.getElementById('account-previous').click();
      doc.getElementById('account-next').click();
      check([...doc.querySelectorAll('tbody tr')].slice(0, 2).map(row => row.dataset.accountId).join() === 'account-10,account-5', 'reopening places the newest recent reset first');
      const frozenOrder = order();
      const frozenRow = row(5);
      row(5).querySelector('button').click();
      await win.ticket01.advance(4 * 60000 - 1);
      check(used(5).textContent === '~0%' && doc.querySelector('.account-detail .account-percent').textContent === '~0% estimated', 'table and detail estimates survive until one millisecond before fifteen minutes');
      await win.ticket01.advance(1);
      check(used(5).textContent === '—' && used(10).textContent === '~0%' && doc.querySelector('.account-detail .account-percent').textContent === '~0% estimated', 'at fifteen minutes table estimate ends while the three-hour detail estimate remains');
      check(doc.querySelector('.account-refresh-notice').textContent === 'Reset priority updates when you reopen this list.'
        && !doc.querySelector('.account-refresh-notice').hidden, 'priority-expiry notice remains visible during inspection');
      doc.querySelector('.account-back').click();
      check(row(5) === frozenRow && order() === frozenOrder && row(5).querySelector('.account-row-reset').textContent === '15m ago', 'Back after estimate cutoff preserves row identity and order with current values');
      doc.getElementById('account-previous').click();
      doc.getElementById('account-next').click();
      check(doc.querySelector('tbody tr').dataset.accountId === 'account-10'
        && doc.querySelectorAll('tbody tr')[1].dataset.accountId === 'account-1', 'reopening removes expired priority and restores remaining reading-recency order');
      check(JSON.stringify(win.ticket01.state.local.accounts) === stored && win.ticket01.writes.length === 0 && win.ticket01.messages.length === 0, 'clock, browsing and estimates never persist readings or send toolbar updates');

      const transition = await open(`ticket03a-transition-${theme}`, { theme, count: 4 });
      const transitionDoc = transition.document;
      transitionDoc.getElementById('account-next').click();
      const original = structuredClone(transition.ticket01.state.local.accounts);
      for (const count of [3, 2, 1, 0, 3, 4]) {
        await transition.chrome.storage.local.set({ accounts: Object.fromEntries(Object.entries(original).slice(0, count)) });
        await settle();
        check(count === 0 ? transitionDoc.getElementById('account-hero').hidden
          : count === 4 ? !!transitionDoc.querySelector('table') && transitionDoc.getElementById('account-dots').children.length === 2
            : !transitionDoc.querySelector('table') && transitionDoc.querySelector('.account-track').children.length === count,
          `${theme}: changing retained count to ${count} rebuilds the appropriate navigation`);
        check(!transitionDoc.querySelector('.lower-controls').hidden && transitionDoc.body.scrollHeight === 340, 'count transition restores lower controls and fixed dimensions');
      }
    }
    check(errors.length === 0, 'rendered popup reports no runtime errors or unhandled rejections');
    document.getElementById('measurements').textContent = JSON.stringify(measurements, null, 2);
    results.textContent += '\nAll ticket 03/03a checks passed. Disposable fixtures, not live extension storage.\n';
  } catch (error) { results.textContent += '\nStopped: ' + error.message; }
};
