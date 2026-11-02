import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  canConfirm,
  cleanFacts,
  isPolling,
  newRunKey,
  statusLabel,
} from '../lib/autopilot-rules.mjs';

describe('isPolling', () => {
  it('polls while the pipeline works', () => {
    for (const s of ['analyzing', 'planning', 'generating', 'finishing']) {
      assert.strictEqual(isPolling(s), true, s);
    }
  });
  it('stops when waiting on the user or done', () => {
    for (const s of ['awaiting_confirmation', 'ready', 'partial', 'failed', 'cancelled', 'weird']) {
      assert.strictEqual(isPolling(s), false, s);
    }
  });
});

describe('statusLabel', () => {
  it('speaks French and never calls an unknown status a success', () => {
    assert.strictEqual(statusLabel('awaiting_confirmation'), 'Vérifiez les infos produit');
    assert.strictEqual(statusLabel('ready'), 'Vos pubs sont prêtes');
    assert.strictEqual(statusLabel('weird'), 'En cours');
  });
});

describe('canConfirm', () => {
  const facts = { name: 'Casque', price: '', benefits: ['Silence'], image_urls: ['u'] };
  it('accepts an empty price', () => {
    assert.strictEqual(canConfirm(facts), true);
  });
  it('needs a name and a photo', () => {
    assert.strictEqual(canConfirm({ ...facts, name: '  ' }), false);
    assert.strictEqual(canConfirm({ ...facts, image_urls: [] }), false);
  });
  it('allows at most 3 benefits', () => {
    assert.strictEqual(canConfirm({ ...facts, benefits: ['a', 'b', 'c', 'd'] }), false);
  });
});

describe('cleanFacts', () => {
  it('trims, drops blank benefits and sends no price when cleared', () => {
    const out = cleanFacts({
      name: ' Casque ',
      price: '  ',
      benefits: [' a ', ''],
      image_urls: ['u'],
    });
    assert.deepStrictEqual(out, {
      name: 'Casque',
      price: null,
      benefits: ['a'],
      image_urls: ['u'],
    });
  });
});

describe('newRunKey', () => {
  it('is unique per call and tied to the product', () => {
    const a = newRunKey('p1');
    assert.ok(a.startsWith('p1:'));
    assert.notStrictEqual(a, newRunKey('p1'));
  });
});
