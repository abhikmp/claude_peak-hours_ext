// Account actions stay outside the paged track, so overlays never move with it.
const AccountActions = (() => {
  let accounts = new Map();
  let origin;
  let targetId;
  let menu;
  let busy = false;
  let undo;
  let timer;
  let clockTimer;
  let countdown;
  let recoveryContext;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const notice = document.createElement('div');
  notice.className = 'account-announcement';
  notice.setAttribute('role', 'status');
  document.body.append(notice);

  const dialog = document.createElement('dialog');
  dialog.className = 'account-forget-dialog';
  dialog.setAttribute('aria-labelledby', 'forget-title');
  dialog.setAttribute('aria-describedby', 'forget-description forget-error');
  dialog.innerHTML = '<h2 id="forget-title"></h2><p id="forget-description">A later Usage reading can add it again.</p><p id="forget-error" role="alert" hidden></p><div class="account-dialog-buttons"><button type="button" id="cancel-forget" autofocus>Cancel</button><button type="button" id="confirm-forget">Forget account</button></div>';
  document.body.append(dialog);
  const cancel = dialog.querySelector('#cancel-forget');
  const confirm = dialog.querySelector('#confirm-forget');

  const toast = document.createElement('div');
  toast.className = 'account-undo';
  toast.hidden = true;
  toast.innerHTML = '<span class="account-undo-text"></span><span class="account-undo-time" aria-hidden="true"></span><button type="button" class="account-undo-button" aria-describedby="undo-deadline">Undo</button><button type="button" class="account-undo-dismiss" aria-label="Dismiss undo notification">×</button><span class="account-undo-line" aria-hidden="true"></span><span class="account-announcement" id="undo-deadline">Undo is available for 2.5 seconds after removal.</span>';
  document.body.append(toast);

  async function mutate(command) {
    const result = await chrome.runtime.sendMessage({ type: 'ACCOUNT_MUTATION', command });
    if (!result || result.error) throw new Error(result?.error ?? 'Account update failed. Please try again.');
    return result;
  }

  function focusVisible() {
    const control = document.querySelector('.account-secondary .account-table-scroll:not([hidden])')
      ?? document.getElementById('theme-toggle');
    if (!control.closest('[hidden], [inert]')) control.focus({ preventScroll: true });
    else document.getElementById('theme-toggle').focus({ preventScroll: true });
  }

  function restoreFocus() {
    if (origin?.isConnected && !origin.hidden && !origin.closest('[hidden], [inert]')) origin.focus({ preventScroll: true });
    else focusVisible();
  }

  function closeMenu(restore = false) {
    menu?.remove();
    menu = null;
    origin?.setAttribute('aria-expanded', 'false');
    if (!dialog.open) targetId = null;
    if (restore) restoreFocus();
  }

  function cancelDialog() {
    dialog.close();
    targetId = null;
    restoreFocus();
  }

  function openMenu(button) {
    const account = accounts.get(button.dataset.accountId);
    if (!account || account.isActive) return;
    closeMenu();
    origin = button;
    targetId = account.accountId;
    origin.setAttribute('aria-expanded', 'true');
    menu = document.createElement('div');
    menu.className = 'account-action-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', `Actions for ${account.label}`);
    const action = document.createElement('button');
    action.type = 'button';
    action.setAttribute('role', 'menuitem');
    action.textContent = 'Forget account';
    action.addEventListener('click', () => {
      const id = targetId;
      closeMenu();
      const current = accounts.get(id);
      if (!current || current.isActive) { restoreFocus(); return; }
      targetId = id;
      dialog.querySelector('h2').textContent = `Forget ${current.label}?`;
      dialog.querySelector('#forget-error').hidden = true;
      dialog.showModal();
      cancel.focus();
    });
    menu.append(action);
    document.body.append(menu);
    const rect = button.getBoundingClientRect();
    menu.style.left = `${Math.max(16, Math.min(244 - menu.offsetWidth, rect.right - menu.offsetWidth))}px`;
    menu.style.top = `${Math.max(16, Math.min(324 - menu.offsetHeight, rect.bottom + 4))}px`;
    action.focus();
  }

  cancel.addEventListener('click', cancelDialog);
  dialog.addEventListener('cancel', event => { event.preventDefault(); cancelDialog(); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom)) cancelDialog();
  });
  confirm.addEventListener('click', async () => {
    if (busy || !targetId) return;
    busy = true;
    confirm.disabled = true;
    const id = targetId;
    const context = AccountPages.captureContext();
    try {
      const result = await mutate({ action: 'forget', accountId: id });
      if (dialog.open) dialog.close();
      targetId = null;
      if (result.status === 'forgotten') {
        recoveryContext = { token: result.undo.token, context };
        await render();
        if (!toast.hidden) toast.querySelector('.account-undo-button').focus();
      } else {
        notice.textContent = 'The Active Account cannot be forgotten.';
        restoreFocus();
      }
    } catch (error) {
      const message = dialog.querySelector('#forget-error');
      message.textContent = error.message;
      message.hidden = false;
      if (dialog.open) cancel.focus();
      else notice.textContent = error.message;
    } finally {
      busy = false;
      confirm.disabled = false;
    }
  });

  function syncOverlay() {
    // Swap out the whole footer while preserving its layout space.
    document.querySelector('.container').classList.toggle('account-has-undo', !toast.hidden);
    document.querySelectorAll('.lower-controls .footer, .lower-controls .tz-picker').forEach(element => {
      element.inert = !toast.hidden;
    });
  }

  function hideUndo() {
    const hadFocus = toast.contains(document.activeElement);
    clearTimeout(timer);
    clearInterval(clockTimer);
    countdown?.cancel();
    undo = null;
    toast.hidden = true;
    syncOverlay();
    if (hadFocus && !dialog.open) focusVisible();
  }

  function expire(token) {
    if (undo?.token !== token) return;
    if (Date.now() < undo.expiresAt) { scheduleCountdown(); return; }
    hideUndo();
    // Token checking at the storage boundary protects a replacement offer.
    mutate({ action: 'dismiss', token }).catch(() => {});
  }

  function scheduleCountdown() {
    clearTimeout(timer);
    clearInterval(clockTimer);
    countdown?.cancel();
    if (!undo) return;
    const token = undo.token;
    const remaining = undo.expiresAt - Date.now();
    if (remaining <= 0) { expire(token); return; }
    const line = toast.querySelector('.account-undo-line');
    const time = toast.querySelector('.account-undo-time');
    const fraction = Math.min(1, remaining / 2500);
    line.style.transform = `scaleX(${fraction})`;
    if (!reducedMotion.matches) countdown = line.animate(
      [{ transform: `scaleX(${fraction})` }, { transform: 'scaleX(0)' }],
      { duration: remaining, easing: 'linear', fill: 'forwards' });
    const updateTime = () => {
      if (undo?.token !== token) return;
      time.textContent = `${Math.max(0, (undo.expiresAt - Date.now()) / 1000).toFixed(1)}s`;
      if (Date.now() >= undo.expiresAt) expire(token);
    };
    updateTime();
    clockTimer = setInterval(updateTime, 100);
    timer = setTimeout(() => expire(token), remaining);
  }

  function syncUndo(record) {
    if (!record || (record.expiresAt !== null && Date.now() >= record.expiresAt)) {
      if (undo) hideUndo();
      if (record) mutate({ action: 'dismiss', token: record.token }).catch(() => {});
      return;
    }
    if (undo?.token === record.token) {
      if (record.expiresAt !== null && undo.expiresAt !== record.expiresAt) {
        undo = record;
        scheduleCountdown();
      }
      return;
    }
    if (record.expiresAt === null) {
      const offeredAt = Date.now();
      record = { ...record, expiresAt: offeredAt + 2500 };
      const token = record.token;
      mutate({ action: 'offerUndo', token, offeredAt }).then(result => {
        if (undo?.token === token) syncUndo(result.undo);
      }).catch(error => {
        if (undo?.token === token) hideUndo();
        notice.textContent = error.message;
      });
    }
    undo = record;
    const label = record.reading.label ?? `Account ${record.accountId.slice(0, 6)}…`;
    const text = toast.querySelector('.account-undo-text');
    text.textContent = `Forgot ${label}`;
    text.title = `Forgot ${label}`;
    toast.hidden = false;
    notice.textContent = `Forgot ${label}. Undo is available for 2.5 seconds.`;
    syncOverlay();
    scheduleCountdown();
  }

  toast.querySelector('.account-undo-button').addEventListener('click', async () => {
    if (!undo) return;
    const saved = undo;
    const context = recoveryContext?.token === saved.token ? recoveryContext.context : AccountPages.captureContext();
    if (Date.now() >= saved.expiresAt) { expire(saved.token); return; }
    try {
      const result = await mutate({ action: 'undo', token: saved.token });
      if (result.status === 'restored') {
        AccountPages.restoreContext({ ...context, restoredId: saved.accountId });
      }
      if (undo?.token === saved.token) hideUndo();
      await render();
      notice.textContent = result.status === 'newer-kept' ? 'This Account returned with a newer reading. The newer reading was kept.'
        : result.status === 'restored' ? 'Account restored with its saved reading.' : 'Undo has expired.';
      focusVisible();
    } catch (error) { notice.textContent = error.message; }
  });
  toast.querySelector('.account-undo-dismiss').addEventListener('click', async () => {
    if (!undo) return;
    const token = undo.token;
    try { await mutate({ action: 'dismiss', token }); if (undo?.token === token) hideUndo(); }
    catch (error) { notice.textContent = error.message; }
  });
  reducedMotion.addEventListener('change', scheduleCountdown);

  document.addEventListener('click', event => {
    const button = event.target.closest('.account-more');
    if (button) { openMenu(button); return; }
    if (menu && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (!menu && !dialog.open) return;
    if (event.key === 'Escape' && menu) {
      event.preventDefault(); closeMenu(true);
    } else if (event.key === 'Tab') {
      const controls = dialog.open ? [cancel, confirm].filter(button => !button.disabled) : [menu.querySelector('button')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    // Prevent the underlying pager and inspection Escape handler from acting.
    event.stopImmediatePropagation();
  }, true);

  return { mutate, syncUndo, syncOverlay, render(orderedAccounts, record) {
    accounts = new Map(orderedAccounts.map(account => [account.accountId, account]));
    if (targetId && (!accounts.has(targetId) || accounts.get(targetId).isActive)) {
      if (dialog.open) cancelDialog();
      closeMenu(true);
    }
    syncUndo(record);
  } };
})();
