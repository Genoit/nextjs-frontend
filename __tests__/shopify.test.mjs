import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SYNC_LABEL, canSend, diffLabel, storeLimitText } from '../lib/shopify-rules.mjs';

describe('shopify rules', () => {
  it('labels sync states', () => {
    assert.strictEqual(SYNC_LABEL.pending_review, 'Needs review');
    assert.strictEqual(SYNC_LABEL.conflict, 'Conflict');
  });

  it('formats the store limit', () => {
    assert.strictEqual(storeLimitText(1, 3), '1 of 3 stores');
    assert.strictEqual(storeLimitText(0, 1), '0 of 1 store');
    assert.strictEqual(storeLimitText(0, 0), 'Upgrade to connect a store');
  });

  it('labels diff fields', () => {
    assert.strictEqual(diffLabel('title'), 'Title');
    assert.strictEqual(diffLabel('description'), 'Description');
    assert.strictEqual(diffLabel('price:abc'), 'Price (abc)');
    assert.strictEqual(diffLabel('compare_at:abc'), 'Compare-at price (abc)');
    assert.strictEqual(diffLabel('options:abc'), 'Options (abc)');
    assert.strictEqual(
      diffLabel('unmanaged_variant:gid://shopify/ProductVariant/1'),
      'Added in Shopify, not managed by TrendED',
    );
  });

  it('blocks send on missing costs or a preview error', () => {
    const ok = [{ price: '9.99' }];
    assert.strictEqual(canSend({ missing_costs: [], previews: { s1: ok } }), true);
    assert.strictEqual(canSend({ missing_costs: ['v1'], previews: {} }), false);
    assert.strictEqual(
      canSend({ missing_costs: [], previews: { s1: ok, s2: { error: 'fx_unavailable', currency: 'CNY' } } }),
      false,
    );
    assert.strictEqual(
      canSend({ missing_costs: [], previews: { s1: { error: 'missing_purchase_cost', variants: ['v1'] } } }),
      false,
    );
  });
});
