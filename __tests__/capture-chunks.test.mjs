import { describe, it } from 'node:test';
import assert from 'node:assert';
import { joinBase64, splitBase64 } from '../lib/capture-chunks.mjs';

describe('capture chunks', () => {
  it('round-trips bytes split across several chunks', () => {
    const bytes = Uint8Array.from({ length: 1000 }, (_, i) => (i * 7) % 256);
    const chunks = splitBase64(bytes, 100);
    assert.ok(chunks.length > 2);
    assert.ok(chunks.every((c) => c.length <= 100));
    assert.deepStrictEqual(joinBase64(chunks), bytes);
  });
  it('handles empty and tiny input', () => {
    assert.deepStrictEqual(joinBase64(splitBase64(new Uint8Array(0))), new Uint8Array(0));
    const one = Uint8Array.of(1, 2);
    assert.deepStrictEqual(joinBase64(splitBase64(one)), one);
  });
});
