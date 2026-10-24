// Only extension-owned contexts load this module. The capture bridge uses messages.
(() => {
  const FIELDS = ['accounts', 'accountUndo'];
  const FORMAT = 'quotabeacon-aes-gcm-v1';
  let keyPromise;

  function deviceKey() {
    if (!keyPromise) keyPromise = (async () => {
      // A non-extractable key is persisted separately from Account ciphertext.
      // This is not an OS vault: access to the whole browser profile can defeat it.
      const candidate = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('quotabeacon-private', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('keys');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction('keys', 'readwrite');
          const store = transaction.objectStore('keys');
          let key;
          const read = store.get('accounts');
          read.onsuccess = () => {
            key = read.result || candidate;
            if (!read.result) store.put(key, 'accounts');
          };
          transaction.oncomplete = () => { db.close(); resolve(key); };
          transaction.onabort = () => { db.close(); reject(transaction.error); };
        };
      });
    })().catch(error => { keyPromise = null; throw error; });
    return keyPromise;
  }

  function create(storage, getKey = deviceKey) {
    const encrypted = value => value?.format === FORMAT;
    async function get(keys) {
      const result = await storage.get(keys);
      for (const field of FIELDS) {
        const value = result[field];
        if (!encrypted(value)) continue; // Read pre-release plaintext for migration.
        const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(value.iv),
          additionalData: new TextEncoder().encode(field) }, await getKey(), new Uint8Array(value.ciphertext));
        result[field] = JSON.parse(new TextDecoder().decode(bytes));
      }
      return result;
    }
    async function set(values) {
      const result = { ...values };
      for (const field of FIELDS) {
        if (!Object.hasOwn(result, field)) continue;
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv,
          additionalData: new TextEncoder().encode(field) }, await getKey(),
        new TextEncoder().encode(JSON.stringify(result[field])));
        result[field] = { format: FORMAT, iv: [...iv], ciphertext: [...new Uint8Array(ciphertext)] };
      }
      await storage.set(result);
    }
    async function migrate() {
      const stored = await storage.get(FIELDS);
      const legacy = Object.fromEntries(FIELDS.filter(field => Object.hasOwn(stored, field) && !encrypted(stored[field]))
        .map(field => [field, stored[field]]));
      if (Object.keys(legacy).length) await set(legacy);
    }
    return { get, set, migrate };
  }
  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.AccountStorage = api;
})();
