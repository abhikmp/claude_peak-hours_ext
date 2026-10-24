importScripts('../shared/accounts.js');
importScripts('../shared/account-store.js');
importScripts('../shared/account-storage.js');
// Capture scripts need no direct storage access. Restrict both areas before use.
const storageReady = Promise.all([
  chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }),
  chrome.storage.sync.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
]);
const accountStorage = AccountStorage.create(chrome.storage.local);
const accountStore = AccountStore.create(accountStorage);
let undoCleanupTimer;

async function mutateAccounts(command) {
  await storageReady;
  const result = await accountStore.mutate(command);
  clearTimeout(undoCleanupTimer);
  if (result.undo) {
    const token = result.undo.token;
    undoCleanupTimer = setTimeout(() => {
      // Read/expire through the same queue. An old callback cannot end a new offer.
      mutateAccounts({ action: 'getUndo', token }).catch(() => {});
    }, Math.max(0, AccountStore.recoveryDeadline(result.undo) - Date.now()));
  }
  if (result.status === 'recorded' || result.status === 'cleared') updateIcon();
  return result;
}

const STATUS_URL = 'https://status.claude.com/api/v2/summary.json';
const ALARM_NAME = 'statusPoll';
const EXPIRY_ALARM_NAME = 'usageExpiryCheck';
const POLL_MINUTES = 5;

// Maps user-facing product keys to substrings found in component names from the API
const PRODUCT_COMPONENT_MAP = {
  ai: ['claude.ai', 'claude ai', 'web'],
  code: ['claude code', 'api'],
  cowork: ['cowork', 'claude desktop', 'mcp'],
  design: ['claude design', 'design']
};

// Format ms into "Xd Yh", "Xh Ym", or "Ym" for tooltip
function formatTitleDuration(ms) {
  if (ms <= 0) return 'soon';
  const totalMin = Math.round(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

// Peak hours: weekdays 5 AM – 11 AM Pacific Time only
function isPeakNow() {
  const now = new Date();
  const fmt = (opts) => new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'America/Los_Angeles' }).format(now);
  const hour = parseInt(fmt({ hour: 'numeric', hour12: false }), 10);
  const day = fmt({ weekday: 'short' });
  const isWeekday = !['Sat', 'Sun'].includes(day);
  return isWeekday && hour >= 5 && hour < 11;
}

// Returns { state, statusDescription, incidentTitle, incidentBody, incidentImpact,
//           affectedProducts, watchedAffected, nextPeakAt, peakEndsAt, lastChecked }
async function fetchAndResolveState() {
  let apiData = null;

  try {
    const res = await fetch(STATUS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    apiData = await res.json();
  } catch (err) {
    let fetchError = 'Failed to reach status.claude.com';
    if (err?.message) {
      if (err.message.startsWith('HTTP ')) {
        fetchError = `Server error: ${err.message}`;
      } else if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
        fetchError = 'Network error — check your connection';
      } else {
        fetchError = err.message.length > 60 ? err.message.slice(0, 57) + '…' : err.message;
      }
    }
    return {
      state: 'grey',
      fetchError,
      statusDescription: null,
      incidentTitle: null,
      incidentBody: null,
      incidentImpact: null,
      affectedProducts: [],
      watchedAffected: false,
      nextPeakAt: null,
      peakEndsAt: null,
      lastChecked: new Date().toISOString()
    };
  }

  const VALID_INDICATORS = new Set(['none', 'minor', 'major', 'critical']);
  const rawIndicator = apiData?.status?.indicator;
  const indicator = VALID_INDICATORS.has(rawIndicator) ? rawIndicator : 'none';
  const statusDescription = apiData?.status?.description ?? null;
  const incidents = apiData?.incidents ?? [];
  const components = apiData?.components ?? [];

  const activeIncident = indicator !== 'none'
    ? incidents[0] ?? { name: apiData.status.description, incident_updates: [] }
    : incidents.find(i => {
      const latest = i.incident_updates?.[0];
      return latest && latest.status !== 'resolved';
    });

  const affectedProducts = activeIncident
    ? getAffectedProducts(activeIncident, components)
    : [];

  const VALID_PRODUCTS = new Set(['ai', 'code', 'cowork', 'design']);
  const syncData = await chrome.storage.sync.get('watchedProducts');
  // Default is now ['ai'] only
  const watched = (syncData.watchedProducts ?? ['ai'])
    .filter(p => VALID_PRODUCTS.has(p));
  const watchedAffected = affectedProducts.length > 0 &&
    affectedProducts.some(p => watched.includes(p));

  if (activeIncident) {
    const latest = activeIncident.incident_updates?.[0];
    return {
      state: watchedAffected ? 'orange' : isPeakNow() ? 'red' : 'green',
      fetchError: null,
      statusDescription,
      incidentTitle: activeIncident.name ?? 'Active incident',
      incidentBody: latest?.body ?? null,
      incidentImpact: VALID_INDICATORS.has(activeIncident.impact) ? activeIncident.impact : indicator,
      affectedProducts,
      watchedAffected,
      nextPeakAt: watchedAffected ? null : getNextPeakISO(),
      peakEndsAt: (!watchedAffected && isPeakNow()) ? getPeakEndISO() : null,
      lastChecked: new Date().toISOString()
    };
  }

  const peak = isPeakNow();
  return {
    state: peak ? 'red' : 'green',
    fetchError: null,
    statusDescription,
    incidentTitle: null,
    incidentBody: null,
    incidentImpact: null,
    affectedProducts: [],
    watchedAffected: false,
    nextPeakAt: getNextPeakISO(),
    peakEndsAt: peak ? getPeakEndISO() : null,
    lastChecked: new Date().toISOString()
  };
}

function getAffectedProducts(incident, components) {
  const affectedComponentIds = new Set(
    (incident.components ?? []).map(c => c.id ?? c)
  );
  const affectedNames = components
    .filter(c => affectedComponentIds.has(c.id) || c.status !== 'operational')
    .map(c => c.name?.toLowerCase() ?? '');

  const matched = [];
  for (const [product, keywords] of Object.entries(PRODUCT_COMPONENT_MAP)) {
    if (affectedNames.some(name => keywords.some(kw => name.includes(kw)))) {
      matched.push(product);
    }
  }
  return matched;
}

function ptWallClockToUTC(year, month, day, hour) {
  const trial = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  const parts = fmt.formatToParts(trial).reduce((acc, p) => { acc[p.type] = +p.value; return acc; }, {});
  const trialPTMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const targetMs = Date.UTC(year, month - 1, day, hour, 0, 0);
  const diffMs = targetMs - trialPTMs;
  return new Date(trial.getTime() + diffMs);
}

function getPTNow() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', weekday: 'short', hour12: false
  });
  return fmt.formatToParts(now).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
}

function getPeakEndISO() {
  const pt = getPTNow();
  return ptWallClockToUTC(+pt.year, +pt.month, +pt.day, 11).toISOString();
}

function getNextPeakISO() {
  const pt = getPTNow();
  const ptHour = parseInt(pt.hour, 10);

  let year = +pt.year;
  let month = +pt.month;
  let day = +pt.day;

  if (ptHour >= 5) {
    const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
    year = tomorrow.getUTCFullYear();
    month = tomorrow.getUTCMonth() + 1;
    day = tomorrow.getUTCDate();
  }

  for (let i = 0; i < 7; i++) {
    const candidate = ptWallClockToUTC(year, month, day, 5);
    const weekday = candidate.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles', weekday: 'short'
    });
    if (!['Sat', 'Sun'].includes(weekday)) {
      return candidate.toISOString();
    }
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }

  return ptWallClockToUTC(year, month, day, 5).toISOString();
}

// ── Icon: color driven by usage %, not peak/outage state ──
// Usage thresholds: missing/expired→green, 0–60→green, 61–85→orange, 86–100→red
async function updateIcon() {
  await storageReady;
  const { accounts = {} } = await accountStorage.get('accounts');
  const now = Date.now();
  const colorKey = Accounts.getIconColor(accounts, now);
  await chrome.action.setIcon({ path: Object.fromEntries(
    [16, 32, 48, 128].map(size => [size, `icons/usage-${colorKey}-${size}.png`])
  ) });
}

// ── Badge: blinking PEAK or DOWN, driven by peak/outage state ──
let blinkInterval = null;
let blinkVisible = true;

function startBadgeBlink(text, bgColor) {
  stopBadgeBlink();
  blinkVisible = true;
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: bgColor });
  chrome.action.setBadgeTextColor({ color: '#ffffff' });
  blinkInterval = setInterval(() => {
    blinkVisible = !blinkVisible;
    chrome.action.setBadgeText({ text: blinkVisible ? text : '' });
  }, 1000);
}

function stopBadgeBlink() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  chrome.action.setBadgeText({ text: '' });
}

// Build a short tooltip title string
function buildTitle(result) {
  if (result.state === 'orange') {
    const products = (result.affectedProducts ?? [])
      .map(p => ({ ai: 'AI', code: 'Code', cowork: 'Cowork', design: 'Design' }[p] ?? p))
      .join('/');
    const prefix = products ? `Issue: Claude ${products}` : 'Tech issue';
    const title = result.incidentTitle ?? '';
    const detail = title.length > 45 ? title.slice(0, 42) + '…' : title;
    return detail ? `${prefix} · ${detail}` : prefix;
  }
  if (result.state === 'red') {
    if (result.peakEndsAt) {
      const ms = new Date(result.peakEndsAt) - Date.now();
      return `Peak hours · Ends in ${formatTitleDuration(ms)}`;
    }
    return 'Peak hours · Use with caution';
  }
  if (result.state === 'green') {
    if (result.incidentTitle && !result.watchedAffected) {
      return result.statusDescription ?? 'Off-peak · All clear';
    }
    if (result.nextPeakAt) {
      const ms = new Date(result.nextPeakAt) - Date.now();
      return `Off-peak · Next peak in ${formatTitleDuration(ms)}`;
    }
    return 'Off-peak · All clear';
  }
  return 'ClaudeBuddy · Unknown';
}

async function poll() {
  const result = await fetchAndResolveState();
  await chrome.storage.local.set(result);

  await updateIcon();

  // Badge = peak/outage signal (DOWN takes priority over PEAK)
  if (result.state === 'orange') {
    startBadgeBlink('DOWN', '#c2410c');
  } else if (result.state === 'red') {
    startBadgeBlink('PEAK', '#b91c1c');
  } else {
    stopBadgeBlink();
  }

  await chrome.action.setTitle({ title: buildTitle(result) });
}

async function initTimezone() {
  const existing = await chrome.storage.sync.get('userTZ');
  if (!existing.userTZ) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await chrome.storage.sync.set({ userTZ: tz });
  }
}

// ── Event listeners ──

async function injectCaptureIntoOpenTabs() {
  const tabs = await chrome.tabs.query({ url: ['https://claude.ai/*'] });
  const scripts = [...chrome.runtime.getManifest().content_scripts]
    .sort((a, b) => Number(b.world === 'ISOLATED') - Number(a.world === 'ISOLATED'));
  await Promise.allSettled(tabs.map(async ({ id }) => {
    for (const script of scripts) {
      await chrome.scripting.executeScript({
        target: { tabId: id }, files: script.js, world: script.world,
        injectImmediately: true
      });
    }
  }));
}

chrome.runtime.onInstalled.addListener(async (details) => {
  await storageReady;
  await mutateAccounts({ action: 'getUndo' });
  if (details.reason === 'install' || details.reason === 'update') {
    await injectCaptureIntoOpenTabs().catch(() => {});
  }
  if (details.reason === 'update') {
    // The usage tracker was never public, so discard its old flat keys once on
    // update. Keep all Account readings and settings already in the new schema.
    await chrome.storage.local.remove(['usagePercent', 'usageResetsAt', 'usageExpired']);
  }
  await initTimezone();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_MINUTES });
  chrome.alarms.create(EXPIRY_ALARM_NAME, { periodInMinutes: 0.5 });
  await poll();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) poll();
  if (alarm.name === EXPIRY_ALARM_NAME) updateIcon();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  if (msg?.type === 'ACCOUNT_MUTATION') {
    // Content scripts may capture readings/labels, never read Undo or delete data.
    const capture = Boolean(sender.tab);
    if (capture && (!sender.url?.startsWith('https://claude.ai/')
        || !['reading', 'label'].includes(msg.command?.action))) return;
    mutateAccounts(msg.command).then(result => sendResponse(capture
      ? { status: result.status, needsLabel: result.needsLabel } : result),
    () => sendResponse({ error: 'Account update failed. Please try again.' }));
    // Keep the response channel open while Chrome wakes/executes the worker.
    return true;
  }
  if (msg?.type === 'POLL_NOW') poll();
  if (msg?.type === 'USAGE_UPDATE') {
    updateIcon();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await storageReady;
  await mutateAccounts({ action: 'getUndo' });
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_MINUTES });
  chrome.alarms.create(EXPIRY_ALARM_NAME, { periodInMinutes: 0.5 });
  poll();
});
