document.getElementById('run').onclick = async () => {
  const out = document.getElementById('results'); out.textContent = '';
  const pause = () => new Promise(resolve => setTimeout(resolve, 25));
  let passed = 0;
  const check = (value, text) => { out.textContent += `${value ? 'PASS' : 'FAIL'} ${text}\n`; if (!value) throw Error(text); passed++; };
  async function open(name, params = {}) {
    localStorage.removeItem('ticket01-extra04-' + name);
    const frame = document.createElement('iframe');
    await new Promise(resolve => { frame.onload = resolve; frame.src = '/popup/popup.html?' + new URLSearchParams({case:'extra04-' + name, count:3, products:'ai', ...params}); document.querySelector('iframe').replaceWith(frame); });
    await pause(); return frame.contentWindow;
  }
  const ask = win => {
    win.document.querySelectorAll('.account-page')[1].querySelector('.account-more').click();
    win.document.querySelector('[role="menuitem"]').click();
  };
  try {
    for (const theme of ['dark','light']) {
      const win = await open(theme, {theme}), doc = win.document;
      const raw = structuredClone(win.ticket01.state.local.accounts);
      raw['account-1'].label = ('研究と開発 · International collaborators ' + 'x'.repeat(100)).repeat(8);
      raw['account-1'].resetsAt = win.Date.now() / 1000 - 4 * 3600;
      await win.chrome.storage.local.set({accounts:raw}); await pause();
      doc.getElementById('account-next').click();
      const page = doc.querySelectorAll('.account-page')[1];
      check(page.scrollHeight === page.clientHeight && page.scrollWidth === page.clientWidth, theme + ': long-name dormant slide fits naturally without a scrollbar');
      check(page.textContent.includes('Last recorded usage') && page.textContent.includes('No recent reading'), 'historical facts and three-hour detail policy survive');
      ask(win);
      const dialog = doc.querySelector('dialog');
      check(dialog.scrollHeight > dialog.clientHeight && dialog.getBoundingClientRect().height <= 300 && dialog.scrollWidth === dialog.clientWidth, 'long dialog name wraps and scrolls internally');
      const currentFocus = doc.activeElement;
      doc.getElementById('theme-toggle').focus();
      check(doc.activeElement === currentFocus, 'modal prevents background controls receiving focus');
      dialog.dispatchEvent(new win.MouseEvent('click', {clientX:0, clientY:0, bubbles:true}));
      check(!dialog.open && doc.activeElement.classList.contains('account-more'), 'backdrop dismissal cancels and restores origin focus');
      ask(win); dialog.dispatchEvent(new win.Event('cancel', {cancelable:true}));
      check(!dialog.open && Object.keys(win.ticket01.state.local.accounts).length === 3, 'Escape cancellation leaves saved Accounts intact');
      const more = page.querySelector('.account-more'); more.click();
      doc.activeElement.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      check(!doc.querySelector('[role="menu"]') && doc.activeElement === more, 'menu Escape restores the trigger');
      ask(win); doc.getElementById('confirm-forget').click(); await pause();
      const toast = doc.querySelector('.account-undo'), label = toast.querySelector('.account-undo-text');
      check(label.scrollWidth > label.clientWidth && label.title.includes('研究と開発'), 'Undo truncates long names and exposes full label');
      const animation = toast.querySelector('.account-undo-line').getAnimations()[0];
      doc.getElementById('account-next').click(); doc.getElementById('theme-toggle').click(); await pause();
      check(toast.querySelector('.account-undo-line').getAnimations()[0] === animation && animation.effect.getTiming().easing === 'linear', 'navigation/theme retain the same linear transform animation');
      const themeButton = doc.getElementById('theme-toggle'); themeButton.focus();
      const positions = () => JSON.stringify(['.pill-row','.product-filter','.footer','.tz-picker'].map(selector => {
        const r = doc.querySelector(selector).getBoundingClientRect(); return [r.x,r.y,r.width,r.height];
      }));
      const reservedPositions = positions();
      check(win.getComputedStyle(doc.querySelector('.footer')).visibility === 'hidden'
        && win.getComputedStyle(doc.querySelector('.tz-picker')).visibility === 'hidden', 'both footer sections are visually replaced while Undo is available');
      await win.ticket01.advance(2500);
      check(toast.hidden && doc.activeElement === themeButton, 'expiry leaves unrelated focus in place');
      check(win.getComputedStyle(doc.querySelector('.footer')).visibility === 'visible'
        && win.getComputedStyle(doc.querySelector('.tz-picker')).visibility === 'visible' && positions() === reservedPositions,
        'expiry restores the complete footer without moving status, products or controls');
      toast.querySelector('.account-undo-button').click(); await pause();
      check(!win.ticket01.state.local.accounts['account-1'], 'late Undo cannot restore an expired observation');
      check(win.ticket01.errors.length === 0, 'accessibility flow has no exceptions');
    }
    const win = await open('reduced', {reducedMotion:1}), doc = win.document;
    doc.getElementById('account-next').click(); ask(win); doc.getElementById('confirm-forget').click(); await pause();
    const line = doc.querySelector('.account-undo-line'), time = doc.querySelector('.account-undo-time');
    check(line.getAnimations().length === 0 && win.getComputedStyle(line).display === 'none' && win.getComputedStyle(time).display !== 'none', 'emulated reduced-motion preference selects production numeric fallback without moving line');
    await win.ticket01.advance(1000);
    check(time.textContent === '1.5s', 'reduced-motion text shows remaining time');
    doc.querySelector('.account-undo-button').focus();
    await win.ticket01.advance(1500);
    check(doc.querySelector('.account-undo').hidden && doc.activeElement.id === 'theme-toggle', 'expiry returns disappearing Undo focus to a visible control');
    out.textContent += `\n${passed} passed, 0 failed\n`;
  } catch (error) {out.textContent += 'ERROR ' + error.stack;}
  await fetch('/qa-save/extra',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:out.textContent})});
};
