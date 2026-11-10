import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MANIFEST_KEY,
  chunkKey,
  handoffPrefix,
  isFbcdnUrl,
  isReadyManifest,
  joinBase64,
  manifestChunkKeys,
  splitBase64,
} from '../lib/capture-chunks.mjs';

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

describe('hand-off keys (manifest + one key per chunk)', () => {
  it('builds one key per chunk under the nonce prefix', () => {
    assert.strictEqual(MANIFEST_KEY, 'trended:ad-capture');
    assert.strictEqual(chunkKey('n1', 0, 3), 'trended:ad-capture:n1:0:3');
    assert.strictEqual(handoffPrefix('n1'), 'trended:ad-capture:n1:');
    assert.strictEqual(handoffPrefix(), 'trended:ad-capture:');
    assert.ok(chunkKey('n1', 2, 11).startsWith(handoffPrefix('n1')));
    assert.ok(!chunkKey('n10', 0, 0).startsWith(handoffPrefix('n1')));
    const m = {
      nonce: 'n1',
      files: [
        { name: 'a', type: 'image/png', chunks: 2 },
        { name: 'b', type: 'video/mp4', chunks: 1 },
      ],
    };
    assert.deepStrictEqual(manifestChunkKeys(m), [
      ['trended:ad-capture:n1:0:0', 'trended:ad-capture:n1:0:1'],
      ['trended:ad-capture:n1:1:0'],
    ]);
  });
  it('accepts only a complete manifest of this nonce', () => {
    const m = {
      nonce: 'n1',
      adId: '1',
      pageId: '2',
      complete: true,
      files: [{ name: 'a', type: 'image/png', chunks: 1 }],
    };
    assert.ok(isReadyManifest(m, 'n1'));
    assert.ok(!isReadyManifest(m, 'old'));
    assert.ok(!isReadyManifest({ ...m, complete: false }, 'n1'));
    assert.ok(!isReadyManifest({ ...m, files: [] }, 'n1'));
    assert.ok(!isReadyManifest({ ...m, files: [{ name: 'a', type: 'x', chunks: '1' }] }, 'n1'));
    assert.ok(!isReadyManifest(undefined, 'n1'));
    assert.ok(!isReadyManifest(m, ''));
  });
  it('reassembles files in chunk order past 10 chunks', () => {
    const bytes = Uint8Array.from({ length: 1200 }, (_, i) => (i * 13) % 256);
    const chunks = splitBase64(bytes, 100);
    assert.ok(chunks.length > 10);
    const m = { nonce: 'z', files: [{ name: 'a', type: 'image/png', chunks: chunks.length }] };
    const store = new Map(chunks.map((c, i) => [chunkKey('z', 0, i), c]));
    const [keys] = manifestChunkKeys(m);
    // A store returns keys sorted as strings ("10" < "2"): order must come from the manifest.
    assert.deepStrictEqual(joinBase64(keys.map((k) => store.get(k))), bytes);
  });
});
