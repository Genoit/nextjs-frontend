import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  STORE_LIMIT,
  SYNC_LABEL,
  canSend,
  conflictChoices,
  diffLabel,
  readShopifyCallback,
  sendBlocker,
  shopifyErrorText,
  storeLimitText,
  stripInstallParams,
} from '../lib/shopify-rules.mjs';

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
      canSend({
        missing_costs: [],
        previews: { s1: ok, s2: { error: 'fx_unavailable', currency: 'CNY' } },
      }),
      false,
    );
    assert.strictEqual(
      canSend({
        missing_costs: [],
        previews: { s1: { error: 'missing_purchase_cost', variants: ['v1'] } },
      }),
      false,
    );
  });

  it('maps plans to store limits', () => {
    assert.deepStrictEqual(STORE_LIMIT, { free: 0, starter: 1, pro: 3, business: 10 });
  });

  it('reads the Shopify callback params', () => {
    assert.deepStrictEqual(readShopifyCallback('?shopify=confirm&install=t1'), {
      kind: 'confirm',
      ticket: 't1',
    });
    assert.deepStrictEqual(readShopifyCallback('shopify=error'), { kind: 'error' });
    // A ticket without the confirm marker is still stripped, and never confirmed.
    assert.deepStrictEqual(readShopifyCallback('?install=t1'), { kind: 'error' });
    assert.deepStrictEqual(readShopifyCallback('?shopify=confirm'), { kind: 'error' });
    assert.strictEqual(readShopifyCallback(''), null);
    assert.strictEqual(readShopifyCallback('?tab=x'), null);
  });

  it('strips the install ticket from a return path', () => {
    assert.strictEqual(stripInstallParams('/settings?shopify=confirm&install=secret'), '/settings');
    assert.strictEqual(
      stripInstallParams('/settings?a=1&install=s#stores'),
      '/settings?a=1#stores',
    );
    assert.strictEqual(stripInstallParams('/products/1'), '/products/1');
  });

  it('turns backend codes into English', () => {
    assert.match(shopifyErrorText('install_expired'), /expired/);
    assert.match(shopifyErrorText('install_user_mismatch'), /another TrendED account/);
    assert.match(shopifyErrorText('store_limit_reached'), /limit/);
    assert.match(shopifyErrorText('shop_already_connected'), /already connected/);
    assert.match(shopifyErrorText('whatever'), /Try again/);
  });

  it('offers only safe conflict choices', () => {
    assert.deepStrictEqual(conflictChoices('title'), ['trended', 'shopify']);
    assert.deepStrictEqual(conflictChoices('price:v1'), ['trended', 'shopify']);
    assert.deepStrictEqual(conflictChoices('options:v1'), ['trended']);
    assert.deepStrictEqual(conflictChoices('unmanaged_variant:gid://x/1'), []);
  });

  it('says why a send is blocked', () => {
    const ok = [{ price: '9.99' }];
    const listing = { title: 'Lamp', missing_costs: [], previews: { s1: ok, s2: ok } };
    assert.strictEqual(sendBlocker(listing, { dirty: false, picked: ['s1'] }), null);
    assert.match(sendBlocker(listing, { dirty: true, picked: ['s1'] }), /Save/);
    assert.match(sendBlocker(listing, { dirty: false, picked: [] }), /Pick/);
    assert.match(
      sendBlocker({ ...listing, title: ' ' }, { dirty: false, picked: ['s1'] }),
      /title/,
    );
    assert.match(
      sendBlocker({ ...listing, missing_costs: ['default'] }, { dirty: false, picked: ['s1'] }),
      /purchase cost/,
    );
    const fx = {
      ...listing,
      previews: { s1: ok, s2: { error: 'fx_unavailable', currency: 'CNY' } },
    };
    // Only the picked stores' previews count.
    assert.strictEqual(sendBlocker(fx, { dirty: false, picked: ['s1'] }), null);
    assert.match(sendBlocker(fx, { dirty: false, picked: ['s2'] }), /CNY/);
  });
});
