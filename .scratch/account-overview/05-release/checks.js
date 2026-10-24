document.getElementById('run').onclick = async () => {
  const out = document.getElementById('results'); out.textContent = '';
  let passed = 0;
  const check = (ok, text) => { out.textContent += `${ok ? 'PASS' : 'FAIL'} ${text}\n`; if (!ok) throw Error(text); passed++; };
  const pause = () => new Promise(resolve => setTimeout(resolve, 50));
  async function open(theme, reopen = false) {
    const key = `secure05-${theme}`;
    if (!reopen) localStorage.removeItem('ticket01-' + key);
    const frame = document.createElement('iframe');
    await new Promise(resolve => {
      frame.onload = resolve;
      frame.src = '/secure-popup/popup.html?' + new URLSearchParams({case:key, theme, count:4, products:'ai'});
      document.querySelector('iframe').replaceWith(frame);
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (frame.contentDocument.querySelectorAll('.account-page').length) break;
      await pause();
    }
    return frame.contentWindow;
  }
  try {
    for (const theme of ['dark', 'light']) {
      let win = await open(theme), doc = win.document;
      check(doc.querySelector('.container').getBoundingClientRect().height === 340 && doc.body.scrollWidth === 260, `${theme}: encrypted artifact renders at 260 × 340`);
      check(win.ticket05.access.length === 2 && win.ticket05.access.every(value => value === 'TRUSTED_CONTEXTS'), 'both storage areas restricted to trusted contexts');
      check(win.ticket01.state.local.accounts.format === 'quotabeacon-aes-gcm-v1', 'pre-release Accounts migrate in the real worker');
      check(!JSON.stringify(win.ticket01.state.local).includes('Active workspace'), 'physical storage contains ciphertext rather than sample labels');
      const original = (await win.ticket05.read()).accounts;
      doc.getElementById('account-next').click();
      doc.querySelector('tbody tr .account-more').click(); doc.querySelector('[role="menuitem"]').click();
      const target = doc.querySelector('tbody tr').dataset.accountId;
      doc.getElementById('confirm-forget').click();
      for (let i = 0; i < 100 && doc.querySelector('.account-undo').hidden; i++) await pause();
      check(!(await win.ticket05.read()).accounts[target], 'Forget removes the real encrypted observation');
      check(win.ticket01.state.local.accountUndo.format === 'quotabeacon-aes-gcm-v1' && !JSON.stringify(win.ticket01.state.local).includes('Workspace'), 'temporary recovery is encrypted too');
      win = await open(theme, true); doc = win.document;
      check(!doc.querySelector('.account-undo').hidden, 'popup recreation reuses the persisted IndexedDB key and original offer');
      doc.querySelector('.account-undo-button').click();
      for (let i = 0; i < 100 && !(await win.ticket05.read()).accounts[target]; i++) await pause();
      check(JSON.stringify((await win.ticket05.read()).accounts[target]) === JSON.stringify(original[target]), 'Undo after recreation restores the exact observation');
      await win.ticket01.mutate({action:'reading', accountId:target, percent:88, resetsAt:win.Date.now()/1000+3600, observedAt:win.Date.now()+1});
      await pause();
      check(doc.querySelector('.account-page .account-name').textContent.includes(original[target].label), 'encrypted storage change updates Active in the actual popup');
      check(win.ticket01.toolbar.length > 0 && (await win.ticket05.read()).accounts[target].percent === 88, 'persisted capture command updates toolbar and observation');
      win.ticket01.state.local.accounts.ciphertext[0] ^= 1;
      doc.getElementById('tz-reset-btn').click();
      for (let i = 0; i < 100 && Object.keys((await win.ticket05.read().catch(() => ({accounts:{pending:true}}))).accounts).length; i++) await pause();
      check(Object.keys((await win.ticket05.read()).accounts).length === 0 && (await win.ticket05.read()).accountUndo === null,
        'actual Reset clears unreadable encrypted Accounts and recovery');
      await win.ticket01.mutate({action:'reading',accountId:target,percent:12,resetsAt:win.Date.now()/1000+3600});
      await pause();
      check((await win.ticket05.read()).accounts[target].percent === 12 && !doc.getElementById('account-hero').hidden,
        'capture and actual popup recover after Reset');
      check(win.ticket01.errors.length === 0, 'no runtime exceptions in encrypted lifecycle');
    }
    out.textContent += `\n${passed} passed, 0 failed\n`;
  } catch (error) { out.textContent += 'ERROR ' + error.stack; }
  await fetch('/qa-save/secure', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:out.textContent})});
};
