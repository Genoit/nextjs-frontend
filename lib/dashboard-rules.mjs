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
    return simulated
      ? { tone: 'simulated', label: 'Simulated' }
      : { tone: 'ready', label: 'Ready' };
  }
  if (status === 'failed' || status === 'blocked') return { tone: 'failed', label: 'Failed' };
  if (status === 'cancelled') return { tone: 'idle', label: 'Cancelled' };
  return { tone: 'idle', label: 'Unknown status' };
}

/**
 * Where the composer sends a pasted link: product input with the URL prefilled.
 * @param {string} raw
 */
export function createHref(raw) {
  const url = raw.trim();
  return url ? `/product-input?url=${encodeURIComponent(url)}` : '/product-input';
}
