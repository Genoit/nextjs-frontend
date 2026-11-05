// Pure rules of the studio dashboard: what a product card shows and what the count strip adds up.
import { isMock } from './render-rules.mjs';
import { imageFileError, LIMITS } from './product-input-rules.mjs';

/**
 * Photos the composer keeps from a new pick: valid files, up to LIMITS.photos in total.
 * @template {{ name: string, type: string, size: number }} F
 * @param {number} kept how many photos are already attached
 * @param {F[]} picked
 * @returns {{ accepted: F[], errors: string[] }}
 */
export function acceptPhotos(kept, picked) {
  const accepted = [];
  const errors = [];
  for (const file of picked) {
    const err = imageFileError(file);
    if (err) errors.push(err);
    else if (kept + accepted.length >= LIMITS.photos)
      errors.push(`${LIMITS.photos} photos max: ${file.name} was not added.`);
    else accepted.push(file);
  }
  return { accepted, errors };
}

export const ACTIVE = ['pending', 'processing', 'rendering', 'assembling'];

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
 * Where the composer sends its text: a link opens the URL import prefilled, anything else opens
 * manual entry with the text as the product description.
 * @param {string} raw
 */
export function createHref(raw) {
  const text = raw.trim();
  if (!text) return '/product-input';
  const link = /^(https?:\/\/|www\.)\S+$/i.test(text) || /^[\w-]+(\.[\w-]+)+\/\S*$/.test(text);
  return link
    ? `/product-input?url=${encodeURIComponent(text)}`
    : `/product-input?mode=manual&describe=${encodeURIComponent(text)}`;
}

/**
 * "$19" for the cheapest paid plan, or null without prices. Catalogue price: a plan not on sale yet
 * (Stripe unset) still has its price; /billing tells whether it can be bought.
 * @param {Array<{ id: string, price_usd: string }>} plans
 */
export function fromPrice(plans) {
  const prices = plans
    .filter((p) => p.id !== 'free')
    .map((p) => Number(p.price_usd))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return `$${Number.isInteger(min) ? min : min.toFixed(2)}`;
}

/** @param {string | null | undefined} iso */
function ms(iso) {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
}

/**
 * Counts of the stats strip for the calendar month of `now` (local time).
 * Average generation time uses completed jobs that carry both start and end.
 * @param {Array<{ status?: string, created_at: string, started_at?: string | null, completed_at?: string | null }>} jobs
 * @param {Date} now
 * @returns {{ generated: number, rendering: number, completed: number, avgSeconds: number | null }}
 */
export function monthStats(jobs, now) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const list = Array.isArray(jobs) ? jobs : [];
  const inMonth = (iso) => (ms(iso) ?? -Infinity) >= start;
  const done = list.filter(
    (j) => j.status === 'completed' && inMonth(j.completed_at ?? j.created_at),
  );
  const spans = done
    .map((j) => {
      const a = ms(j.started_at ?? j.created_at);
      const b = ms(j.completed_at);
      return a !== null && b !== null && b >= a ? (b - a) / 1000 : null;
    })
    .filter((s) => s !== null);
  return {
    generated: list.filter((j) => inMonth(j.created_at)).length,
    rendering: list.filter((j) => ACTIVE.includes(j.status ?? '')).length,
    completed: done.length,
    avgSeconds: spans.length ? Math.round(spans.reduce((x, y) => x + y, 0) / spans.length) : null,
  };
}

/** "45s", "1m 24s", "2h 05m". @param {number | null} s */
export function durationText(s) {
  if (s === null || !Number.isFinite(s) || s < 0) return '—';
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}

/** "just now", "5m ago", "2h ago", "1d ago". @param {string} iso @param {Date} now */
export function timeAgo(iso, now) {
  const t = ms(iso);
  if (t === null) return '';
  const s = Math.max(0, (now.getTime() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Whole days from now to `iso`, never below 0; null without a date. @param {string | null} iso @param {Date} now */
export function daysUntil(iso, now) {
  const t = ms(iso);
  return t === null ? null : Math.max(0, Math.ceil((t - now.getTime()) / 86400000));
}

/**
 * Length of a video from its shots (seconds), or null when no shot carries a duration.
 * @param {{ shots?: Array<{ duration_shot_s?: number | string | null }> } | null} job
 */
export function jobSeconds(job) {
  const parts = (job?.shots ?? []).map((s) => num(s.duration_shot_s)).filter((n) => n !== null);
  return parts.length ? Math.round(parts.reduce((a, b) => a + b, 0)) : null;
}

/** "00:28", "01:05"; null without a length. @param {number | null} s */
export function clockText(s) {
  if (s === null || !Number.isFinite(s) || s < 0) return null;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;
}

/**
 * Discount of the selling price against the compare-at price, in whole percent; null when either
 * is missing or there is no discount.
 * @param {number | null | undefined} price @param {number | null | undefined} compareAt
 */
export function discountPct(price, compareAt) {
  const p = num(price);
  const c = num(compareAt);
  if (p === null || c === null || c <= 0 || p >= c) return null;
  return Math.round(((c - p) / c) * 100);
}
