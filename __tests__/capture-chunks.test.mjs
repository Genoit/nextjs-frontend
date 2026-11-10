import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isFbcdnUrl, joinBase64, splitBase64 } from '../lib/capture-chunks.mjs';

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

describe('isFbcdnUrl', () => {
  it('accepts https fbcdn hosts only', () => {
    assert.ok(isFbcdnUrl('https://video-cdg4-1.xx.fbcdn.net/v/t42/a.mp4?x=1'));
    assert.ok(isFbcdnUrl('https://fbcdn.net/a.png'));
  });
  it('rejects look-alikes, other schemes and junk', () => {
    for (const u of [
      'http://scontent.fbcdn.net/a.png',
      'https://evil-fbcdn.net/a.png',
      'https://fbcdn.net.evil.com/a.png',
      'https://scontent.fbcdn.net@evil.com/a.png',
      'http://localhost:3000/x.png',
      'data:image/png;base64,AAAA',
      'blob:https://x.fbcdn.net/1',
      'not a url',
      '',
    ])
      assert.strictEqual(isFbcdnUrl(u), false, u);
  });
});
