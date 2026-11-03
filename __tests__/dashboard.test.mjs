import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createHref,
  daysUntil,
  durationText,
  jobBadge,
  latestJob,
  monthStats,
  timeAgo,
} from '../lib/dashboard-rules.mjs';

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

describe('monthStats', () => {
  const now = new Date('2026-11-20T12:00:00');
  const jobs = [
    {
      status: 'completed',
      created_at: '2026-11-02T10:00:00',
      started_at: '2026-11-02T10:00:00',
      completed_at: '2026-11-02T10:01:00',
    },
    {
      status: 'completed',
      created_at: '2026-11-03T10:00:00',
      started_at: '2026-11-03T10:00:00',
      completed_at: '2026-11-03T10:02:00',
    },
    { status: 'rendering', created_at: '2026-11-19T10:00:00' },
    { status: 'completed', created_at: '2026-10-10T10:00:00', completed_at: '2026-10-10T10:05:00' },
  ];
  it('counts this month only, and every running job', () => {
    const s = monthStats(jobs, now);
    assert.strictEqual(s.generated, 3);
    assert.strictEqual(s.completed, 2);
    assert.strictEqual(s.rendering, 1);
  });
  it('averages completed spans', () => {
    assert.strictEqual(monthStats(jobs, now).avgSeconds, 90);
  });
  it('has no average without completed jobs', () => {
    assert.strictEqual(monthStats([], now).avgSeconds, null);
  });
});

describe('durationText / timeAgo / daysUntil', () => {
  const now = new Date('2026-11-20T12:00:00Z');
  it('formats durations', () => {
    assert.strictEqual(durationText(84), '1m 24s');
    assert.strictEqual(durationText(45), '45s');
    assert.strictEqual(durationText(null), '—');
  });
  it('formats ages', () => {
    assert.strictEqual(timeAgo('2026-11-20T10:00:00Z', now), '2h ago');
    assert.strictEqual(timeAgo('2026-11-19T11:00:00Z', now), '1d ago');
  });
  it('counts days left, never negative', () => {
    assert.strictEqual(daysUntil('2026-12-04T12:00:00Z', now), 14);
    assert.strictEqual(daysUntil('2026-11-01T00:00:00Z', now), 0);
    assert.strictEqual(daysUntil(null, now), null);
  });
});
