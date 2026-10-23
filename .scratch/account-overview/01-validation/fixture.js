// Only the QA server injects this adapter. No extension storage or site is accessed.
(() => {
  const params = new URLSearchParams(location.search);
  const key = 'ticket01-' + params.get('case');
  const base = Date.parse('2026-10-23T10:00:00Z');
  const id = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';
  const isOld = params.get('old') === '1';
  const expired = params.get('expired') === '1';
  const reading = {
    label: 'Studio', percent: 100, resetsAt: (base + (expired ? -Number(params.get('resetAgoMinutes') || 0) * 60000 : 3600000)) / 1000,
    lastReadingAt: base - (isOld ? 365 * 86400000 : Number(params.get('ageMinutes') || 20) * 60000), readingOrder: 1
  };
  const seed = {
    now: base,
    local: {
      state: params.get('status') || 'green', accounts: params.get('empty') ? {} : { [id]: reading },
      nextPeakAt: new Date(base + 7200000).toISOString(),
      peakEndsAt: new Date(base + 28800000).toISOString(),
      incidentTitle: 'Claude AI service disruption affecting message delivery and conversation loading across several regions. Engineers are investigating.',
      incidentImpact: 'minor', affectedProducts: ['ai']
    },
    sync: { theme: params.get('theme') || 'dark', userTZ: 'Asia/Calcutta', watchedProducts: params.has('products') ? params.get('products').split(',') : ['code', 'design'] }
  };
  if (params.get('multi')) seed.local.accounts[other] = {
    label: 'Research workspace', percent: 45, resetsAt: (base + 7200000) / 1000,
    lastReadingAt: base, readingOrder: 2
  };
  if (params.get('longLabels')) {
    Object.values(seed.local.accounts).forEach(account => {
      account.label = 'Research and development workspace with a deliberately very long Account name';
    });
  }
  if (params.get('activeFull') && seed.local.accounts[other]) seed.local.accounts[other].percent = 100;
  if (params.has('count')) {
    seed.local.accounts = Object.fromEntries(Array.from({ length: Number(params.get('count')) }, (_, index) => [
      `account-${index}`, {
        label: index === 0 ? 'Active workspace' : `Workspace ${String(index).padStart(2, '0')}`,
        percent: index === 0 ? 24 : index % 5 === 0 ? 100 : index % 100,
        resetsAt: (base + (index > 0 && index % 5 === 0 ? index : 120) * 60000) / 1000,
        lastReadingAt: base - index * 60000, readingOrder: 100 - index
      }
    ]));
  }
  const state = JSON.parse(localStorage.getItem(key) || 'null') || seed;
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  const NativeDate = Date;
  window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [state.now])); }
    static now() { return state.now; }
  };
  const listeners = [];
  const messages = [];
  const writes = [];
  let tick;
  const realSetInterval = window.setInterval;
  window.setInterval = (callback, ms) => {
    if (ms === 30000) tick = callback;
    return realSetInterval(callback, ms);
  };
  const area = name => ({
    get: async () => structuredClone(state[name]),
    set: async value => {
      const changes = Object.fromEntries(Object.entries(value).map(([key, newValue]) =>
        [key, { oldValue: state[name][key], newValue }]));
      state[name] = { ...state[name], ...structuredClone(value) };
      writes.push({ area: name, keys: Object.keys(value) });
      save();
      listeners.forEach(listener => listener(changes, name));
    }
  });
  window.chrome = {
    storage: { local: area('local'), sync: area('sync'), onChanged: { addListener: listener => listeners.push(listener) } },
    runtime: {
      getURL: file => '/' + file,
      sendMessage: async message => { messages.push(message.type); }
    }
  };
  save();
  window.ticket01 = {
    state, writes, messages,
    async advance(ms) { state.now += ms; save(); await tick(); },
    async reading() {
      await chrome.storage.local.set({ accounts: Accounts.applyReading(state.local.accounts,
        { accountId: id, percent: 28, resetsAt: (state.now + 3600000) / 1000 }, state.now) });
    }
  };
})();
