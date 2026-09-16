const STATUS_URL = 'https://status.claude.com/api/v2/summary.json';
const ALARM_NAME = 'statusPoll';
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
    // Build a short human-readable error string for the popup ticker
    let fetchError = 'Failed to reach status.claude.com';
    if (err?.message) {
      if (err.message.startsWith('HTTP ')) {
        fetchError = `Server error: ${err.message}`;
      } else if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
        fetchError = 'Network error — check your connection';
      } else {
        // Trim long JS error messages to something display-safe
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

  // Find active incident
  const activeIncident = indicator !== 'none'
    ? incidents[0] ?? { name: apiData.status.description, incident_updates: [] }
    : incidents.find(i => {
      const latest = i.incident_updates?.[0];
      return latest && latest.status !== 'resolved';
    });

  // Which products are affected (based on non-operational components)?
  const affectedProducts = activeIncident
    ? getAffectedProducts(activeIncident, components)
    : [];

  // Does this affect any of the user's watched products? → drives icon color
  const VALID_PRODUCTS = new Set(['ai', 'code', 'cowork', 'design']);
  const syncData = await chrome.storage.sync.get('watchedProducts');
  const watched = (syncData.watchedProducts ?? ['ai', 'code', 'cowork', 'design'])
    .filter(p => VALID_PRODUCTS.has(p));
  const watchedAffected = affectedProducts.length > 0 &&
    affectedProducts.some(p => watched.includes(p));

  if (activeIncident) {
    const latest = activeIncident.incident_updates?.[0];
    return {
      // Icon goes orange only if a watched product is affected
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

  // No incident
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

// Determine which product keys are affected by an incident via component names
function getAffectedProducts(incident, components) {
  // Some incidents list affected component IDs; match against component names
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

// Convert a PT wall-clock date+hour into a real UTC Date.
// Works correctly regardless of the device's local timezone or DST.
// Strategy: format a reference UTC epoch in PT to get the PT offset,
// then use that offset to build the target UTC instant.
function ptWallClockToUTC(year, month, day, hour) {
  // We need to find the UTC instant where PT wall clock = year/month/day hour:00:00.
  // Use a binary-search-free approach: format a trial UTC date in PT and measure the gap.
  // Trial: treat the wall-clock as if it were UTC, then correct.
  const trial = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  // Format that trial in PT to see what PT wall clock it maps to
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  const parts = fmt.formatToParts(trial).reduce((acc, p) => { acc[p.type] = +p.value; return acc; }, {});
  // Difference in hours between trial PT wall clock and desired PT wall clock
  const trialPTMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const targetMs = Date.UTC(year, month - 1, day, hour, 0, 0);
  const diffMs = targetMs - trialPTMs;
  return new Date(trial.getTime() + diffMs);
}

// Get current PT date parts {year, month, day, hour, weekday}
function getPTNow() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', weekday: 'short', hour12: false
  });
  return fmt.formatToParts(now).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
}

// Returns ISO string for when the current peak window ends (11 AM PT today)
function getPeakEndISO() {
  const pt = getPTNow();
  return ptWallClockToUTC(+pt.year, +pt.month, +pt.day, 11).toISOString();
}

// Returns ISO string for next peak window start (next weekday 5 AM PT)
function getNextPeakISO() {
  const pt = getPTNow();
  const ptHour = parseInt(pt.hour, 10);

  // Start from a JS Date set to PT midnight today (UTC-based, for day arithmetic only)
  // We'll use a simple day counter in PT calendar space
  let year = +pt.year;
  let month = +pt.month;
  let day = +pt.day;

  // If it's already past 5 AM PT today, move to tomorrow
  if (ptHour >= 5) {
    const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
    year = tomorrow.getUTCFullYear();
    month = tomorrow.getUTCMonth() + 1;
    day = tomorrow.getUTCDate();
  }

  // Skip until we land on a weekday
  // Use ptWallClockToUTC to get the real weekday (handles month/year rollover)
  for (let i = 0; i < 7; i++) {
    const candidate = ptWallClockToUTC(year, month, day, 5);
    const weekday = candidate.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles', weekday: 'short'
    });
    if (!['Sat', 'Sun'].includes(weekday)) {
      return candidate.toISOString();
    }
    // Advance one day in UTC calendar (safe since 5 AM PT is always same UTC date or +1)
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }

  // Fallback (should never reach here)
  return ptWallClockToUTC(year, month, day, 5).toISOString();
}

// Generate a colored circle icon via OffscreenCanvas and set it as the action icon
const STATE_COLORS = {
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  grey: '#9ca3af'
};

async function updateIcon(state) {
  const color = STATE_COLORS[state] ?? STATE_COLORS.grey;
  const sizes = [16, 32, 48, 128];
  const imageData = {};

  for (const size of sizes) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const r = size / 2;
    const inset = size * 0.08; // small inset so circle doesn't clip

    // Transparent background
    ctx.clearRect(0, 0, size, size);

    // Colored circle
    ctx.beginPath();
    ctx.arc(r, r, r - inset, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    imageData[size] = ctx.getImageData(0, 0, size, size);
  }

  await chrome.action.setIcon({ imageData });
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
    // Show API status description if there's a non-watched incident
    if (result.incidentTitle && !result.watchedAffected) {
      return result.statusDescription ?? 'Off-peak · All clear';
    }
    if (result.nextPeakAt) {
      const ms = new Date(result.nextPeakAt) - Date.now();
      return `Off-peak · Next peak in ${formatTitleDuration(ms)}`;
    }
    return 'Off-peak · All clear';
  }
  return 'Claude Status · Unknown';
}

async function poll() {
  const result = await fetchAndResolveState();
  await chrome.storage.local.set(result);
  await updateIcon(result.state);
  await chrome.action.setTitle({ title: buildTitle(result) });
}

// Detect and store timezone on install
async function initTimezone() {
  const existing = await chrome.storage.sync.get('userTZ');
  if (!existing.userTZ) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await chrome.storage.sync.set({ userTZ: tz });
  }
}

// ── Event listeners ──

chrome.runtime.onInstalled.addListener(async () => {
  await initTimezone();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_MINUTES });
  await poll(); // run immediately on install
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) poll();
});

// Allow the popup to request an immediate re-poll (e.g. after changing product filter)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return;
  if (msg?.type === 'POLL_NOW') poll();
});

// Re-run on browser startup (service workers don't persist)
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_MINUTES });
  poll();
});