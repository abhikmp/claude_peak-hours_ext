// The narrow quota projection of Bard's StreamTimeline response. Field numbers
// come from streaming.proto / bard_api.proto in Claude's public client bundle.
// See ticket 08 for the source snapshot. No chat fields are decoded or retained.
(function () {
  const MAX_FRAME_BYTES = 32 * 1024 * 1024;

  function fields(bytes) {
    let offset = 0;
    const result = new Map();
    function integer() {
      let value = 0, factor = 1;
      for (let count = 0; count < 10 && offset < bytes.length; count++) {
        const byte = bytes[offset++];
        value += (byte & 127) * factor;
        if (!(byte & 128)) return value;
        factor *= 128;
      }
      throw new Error('Invalid protobuf varint');
    }
    while (offset < bytes.length) {
      const tag = integer(), field = Math.floor(tag / 8), wire = tag % 8;
      if (!Number.isSafeInteger(tag) || field < 1) throw new Error('Invalid protobuf tag');
      let value;
      if (wire === 0) value = integer();
      else if (wire === 1 || wire === 2 || wire === 5) {
        const length = wire === 2 ? integer() : wire === 1 ? 8 : 4;
        if (!Number.isSafeInteger(length) || length < 0 || length > bytes.length - offset) {
          throw new Error('Truncated protobuf field');
        }
        value = bytes.subarray(offset, offset + length);
        offset += length;
      } else throw new Error('Unsupported protobuf wire type');
      if (!result.has(field)) result.set(field, []);
      result.get(field).push({ wire, value });
    }
    return result;
  }

  function message(map, field) {
    const item = map?.get(field)?.at(-1);
    return item?.wire === 2 ? fields(item.value) : null;
  }

  function reading(bytes) {
    // StreamTimelineResponse.event -> StreamEvent.message_limit -> windows.
    const event = message(fields(bytes), 1);
    const limit = message(event, 4);
    for (const entry of limit?.get(13) ?? []) {
      if (entry.wire !== 2) continue;
      const map = fields(entry.value), key = map.get(1)?.at(-1);
      if (key?.wire !== 2 || key.value.length !== 2 || key.value[0] !== 53 || key.value[1] !== 104) continue; // "5h"
      const window = message(map, 2), value = window?.get(3)?.at(-1);
      // Utilization is optional: absence is not a zero-percent observation.
      if (value?.wire !== 1 || value.value.length !== 8) return null;
      const utilization = new DataView(value.value.buffer, value.value.byteOffset, 8).getFloat64(0, true);
      if (!Number.isFinite(utilization) || utilization < 0) return null;
      const timestamp = message(window, 2), seconds = timestamp?.get(1)?.at(-1);
      const resetsAt = timestamp ? seconds?.value ?? 0 : null;
      if (seconds && seconds.wire !== 0) return null;
      if (resetsAt !== null && (!Number.isSafeInteger(resetsAt) || resetsAt < 0)) return null;
      return { percent: Math.min(100, utilization * 100), resetsAt };
    }
    return null;
  }

  async function read(reader, encoding, onReading) {
    let chunk = new Uint8Array(0), offset = 0;
    // Allocate each envelope once, even when its header or body spans many
    // network chunks. Never concatenate an ever-growing response buffer.
    async function take(length, allowEnd = false) {
      const output = new Uint8Array(length);
      let filled = 0;
      while (filled < length) {
        if (offset === chunk.length) {
          const next = await reader.read();
          if (next.done) {
            if (allowEnd && filled === 0) return null;
            throw new Error('Truncated Connect envelope');
          }
          chunk = next.value;
          offset = 0;
          if (!chunk.length) continue;
        }
        const count = Math.min(length - filled, chunk.length - offset);
        output.set(chunk.subarray(offset, offset + count), filled);
        offset += count;
        filled += count;
      }
      return output;
    }
    while (true) {
      const header = await take(5, true);
      if (!header) return;
      const flags = header[0], length = new DataView(header.buffer).getUint32(1);
      if (flags & ~3 || length > MAX_FRAME_BYTES) throw new Error('Invalid Connect envelope');
      let payload = await take(length);
      if (flags & 2) return; // EndStream JSON is not a quota event.
      if (flags & 1) {
        if (encoding !== 'gzip') throw new Error('Unsupported Connect compression');
        const stream = new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'));
        payload = new Uint8Array(await new Response(stream).arrayBuffer());
        if (payload.length > MAX_FRAME_BYTES) throw new Error('Oversized Connect message');
      }
      const value = reading(payload);
      if (value) onReading(value);
    }
  }

  globalThis.ConnectUsage = { read };
})();
