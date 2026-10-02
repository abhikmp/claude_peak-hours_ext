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

// Maps incidentImpact strings from the API to short 2-word display labels
function impactToLabel(impact) {
  if (!impact || impact === 'none') return 'All Clear';
  if (impact === 'critical') return 'Major Outage';
  if (impact === 'major') return 'Major Outage';
  if (impact === 'minor') return 'Partial Outage';
  // Capitalise unknown values as a fallback
  return impact.charAt(0).toUpperCase() + impact.slice(1);
}

// Pick the single best ticker message from available incident data.
// Priority: watched-product issue → major model issue → generic elevated error → null
function pickTickerText(local, watched) {
  const title = local.incidentTitle ?? '';
  const body = local.incidentBody ?? '';

  if (!title) return null;

  // Gather candidate strings (title + body lines)
  const rawCandidates = [title];
  // body often has multiple sentences; split on ". " to get individual lines
  body.split(/\.\s+/).forEach(s => { if (s.trim()) rawCandidates.push(s.trim()); });

  // Deduplicate: normalise whitespace + lowercase comparison
  const seen = new Set();
  const candidates = rawCandidates.filter(s => {
    const key = s.toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?]$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Product name patterns for matching
  const PRODUCT_KEYWORDS = {
    ai: ['claude.ai', 'claude ai', 'logging in', 'login', 'web'],
    code: ['claude code', 'api'],
    cowork: ['cowork', 'desktop', 'mcp'],
    design: ['claude design', 'design']
  };
  const MODEL_WORDS = ['sonnet', 'opus', 'haiku', 'mythos', 'fable', 'model'];

  // Score each candidate
  function score(text) {
    const lower = text.toLowerCase();
    // Tier 1: matches a watched product
    for (const p of watched) {
      const kws = PRODUCT_KEYWORDS[p] ?? [];
      if (kws.some(kw => lower.includes(kw))) return 3;
    }
    // Tier 2: mentions a model name
    if (MODEL_WORDS.some(m => lower.includes(m))) return 2;
    // Tier 3: any other incident text
    return 1;
  }

  // Sort by score descending, pick the best
  candidates.sort((a, b) => score(b) - score(a));
  const best = candidates[0];

  // Trim to a reasonable length
  return best && best.length > 120 ? best.slice(0, 117) + '…' : (best || null);
}

// Renders the usage bar given a percent (0–100), a Unix seconds resets-at timestamp,
// IANA tz, and whether the quota window has already expired (checked in render()).
function renderUsageBar(percent, resetsAt, tz, expired) {
  const fill = document.getElementById('usage-fill');
  const label = document.getElementById('usage-label');
  const resets = document.getElementById('usage-resets');

  if (expired) {
    // Quota window has rolled over — show a fresh-start state
    fill.style.width = '0%';
    fill.className = 'usage-fill';
    label.textContent = '✦ Full quota available!';
    label.className = 'usage-label fresh';
    resets.textContent = 'Start messaging — your limit has reset';
    return;
  }

  if (percent === null || percent === undefined) {
    // No data seen yet in this quota window
    fill.style.width = '0%';
    fill.className = 'usage-fill';
    label.textContent = 'Send a message to see usage';
    label.className = 'usage-label';
    resets.textContent = '';
    return;
  }

  // Round to integer to avoid float display issues and ensure dark-text threshold is accurate
  const pct = Math.round(Math.min(100, Math.max(0, percent)));
  const colorClass = pct < 60 ? 'green' : pct < 85 ? 'orange' : 'red';

  fill.style.width = pct + '%';
  fill.className = `usage-fill ${colorClass}`;

  label.textContent = `${pct}% used`;
  // If fill is thin (< 60%), white text would sit mostly in the empty region — use dark
  label.className = `usage-label has-data${pct < 60 ? ' dark-text' : ''}`;

  // Resets countdown with clock time
  if (resetsAt) {
    const msLeft = resetsAt * 1000 - Date.now();
    const resetsAtISO = new Date(resetsAt * 1000).toISOString();
    const clockTime = toLocalTimeStr(resetsAtISO, tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
    resets.textContent = msLeft > 0
      ? `Resets in ${formatDuration(msLeft)} · ${clockTime}`
      : 'Resetting soon';
  } else {
    resets.textContent = '';
  }
}

async function render() {
  const [local, sync] = await Promise.all([
    chrome.storage.local.get([
      'state', 'fetchError', 'statusDescription', 'incidentTitle', 'incidentBody',
      'nextPeakAt', 'peakEndsAt', 'lastChecked', 'affectedProducts',
      'watchedAffected', 'incidentImpact',
      'usagePercent', 'usageResetsAt'
    ]),
    chrome.storage.sync.get(['userTZ', 'watchedProducts'])
  ]);

  const state = local.state ?? 'grey';
  const tz = sync.userTZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const VALID_PRODUCTS = new Set(['ai', 'code', 'cowork', 'design']);
  const watched = (sync.watchedProducts ?? ['ai', 'code', 'cowork', 'design'])
    .filter(p => VALID_PRODUCTS.has(p));

  // ── Circle color ──
  const circle = document.getElementById('circle');
  circle.className = `circle ${state}`;

  // ── Status label + sub-text ──
  const label = document.getElementById('status-label');
  const sub = document.getElementById('status-sub');
  const retryBtn = document.getElementById('retry-btn');

  if (state === 'orange') {
    // Incident on a watched product — show incident detail in sub-text
    label.textContent = impactToLabel(local.incidentImpact);
    retryBtn.hidden = true;
    const tickerText = pickTickerText(local, watched);
    sub.textContent = tickerText ?? 'Check status page';
  } else if (state === 'green') {
    label.textContent = 'All Clear';
    retryBtn.hidden = true;
    const next = local.nextPeakAt;
    if (next) {
      const ms = new Date(next) - Date.now();
      const localTime = toLocalTimeStr(next, tz);
      sub.textContent = `Peak starts in ${formatDuration(ms)} (${localTime} your time)`;
    } else {
      sub.textContent = '';
    }
  } else if (state === 'red') {
    label.textContent = 'Peak Hours';
    retryBtn.hidden = true;
    const ends = local.peakEndsAt;
    if (ends) {
      const ms = new Date(ends) - Date.now();
      const localTime = toLocalTimeStr(ends, tz);
      sub.textContent = `Ends in ${formatDuration(ms)} (${localTime} your time)`;
    } else {
      sub.textContent = 'Use with caution';
    }
  } else {
    // Grey — fetch failure
    label.textContent = 'Status Unavailable';
    retryBtn.hidden = false;
    sub.textContent = 'Will retry automatically in ~5 min';
  }

  // ── Usage bar ──
  // Check expiry at popup-open time. If the stored reset time has passed and we
  // have stale data, clear it now so the next content-script update starts fresh.
  const resetsAt = local.usageResetsAt ?? null;
  const expired = resetsAt !== null
    && local.usagePercent !== null && local.usagePercent !== undefined
    && Date.now() / 1000 >= resetsAt;
  if (expired) {
    chrome.storage.local.remove(['usagePercent', 'usageResetsAt']).catch(() => {});
  }
  renderUsageBar(local.usagePercent ?? null, resetsAt, tz, expired);

  // ── Footer timezone label ──
  document.getElementById('tz-label').textContent = tz;
  document.getElementById('tz-search').placeholder = 'Set custom timezone';
}

// ── Retry button (grey / fetch-failure state only) ──

document.getElementById('retry-btn').addEventListener('click', async () => {
  const btn = document.getElementById('retry-btn');
  btn.textContent = '↺ Retrying…';
  btn.disabled = true;
  chrome.runtime.sendMessage({ type: 'POLL_NOW' }).catch(() => { });
  // Give the service worker time to fetch and write state, then re-render
  setTimeout(async () => {
    btn.textContent = '↺ Retry';
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
    console.warn('Claude Status: failed to load timezones.json');
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
    li.textContent = tz;
    li.addEventListener('click', async () => {
      await chrome.storage.sync.set({ userTZ: tz });
      document.getElementById('tz-list').hidden = true;
      document.getElementById('tz-search').value = '';
      await render();
    });
    list.appendChild(li);
  });
}

document.getElementById('tz-reset-btn').addEventListener('click', async () => {
  const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await chrome.storage.sync.set({ userTZ: systemTZ });
  document.getElementById('tz-list').hidden = true;
  document.getElementById('tz-search').value = '';
  await render();
});

async function openTZList() {
  const list = document.getElementById('tz-list');
  const search = document.getElementById('tz-search');
  search.value = '';
  if (allTimezones.length === 0) await loadTimezones();
  renderTZList('');
  list.hidden = false;
}

document.getElementById('tz-search').addEventListener('focus', openTZList);
document.getElementById('tz-search').addEventListener('input', (e) => {
  document.getElementById('tz-list').hidden = false;
  renderTZList(e.target.value);
});

// Close list when clicking outside the picker
document.addEventListener('click', (e) => {
  const picker = document.querySelector('.tz-picker');
  if (!picker.contains(e.target)) {
    document.getElementById('tz-list').hidden = true;
    document.getElementById('tz-search').value = '';
  }
});

// ── Product filter ──

const PRODUCT_IDS = ['ai', 'code', 'cowork', 'design'];

// Disable the sole remaining checked checkbox so the user can't uncheck it.
// All others stay enabled normally. Re-enables everything once 2+ are checked.
function updateCheckboxConstraints() {
  const checked = PRODUCT_IDS.filter(id => document.getElementById(`pf-${id}`)?.checked);
  const isLastOne = checked.length === 1;
  PRODUCT_IDS.forEach(id => {
    const cb = document.getElementById(`pf-${id}`);
    if (!cb) return;
    const locked = isLastOne && cb.checked;
    cb.disabled = locked;
    const label = cb.closest('label');
    if (label) label.style.opacity = locked ? '0.45' : '';
  });
  const hint = document.getElementById('product-filter-hint');
  if (hint) hint.hidden = !isLastOne;
}

async function initProductFilter() {
  const sync = await chrome.storage.sync.get('watchedProducts');
  const watched = (sync.watchedProducts ?? PRODUCT_IDS).filter(p => PRODUCT_IDS.includes(p));
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
  // Re-evaluate state immediately with the new filter — don't wait for the next 5-min alarm
  chrome.runtime.sendMessage({ type: 'POLL_NOW' }).catch(() => { });
  // Give the service worker a moment to write new state, then re-render the popup
  setTimeout(render, 400);
}

PRODUCT_IDS.forEach(id => {
  const cb = document.getElementById(`pf-${id}`);
  if (cb) cb.addEventListener('change', saveProductFilter);
});

// Init.
render();
initProductFilter();