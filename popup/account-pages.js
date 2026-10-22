// Popup-only paging. Account identity, ordering and display state come from Accounts.
const AccountPages = (() => {
  const hero = document.getElementById('account-hero');
  const track = document.getElementById('account-track');
  const dots = document.getElementById('account-dots');
  const previous = document.getElementById('account-previous');
  const next = document.getElementById('account-next');
  const announcement = document.getElementById('account-announcement');
  let accounts = [];
  let pageIndex = 0;

  function displayLabel(label) {
    const email = label.trim().match(/^([^@\s]+)@[^@\s]+(?:['’]s\s+Organization)?$/i);
    return email ? email[1] : label;
  }

  function showPage(index) {
    if (accounts.length < 2) return;
    pageIndex = Math.max(0, Math.min(accounts.length - 1, index));
    track.style.transform = `translateX(-${pageIndex * 100}%)`;
    previous.disabled = pageIndex === 0;
    next.disabled = pageIndex === accounts.length - 1;
    [...track.children].forEach((page, i) => {
      page.inert = i !== pageIndex;
      page.setAttribute('aria-hidden', String(i !== pageIndex));
      dots.children[i].classList.toggle('current', i === pageIndex);
    });
    const account = accounts[pageIndex];
    announcement.textContent = `Account ${pageIndex + 1} of ${accounts.length}: ${displayLabel(account.label)}`;
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
        <span class="account-tag full" hidden>Full</span>
      </div>
      <div class="account-usage-top">
        <span class="account-percent"></span><span class="account-quota">5h quota</span>
      </div>
      <div class="account-bar"><div class="account-fill"></div></div>
      <div class="account-reset"></div>`;
    const name = page.querySelector('.account-name');
    const label = displayLabel(account.label);
    name.textContent = label;
    name.title = label;
    page.querySelector('.active').hidden = !account.isActive;
    page.querySelector('.full').hidden = !account.isFull;
    const percent = Math.round(account.percent);
    const tone = percent <= 60 ? 'green' : percent <= 85 ? 'orange' : 'red';
    page.dataset.tone = tone;
    page.querySelector('.account-percent').textContent = account.isExpired ? '0%' : `${percent}%\u00a0used`;
    page.querySelector('.account-fill').style.width = `${percent}%`;
    const reset = page.querySelector('.account-reset');
    if (account.isExpired) {
      reset.textContent = '✦ Full quota available — your limit has reset';
      reset.classList.add('fresh');
    } else if (account.resetsAt) {
      const msLeft = account.resetsAt * 1000 - Date.now();
      const clockTime = toLocalTimeStr(new Date(account.resetsAt * 1000).toISOString(), tz);
      reset.textContent = msLeft > 0
        ? `Resets in ${formatDuration(msLeft)} · ${clockTime}`
        : 'Resetting soon…';
    }
    if (!account.isActive && account.isStale) {
      const updated = document.createElement('div');
      updated.className = 'account-updated';
      updated.textContent = `Updated ${formatDuration(Math.floor(account.ageMs / 60000) * 60000)} ago`;
      name.after(updated);
    }
    return page;
  }

  // Returns whether the paged hero replaces the popup's single-Account hero.
  function render(orderedAccounts, tz) {
    if (orderedAccounts.length < 2) {
      hero.hidden = true;
      accounts = [];
      pageIndex = 0;
      return false;
    }
    const selectedId = accounts[pageIndex]?.accountId;
    const activeChanged = accounts[0]?.accountId !== orderedAccounts[0].accountId;
    const index = activeChanged ? 0 : Math.max(0,
      orderedAccounts.findIndex(account => account.accountId === selectedId));
    accounts = orderedAccounts;
    hero.hidden = false;
    // Data refreshes are immediate. Only a deliberate page change slides.
    track.classList.add('updating');
    track.replaceChildren(...accounts.map((account, i) => makePage(account, tz, i, accounts.length)));
    dots.replaceChildren(...accounts.map(() => document.createElement('span')));
    showPage(index);
    track.getBoundingClientRect();
    track.classList.remove('updating');
    return true;
  }

  previous.addEventListener('click', () => showPage(pageIndex - 1));
  next.addEventListener('click', () => showPage(pageIndex + 1));
  document.addEventListener('keydown', event => {
    if (hero.hidden || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    showPage(pageIndex + direction);
  });

  return { render };
})();
