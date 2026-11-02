// Pure rules of the studio dashboard: what a product card shows and what the count strip adds up.
import { isMock } from './render-rules.mjs';

const ACTIVE = ['pending', 'processing', 'rendering', 'assembling'];

/** @param {unknown} v */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Most recent job of a product (by created_at), or null.
 * @template {{ created_at: string }} J
 * @param {J[]} jobs
 * @returns {J | null}
 */
export function latestJob(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return null;
  return [...jobs].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
}

/**
 * Badge of a product card from its latest job. Unknown statuses never read as a success.
 * @param {{ status?: string, progress_percentage?: number, shots?: Array<{ is_mock?: boolean }> } | null} job
 * @returns {{ tone: 'idle' | 'active' | 'ready' | 'simulated' | 'failed', label: string }}
 */
export function jobBadge(job) {
  if (!job) return { tone: 'idle', label: 'No video yet' };
  const status = job.status ?? '';
  if (ACTIVE.includes(status)) {
    const pct = Math.max(0, Math.min(100, Math.round(num(job.progress_percentage) ?? 0)));
    return { tone: 'active', label: `Generating · ${pct}%` };
  }
  if (status === 'completed') {
    const simulated = (job.shots ?? []).some((s) => isMock(s));
    // A mock render never looks like a real success: its own grey tone, not green.
    return simulated ? { tone: 'simulated', label: 'Simulated' } : { tone: 'ready', label: 'Ready' };
  }
  if (status === 'failed' || status === 'blocked') return { tone: 'failed', label: 'Failed' };
  if (status === 'cancelled') return { tone: 'idle', label: 'Cancelled' };
  return { tone: 'idle', label: 'Unknown status' };
}

/**
 * Count strip, computed from the rows shown. Spend sums actual costs only; jobs without one are counted apart.
 * @param {Array<{ jobs: Array<{ status?: string, actual_cost?: number | string | null }> }>} entries
 */
export function studioStats(entries) {
  let inProgress = 0;
  let ready = 0;
  let spend = 0;
  let unmeasured = 0;
  for (const { jobs } of entries) {
    for (const job of jobs) {
      if (ACTIVE.includes(job.status ?? '')) inProgress += 1;
      if (job.status === 'completed') ready += 1;
      const cost = num(job.actual_cost);
      if (cost === null) unmeasured += 1;
      else spend += cost;
    }
  }
  return {
    products: entries.length,
    inProgress,
    ready,
    spend: Math.round(spend * 100) / 100,
    unmeasured,
  };
}

/**
 * Where the composer sends a pasted link: product input with the URL prefilled.
 * @param {string} raw
 */
export function createHref(raw) {
  const url = raw.trim();
  return url ? `/product-input?url=${encodeURIComponent(url)}` : '/product-input';
}

/** @param {number} n */
export function formatUsd(n) {
  return `$${n.toFixed(2)}`;
}
