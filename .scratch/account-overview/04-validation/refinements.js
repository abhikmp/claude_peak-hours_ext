document.getElementById('run').onclick = async () => {
  const output = document.getElementById('results'); output.textContent = '';
  const pause = () => new Promise(resolve => setTimeout(resolve, 25));
  let passed = 0;
  const check = (ok, text) => { output.textContent += `${ok ? 'PASS' : 'FAIL'} ${text}\n`; if (!ok) throw Error(text); passed++; };
  const currentId = doc => doc.querySelector('.account-page[aria-hidden="false"] .account-more')?.dataset.accountId;
  async function open(theme, count, suffix) {
    const name = `refine04-${theme}-${count}-${suffix}`;
    localStorage.removeItem('ticket01-' + name);
    const frame = document.createElement('iframe');
    await new Promise(resolve => { frame.onload = resolve; frame.src = '/popup/popup.html?' + new URLSearchParams({case:name, count, theme, products:'ai',load:Date.now()}); document.querySelector('iframe').replaceWith(frame); });
    await pause(); return frame.contentWindow;
  }
  async function forget(win, id) {
    const doc = win.document;
    [...doc.querySelectorAll(`.account-more[data-account-id="${id}"]`)].find(node => !node.hidden && !node.closest('[hidden],[inert]')).click();
    doc.querySelector('[role="menuitem"]').click();
    doc.getElementById('confirm-forget').click(); await pause();
  }
  try {
    for (const theme of ['dark','light']) {
      let win = await open(theme,3,'middle'), doc = win.document;
      doc.getElementById('account-next').click(); await forget(win,'account-1');
      check(currentId(doc) === 'account-2', `${theme}: deleting Account 2 of 3 continues at Account 3`);
      const remaining = JSON.stringify(win.ticket01.state.local.accounts);
      await win.ticket01.advance(2500);
      check(currentId(doc) === 'account-2' && JSON.stringify(win.ticket01.state.local.accounts) === remaining, 'Undo expiry preserves successor page and remaining observations');

      win = await open(theme,3,'last'); doc = win.document;
      doc.getElementById('account-next').click(); doc.getElementById('account-next').click();
      await forget(win,'account-2');
      check(currentId(doc) === 'account-1', `${theme}: deleting last slide stays at preceding non-Active Account`);

      win = await open(theme,3,'undo'); doc = win.document;
      doc.getElementById('account-next').click(); await forget(win,'account-1');
      doc.querySelector('.account-undo-button').click(); await pause();
      check(currentId(doc) === 'account-1', 'Undo restores the original browsing context after queue continuation');

      win = await open(theme,4,'priority-order'); doc = win.document;
      const raw = structuredClone(win.ticket01.state.local.accounts);
      raw['account-3'].resetsAt = win.Date.now()/1000-360;
      await win.chrome.storage.local.set({accounts:raw}); await pause();
      doc.getElementById('account-next').click();
      check(doc.querySelector('tbody tr').dataset.accountId === 'account-3', 'fixture prioritizes a recent reset ahead of ordinary slide order');
      await forget(win,'account-3');
      check(currentId(doc) === 'account-1', 'table→slides follows the frozen table successor rather than a recalculated position');

      for (const removed of [1,2,3]) {
        win = await open(theme,4,'table-' + removed); doc = win.document;
        doc.getElementById('account-next').click(); await forget(win,`account-${removed}`);
        check(currentId(doc) === `account-${removed === 3 ? 2 : removed+1}`, `${theme}: four→three continues at next row, or previous row at end (${removed})`);
        check(!doc.querySelector('table') && doc.getElementById('account-dots').children.length === 3, 'table→slides keeps correct navigation');
      }

      win = await open(theme,5,'stay-table'); doc = win.document;
      doc.getElementById('account-next').click();
      const search = doc.getElementById('account-search'); search.value = 'Workspace'; search.dispatchEvent(new win.Event('input',{bubbles:true}));
      const kept = doc.querySelector('tr[data-account-id="account-4"]');
      await forget(win,'account-2');
      check(doc.querySelector('.container').classList.contains('account-table-view') && doc.querySelectorAll('tbody tr').length === 3,
        `${theme}: five→four stays in table view`);
      check(search.value === 'Workspace' && kept.isConnected, 'table removal retains query and unrelated row identity');
      const active = win.Accounts.getAccounts(win.ticket01.state.local.accounts,win.Date.now())[0];
      check(active.accountId === 'account-0', 'queue continuation never changes Active');

      win = await open(theme,4,'inspection'); doc = win.document;
      doc.getElementById('account-next').click(); doc.querySelector('tr[data-account-id="account-1"] .account-row-name').click();
      await forget(win,'account-1');
      check(currentId(doc) === 'account-2', 'removal from inspected details also continues at the next Account');

      win = await open(theme,2,'one-left'); doc = win.document;
      doc.getElementById('account-next').click(); await forget(win,'account-1');
      check(currentId(doc) === 'account-0' && doc.querySelector('.account-nav').hidden, 'one remaining Account keeps the single view');

      win = await open(theme,3,'colors'); doc = win.document;
      doc.getElementById('account-next').click();
      doc.querySelectorAll('.account-page')[1].querySelector('.account-more').click();
      const menuButton = doc.querySelector('[role="menuitem"]'), menuStyle = win.getComputedStyle(menuButton);
      const menuBackground = menuStyle.backgroundColor, menuColor = menuStyle.color;
      check(menuBackground === 'rgb(207, 69, 69)' && menuColor === 'rgb(255, 255, 255)', `${theme}: menu uses softened red with white text`);
      menuButton.click();
      const confirm = doc.getElementById('confirm-forget'), style = win.getComputedStyle(confirm);
      check(style.backgroundColor === menuBackground && style.color === menuColor, 'confirmation uses the same red and white');
      check(win.ticket01.errors.length === 0, 'refinement flow has no runtime errors');
      const box = doc.querySelector('.container').getBoundingClientRect();
      check(box.width === 260 && box.height === 340 && doc.body.scrollWidth === 260 && doc.body.scrollHeight === 340, 'refinements retain 260 × 340 bounds');
    }
    output.textContent += `\n${passed} passed, 0 failed\n`;
  } catch(error) { output.textContent += 'ERROR ' + error.stack; }
  await fetch('/qa-save/refinements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:output.textContent})});
};
