import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  anyActive,
  creationHref,
  creations,
  etaSeconds,
  formatEta,
} from '../lib/generate-rules.mjs';

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
    assert.strictEqual(creationHref(rendering), '/generate?job=b');
  });
});

describe('etaSeconds and formatEta', () => {
  const now = new Date('2026-11-06T10:00:00Z');
  it('guesses from the shot count before any progress', () => {
    const job = { created_at: '2026-11-06T09:59:00Z', progress_percentage: 0, shots: [1, 2, 3] };
    assert.strictEqual(etaSeconds(job, now), 60 + 120 - 60);
  });
  it('extrapolates from progress once it moves', () => {
    const job = { created_at: '2026-11-06T09:58:00Z', progress_percentage: 40 };
    assert.strictEqual(etaSeconds(job, now), 180);
  });
  it('never goes below zero and formats m:ss', () => {
    assert.strictEqual(etaSeconds({ created_at: '2026-11-06T08:00:00Z' }, now), 0);
    assert.strictEqual(formatEta(125), '2:05');
    assert.strictEqual(formatEta(0), null);
  });
});
