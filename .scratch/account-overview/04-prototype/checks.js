const results = document.getElementById('results');
const pause = () => new Promise(resolve => setTimeout(resolve, 30));
const errors = [];
document.getElementById('run').onclick = async () => {
  results.textContent = '';
  const check = (condition, message) => {
    results.textContent += `${condition ? 'PASS' : 'FAIL'} ${message}\n`;
    if (!condition) throw new Error(message);
  };
  try {
    for (const variant of [1, 2, 3]) {
      const old = document.querySelector('iframe'), frame = document.createElement('iframe');
      frame.title = 'Forget Account prototype';
      await new Promise(resolve => { frame.onload = resolve; frame.src = `prototype.html?v=${variant}`; old.replaceWith(frame); });
      await pause();
      const win = frame.contentWindow, doc = win.document;
      for (let attempt = 0; !doc.querySelector('.popup') && attempt < 150; attempt++) await pause();
      win.addEventListener('error', event => errors.push(event.message));
      const click = selector => { const el = doc.querySelector(selector); if (!el) throw Error('Missing: ' + selector); el.click(); };
      const select = (selector, value) => { const el = doc.querySelector(selector); el.value = value; el.dispatchEvent(new win.Event('change', { bubbles: true })); };
      const popup = () => doc.querySelector('.popup');
      const fixed = () => { const box = popup().getBoundingClientRect(); return box.width === 260 && box.height === 340 && popup().scrollWidth === 260 && popup().scrollHeight === 340; };
      const order = () => [...doc.querySelectorAll('tbody tr')].map(row => row.dataset.id).join();
      const positions = () => JSON.stringify(['.preferences', '.checks', '.footer', '.tz'].map(selector => { const b = doc.querySelector(selector).getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; }));
      const ask = id => { click(`.more[data-id="${id}"]`); click('[role="menuitem"]'); };
      for (const theme of ['dark', 'light']) {
        if (theme === 'light') click('.theme');
        check(fixed() && doc.querySelectorAll('tbody tr').length === 3, `${variant} ${theme}: four Accounts have three table rows in fixed bounds`);
        const scroller = doc.querySelector('.table-scroll');
        check(scroller.scrollWidth === scroller.clientWidth && scroller.scrollHeight === scroller.clientHeight, `all three rows fit without horizontal overflow (width ${scroller.scrollWidth}/${scroller.clientWidth}, height ${scroller.scrollHeight}/${scroller.clientHeight})`);
        check(win.getComputedStyle(scroller).scrollbarWidth === 'none' && win.getComputedStyle(scroller).overflowY === 'auto', 'table hides its scrollbar while retaining scrolling');
        const menu = doc.querySelector('tbody tr .more'), resetCell = doc.querySelector('tbody tr .reset-cell');
        const circles = [...menu.querySelectorAll('circle')];
        check(menu.closest('td') === doc.querySelector('tbody tr').lastElementChild
          && menu.getBoundingClientRect().left >= resetCell.getBoundingClientRect().right
          && circles.length === 3 && circles.every(circle => circle.getAttribute('cx') === '8')
          && circles.map(circle => circle.getAttribute('cy')).join() === '3,8,13', 'vertical three-dot menu follows Reset at the far right of each row');
        click('[data-action="previous"]');
        check(!doc.querySelector('.more'), 'Active Account has no Forget action');
        click('[data-action="next"]');
        const input = doc.getElementById('account-search'); input.value = 'Writing'; input.dispatchEvent(new win.Event('input', { bubbles: true }));
        ask('a2');
        const dialog = doc.querySelector('[role="dialog"]');
        check(dialog.textContent.includes('Forget Writing room?') && dialog.textContent.includes('A later Usage reading can add it again.') && doc.activeElement.id === 'cancel-forget', 'confirmation names the Account, explains rediscovery and focuses Cancel');
        check(fixed(), 'confirmation stays in fixed popup bounds');
        click('[data-action="cancel"]');
        check(doc.getElementById('account-search').value === 'Writing' && doc.querySelectorAll('tbody tr').length === 1 && doc.activeElement.dataset.id === 'a2', 'Cancel restores query, row and menu-trigger focus');
        click('.more[data-id="a2"]');
        doc.activeElement.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        check(!doc.querySelector('[role="menu"]') && doc.activeElement.dataset.id === 'a2', 'Escape dismisses menu and restores focus');
        ask('a2'); click('[data-action="forget"]');
        check(doc.querySelectorAll('.dots i').length === 3 && !doc.querySelector('table') && !!doc.querySelector('.preferences') && !!doc.querySelector('.undo') && fixed(), 'four to three becomes slides, keeps preferences and offers Undo');
        const lower = positions();
        click('.undo');
        check(doc.querySelectorAll('tbody tr').length === 1 && doc.getElementById('account-search').value === 'Writing' && doc.querySelector('.row-used').textContent === '~0%' && fixed(), 'Undo restores table, query and original captured reading');
        ask('a2'); click('[data-action="forget"]');
        check(positions() === lower, 'repeated removal leaves shared lower-control positions unchanged');
        select('#reading-account', 'a2'); click('#receive');
        check(popup().textContent.includes('Writing room') && popup().textContent.includes('28% used') && popup().textContent.includes('Active') && !!doc.querySelector('.undo') && fixed(), 'a sample reading rediscovers the forgotten Account and makes it Active');
        click('.undo'); click('[data-action="previous"]');
        check(popup().textContent.includes('Writing room') && popup().textContent.includes('28% used') && doc.getElementById('event').textContent.includes('newer reading'), 'Undo after rediscovery keeps the newer reading');

        select('#count', '2'); ask('a1'); click('[data-action="forget"]');
        check(!doc.querySelector('.arrows') && !doc.querySelector('.dots') && fixed(), 'two to one removes navigation');
        click('.undo');
        check(doc.querySelectorAll('.dots i').length === 2 && fixed(), 'Undo restores two slides');
        select('#count', '3'); ask('a1'); click('[data-action="forget"]');
        check(doc.querySelectorAll('.dots i').length === 2 && !doc.querySelector('table') && fixed(), 'three to two remains slides');
        click('.undo');
        check(doc.querySelectorAll('.dots i').length === 3 && fixed(), 'Undo restores three slides');
        select('#count', '64');
        let search = doc.getElementById('account-search'); search.value = 'lab'; search.dispatchEvent(new win.Event('input', { bubbles: true }));
        const scroll = doc.querySelector('.table-scroll'); scroll.scrollTop = 120; await pause();
        const priorScroll = scroll.scrollTop, priorOrder = order();
        const visible = [...doc.querySelectorAll('tbody tr')].find(row => { const r = row.getBoundingClientRect(), b = scroll.getBoundingClientRect(); return r.top >= b.top + 20 && r.bottom <= b.bottom; });
        check(!!visible && priorScroll > 0, 'large list supports internal scrolling');
        ask(visible.dataset.id); click('[data-action="cancel"]');
        check(doc.getElementById('account-search').value === 'lab' && order() === priorOrder && doc.querySelector('.table-scroll').scrollTop === priorScroll, 'Cancel preserves exact filtered order and scroll position');
        select('#count', '4'); select('#scenario', 'long'); ask('a2');
        const longDialog = doc.querySelector('[role="dialog"]');
        check(longDialog.textContent.includes('研究と開発') && longDialog.scrollWidth === longDialog.clientWidth && fixed(), 'long international names wrap or scroll inside confirmation without widening popup');
        click('[data-action="cancel"]'); select('#scenario', 'normal');
      }
    }
    check(errors.length === 0, 'no prototype runtime errors');
    results.textContent += '\nAll prototype checks passed. Sample data only.\n';
  } catch (error) { results.textContent += '\nStopped: ' + error.message; }
};
