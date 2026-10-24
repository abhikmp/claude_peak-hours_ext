const mode = new URLSearchParams(location.search).get('mode') || 'usage';
const content = {
  usage: ['Your last reading. At a glance.', 'Five-hour quota, captured reset times and public service status. A compact view in either theme.', 'Dark theme', 'Light theme'],
  compare: ['More Accounts. One clear view.', 'Search remembered Accounts, compare observed usage and see when an estimate becomes unknown.', 'Searchable comparison', 'Actual reading age'],
  forget: ['Keep the list that works for you.', 'Forget another Account with confirmation. Undo for 2.5 seconds; a later reading can add it again.', 'Confirmation before removal', 'Undo replaces the footer']
}[mode];
document.getElementById('title').textContent = content[0];
document.getElementById('copy').textContent = content[1];
document.getElementById('dark-caption').textContent = content[2];
document.getElementById('light-caption').textContent = content[3];
for (const frame of document.querySelectorAll('iframe')) {
  const name = `asset05-${mode}-${frame.id}`;
  localStorage.removeItem('ticket01-' + name);
  frame.onload = async () => {
    const win = frame.contentWindow, doc = win.document;
    await new Promise(resolve => setTimeout(resolve, 150));
    if (mode === 'compare') {
      const accounts = structuredClone(win.ticket01.state.local.accounts);
      accounts['account-1'].resetsAt = win.Date.now() / 1000 - 300;
      accounts['account-2'].resetsAt = win.Date.now() / 1000 - 1200;
      accounts['account-3'].percent = 75;
      await win.chrome.storage.local.set({accounts});
      await new Promise(resolve => setTimeout(resolve, 50));
      doc.getElementById('account-next').click();
    } else if (mode === 'forget') {
      doc.getElementById('account-next').click();
      doc.querySelector('tbody tr .account-more').click();
      doc.querySelector('[role="menuitem"]').click();
      if (frame.id === 'light') {
        doc.getElementById('confirm-forget').click();
        await new Promise(resolve => setTimeout(resolve, 100));
        for (const animation of doc.querySelector('.account-undo-line').getAnimations()) {
          animation.pause(); animation.currentTime = 400;
        }
      }
    }
    frame.dataset.ready = 'true';
  };
  frame.src = '/popup/popup.html?' + new URLSearchParams({case:name,count:mode === 'usage' ? 1 : 8,products:'ai',theme:frame.id});
}
