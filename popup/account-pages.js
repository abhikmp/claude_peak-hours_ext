// Popup-only navigation. Account identity, ordering and display state come from Accounts.
const AccountPages = (() => {
  const hero = document.getElementById('account-hero');
  const track = document.getElementById('account-track');
  const dots = document.getElementById('account-dots');
  const previous = document.getElementById('account-previous');
  const next = document.getElementById('account-next');
  const navigation = hero.querySelector('.account-nav');
  const announcement = document.getElementById('account-announcement');
  const container = document.querySelector('.container');
  const usageRegion = document.querySelector('.usage-region');
  const lowerControls = document.querySelector('.lower-controls');
  const status = document.querySelector('.pill-row');
  let accounts = [];
  let accountsById = new Map();
  let timezone;
  let pageIndex = 0;
  let layoutKind = null;
  let tablePage;
  let tableIds = [];
  let tableRecentIds = new Set();
  let hasNewReading = false;
  let hasMembershipChange = false;
  let hasPriorityChange = false;
  let selectedId = null;
  let restoreContext = null;

  function displayLabel(label) {
    const email = label.trim().match(/^([^@\s]+)@[^@\s]+(?:['’]s\s+Organization)?$/i);
    return email ? email[1] : label;
  }

  function usageTone(account) {
    return account.isExpired ? 'unknown' : account.percent <= 60 ? 'green' : account.percent <= 85 ? 'orange' : 'red';
  }

  function showPage(index) {
    if (accounts.length === 0) return;
    const lastPage = layoutKind === 'table' ? 1 : accounts.length - 1;
    const nextIndex = Math.max(0, Math.min(lastPage, index));
    const changedPage = nextIndex !== pageIndex;
    const focused = document.activeElement;
    if (layoutKind === 'table' && nextIndex === 1 && pageIndex === 0) openTable();
    pageIndex = nextIndex;
    const secondary = layoutKind === 'table' && pageIndex === 1;
    container.classList.toggle('account-secondary', secondary);
    container.classList.toggle('account-table-view', secondary && !selectedId);
    lowerControls.hidden = secondary;
    if (secondary) usageRegion.before(status);
    else lowerControls.prepend(status);
    track.style.transform = `translateX(-${pageIndex * 100}%)`;
    previous.disabled = pageIndex === 0;
    next.disabled = pageIndex === lastPage;
    [...track.children].forEach((page, i) => {
      page.inert = i !== pageIndex;
      page.setAttribute('aria-hidden', String(i !== pageIndex));
      dots.children[i].classList.toggle('current', i === pageIndex);
    });
    announcement.textContent = secondary
      ? selectedId ? `Page 2: ${accountsById.get(selectedId).label}` : 'Page 2: saved Accounts table'
      : `Account ${pageIndex + 1} of ${layoutKind === 'table' ? 2 : accounts.length}: ${displayLabel(accounts[pageIndex].label)}`;
    if (changedPage && (track.contains(focused) || (focused === previous && previous.disabled) || (focused === next && next.disabled))) {
      (pageIndex === 0 ? next : previous).focus();
    }
    AccountActions.syncOverlay();
  }

  function makePage(account, tz, index, count) {
    const page = document.createElement('section');
    page.className = 'account-page';
    page.setAttribute('role', 'group');
    page.setAttribute('aria-label', `Account ${index + 1} of ${count}`);
    // Only static markup is parsed; organization names are always plain text.
    page.innerHTML = `
      <div class="account-heading">
        <span class="account-name"></span>
        <span class="account-tag active" hidden>Active</span>
        <button type="button" class="account-more" aria-haspopup="menu" aria-expanded="false"></button>
      </div>
      <div class="account-usage-top">
        <span class="account-percent"></span><span class="account-quota">5h quota</span>
      </div>
      <div class="account-bar"><div class="account-fill"></div></div>
      <div class="account-reset"></div>
      <div class="account-updated"></div>
      <dl class="usage-facts" aria-label="Last captured reading" hidden></dl>`;
    updatePage(page, account, tz);
    return page;
  }

  function updatePage(page, account, tz) {
    const name = page.querySelector('.account-name');
    const label = displayLabel(account.label);
    name.textContent = label;
    name.title = account.label;
    page.querySelector('.active').hidden = !account.isActive;
    updateMenuButton(page.querySelector('.account-more'), account);
    const percent = Math.round(account.percent);
    page.dataset.tone = usageTone(account);
    const percentElement = page.querySelector('.account-percent');
    percentElement.classList.remove('estimated');
    percentElement.removeAttribute('title');
    percentElement.removeAttribute('aria-description');
    percentElement.removeAttribute('tabindex');
    percentElement.textContent = `${percent}%\u00a0used`;
    page.querySelector('.account-quota').hidden = account.isExpired;
    page.querySelector('.account-bar').hidden = account.isExpired;
    page.querySelector('.account-fill').style.width = `${percent}%`;
    const reset = page.querySelector('.account-reset');
    reset.hidden = account.isExpired;
    reset.textContent = '';
    if (account.isExpired) {
      renderDormantUsage(percentElement, account);
    } else if (account.resetsAt) {
      const msLeft = account.resetsAt * 1000 - Date.now();
      const clockTime = toLocalTimeStr(new Date(account.resetsAt * 1000).toISOString(), tz);
      reset.textContent = msLeft > 0
        ? `Resets in ${formatDuration(msLeft)} · ${clockTime}`
        : 'Resetting soon…';
    }
    const updated = page.querySelector('.account-updated');
    updated.hidden = account.isExpired;
    updated.textContent = formatReadingAge(account.ageMs);
    renderUsageFacts(page.querySelector('.usage-facts'), account, tz);
  }

  function makeTablePage() {
    const page = document.createElement('section');
    page.className = 'account-comparison';
    page.setAttribute('role', 'group');
    page.setAttribute('aria-label', 'Saved Accounts');
    page.innerHTML = `
      <p class="account-refresh-notice" role="status" hidden>New reading received. Order updates when you reopen this list.</p>
      <div class="account-list">
        <label class="account-search"><span class="account-announcement">Search accounts</span>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg>
          <input type="search" id="account-search" placeholder="Search accounts" autocomplete="off">
        </label>
        <div class="account-table-scroll" tabindex="0" role="region" aria-label="Saved Accounts table">
          <table aria-label="Account usage comparison">
            <colgroup><col><col class="account-used-column"><col class="account-reset-column"><col class="account-action-column"></colgroup>
            <thead><tr><th scope="col">Account</th><th scope="col">Used</th><th scope="col">Reset</th><th scope="col"><span class="account-announcement">Actions</span></th></tr></thead>
            <tbody></tbody>
          </table>
          <p class="account-search-empty" role="status" hidden>No matching accounts.</p>
        </div>
        <p class="account-table-foot"></p>
      </div>
      <div class="account-inspection" hidden>
        <button type="button" class="account-back">← Back to accounts</button>
        <div class="account-detail"></div>
      </div>`;
    page.querySelector('input').addEventListener('input', () => {
      filterTable();
      page.querySelector('.account-table-scroll').scrollTop = 0;
    });
    page.querySelector('.account-back').addEventListener('click', backToTable);
    page.querySelector('tbody').addEventListener('click', event => {
      if (event.target.closest('.account-more')) return;
      const row = event.target.closest('tr[data-account-id]');
      if (row) inspectAccount(row.dataset.accountId);
    });
    return page;
  }

  function updateMenuButton(button, account) {
    button.dataset.accountId = account.accountId;
    button.hidden = account.isActive;
    button.setAttribute('aria-label', `Actions for ${account.label}`);
    button.title = `Actions for ${account.label}`;
    if (!button.firstChild) button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg>';
  }

  function makeRow(accountId) {
    const row = document.createElement('tr');
    row.dataset.accountId = accountId;
    row.innerHTML = '<td><button type="button" class="account-row-name"></button><span class="account-row-age"></span></td><td class="account-row-used"></td><td class="account-row-reset"></td><td><button type="button" class="account-more" aria-haspopup="menu" aria-expanded="false"></button></td>';
    return row;
  }

  function openTable() {
    selectedId = null;
    const now = Date.now();
    tableIds = Accounts.orderComparisonAccounts(accounts, now).map(account => account.accountId);
    tableRecentIds = new Set(tableIds.filter(id => Accounts.isRecentReset(accountsById.get(id), now)));
    hasNewReading = false;
    hasMembershipChange = false;
    hasPriorityChange = false;
    const body = tablePage.querySelector('tbody');
    body.replaceChildren(...tableIds.map(makeRow));
    tablePage.querySelector('input').value = '';
    tablePage.querySelector('.account-refresh-notice').hidden = true;
    tablePage.querySelector('.account-list').hidden = false;
    tablePage.querySelector('.account-list').inert = false;
    tablePage.querySelector('.account-inspection').hidden = true;
    updateTable();
    tablePage.querySelector('.account-table-scroll').scrollTop = 0;
  }

  function filterTable() {
    const query = tablePage.querySelector('input').value.trim().toLocaleLowerCase();
    let matches = 0;
    for (const row of tablePage.querySelectorAll('tbody tr')) {
      const account = accountsById.get(row.dataset.accountId);
      row.hidden = !account || !account.label.toLocaleLowerCase().includes(query);
      if (!row.hidden) matches++;
    }
    tablePage.querySelector('.account-search-empty').hidden = matches !== 0;
    tablePage.querySelector('.account-table-foot').textContent = `${tableIds.length} saved ${tableIds.length === 1 ? 'Account' : 'Accounts'}`;
  }

  function updateTable() {
    const now = Date.now();
    const notice = tablePage.querySelector('.account-refresh-notice');
    hasPriorityChange ||= tableIds.some(id => {
      const account = accountsById.get(id);
      return account && tableRecentIds.has(id) !== Accounts.isRecentReset(account, now);
    });
    notice.hidden = !hasNewReading && !hasPriorityChange && !hasMembershipChange;
    notice.textContent = hasNewReading
      ? 'New reading received. Order updates when you reopen this list.'
      : hasMembershipChange ? 'Saved Accounts changed. Order updates when you reopen this list.'
      : 'Reset priority updates when you reopen this list.';
    for (const row of tablePage.querySelectorAll('tbody tr')) {
      const account = accountsById.get(row.dataset.accountId);
      if (!account) continue;
      updateMenuButton(row.querySelector('.account-more'), account);
      const name = row.querySelector('button');
      name.textContent = displayLabel(account.label);
      name.title = account.label;
      row.querySelector('.account-row-age').textContent = `${account.isActive ? 'Active · ' : ''}${formatReadingAge(account.ageMs)}`;
      const used = row.querySelector('.account-row-used');
      const recent = Accounts.isRecentReset(account, now);
      used.textContent = recent ? '~0%' : account.percent === null ? '—' : `${Math.round(account.percent)}%`;
      used.dataset.tone = recent ? 'green' : usageTone(account);
      used.title = recent
        ? `Estimated 0% for fifteen minutes after the captured reset; current usage has not been observed. ${formatReadingAge(account.ageMs)}. ${observedUsageText(account)}`
        : account.isExpired ? `Current usage unknown. ${observedUsageText(account)}` : 'Observed usage';
      used.setAttribute('aria-label', `${used.textContent}. ${used.title}`);
      const reset = row.querySelector('.account-row-reset');
      reset.textContent = account.isExpired ? formatLastReset(account.resetsAt) : account.resetsAt
        ? `in ${formatDuration(account.resetsAt * 1000 - now)}` : '—';
      reset.title = account.resetsAt !== null
        ? `${account.isExpired ? 'Last reset' : 'Resets at'}: ${formatExactReset(account.resetsAt, timezone)}. From the last captured reading.` : 'Reset time unknown';
      reset.setAttribute('aria-label', `${reset.textContent}. ${reset.title}`);
    }
    filterTable();
    if (selectedId) {
      const account = accountsById.get(selectedId);
      if (account) updatePage(tablePage.querySelector('.account-detail .account-page'), account, timezone);
      else backToTable();
    }
  }

  function inspectAccount(accountId) {
    const account = accountsById.get(accountId);
    if (!account) return;
    selectedId = accountId;
    const list = tablePage.querySelector('.account-list');
    list.hidden = true;
    list.inert = true;
    tablePage.querySelector('.account-inspection').hidden = false;
    tablePage.querySelector('.account-detail').replaceChildren(makePage(account, timezone, 1, 2));
    showPage(1);
    tablePage.querySelector('.account-back').focus();
  }

  function backToTable() {
    selectedId = null;
    tablePage.querySelector('.account-inspection').hidden = true;
    const list = tablePage.querySelector('.account-list');
    list.hidden = false;
    list.inert = false;
    showPage(1);
    tablePage.querySelector('.account-table-scroll').focus({ preventScroll: true });
  }

  // Keep the comparison DOM and row IDs while open, including during inspection.
  function render(orderedAccounts, tz) {
    if (orderedAccounts.length === 0) {
      hero.hidden = true;
      accounts = [];
      accountsById.clear();
      pageIndex = 0;
      layoutKind = null;
      container.classList.remove('account-secondary', 'account-table-view');
      lowerControls.hidden = false;
      lowerControls.prepend(status);
      track.replaceChildren();
      dots.replaceChildren();
      announcement.textContent = '';
      return false;
    }
    const activeChanged = accounts[0]?.accountId !== orderedAccounts[0].accountId;
    const remainingIds = new Set(orderedAccounts.map(account => account.accountId));
    let continuationId;
    if (!activeChanged && accounts.some(account => !remainingIds.has(account.accountId))) {
      // Use the order the user was browsing, including the frozen table order.
      const browsingTable = layoutKind === 'table' && pageIndex === 1;
      const queue = browsingTable ? tableIds : accounts.map(account => account.accountId);
      const viewedId = browsingTable
        ? selectedId ?? queue.find(id => !remainingIds.has(id))
        : accounts[pageIndex]?.accountId;
      const removedIndex = queue.indexOf(viewedId);
      continuationId = remainingIds.has(viewedId) ? viewedId
        : queue.slice(removedIndex + 1).find(id => remainingIds.has(id))
          ?? queue.slice(0, removedIndex).reverse().find(id => remainingIds.has(id));
    }
    const membershipChanged = accounts.length !== orderedAccounts.length || orderedAccounts.some(account => !accountsById.has(account.accountId));
    const readingChanged = orderedAccounts.some(account => {
      const prior = accountsById.get(account.accountId);
      // Non-Active additions may be restored observations or delayed captures;
      // the membership notice covers both without claiming a new observation.
      if (!prior) return account.isActive;
      return prior.lastReadingAt !== account.lastReadingAt || prior.lastObservedPercent !== account.lastObservedPercent
        || prior.resetsAt !== account.resetsAt || prior.isActive !== account.isActive;
    });
    const removed = tableIds.filter(id => !orderedAccounts.some(account => account.accountId === id));
    accounts = orderedAccounts;
    accountsById = new Map(accounts.map(account => [account.accountId, account]));
    timezone = tz;
    hero.hidden = false;
    navigation.hidden = accounts.length === 1;
    dots.hidden = accounts.length === 1;
    // Data refreshes are immediate. Only a deliberate page change slides.
    track.classList.add('updating');
    const nextLayoutKind = accounts.length >= 4 ? 'table' : 'slides';
    if (layoutKind !== nextLayoutKind || (nextLayoutKind === 'slides' && track.children.length !== accounts.length)) {
      layoutKind = nextLayoutKind;
      pageIndex = layoutKind === 'slides' && continuationId
        ? Math.max(0, accounts.findIndex(account => account.accountId === continuationId)) : 0;
      selectedId = null;
      tablePage = layoutKind === 'table' ? makeTablePage() : null;
      const pageAccounts = tablePage ? accounts.slice(0, 1) : accounts;
      const pageCount = tablePage ? 2 : accounts.length;
      track.replaceChildren(...pageAccounts.map((account, index) => makePage(account, tz, index, pageCount)));
      if (tablePage) track.append(tablePage);
      dots.replaceChildren(...Array.from({ length: pageCount }, () => document.createElement('span')));
    } else {
      (layoutKind === 'table' ? accounts.slice(0, 1) : accounts).forEach((account, index) => updatePage(track.children[index], account, tz));
      if (layoutKind === 'table' && pageIndex === 1) {
        if (removed.length) {
          tableIds = tableIds.filter(id => accountsById.has(id));
          for (const row of tablePage.querySelectorAll('tbody tr')) {
            if (!accountsById.has(row.dataset.accountId)) row.remove();
          }
        }
        if (readingChanged) hasNewReading = true;
        if (membershipChanged) hasMembershipChange = true;
        updateTable();
      }
      if (activeChanged && layoutKind !== 'table') pageIndex = 0;
    }
    if (restoreContext) {
      const saved = restoreContext;
      restoreContext = null;
      if (layoutKind === 'table' && saved.layoutKind === 'table') {
        const rows = new Map([...tablePage.querySelectorAll('tbody tr')].map(row => [row.dataset.accountId, row]));
        tableIds = [...new Set([...saved.tableIds, ...tableIds, saved.restoredId])].filter(id => accountsById.has(id));
        tablePage.querySelector('tbody').replaceChildren(...tableIds.map(id => rows.get(id) ?? makeRow(id)));
        tableRecentIds = new Set(tableIds.filter(id => Accounts.isRecentReset(accountsById.get(id), Date.now())));
        tablePage.querySelector('input').value = saved.query;
        tablePage.querySelector('.account-list').hidden = false;
        tablePage.querySelector('.account-list').inert = false;
        tablePage.querySelector('.account-inspection').hidden = true;
        selectedId = null;
        pageIndex = saved.pageIndex;
        updateTable();
        tablePage.querySelector('.account-table-scroll').scrollTop = saved.scroll;
        if (saved.selectedId && accountsById.has(saved.selectedId)) inspectAccount(saved.selectedId);
      } else if (layoutKind === 'slides') {
        pageIndex = Math.max(0, accounts.findIndex(account => account.accountId === saved.visibleId));
      }
    }
    showPage(pageIndex);
    track.getBoundingClientRect();
    track.classList.remove('updating');
    return true;
  }

  previous.addEventListener('click', () => showPage(pageIndex - 1));
  next.addEventListener('click', () => showPage(pageIndex + 1));
  document.addEventListener('keydown', event => {
    if (accounts.length < 2 || hero.hidden || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (event.key === 'Escape' && layoutKind === 'table' && pageIndex === 1 && selectedId) {
      event.preventDefault();
      backToTable();
      return;
    }
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    showPage(pageIndex + direction);
  });

  function captureContext() {
    return { layoutKind, pageIndex, tableIds: [...tableIds], selectedId,
      visibleId: accounts[pageIndex]?.accountId,
      query: tablePage?.querySelector('input').value ?? '',
      scroll: tablePage?.querySelector('.account-table-scroll').scrollTop ?? 0 };
  }

  return { render, captureContext, restoreContext(context) { restoreContext = context; } };
})();
