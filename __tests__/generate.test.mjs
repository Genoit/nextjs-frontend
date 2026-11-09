import { describe, it } from 'node:test';
import assert from 'node:assert';
import { anyActive, creationHref, creations } from '../lib/generate-rules.mjs';

const entries = [
  {
    product: { id: 'p1', title: 'Casque Audio' },
    jobs: [
      { id: 'a', status: 'completed', created_at: '2026-11-01T00:00:00Z' },
      { id: 'b', status: 'rendering', created_at: '2026-11-03T00:00:00Z' },
    ],
  },
  { product: { id: 'p2', title: 'Lampe' }, jobs: null },
  {
    product: { id: 'p3', title: 'Montre' },
    jobs: [{ id: 'c', status: 'failed', created_at: '2026-11-02T00:00:00Z' }],
  },
];

describe('creations', () => {
  it('flattens jobs newest first and skips failed job loads', () => {
    assert.deepStrictEqual(
      creations(entries).map((c) => c.job.id),
      ['b', 'c', 'a'],
    );
  });
  it('filters by product and by title search', () => {
    assert.deepStrictEqual(
      creations(entries, { productId: 'p3' }).map((c) => c.job.id),
      ['c'],
    );
    assert.deepStrictEqual(
      creations(entries, { query: ' casque ' }).map((c) => c.job.id),
      ['b', 'a'],
    );
  });
});

describe('anyActive and creationHref', () => {
  it('spots rendering jobs and routes cards', () => {
    assert.ok(anyActive(creations(entries)));
    assert.ok(!anyActive(creations(entries, { productId: 'p3' })));
    const [rendering, , done] = creations(entries);
    assert.strictEqual(creationHref(done), '/studio/a');
    assert.strictEqual(creationHref(rendering), '/products/p1/creative');
  });
});
