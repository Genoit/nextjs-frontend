import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  anyExportInFlight,
  exportRows,
  exportTransitionMessage,
  exportsByRatio,
  finishingBadges,
  finishingCheckLabel,
  finishingView,
  historyView,
  mediaSource,
  musicChoiceOf,
  musicFileError,
  musicPreferences,
  parseMoods,
  trackDuration,
} from '../lib/finishing-rules.mjs';

const exp = (id, ratio, status, at = '2026-10-28T10:00:00Z') => ({
  id,
  aspect_ratio: ratio,
  status,
  created_at: at,
  updated_at: at,
});

describe('finishing report', () => {
  it('labels checks in French and keeps unknown names', () => {
    assert.strictEqual(finishingCheckLabel('true_peak'), 'Crête sonore (dBTP)');
    assert.strictEqual(finishingCheckLabel('new_check'), 'new_check');
  });

  it('lists issues, counts passes, never reads a fail as passed', () => {
    const v = finishingView({
      passed: true,
      checks: [
        { name: 'fps', status: 'pass' },
        { name: 'music', status: 'skipped' },
        { name: 'true_peak', status: 'warn' },
        { name: 'duration', status: 'fail', blocking: true },
        { name: 'x', status: 'weird' },
      ],
      voiceover: { is_mock: false, status: 'real' },
      music: { track_id: 't' },
    });
    assert.strictEqual(v.passed, false);
    assert.strictEqual(v.blockingFails, 1);
    assert.deepStrictEqual(
      v.issues.map((c) => c.name),
      ['true_peak', 'duration', 'x'],
    );
    assert.strictEqual(v.passedCount, 1);
    assert.strictEqual(v.others.length, 2);
    assert.deepStrictEqual(v.badges, []);
    assert.strictEqual(finishingView(null), null);
  });

  it('flags mock, missing and uncertain voice-over, and no music', () => {
    const b = (voiceover, music = null) => finishingBadges({ voiceover, music });
    assert.deepStrictEqual(b({ is_mock: true, status: 'mock' }), ['Voix simulée', 'Sans musique']);
    assert.deepStrictEqual(b({ is_mock: false, status: 'none' }, {}), ['Sans voix off']);
    assert.deepStrictEqual(b({ is_mock: false, status: 'unavailable' }, {}), ['Sans voix off']);
    assert.deepStrictEqual(b({ is_mock: false, status: 'uncertain' }, {}), ['Voix off incertaine']);
    assert.deepStrictEqual(b(undefined, {}), ['Voix off incertaine']);
  });
});

describe('exports', () => {
  it('keeps a completed export over a newer failure, else the latest', () => {
    const by = exportsByRatio([
      exp('a', '1:1', 'completed', '2026-10-28T10:00:00Z'),
      exp('b', '1:1', 'failed', '2026-10-28T11:00:00Z'),
      exp('c', '16:9', 'failed', '2026-10-28T10:00:00Z'),
      exp('d', '16:9', 'rendering', '2026-10-28T11:00:00Z'),
    ]);
    assert.strictEqual(by['1:1'].id, 'a');
    assert.strictEqual(by['16:9'].id, 'd');
  });

  it('offers the button only for missing or failed formats, and shows the primary', () => {
    const rows = exportRows(
      [exp('p', '4:5', 'completed'), exp('a', '1:1', 'pending'), exp('b', '16:9', 'failed')],
      '4:5',
    );
    assert.deepStrictEqual(
      rows.map((r) => [r.ratio, r.exp?.id ?? null, r.canExport]),
      [
        ['9:16', null, true],
        ['1:1', 'a', false],
        ['16:9', 'b', true],
        ['4:5', 'p', false],
      ],
    );
  });

  it('polls only while an export is pending or rendering', () => {
    assert.strictEqual(anyExportInFlight([exp('a', '1:1', 'rendering')]), true);
    assert.strictEqual(anyExportInFlight([exp('a', '1:1', 'completed')]), false);
    assert.strictEqual(anyExportInFlight(null), false);
  });

  it('announces status changes and new exports', () => {
    assert.strictEqual(
      exportTransitionMessage(
        [exp('a', '1:1', 'rendering')],
        [exp('a', '1:1', 'completed'), exp('b', '16:9', 'pending')],
      ),
      'Export 1:1 : Prêt. Export 16:9 : En attente.',
    );
    assert.strictEqual(exportTransitionMessage(null, []), '');
  });
});

describe('mediaSource', () => {
  const base = 'http://localhost:8000/api/v1';
  it('strips the API prefix for authed fetches', () => {
    assert.deepStrictEqual(mediaSource('/api/v1/creative/assets/x/download', base), {
      kind: 'authed',
      endpoint: '/creative/assets/x/download',
    });
    assert.deepStrictEqual(mediaSource(`${base}/creative/assets/x/download`, base), {
      kind: 'authed',
      endpoint: '/creative/assets/x/download',
    });
    assert.deepStrictEqual(mediaSource('/creative/assets/x/download', base), {
      kind: 'authed',
      endpoint: '/creative/assets/x/download',
    });
  });
  it('uses foreign (presigned) URLs directly, without the token', () => {
    const url = 'https://bucket.s3.amazonaws.com/x.jpg?X-Amz-Signature=1';
    assert.deepStrictEqual(mediaSource(url, base), { kind: 'direct', url });
    assert.strictEqual(mediaSource(null, base), null);
  });
});

describe('music', () => {
  it('pre-checks type and size', () => {
    assert.strictEqual(musicFileError({ name: 'a.MP3', size: 1000 }), null);
    assert.strictEqual(musicFileError({ name: 'a.m4a', size: 15 * 1024 * 1024 }), null);
    assert.match(musicFileError({ name: 'a.ogg', size: 10 }), /MP3, WAV ou M4A/);
    assert.match(musicFileError({ name: 'a.wav', size: 15 * 1024 * 1024 + 1 }), /15 Mo/);
    assert.match(musicFileError({ name: 'a.wav', size: 0 }), /vide/);
    assert.match(musicFileError(null), /Choisissez/);
  });

  it('formats durations and moods', () => {
    assert.strictEqual(trackDuration(65.4), '1:05');
    assert.strictEqual(trackDuration(null), '—');
    assert.deepStrictEqual(parseMoods(' upbeat, calm,,upbeat '), ['upbeat', 'calm']);
  });

  it('round-trips the music choice through music_preferences', () => {
    assert.deepStrictEqual(musicPreferences('none', 'calm'), { mood: 'none', track_id: null });
    assert.deepStrictEqual(musicPreferences('auto', 'calm'), { mood: 'calm', track_id: null });
    assert.deepStrictEqual(musicPreferences('t1', 'calm'), { mood: 'calm', track_id: 't1' });
    assert.strictEqual(musicChoiceOf(musicPreferences('none', 'calm')), 'none');
    assert.strictEqual(musicChoiceOf(musicPreferences('auto', 'calm')), 'auto');
    assert.strictEqual(musicChoiceOf(musicPreferences('t1', 'calm')), 't1');
    assert.strictEqual(musicChoiceOf(undefined), 'auto');
  });
});

describe('historyView', () => {
  it('lists completed formats once, with thumbnail and cost', () => {
    const v = historyView({
      thumbnail_url: '/t',
      actual_cost: '0.4',
      exports: [
        exp('a', '9:16', 'completed'),
        exp('b', '1:1', 'failed'),
        exp('c', '9:16', 'completed'),
      ],
    });
    assert.deepStrictEqual(v, { formats: ['9:16'], thumbnailUrl: '/t', cost: '0.4' });
  });
});
