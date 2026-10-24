// Disposable browser boundary only. Account rules, queue, worker, and UI are real.
(() => {
  const { state, messages } = ticket01;
  if (new URLSearchParams(location.search).has('reducedMotion')) {
    const nativeMedia = window.matchMedia.bind(window);
    window.matchMedia = query => query.includes('prefers-reduced-motion')
      ? { matches: true, addEventListener() {} } : nativeMedia(query);
    document.addEventListener('DOMContentLoaded', () => {
      for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
        if (rule.media?.mediaText.includes('prefers-reduced-motion')) rule.media.mediaText = 'all';
      }
    });
  }
  const callbacks = [];
  const timers = new Map();
  const nativeTimeout = window.setTimeout.bind(window);
  let nextTimer = 1;
  window.setTimeout = (callback, delay = 0) => {
    const id = nextTimer++;
    timers.set(id, { callback, at: state.now + delay });
    return id;
  };
  window.setInterval = (callback, delay) => {
    const id = nextTimer++;
    timers.set(id, { callback, at: state.now + delay, interval: delay });
    return id;
  };
  window.clearInterval = window.clearTimeout = id => timers.delete(id);
  chrome.runtime.id = 'disposable-ticket04';
  chrome.runtime.onMessage = { addListener: callback => callbacks.push(callback) };
  chrome.runtime.onInstalled = chrome.runtime.onStartup = { addListener() {} };
  chrome.alarms = { create() {}, onAlarm: { addListener() {} } };
  const toolbar = [];
  chrome.action = {
    setIcon: value => toolbar.push(value), setBadgeText: () => { throw Error('Unexpected badge change'); },
    setTitle: () => { throw Error('Unexpected tooltip change'); }
  };
  window.importScripts = () => {}; // Already loaded the exact shared script paths.
  chrome.runtime.sendMessage = async message => {
    if (message.command?.action !== 'getUndo') messages.push(message.type);
    if (message.type !== 'ACCOUNT_MUTATION') return;
    return new Promise(resolve => callbacks[0](message, { id: chrome.runtime.id }, resolve));
  };
  const settle = () => new Promise(resolve => nativeTimeout(resolve, 0));
  ticket01.advance = async ms => {
    state.now += ms;
    localStorage.setItem('ticket01-' + new URLSearchParams(location.search).get('case'), JSON.stringify(state));
    await render();
    for (const [id, task] of [...timers]) {
      if (task.at > state.now || !timers.has(id)) continue;
      if (task.interval) task.at = state.now + task.interval;
      else timers.delete(id);
      await task.callback();
      await settle();
    }
    await settle();
  };
  ticket01.mutate = command => chrome.runtime.sendMessage({ type: 'ACCOUNT_MUTATION', command });
  ticket01.toolbar = toolbar;
  ticket01.errors = [];
  window.addEventListener('error', event => ticket01.errors.push(event.message));
  window.addEventListener('unhandledrejection', event => ticket01.errors.push(String(event.reason)));
})();
