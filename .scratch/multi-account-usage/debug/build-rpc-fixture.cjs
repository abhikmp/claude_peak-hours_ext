// Encode only the sanitized quota fields observed live. No client code is run.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
function varint(value) {
  const bytes = [];
  do { bytes.push((value % 128) | (value >= 128 ? 128 : 0)); value = Math.floor(value / 128); } while (value);
  return Buffer.from(bytes);
}
function integer(field, value) { return Buffer.concat([varint(field * 8), varint(value)]); }
function nested(field, bytes) { return Buffer.concat([varint(field * 8 + 2), varint(bytes.length), bytes]); }
function double(field, number) { const bytes = Buffer.alloc(8); bytes.writeDoubleLE(number); return Buffer.concat([varint(field * 8 + 1), bytes]); }
function window(key, usage, reset) {
  const value = Buffer.concat([integer(1, 1), nested(2, integer(1, reset)), ...(usage === null ? [] : [double(3, usage)])]);
  return nested(13, Buffer.concat([nested(1, Buffer.from(key)), nested(2, value)]));
}
const limit = Buffer.concat([integer(1, 1), window('5h', 0.6, 1800018000), window('7d', 0.03, 1800604800)]);
const message = nested(1, nested(4, limit));
function envelope(bytes, flags = 0) { const header = Buffer.alloc(5); header[0] = flags; header.writeUInt32BE(bytes.length, 1); return Buffer.concat([header, bytes]); }
const fixture = {
  description: 'Live Bard MessageLimit shape: five-hour utilization 0.6 and weekly 0.03. Reset timestamps normalized to the fixed test clock; all chat and identity fields omitted.',
  path: '/claudeai-rpc/anthropic.bard.api.v1alpha.ConversationService/StreamTimeline',
  gzipBase64: envelope(zlib.gzipSync(message), 1).toString('base64'),
  identityBase64: envelope(message).toString('base64'),
  withoutUtilizationBase64: envelope(nested(1, nested(4, window('5h', null, 1800018000)))).toString('base64'),
  weeklyOnlyBase64: envelope(nested(1, nested(4, window('7d', 0.03, 1800604800)))).toString('base64'),
  zeroBase64: envelope(nested(1, nested(4, window('5h', 0, 1800018000)))).toString('base64'),
  exhaustedBase64: envelope(nested(1, nested(4, window('5h', 1.2, 1800018000)))).toString('base64')
};
const directory = path.resolve(__dirname, '../../../tests/fixtures');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'bard-message-limit.json'), JSON.stringify(fixture, null, 2) + '\n');
