import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  compactEdits,
  currentExport,
  fullEdits,
  pushHistory,
  rulerMarks,
  sameRender,
  sceneBlocks,
  timecode,
} from '../lib/studio-rules.mjs';

describe('edits', () => {
  it('drops defaults and unknown keys like the API', () => {
    assert.deepStrictEqual(
      compactEdits({ captions: true, effect: 'bw', music_gain_db: null, junk: 1 }),
      { effect: 'bw' },
    );
    assert.strictEqual(fullEdits({ effect: 'bw' }).caption_style, 'bold');
  });
  it('compares renders by track and settings', () => {
    const a = { track_id: null, edits: { effect: 'bw', captions: true } };
    assert.ok(sameRender(a, { track_id: null, edits: { effect: 'bw' } }));
    assert.ok(!sameRender(a, { track_id: 't', edits: { effect: 'bw' } }));
    assert.ok(!sameRender(a, { track_id: null, edits: {} }));
  });
});

describe('currentExport', () => {
  it('takes the newest completed export of the job ratio', () => {
    const rows = [
      { id: 'a', status: 'completed', aspect_ratio: '9:16', updated_at: '2026-11-01T00:00:00Z' },
      { id: 'b', status: 'completed', aspect_ratio: '1:1', updated_at: '2026-11-03T00:00:00Z' },
      { id: 'c', status: 'failed', aspect_ratio: '9:16', updated_at: '2026-11-04T00:00:00Z' },
      { id: 'd', status: 'completed', aspect_ratio: '9:16', updated_at: '2026-11-02T00:00:00Z' },
    ];
    assert.strictEqual(currentExport(rows, '9:16').id, 'd');
    assert.strictEqual(currentExport([], '9:16'), null);
  });
});

describe('timeline', () => {
  it('formats timecodes without rounding up to 60', () => {
    assert.strictEqual(timecode(59.7), '00:59');
    assert.strictEqual(timecode(75), '01:15');
    assert.strictEqual(timecode(NaN), '00:00');
  });
  it('picks a readable ruler step', () => {
    assert.deepStrictEqual(rulerMarks(15), [0, 5, 10, 15]);
    assert.deepStrictEqual(rulerMarks(4), [0, 1, 2, 3, 4]);
    assert.deepStrictEqual(rulerMarks(0), [0]);
  });
  it('reads scene blocks from the EDL and skips broken ones', () => {
    const blocks = sceneBlocks({
      scenes: [
        { order: 1, start: 0, duration: 3, vo_text: 'Hi', overlay_text: null },
        { order: 2, start: 'x', duration: 3 },
      ],
    });
    assert.deepStrictEqual(blocks, [{ order: 1, start: 0, duration: 3, voice: 'Hi', overlay: '' }]);
    assert.deepStrictEqual(sceneBlocks(undefined), []);
  });
});

describe('pushHistory', () => {
  it('truncates redo and skips duplicates', () => {
    let h = { past: [], index: -1 };
    h = pushHistory(h, { track_id: null, edits: {} });
    h = pushHistory(h, { track_id: null, edits: { effect: 'bw' } });
    h = pushHistory(h, { track_id: null, edits: { effect: 'bw' } });
    assert.strictEqual(h.past.length, 2);
    h = pushHistory({ ...h, index: 0 }, { track_id: null, edits: { effect: 'warm' } });
    assert.deepStrictEqual(
      h.past.map((e) => e.edits.effect ?? 'none'),
      ['none', 'warm'],
    );
  });
});
