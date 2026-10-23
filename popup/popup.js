// Formats a duration in ms to "Xd Yh", "Xh Ym", or "Ym" string
function formatDuration(ms) {
  if (ms <= 0) return 'soon';
  const totalMin = Math.round(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

// Converts an ISO UTC string to a human-readable day + time in the given IANA timezone
function toLocalTimeStr(isoStr, tz) {
  if (!isoStr) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz
  }).format(new Date(isoStr));
}

// Aside text for outage — severity + affected products
function impactToAside(impact, affectedProducts) {
  const severity = (impact === 'critical' || impact === 'major') ? 'Major' : 'Partial';
  const products = affectedProducts?.length
    ? affectedProducts.map(p => ({ ai: 'Claude AI', code: 'Claude Code', cowork: 'Cowork', design: 'Design' }[p] ?? p)).join(', ')
    : '';
  return products ? `${severity} · ${products}` : severity;
}

// Builds the aside text for the off-peak green state.
// today / tomorrow / day-name, with <1hr countdown prefix.
function formatNextPeakAside(nextPeakAt, tz) {
  if (!nextPeakAt) return '';

  const peakDate = new Date(nextPeakAt);
  const msUntil  = peakDate - Date.now();

  // Clock time in user's TZ, e.g. "5:00 AM"
  const clockTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz
  }).format(peakDate);

  // Day label: today / tomorrow / Wed …
  const userTZ     = tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayStr   = new Intl.DateTimeFormat('en-CA', { timeZone: userTZ }).format(new Date());
  const peakStr    = new Intl.DateTimeFormat('en-CA', { timeZone: userTZ }).format(peakDate);
  const tomorrow   = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = new Intl.DateTimeFormat('en-CA', { timeZone: userTZ }).format(tomorrow);

  let dayLabel;
  if (peakStr === todayStr) {
    dayLabel = 'today';
  } else if (peakStr === tomorrowStr) {
    dayLabel = 'tomorrow';
  } else {
    dayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: userTZ }).format(peakDate);
  }

  if (msUntil > 0 && msUntil < 60 * 60 * 1000) {
    // < 1 hr: show countdown + anchor
    return `Next peak in ${formatDuration(msUntil)} · ${dayLabel} ${clockTime}`;
  }
  return `Next peak · ${dayLabel} ${clockTime}`;
}

// Pick the single best ticker message from available incident data.
function pickTickerText(local, watched) {
  const title = local.incidentTitle ?? '';
  const body = local.incidentBody ?? '';
  if (!title) return null;

  const rawCandidates = [title];
  body.split(/\.\s+/).forEach(s => { if (s.trim()) rawCandidates.push(s.trim()); });

  const seen = new Set();
  const candidates = rawCandidates.filter(s => {
    const key = s.toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?]$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const PRODUCT_KEYWORDS = {
    ai: ['claude.ai', 'claude ai', 'logging in', 'login', 'web'],
    code: ['claude code', 'api'],
    cowork: ['cowork', 'desktop', 'mcp'],
    design: ['claude design', 'design']
  };
  const MODEL_WORDS = ['sonnet', 'opus', 'haiku', 'mythos', 'fable', 'model'];

  function score(text) {
    const lower = text.toLowerCase();
    for (const p of watched) {
      const kws = PRODUCT_KEYWORDS[p] ?? [];
      if (kws.some(kw => lower.includes(kw))) return 3;
    }
    if (MODEL_WORDS.some(m => lower.includes(m))) return 2;
    return 1;
  }

  candidates.sort((a, b) => score(b) - score(a));
  const best = candidates[0];
  return best && best.length > 120 ? best.slice(0, 117) + '…' : (best || null);
}

function formatReadingAge(ageMs) {
  return ageMs < 60000 ? 'Updated just now'
    : `Updated ${formatDuration(Math.floor(ageMs / 60000) * 60000)} ago`;
}

function formatLastReset(resetsAt) {
  const minutes = Math.max(0, Math.floor((Date.now() - resetsAt * 1000) / 60000));
  return minutes < 1 ? 'just now' : minutes < 60 ? `${minutes}m ago`
    : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
}

function formatExactReset(resetsAt, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full', timeStyle: 'short', timeZone: tz
  }).format(new Date(resetsAt * 1000)) + ` (${tz})`;
}

function observedUsageText(account) {
  return `Last observed: ${Math.round(account.lastObservedPercent)}%. Send a message from this Account for a new reading.`;
}

function renderDormantUsage(element, account) {
  const estimated = Date.now() < account.resetsAt * 1000 + 3 * 60 * 60 * 1000;
  element.classList.toggle('estimated', estimated);
  element.textContent = estimated ? '~0% ' : 'No recent reading';
  if (estimated) {
    const label = document.createElement('span');
    label.className = 'usage-estimate-label';
    label.textContent = 'estimated';
    element.append(label);
  }
  const context = estimated
    ? 'Estimated for three hours after the observed 5-hour quota reset; current usage has not been observed. '
    : 'The observed 5-hour quota period ended; current usage has not been observed. ';
  element.title = context + formatReadingAge(account.ageMs) + '. ' + observedUsageText(account);
  element.setAttribute('aria-description', element.title);
  element.tabIndex = 0;
}

function renderUsageFacts(element, account, tz) {
  element.hidden = !account?.isExpired;
  element.replaceChildren();
  if (element.hidden) return;
  element.innerHTML = `
    <dt title="Reset time from the last captured reading">Last reset</dt><dd><time></time></dd>
    <dt>Last recorded usage</dt><dd class="usage-last-recorded"></dd>
    <dt>Updated</dt><dd class="usage-reading-age"></dd>`;
  const reset = new Date(account.resetsAt * 1000);
  const time = element.querySelector('time');
  time.dateTime = reset.toISOString();
  time.textContent = formatLastReset(account.resetsAt);
  time.title = formatExactReset(account.resetsAt, tz);
  element.querySelector('.usage-last-recorded').textContent = `${Math.round(account.lastObservedPercent)}%`;
  element.querySelector('.usage-reading-age').textContent = formatReadingAge(account.ageMs).replace(/^Updated /, '');
}

// ── Render status pill ──
function renderPill(state, local, watched, tz) {
  const pill        = document.getElementById('status-pill');
  const pillText    = document.getElementById('pill-text');
  const pillAside   = document.getElementById('pill-aside');
  const incidentSub = document.getElementById('incident-sub');
  const retryBtn    = document.getElementById('retry-btn');

  pill.className = 'pill';
  incidentSub.hidden = true;
  retryBtn.hidden = true;
  pillAside.hidden = true;
  pillAside.textContent = '';

  if (state === 'orange') {
    pill.classList.add('orange');
    pillText.textContent = 'Outage';
    const aside = impactToAside(local.incidentImpact, local.affectedProducts);
    if (aside) {
      pillAside.textContent = aside;
      pillAside.hidden = false;
    }
    const ticker = pickTickerText(local, watched);
    if (ticker) {
      incidentSub.textContent = ticker;
      incidentSub.hidden = false;
    }
  } else if (state === 'red') {
    pill.classList.add('red');
    pillText.textContent = 'Peak';
    if (local.peakEndsAt) {
      const ms = new Date(local.peakEndsAt) - Date.now();
      pillAside.textContent = `Ends in ${formatDuration(ms)} · today ${
        new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(local.peakEndsAt))
      }`;
      pillAside.hidden = false;
    }
  } else if (state === 'green') {
    pill.classList.add('green');
    pillText.textContent = 'Off peak';
    const aside = formatNextPeakAside(local.nextPeakAt, tz);
    if (aside) {
      pillAside.textContent = aside;
      pillAside.hidden = false;
    }
  } else {
    // Grey — fetch failure
    pillText.textContent = 'Status unavailable';
    retryBtn.hidden = false;
  }
}

// ── Main render ──
let renderRevision = 0;
async function render() {
  const revision = ++renderRevision;
  const [local, sync] = await Promise.all([
    chrome.storage.local.get([
      'state', 'fetchError', 'statusDescription', 'incidentTitle', 'incidentBody',
      'nextPeakAt', 'peakEndsAt', 'lastChecked', 'affectedProducts',
      'watchedAffected', 'incidentImpact',
      'accounts'
    ]),
    chrome.storage.sync.get(['userTZ', 'watchedProducts'])
  ]);
  if (revision !== renderRevision) return;

  const state = local.state ?? 'grey';
  const tz = sync.userTZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const VALID_PRODUCTS = new Set(['ai', 'code', 'cowork', 'design']);
  const watched = (sync.watchedProducts ?? ['ai']).filter(p => VALID_PRODUCTS.has(p));

  // ── Usage hero ──
  const now = Date.now();
  const accounts = local.accounts ?? {};
  const orderedAccounts = Accounts.getAccounts(accounts, now);
  const hasAccounts = AccountPages.render(orderedAccounts, tz);
  document.querySelector('.usage-hero').hidden = hasAccounts;

  // ── Status pill ──
  renderPill(state, local, watched, tz);

  // ── Footer timezone label ──
  document.getElementById('tz-label').textContent = tz;
}

// ── Theme toggle ──
// Persists preference to chrome.storage.sync so it survives popup close/reopen.

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

async function initTheme() {
  const sync = await chrome.storage.sync.get('theme');
  applyTheme(sync.theme ?? 'dark');
}

document.getElementById('theme-toggle').addEventListener('click', async () => {
  const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  await chrome.storage.sync.set({ theme: next });
});

// ── Retry button (grey state — icon only, spins while retrying) ──
document.getElementById('retry-btn').addEventListener('click', async () => {
  const btn = document.getElementById('retry-btn');
  btn.disabled = true;
  chrome.runtime.sendMessage({ type: 'POLL_NOW' }).catch(() => {});
  setTimeout(async () => {
    btn.disabled = false;
    await render();
  }, 2500);
});

// ── Timezone picker ──

let allTimezones = [];

async function loadTimezones() {
  try {
    const res = await fetch(chrome.runtime.getURL('data/timezones.json'));
    allTimezones = await res.json();
  } catch {
    allTimezones = [];
    console.warn('QuotaBeacon: failed to load timezones.json');
  }
}

function renderTZList(filter = '') {
  const list = document.getElementById('tz-list');
  const lower = filter.toLowerCase();
  const matches = filter
    ? allTimezones.filter(tz => tz.toLowerCase().includes(lower)).slice(0, 80)
    : allTimezones.slice(0, 80);

  list.innerHTML = '';
  matches.forEach(tz => {
    const li = document.createElement('li');
    const option = document.createElement('button');
    option.type = 'button';
    option.textContent = tz;
    option.addEventListener('click', async () => {
      await chrome.storage.sync.set({ userTZ: tz });
      document.getElementById('tz-list').hidden = true;
      document.getElementById('tz-search').value = '';
      await render();
    });
    li.append(option);
    list.appendChild(li);
  });
}

// Reset button — resets timezone, watched products, theme, and usage to defaults
document.getElementById('tz-reset-btn').addEventListener('click', async () => {
  const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await chrome.storage.sync.set({
    userTZ: systemTZ,
    watchedProducts: ['ai'],
    theme: 'dark'
  });
  applyTheme('dark');
  PRODUCT_IDS.forEach(id => {
    const cb = document.getElementById(`pf-${id}`);
    if (cb) cb.checked = (id === 'ai');
  });
  updateCheckboxConstraints();

  await chrome.storage.local.set({ accounts: Accounts.clearAccounts() });
  chrome.runtime.sendMessage({ type: 'USAGE_UPDATE' }).catch(() => {});

  chrome.runtime.sendMessage({ type: 'POLL_NOW' }).catch(() => {});
  document.getElementById('tz-list').hidden = true;
  document.getElementById('tz-search').value = '';
  await render();
});

async function openTZList() {
  const search = document.getElementById('tz-search');
  search.value = '';
  if (allTimezones.length === 0) await loadTimezones();
  renderTZList('');
  document.getElementById('tz-list').hidden = false;
}

document.getElementById('tz-search').addEventListener('focus', openTZList);
document.getElementById('tz-search').addEventListener('input', (e) => {
  document.getElementById('tz-list').hidden = false;
  renderTZList(e.target.value);
});

document.addEventListener('click', (e) => {
  const picker = document.querySelector('.tz-picker');
  if (!picker.contains(e.target)) {
    document.getElementById('tz-list').hidden = true;
    document.getElementById('tz-search').value = '';
  }
});

// ── Product filter ──

const PRODUCT_IDS = ['ai', 'code', 'cowork', 'design'];

function updateCheckboxConstraints() {
  const checked = PRODUCT_IDS.filter(id => document.getElementById(`pf-${id}`)?.checked);
  const isLastOne = checked.length === 1;
  PRODUCT_IDS.forEach(id => {
    const cb = document.getElementById(`pf-${id}`);
    if (!cb) return;
    const locked = isLastOne && cb.checked;
    cb.disabled = locked;
    const lbl = cb.closest('label');
    if (lbl) lbl.style.opacity = locked ? '0.45' : '';
  });
  const hint = document.getElementById('product-filter-hint');
  if (hint) hint.hidden = !isLastOne;
}

async function initProductFilter() {
  const sync = await chrome.storage.sync.get('watchedProducts');
  const watched = (sync.watchedProducts ?? ['ai']).filter(p => PRODUCT_IDS.includes(p));
  PRODUCT_IDS.forEach(id => {
    const cb = document.getElementById(`pf-${id}`);
    if (cb) cb.checked = watched.includes(id);
  });
  updateCheckboxConstraints();
}

async function saveProductFilter() {
  updateCheckboxConstraints();
  const watched = PRODUCT_IDS.filter(id => {
    const cb = document.getElementById(`pf-${id}`);
    return cb?.checked;
  });
  await chrome.storage.sync.set({ watchedProducts: watched });
  chrome.runtime.sendMessage({ type: 'POLL_NOW' }).catch(() => {});
  setTimeout(render, 400);
}

PRODUCT_IDS.forEach(id => {
  const cb = document.getElementById(`pf-${id}`);
  if (cb) cb.addEventListener('change', saveProductFilter);
});

// ── Init ──
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.accounts) render();
});
async function initAccounts() {
  await render();
  await initProductFilter();
  // Age and expiry also change while an otherwise idle popup stays open.
  setInterval(render, 30000);
}

// Apply theme before render to avoid a flash of wrong theme
initTheme().then(initAccounts);
