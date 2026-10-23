const frame = document.querySelector('iframe');
const results = document.getElementById('results');
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const until = async predicate => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error('Timed out waiting for popup UI');
};
const currentPage = doc => [...doc.querySelectorAll('.account-page')].find(page => page.getAttribute('aria-hidden') === 'false');
const positions = doc => ['.pill-row', '.product-filter', '.footer', '.tz-picker', '#theme-toggle'].map(selector => {
  const { x, y, width, height } = doc.querySelector(selector).getBoundingClientRect();
  return { x, y, width, height };
});
const key = (win, target, value) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
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
    for (const theme of ['dark', 'light']) {
      for (const count of [0, 1, 2]) {
        const win = await open(`ticket02-size-${theme}-${count}`, {
          theme, ...(count === 0 ? { empty: '1' } : {}), ...(count === 2 ? { multi: '1' } : {})
        });
        const doc = win.document;
        const box = doc.querySelector('.container').getBoundingClientRect();
        check(box.width === 260 && box.height === 340,
          `${theme} ${count} Accounts: content box is 260 × 340 (actual ${box.width} × ${box.height})`);
        check(doc.body.getBoundingClientRect().height === 340 && doc.body.scrollHeight === 340 && doc.body.scrollWidth === 260,
          'body has fixed bounds and no outer overflow');
        if (count === 1) {
          const name = doc.querySelector('.account-heading .account-name');
          check(name?.textContent === 'Studio' && !doc.querySelector('.account-heading .active').hidden,
            'single Account retains its identity and Active tag');
          check(doc.querySelector('.account-nav').getBoundingClientRect().height === 0 && doc.getElementById('account-dots').getBoundingClientRect().height === 0,
            'single Account has no visible navigation or position dots');
          check(currentPage(doc).innerText.includes('100%') && !currentPage(doc).innerText.includes('FULL'),
            '100% on Active has no Full pill');
        }
        if (count === 2) {
          const before = JSON.stringify(positions(doc));
          const saved = JSON.stringify(win.ticket01.state.local.accounts);
          check(!currentPage(doc).querySelector('.active').hidden && doc.getElementById('account-previous').disabled && !doc.getElementById('account-next').disabled,
            'two Accounts open on Active at the first navigation boundary');
          check(doc.getElementById('account-dots').children.length === 2, 'two Accounts have two position dots');
          doc.getElementById('account-next').click();
          const page = currentPage(doc);
          check(page.innerText.includes('100%') && !page.innerText.includes('FULL'),
            '100% on the other Account shows the percentage without a Full pill');
          check(before === JSON.stringify(positions(doc)), 'status, products, timezone and theme retain identical positions while paging');
          check(doc.getElementById('account-next').disabled && !doc.getElementById('account-previous').disabled,
            'navigation stops at the second Account');
          key(win, doc.body, 'ArrowRight');
          check(currentPage(doc) === page, 'right key does not wrap past the last Account');
          key(win, doc.getElementById('tz-search'), 'ArrowLeft');
          check(currentPage(doc) === page, 'editing the timezone input does not change Account page');
          key(win, doc.body, 'ArrowLeft');
          check(!currentPage(doc).querySelector('.active').hidden, 'left key returns to Active');
          key(win, doc.body, 'ArrowLeft');
          check(!currentPage(doc).querySelector('.active').hidden, 'left key does not wrap before Active');
          check(JSON.stringify(win.ticket01.state.local.accounts) === saved && win.ticket01.writes.length === 0 && win.ticket01.messages.length === 0,
            'browsing writes no readings/preferences and requests no toolbar or status changes');
          check(doc.getElementById('account-announcement').textContent.includes('Account 1 of 2'), 'live announcement identifies the visible Account');
          const hidden = [...doc.querySelectorAll('.account-page')].find(page => page !== currentPage(doc));
          check(hidden.inert && hidden.getAttribute('aria-hidden') === 'true', 'inactive Account content is inert and excluded from accessibility');
        }
      }

      let win = await open(`ticket02-stress-${theme}`, { theme, multi: '1', expired: '1', longLabels: '1', products: 'ai', status: 'orange' });
      let doc = win.document;
      const shared = JSON.stringify(positions(doc));
      const hiddenValue = doc.querySelectorAll('.account-percent')[1];
      const activeName = currentPage(doc).querySelector('.account-name');
      const activeTag = currentPage(doc).querySelector('.active');
      check(activeName.scrollWidth > activeName.clientWidth && activeTag.getBoundingClientRect().right <= currentPage(doc).getBoundingClientRect().right,
        'long Active names leave the Active tag and navigation gutter intact');
      hiddenValue.focus();
      check(doc.activeElement !== hiddenValue, 'a dormant label on an inactive page cannot receive keyboard focus');
      doc.getElementById('account-next').click();
      let page = currentPage(doc);
      const name = page.querySelector('.account-name');
      check(name.scrollWidth > name.clientWidth && win.getComputedStyle(name).textOverflow === 'ellipsis', 'long names truncate and preserve the full title');
      check(page.scrollHeight > page.clientHeight && win.getComputedStyle(page).overflowY === 'auto', 'long dormant details scroll inside the available Account region');
      check(!page.querySelector('.usage-facts').hidden && page.querySelector('.usage-last-recorded').textContent === '100%', 'approved dormant estimate and three fact rows are preserved');
      page.scrollTop = page.scrollHeight;
      check(page.scrollTop > 0 && JSON.stringify(positions(doc)) === shared, 'scrolling Account details does not move or cover lower controls');
      check(doc.body.scrollHeight === 340 && doc.body.scrollWidth === 260, 'outage, one-product hint and long content stay inside fixed bounds');
      check(doc.getElementById('pill-text').textContent === 'Outage' && !doc.getElementById('incident-sub').hidden, 'outage presentation and incident detail remain available');
      check(doc.getElementById('incident-sub').getBoundingClientRect().bottom < doc.querySelector('.product-filter').getBoundingClientRect().top, 'incident detail fits above preference controls');

      doc.getElementById('theme-toggle').click();
      await settle();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      check(doc.documentElement.dataset.theme === newTheme && win.ticket01.state.sync.theme === newTheme, 'theme is accessible from the second page and saves');
      doc.getElementById('pf-code').click();
      await settle();
      check(win.ticket01.state.sync.watchedProducts.join() === 'ai,code', 'real product controls save from the second page');
      const input = doc.getElementById('tz-search');
      input.focus();
      await until(() => doc.querySelectorAll('.tz-list li').length > 0);
      input.value = 'Pacific/Honolulu';
      input.dispatchEvent(new win.Event('input', { bubbles: true }));
      const choice = [...doc.querySelectorAll('.tz-list li')].find(li => li.textContent === 'Pacific/Honolulu');
      check(!!choice && doc.body.scrollHeight === 340, 'timezone choices open within the fixed popup');
      check(choice.querySelector('button')?.type === 'button', 'timezone choices expose native keyboard-operable buttons');
      const listBounds = doc.getElementById('tz-list').getBoundingClientRect();
      check(listBounds.top >= 0 && listBounds.bottom <= 340, 'timezone list stays inside the popup viewport');
      choice.querySelector('button').click();
      await settle();
      check(win.ticket01.state.sync.userTZ === 'Pacific/Honolulu' && doc.getElementById('tz-list').hidden, 'timezone selection saves and closes its list');
      win = await open(`ticket02-stress-${theme}`, {}, true);
      doc = win.document;
      check(doc.documentElement.dataset.theme === newTheme && doc.getElementById('pf-ai').checked && doc.getElementById('pf-code').checked && doc.getElementById('tz-label').textContent === 'Pacific/Honolulu',
        'theme, watched products and timezone persist after popup reopening');
      check(!currentPage(doc).querySelector('.active').hidden, 'reopening returns to Active');

      win = await open(`ticket02-full-${theme}`, { theme, multi: '1', activeFull: '1', status: 'red' });
      doc = win.document;
      check(currentPage(doc).innerText.includes('100%') && !currentPage(doc).innerText.includes('FULL') && !currentPage(doc).querySelector('.active').hidden,
        'Full Active keeps its percentage and Active tag without a Full pill');
      check(doc.getElementById('pill-text').textContent === 'Peak', 'peak status remains separate from quota usage');
      const lower = JSON.stringify(positions(doc));
      await win.ticket01.advance(7200000);
      check(doc.body.scrollHeight === 340 && JSON.stringify(positions(doc)) === lower, 'expiry while open keeps dimensions and lower-control positions stable');
      check(currentPage(doc).innerText.includes('~0% estimated') && !currentPage(doc).querySelector('.usage-facts').hidden,
        'expired Active shows the approved estimate and historical facts');

      win = await open(`ticket02-normal-dormant-${theme}`, { theme, multi: '1', products: 'ai', expired: '1' });
      doc = win.document;
      doc.getElementById('account-next').click();
      page = currentPage(doc);
      check(page.scrollHeight === page.clientHeight, 'ordinary dormant facts fit without an unnecessary scrollbar beside the one-product hint');

      win = await open(`ticket02-unavailable-${theme}`, { theme, empty: '1', status: 'grey' });
      doc = win.document;
      check(doc.getElementById('pill-text').textContent === 'Status unavailable' && !doc.getElementById('retry-btn').hidden,
        'no-reading view retains unavailable-status recovery');
      doc.getElementById('retry-btn').click();
      await settle();
      check(doc.getElementById('retry-btn').disabled && win.ticket01.messages.includes('POLL_NOW'), 'retry requests a poll and disables during recovery');

      win = await open(`ticket02-existing-many-${theme}`, { theme, multi: '1' });
      doc = win.document;
      await win.chrome.storage.local.set({ accounts: win.Accounts.applyReading(win.ticket01.state.local.accounts,
        { accountId: '33333333-3333-4333-8333-333333333333', label: 'Third workspace', percent: 30, resetsAt: win.Date.now() / 1000 + 3600 }, win.Date.now() + 1) });
      await settle();
      check(doc.querySelector('.account-track').children.length === 2 && !!doc.querySelector('table') && doc.body.scrollHeight === 340,
        'three Accounts use two main pages with the ticket 03 table');
      check(currentPage(doc).querySelector('.account-name').textContent === 'Third workspace', 'incoming reading still returns the popup to the new Active Account');
    }
    results.textContent += '\nAll ticket 02 checks passed. Disposable fixtures, not live extension storage.\n';
  } catch (error) { results.textContent += '\nStopped: ' + error.message; }
};
