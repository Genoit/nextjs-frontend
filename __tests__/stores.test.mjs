import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  bestSellersUrl,
  changeText,
  countLabel,
  isSettling,
  listingInfo,
  money,
  readAgo,
  storeState,
  storesErrorText,
} from '../lib/stores-rules.mjs';

describe('storeState', () => {
  it('lets a paused follow win over the store status', () => {
    assert.strictEqual(storeState('ok', true).label, 'Paused');
    assert.strictEqual(storeState('blocked', true).tone, 'neutral');
  });
  it('maps every status, unknown ones included', () => {
    assert.strictEqual(storeState('ok', false).tone, 'success');
    assert.strictEqual(storeState('ok', false).hint, null);
    assert.strictEqual(storeState('pending', false).tone, 'warning');
    for (const s of ['not_shopify', 'blocked', 'unreachable', 'whatever']) {
      const state = storeState(s, false);
      assert.strictEqual(state.tone, 'danger', s);
      assert.ok(state.hint, s);
    }
  });
  it('waits only for a first reading that is not paused', () => {
    assert.strictEqual(isSettling({ status: 'pending', paused: false }), true);
    assert.strictEqual(isSettling({ status: 'pending', paused: true }), false);
    assert.strictEqual(isSettling({ status: 'ok', paused: false }), false);
  });
});

describe('money', () => {
  it('keeps two decimals and the currency', () => {
    assert.strictEqual(money('19.9', 'EUR'), '19.90 EUR');
    assert.strictEqual(money(5, null), '5.00');
    assert.strictEqual(money(null, 'EUR'), '');
    assert.strictEqual(money('abc', 'EUR'), '');
  });
});

describe('changeText', () => {
  const c = (kind, before, after) => changeText({ kind, old: before, new: after }, 'EUR');
  it('says which way a price moved and by how much', () => {
    assert.deepStrictEqual(c('price', '19.99', '14.99'), {
      text: 'Price down 25%: 19.99 EUR → 14.99 EUR',
      tone: 'down',
    });
    assert.strictEqual(c('price', '10.00', '12.00').text, 'Price up 20%: 10.00 EUR → 12.00 EUR');
    assert.strictEqual(c('price', '100.00', '100.10').tone, 'edit'); // rounds to 0 %
    assert.strictEqual(c('price', '0.00', '5.00').tone, 'edit'); // no percentage from zero
  });
  it('describes a discount appearing, changing and going away', () => {
    assert.strictEqual(
      c('compare_at', null, '29.99').text,
      'Now shown as discounted from 29.99 EUR',
    );
    assert.strictEqual(
      c('compare_at', '29.99', null).text,
      'Discount removed (was from 29.99 EUR)',
    );
    assert.strictEqual(c('compare_at', '29.99', '39.99').tone, 'edit');
  });
  it('covers the other kinds and unknown ones', () => {
    assert.strictEqual(c('product_added', null, 'Lamp').tone, 'plus');
    assert.strictEqual(c('product_removed', 'Lamp', null).tone, 'minus');
    assert.strictEqual(c('availability', 'sold out', 'in stock').text, 'Back in stock');
    assert.strictEqual(c('availability', 'in stock', 'sold out').text, 'Sold out');
    assert.strictEqual(c('theme', 'Dawn', 'Shrine').text, 'Theme changed from Dawn to Shrine');
    assert.strictEqual(c('app_added', null, 'Loox').text, 'Installed Loox');
    assert.strictEqual(c('app_removed', 'Loox', null).text, 'Removed Loox');
    assert.strictEqual(c('title', 'A', 'B').text, 'Renamed from “A” to “B”');
    assert.strictEqual(c('future_kind', null, null).text, 'Change');
  });
});

describe('readAgo', () => {
  const now = Date.parse('2026-11-12T12:00:00Z');
  it('scales the unit', () => {
    assert.strictEqual(readAgo(null, now), 'Not read yet');
    assert.strictEqual(readAgo('garbage', now), 'Not read yet');
    assert.strictEqual(readAgo('2026-11-12T11:59:40Z', now), 'Read just now');
    assert.strictEqual(readAgo('2026-11-12T11:15:00Z', now), 'Read 45 min ago');
    assert.strictEqual(readAgo('2026-11-12T09:00:00Z', now), 'Read 3 h ago');
    assert.strictEqual(readAgo('2026-11-09T12:00:00Z', now), 'Read 3 days ago');
    assert.strictEqual(readAgo('2026-11-12T12:05:00Z', now), 'Read just now'); // clock skew
  });
});

describe('labels', () => {
  it('pluralises and falls back', () => {
    assert.strictEqual(countLabel(1, 'product', 'products'), '1 product');
    assert.strictEqual(countLabel(1200, 'product', 'products'), '1,200 products');
    assert.match(storesErrorText('store_limit_reached'), /Pause a store or upgrade/);
    assert.strictEqual(storesErrorText('nope'), 'Something went wrong. Please try again.');
  });
});

describe('listingInfo', () => {
  it('calls it best sellers only when the page is in best-selling order', () => {
    const best = listingInfo({ is_shopify: true, best_selling: true, products: [1] });
    assert.strictEqual(best.heading, 'Best sellers');
    assert.strictEqual(best.suggestBestSellers, false);
    const plain = listingInfo({ is_shopify: true, best_selling: false, products: [1] });
    assert.strictEqual(plain.heading, 'Products on this page');
    assert.match(plain.note, /not a sales ranking/);
    assert.strictEqual(plain.suggestBestSellers, true);
  });
  it('says when nothing was found and never suggests on a non-Shopify page', () => {
    const none = listingInfo({ is_shopify: false, best_selling: false, products: [] });
    assert.match(none.note, /No product link/);
    assert.strictEqual(none.suggestBestSellers, false);
    assert.strictEqual(
      bestSellersUrl('acme.com'),
      'https://acme.com/collections/all?sort_by=best-selling',
    );
  });
});
