import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampSeconds,
  formatSeconds,
  parseAdSettings,
  platformOf,
} from '../lib/ad-settings-rules.mjs';

test('clampSeconds snaps to 5 s steps inside 10..60', () => {
  assert.equal(clampSeconds(3), 10);
  assert.equal(clampSeconds(22), 20);
  assert.equal(clampSeconds(23), 25);
  assert.equal(clampSeconds(90), 60);
  assert.equal(clampSeconds('x'), 15);
});

test('formatSeconds shows a minute as 1 min', () => {
  assert.equal(formatSeconds(15), '15s');
  assert.equal(formatSeconds(60), '1 min');
});

test('platformOf follows the format', () => {
  assert.equal(platformOf('9:16'), 'tiktok');
  assert.equal(platformOf('16:9'), 'youtube');
  assert.equal(platformOf('nope'), 'tiktok');
});

test('parseAdSettings keeps only a complete, valid composer choice', () => {
  assert.deepEqual(parseAdSettings('{"format":"1:1","language":"fr","duration":31}'), {
    aspect_ratio: '1:1',
    language: 'fr',
    target_duration: 30,
    platform: 'instagram_reels',
  });
  assert.equal(parseAdSettings(null), null);
  assert.equal(parseAdSettings('not json'), null);
  assert.equal(parseAdSettings('{"format":"2:3","language":"fr","duration":15}'), null);
  assert.equal(parseAdSettings('{"format":"9:16","language":"it","duration":15}'), null);
  assert.equal(parseAdSettings('{"format":"9:16","language":"fr"}'), null);
});
