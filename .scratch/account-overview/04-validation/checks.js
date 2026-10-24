const output = document.getElementById('results');
const pause = () => new Promise(resolve => setTimeout(resolve, 15));
const measurements = [];
document.getElementById('run').onclick = async () => {
  output.textContent = '';
  let passes = 0;
  const check = (ok, text) => {
    output.textContent += `${ok ? 'PASS' : 'FAIL'} ${text}\n`;
    if (!ok) throw Error(text);
    passes++;
  };
  async function open(name, params = {}, reopen = false) {
    const key = 'ticket01-ticket04-' + name;
    if (!reopen) localStorage.removeItem(key);
    const frame = document.createElement('iframe');
    frame.title = 'Disposable production popup';
    await new Promise(resolve => {
      frame.onload = resolve;
      frame.src = '/popup/popup.html?' + new URLSearchParams({ case: 'ticket04-' + name, count: 4, products: 'ai', load: Date.now(), ...params });
      document.querySelector('iframe').replaceWith(frame);
    });
    await pause();
    const win = frame.contentWindow;
    check(win.ticket01.errors.length === 0, `${name}: production loads without exceptions`);
    return win;
  }
  const click = (win, selector) => {
    const node = win.document.querySelector(selector);
    if (!node) throw Error('Missing ' + selector);
    node.click();
  };
  const key = (win, value, shiftKey = false) => win.document.activeElement.dispatchEvent(new win.KeyboardEvent('keydown', {
    key: value, shiftKey, bubbles: true, cancelable: true
  }));
  const ask = (win, id) => {
    const button = [...win.document.querySelectorAll(`.account-more[data-account-id="${id}"]`)]
      .find(node => !node.hidden && !node.closest('[hidden], [inert]'));
    if (!button) throw Error('No visible menu for ' + id);
    button.click();
    click(win, '[role="menuitem"]');
  };
  const forget = async (win, id) => { ask(win, id); click(win, '#confirm-forget'); await pause(); };
  const undo = async win => { click(win, '.account-undo-button'); await pause(); };
  function fixed(win, description) {
    const doc = win.document, box = doc.querySelector('.container').getBoundingClientRect();
    check(box.width === 260 && box.height === 340 && doc.body.scrollWidth === 260 && doc.body.scrollHeight === 340,
      description + ': 260 × 340 with no outer overflow');
    measurements.push({ description, width: box.width, height: box.height });
  }
  const save = name => fetch('/qa-save/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: output.textContent, measurements }) });
  const toastBox = win => {
    const r = win.document.querySelector('.account-undo').getBoundingClientRect();
    return [r.x, r.y, r.width, r.height].join();
  };
  try {
    if (!location.search.includes('advanced')) for (const theme of ['dark', 'light']) {
      for (const count of [0, 1, 2, 3, 4, 64]) {
        const win = await open(`${theme}-${count}`, { theme, count, ...(count === 0 ? { empty: 1 } : {}) });
        const doc = win.document;
        fixed(win, `${theme} ${count} Active`);
        check(count === 0 ? doc.getElementById('account-hero').hidden : !doc.getElementById('account-hero').hidden,
          'zero keeps no-reading state; remembered Accounts show real usage');
        if (!count) continue;
        check(doc.querySelector('.account-more').hidden, 'Active has no Forget action');
        if (count === 1) {
          check(doc.querySelector('.account-nav').hidden && doc.getElementById('account-dots').hidden, 'one Account has no navigation');
          continue;
        }
        click(win, '#account-next');
        fixed(win, `${theme} ${count} secondary`);
        if (count < 4) {
          check(doc.getElementById('account-dots').children.length === count, 'two and three Accounts retain individual slides');
          const page = doc.querySelectorAll('.account-page')[1];
          check(page.scrollHeight === page.clientHeight, 'non-Active ordinary detail fits naturally');
        } else {
          const scroller = doc.querySelector('.account-table-scroll');
          check(win.getComputedStyle(scroller).scrollbarWidth === 'none' && win.getComputedStyle(scroller).overflowY === 'auto', 'internal scrolling retains hidden scrollbar and no reserved gutter');
          check(scroller.scrollWidth === scroller.clientWidth, 'table has no horizontal overflow');
          if (count === 64) {
            scroller.scrollTop = 140;
            check(scroller.scrollTop === 140, '64-Account table scrolls internally');
          }
          const row = doc.querySelector('tbody tr'), menu = row.querySelector('.account-more');
          check(menu.closest('td') === row.lastElementChild && menu.getBoundingClientRect().left >= row.querySelector('.account-row-reset').getBoundingClientRect().right,
            'vertical menu occupies action column after Reset');
          check([...menu.querySelectorAll('circle')].every(circle => circle.getAttribute('cx') === '8'), 'menu dots are vertical');
          check(win.getComputedStyle(row.querySelector('.account-row-reset')).fontSize === '11px'
            && win.getComputedStyle(row.querySelector('.account-row-reset')).fontWeight === '400', 'Compact reset typography stays 11px regular');
        }
        const id = count >= 4 ? doc.querySelector('tbody tr').dataset.accountId : 'account-1';
        const original = JSON.stringify(win.ticket01.state.local.accounts[id]);
        const originalActive = JSON.stringify(win.ticket01.state.local.accounts['account-0']);
        const icons = win.ticket01.toolbar.length;
        const writes = win.ticket01.writes.length;
        ask(win, id);
        const dialog = doc.querySelector('dialog');
        check(dialog.open && doc.activeElement.id === 'cancel-forget', 'confirmation is modal and focuses Cancel');
        check(dialog.textContent.includes('A later Usage reading can add it again.'), 'dialog explains rediscovery');
        key(win, 'Tab', true);
        check(doc.activeElement.id === 'confirm-forget', 'Shift+Tab wraps to Forget');
        key(win, 'Tab');
        check(doc.activeElement.id === 'cancel-forget', 'Tab wraps to Cancel');
        fixed(win, `${theme} ${count} confirmation`);
        click(win, '#cancel-forget');
        check(win.ticket01.writes.length === writes && doc.activeElement.dataset.accountId === id, 'Cancel writes nothing and restores originating control');
        await forget(win, id);
        check(!win.ticket01.state.local.accounts[id] && !doc.querySelector('.account-undo').hidden, 'Forget persists removal and offers Undo');
        if (count === 64) check(!doc.querySelector('.account-refresh-notice').textContent.includes('New reading received'), 'Forget does not announce a fictional new reading');
        check(JSON.stringify(win.ticket01.state.local.accounts['account-0']) === originalActive && win.ticket01.toolbar.length === icons,
          'Forget preserves Active raw reading and toolbar');
        check(toastBox(win) === '16,278,228,32', 'Undo occupies the fixed 228 × 32 lower slot');
        const deadline = win.ticket01.state.local.accountUndo.expiresAt;
        check(deadline === win.Date.now() + 2500, 'offer deadline is exactly 2500ms');
        const dots = doc.getElementById('account-dots');
        check(count === 2 ? dots.hidden : dots.children.length === (count === 4 ? 3 : count === 3 ? 2 : 2), 'count reconciliation switches four→three, three→two, two→one');
        fixed(win, `${theme} ${count} forgotten`);
        check(doc.querySelector('.footer').inert && doc.querySelector('.tz-picker').inert, 'controls covered by Undo cannot receive focus');
        check(win.getComputedStyle(doc.querySelector('.footer')).visibility === 'hidden'
          && win.getComputedStyle(doc.querySelector('.tz-picker')).visibility === 'hidden', 'Undo replaces the entire timezone/reset footer without controls peeking through');
        click(win, '#theme-toggle');
        await pause();
        check(win.ticket01.state.local.accountUndo.expiresAt === deadline && toastBox(win) === '16,278,228,32', 'theme preserves deadline and notification position');
        await undo(win);
        check(JSON.stringify(win.ticket01.state.local.accounts[id]) === original, 'Undo restores exact raw identity, label, percentage, reset, timestamp and tie order');
        check(doc.querySelector('.account-undo').hidden && !doc.querySelector('.footer').inert, 'Undo removes recovery and releases covered controls');
        check(win.getComputedStyle(doc.querySelector('.footer')).visibility === 'visible'
          && win.getComputedStyle(doc.querySelector('.tz-picker')).visibility === 'visible', 'Undo restores both footer sections after recovery');
        if (count === 64) check(!doc.querySelector('.account-refresh-notice').textContent.includes('New reading received'), 'Undo does not announce the restored observation as a new reading');
        fixed(win, `${theme} ${count} restored`);
        check(win.ticket01.toolbar.length === icons, 'Undo does not change toolbar');
        check(win.ticket01.errors.length === 0, 'flow has no browser exceptions');
      }
    }

    if (location.search.includes('matrix')) {
      output.textContent += `\n${passes} passed, 0 failed\n`;
      await save('matrix');
      return;
    }

    let win = await open('context', { count: 64 });
    let doc = win.document;
    click(win, '#account-next');
    const search = doc.getElementById('account-search');
    search.value = 'Workspace'; search.dispatchEvent(new win.Event('input', { bubbles: true }));
    const scroller = doc.querySelector('.account-table-scroll');
    scroller.scrollTop = 140;
    const rows = [...doc.querySelectorAll('tbody tr')];
    const order = rows.map(row => row.dataset.accountId).join();
    const target = rows[6].dataset.accountId;
    ask(win, target);
    click(win, '#cancel-forget');
    check(search.value === 'Workspace' && scroller.scrollTop === 140, 'Cancel preserves search and exact scroll');
    await forget(win, target);
    check(rows.filter(row => row.dataset.accountId !== target).every(row => row.isConnected), 'Forget retains unrelated row identity');
    await undo(win);
    check(search.value === 'Workspace' && scroller.scrollTop === 140 && [...doc.querySelectorAll('tbody tr')].map(row => row.dataset.accountId).join() === order,
      'Undo restores search, exact scroll and original membership order');

    click(win, `tr[data-account-id="${target}"] .account-row-name`);
    ask(win, target);
    click(win, '#cancel-forget');
    check(!doc.querySelector('.account-inspection').hidden && doc.activeElement.classList.contains('account-more'), 'inspection Cancel restores the detail menu focus');
    await forget(win, target);
    check(!doc.querySelector('.account-list').hidden, 'forgetting an inspected Account returns to the table');
    const tableBox = toastBox(win);
    click(win, '#account-previous');
    check(toastBox(win) === tableBox, 'Active and table use equal Undo bounds');
    click(win, '#account-next');
    click(win, 'tbody tr .account-row-name');
    check(toastBox(win) === tableBox, 'inspection uses the same fixed Undo bounds');
    await win.ticket01.advance(1000);
    const deadline = win.ticket01.state.local.accountUndo.expiresAt;
    win = await open('context', { count: 64 }, true); doc = win.document;
    check(!doc.querySelector('.account-undo').hidden && win.ticket01.state.local.accountUndo.expiresAt === deadline,
      'popup reopening preserves original deadline');
    const animation = doc.querySelector('.account-undo-line').getAnimations()[0];
    check(animation.effect.getTiming().duration === 1500, 'reopened countdown starts with remaining progress, not a new window');
    await win.ticket01.advance(1500);
    check(doc.querySelector('.account-undo').hidden && win.ticket01.state.local.accountUndo === null, 'automatic expiry removes UI and persisted recovery at deadline');
    win = await open('context', { count: 64 }, true);
    check(win.document.querySelector('.account-undo').hidden, 'reopening after expiry cannot revive Undo');

    win = await open('reopened-restore', { count: 6 }); doc = win.document;
    click(win, '#account-next'); await forget(win, 'account-1');
    win = await open('reopened-restore', { count: 6 }, true); doc = win.document;
    click(win, '#account-next');
    const keptRows = [...doc.querySelectorAll('tbody tr')];
    await undo(win);
    check(doc.querySelectorAll('tbody tr').length === 5 && !!doc.querySelector('tr[data-account-id="account-1"]'),
      'Undo after reopening inserts restored Account into the already-open table');
    check(keptRows.every(row => row.isConnected), 'reopened Undo preserves unrelated row identity');

    win = await open('slow-storage'); doc = win.document;
    const set = win.chrome.storage.local.set;
    let delayed = false;
    win.chrome.storage.local.set = async value => {
      if (!delayed && value.accounts && !value.accounts['account-1']) { win.ticket01.state.now += 3000; delayed = true; }
      await set(value);
    };
    click(win, '#account-next'); await forget(win, 'account-1');
    check(win.ticket01.state.local.accountUndo.expiresAt === win.Date.now() + 2500,
      'three-second removal persistence still gives a full visible 2.5-second Undo window');

    win = await open('rediscovery'); doc = win.document;
    click(win, '#account-next');
    await forget(win, 'account-1');
    await win.ticket01.mutate({ action: 'reading', accountId: 'account-1', percent: 28, resetsAt: win.Date.now() / 1000 + 3600 });
    await pause();
    await undo(win);
    check(win.ticket01.state.local.accounts['account-1'].percent === 28 && win.Accounts.getAccounts(win.ticket01.state.local.accounts, win.Date.now())[0].accountId === 'account-1',
      'rediscovery reconciles count and newer reading wins over Undo');
    check(doc.body.textContent.includes('newer reading was kept'), 'newer-reading protection is announced');

    win = await open('active-guard'); doc = win.document;
    click(win, '#account-next'); ask(win, 'account-1');
    await win.ticket01.mutate({ action: 'reading', accountId: 'account-1', percent: 30 }); await pause();
    check(!doc.querySelector('dialog').open && !!win.ticket01.state.local.accounts['account-1'], 'incoming Active reading safely closes stale confirmation');
    click(win, '.account-back');
    click(win, '#account-previous'); click(win, '#account-next');
    ask(win, 'account-2');
    await win.ticket01.mutate({ action: 'reading', accountId: 'account-2', percent: 31 });
    const result = await win.ticket01.mutate({ action: 'forget', accountId: 'account-2' });
    check(result.status === 'active', 'persisted eligibility rejects stale Forget');

    win = await open('replacement', { count: 3 }); doc = win.document;
    click(win, '#account-next'); await forget(win, 'account-1');
    const first = win.ticket01.state.local.accountUndo;
    await win.ticket01.advance(1000);
    click(win, '#account-next'); await forget(win, 'account-2');
    const second = win.ticket01.state.local.accountUndo;
    check(second.expiresAt === first.expiresAt + 1000, 'second removal gets its own full window');
    await win.ticket01.advance(1500);
    await win.ticket01.mutate({ action: 'dismiss', token: first.token }); await pause();
    check(!doc.querySelector('.account-undo').hidden && win.ticket01.state.local.accountUndo.token === second.token, 'old timer and dismissal leave replacement offer intact');
    click(win, '.account-undo-dismiss'); await pause();
    check(doc.querySelector('.account-undo').hidden && win.ticket01.state.local.accountUndo === null
      && win.getComputedStyle(doc.querySelector('.footer')).visibility === 'visible', 'dismiss ends persisted recovery and restores the footer');

    win = await open('reset'); doc = win.document;
    click(win, '#account-next'); await forget(win, 'account-1');
    await win.ticket01.mutate({ action: 'clear' }); await pause();
    check(Object.keys(win.ticket01.state.local.accounts).length === 0 && win.ticket01.state.local.accountUndo === null && doc.querySelector('.account-undo').hidden
      && win.getComputedStyle(doc.querySelector('.footer')).visibility === 'visible',
      'reset-to-default Account boundary clears Accounts and pending recovery together');
    check(win.ticket01.errors.length === 0, 'final production flow has no exceptions');

    win = await open('delayed-discovery', {count:6}); doc = win.document;
    click(win, '#account-next');
    await win.ticket01.mutate({action:'reading', accountId:'delayed', percent:28, observedAt:win.Date.now()-100000}); await pause();
    check(!doc.querySelector('tr[data-account-id="delayed"]') && !doc.querySelector('.account-refresh-notice').hidden
      && doc.querySelector('.account-refresh-notice').textContent.includes('reopen'), 'delayed non-Active discovery preserves frozen membership and announces reopening');
    click(win, '#account-previous'); click(win, '#account-next');
    check(!!doc.querySelector('tr[data-account-id="delayed"]'), 'reopening includes a delayed non-Active discovery');
    output.textContent += `\n${passes} passed, 0 failed\n`;
  } catch (error) { output.textContent += `ERROR ${error.stack}\n`; }
  await save(location.search.includes('advanced') ? 'advanced' : 'matrix');
  document.getElementById('measurements')?.remove();
  const data = document.createElement('pre'); data.id = 'measurements'; data.hidden = true;
  data.textContent = JSON.stringify(measurements, null, 2); document.body.append(data);
};
