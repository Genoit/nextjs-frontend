import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ADS_ERROR_TEXT,
  adIdFromLibraryUrl,
  adsErrorText,
  isAdLibraryUrl,
  reachLabel,
  runTimeLabel,
  startedAfterFilter,
  parseRefAd,
  strategyChoices,
} from '../lib/ads-rules.mjs';

describe('reachLabel', () => {
  it('formats compactly and labels the estimate', () => {
    assert.strictEqual(reachLabel(1234567), '1.2M EU reach (Meta estimate)');
    assert.strictEqual(reachLabel(12345), '12K EU reach (Meta estimate)');
    assert.strictEqual(reachLabel(999), '999 EU reach (Meta estimate)');
    assert.strictEqual(reachLabel(0), '0 EU reach (Meta estimate)');
  });
  it('handles null', () => {
    assert.strictEqual(reachLabel(null), 'Reach not reported');
  });
  it('rounds before picking the unit at the boundaries', () => {
    const cases = [
      [999, '999'],
      [1000, '1K'],
      [9999, '10K'],
      [10000, '10K'],
      [999499, '999K'],
      [999999, '1M'],
      [1000000, '1M'],
    ];
    for (const [n, out] of cases)
      assert.strictEqual(reachLabel(n), `${out} EU reach (Meta estimate)`, String(n));
  });
});

describe('runTimeLabel', () => {
  it('singular for 0 and 1', () => {
    assert.strictEqual(runTimeLabel(0), '1 day');
    assert.strictEqual(runTimeLabel(1), '1 day');
    assert.strictEqual(runTimeLabel(14), '14 days');
  });
});

describe('error text', () => {
  const codes = [
    'search_limit_reached',
    'follow_limit_reached',
    'capture_limit_reached',
    'capture_lookup_limit',
    'meta_not_configured',
    'meta_busy',
    'ad_not_found',
    'advertiser_not_found',
    'capture_not_found',
    'unsupported_media',
    'file_too_large',
    'invalid_cursor',
  ];
  it('covers every backend code', () => {
    for (const c of codes) assert.ok(ADS_ERROR_TEXT[c], c);
  });
  it('falls back for unknown codes', () => {
    assert.ok(adsErrorText('nope').length > 0);
    assert.ok(adsErrorText(undefined).length > 0);
    assert.strictEqual(adsErrorText('meta_busy'), ADS_ERROR_TEXT.meta_busy);
  });
});

describe('library urls', () => {
  it('recognises Ad Library urls', () => {
    assert.ok(isAdLibraryUrl('https://www.facebook.com/ads/library/?id=123'));
    assert.ok(isAdLibraryUrl('https://facebook.com/ads/library/?id=123'));
    assert.ok(!isAdLibraryUrl('https://evil.com/ads/library/?id=123'));
    assert.ok(!isAdLibraryUrl('https://www.facebook.com.evil.com/ads/library/'));
    assert.ok(!isAdLibraryUrl('https://www.facebook.com/somepage'));
    assert.ok(!isAdLibraryUrl('not a url'));
  });
  it('reads the digits of ?id=', () => {
    assert.strictEqual(
      adIdFromLibraryUrl('https://www.facebook.com/ads/library/?id=12345'),
      '12345',
    );
    assert.strictEqual(adIdFromLibraryUrl('https://www.facebook.com/ads/library/?id=12a'), null);
    assert.strictEqual(adIdFromLibraryUrl('https://www.facebook.com/ads/library/'), null);
    assert.strictEqual(adIdFromLibraryUrl('https://evil.com/ads/library/?id=1'), null);
    assert.strictEqual(adIdFromLibraryUrl('garbage'), null);
  });
});

describe('strategyChoices', () => {
  const s = (id, ref, name = null) => ({ id, ref_ad_id: ref, ref_page_name: name });
  it('keeps the newest of each kind, standard first', () => {
    const got = strategyChoices([
      s('r2', '111', 'Nike'),
      s('st2', null),
      s('r1', '111', 'Nike'),
      s('x', '222'),
      s('st1', null),
    ]);
    assert.deepStrictEqual(got, [
      { id: 'st2', refAdId: null, label: 'Standard' },
      { id: 'r2', refAdId: '111', label: "Inspired by Nike's ad" },
      { id: 'x', refAdId: '222', label: 'Inspired by a removed ad' },
    ]);
  });
  it('has no standard option before one exists', () => {
    assert.deepStrictEqual(
      strategyChoices([s('r', '1', 'A')]).map((c) => c.id),
      ['r'],
    );
  });
});

describe('parseRefAd', () => {
  it('keeps digit-only ad ids', () => {
    assert.strictEqual(parseRefAd('900100000102'), '900100000102');
  });
  it('drops anything else', () => {
    for (const v of [null, undefined, '', 'abc', '12a', '1&x=2', ' 12', '../1', '１２']) {
      assert.strictEqual(parseRefAd(v), undefined, String(v));
    }
  });
});

describe('startedAfterFilter', () => {
  it('applies only full dates from 2000 on, and clearing', () => {
    assert.strictEqual(startedAfterFilter('2026-03-01'), '2026-03-01');
    assert.strictEqual(startedAfterFilter('2000-01-01'), '2000-01-01');
    assert.strictEqual(startedAfterFilter(''), undefined);
    for (const partial of [
      '0002-03-01',
      '0020-03-01',
      '0202-03-01',
      '1999-12-31',
      '2026-02-30',
      '2026-3-1',
      'x',
    ])
      assert.strictEqual(startedAfterFilter(partial), null, partial);
  });
});
