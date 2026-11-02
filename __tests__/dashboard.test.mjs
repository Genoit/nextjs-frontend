import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createHref, jobBadge, latestJob } from '../lib/dashboard-rules.mjs';

describe('latestJob', () => {
  it('returns null without jobs', () => {
    assert.strictEqual(latestJob([]), null);
  });
  it('picks the most recent by created_at', () => {
    const jobs = [
      { id: 'a', created_at: '2026-10-01T10:00:00Z' },
      { id: 'b', created_at: '2026-10-03T10:00:00Z' },
      { id: 'c', created_at: '2026-10-02T10:00:00Z' },
    ];
    assert.strictEqual(latestJob(jobs).id, 'b');
  });
});

describe('jobBadge', () => {
  it('says no video when there is no job', () => {
    assert.deepStrictEqual(jobBadge(null), { tone: 'idle', label: 'No video yet' });
  });
  it('shows clamped progress while generating', () => {
    assert.strictEqual(
      jobBadge({ status: 'rendering', progress_percentage: 140 }).label,
      'Generating · 100%',
    );
  });
  it('flags a completed job with simulated shots', () => {
    const job = { status: 'completed', shots: [{ is_mock: false }, { is_mock: true }] };
    assert.deepStrictEqual(jobBadge(job), { tone: 'simulated', label: 'Simulated' });
  });
  it('treats a shot without is_mock as a simulation (fail closed)', () => {
    assert.strictEqual(jobBadge({ status: 'completed', shots: [{}] }).tone, 'simulated');
  });
  it('never reads an unknown status as ready', () => {
    assert.strictEqual(jobBadge({ status: 'weird' }).tone, 'idle');
  });
  it('maps blocked to failed', () => {
    assert.strictEqual(jobBadge({ status: 'blocked' }).tone, 'failed');
  });
});

describe('createHref', () => {
  it('prefills the pasted link', () => {
    assert.strictEqual(
      createHref(' https://a.com/p?x=1 '),
      '/product-input?url=https%3A%2F%2Fa.com%2Fp%3Fx%3D1',
    );
  });
  it('falls back to plain product input', () => {
    assert.strictEqual(createHref('  '), '/product-input');
  });
});
