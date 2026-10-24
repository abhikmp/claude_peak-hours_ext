const evidenceButton = document.createElement('button');
evidenceButton.textContent = 'Save regression evidence';
evidenceButton.onclick = async () => {
  const name = 'ticket' + location.pathname.match(/\/(0[123])-validation/)[1];
  await fetch('/qa-save/' + name, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:document.getElementById('results').textContent})});
  evidenceButton.textContent = 'Evidence saved';
};
document.body.prepend(evidenceButton);
