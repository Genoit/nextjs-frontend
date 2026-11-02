import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  adsFor,
  creditsText,
  founderPrice,
  isSubscribed,
  videoTime,
} from '../lib/billing-rules.mjs';

describe('billing rules', () => {
  it('pluralizes credits', () => {
    assert.strictEqual(creditsText(1), '1 credit');
    assert.strictEqual(creditsText(0), '0 credits');
  });
  it('turns credits into video time and ads', () => {
    assert.strictEqual(videoTime(2, 15), '30 s');
    assert.strictEqual(videoTime(16, 15), '4 min');
    assert.strictEqual(videoTime(5, 15), '1 min 15 s');
    assert.strictEqual(adsFor(16, 30, 15), 8);
    assert.strictEqual(adsFor(16, 15, 15), 16);
    assert.strictEqual(adsFor(1, 30, 15), 0);
  });
  it('only counts live paid subscriptions', () => {
    assert.strictEqual(isSubscribed({ plan: 'pro', subscription_status: 'active' }), true);
    assert.strictEqual(isSubscribed({ plan: 'pro', subscription_status: 'canceled' }), false);
    assert.strictEqual(isSubscribed({ plan: 'free', subscription_status: null }), false);
  });
  it('applies the founder discount', () => {
    assert.strictEqual(founderPrice('19'), '14.25');
    assert.strictEqual(founderPrice(39), '29.25');
  });
});
