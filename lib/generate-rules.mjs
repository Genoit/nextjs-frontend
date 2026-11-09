// Pure rules of /generate: the user's video jobs as one grid, filtered by product and search.

import { ACTIVE } from './dashboard-rules.mjs';

/**
 * Every job of every loaded product, newest first, optionally one product's or matching a search
 * on the product title.
 * @param {Array<{ product: any, jobs: any[] | null }>} entries
 * @param {{ productId?: string | null, query?: string }} [filter]
 */
export function creations(entries, filter = {}) {
  const q = (filter.query ?? '').trim().toLowerCase();
  return entries
    .filter((e) => !filter.productId || e.product.id === filter.productId)
    .filter(
      (e) =>
        !q ||
        String(e.product.title ?? '')
          .toLowerCase()
          .includes(q),
    )
    .flatMap((e) => (e.jobs ?? []).map((job) => ({ product: e.product, job })))
    .sort((a, b) => Date.parse(b.job.created_at) - Date.parse(a.job.created_at));
}

/** True while a job still renders: the grid refreshes itself. @param {any[]} list */
export function anyActive(list) {
  return list.some(({ job }) => ACTIVE.includes(job.status));
}

/** Where a card leads: the editor once finished, the ad flow after a failure, else this grid. */
export function creationHref({ product, job }) {
  if (job.status === 'completed') return `/studio/${job.id}`;
  if (ACTIVE.includes(job.status)) return `/generate?job=${encodeURIComponent(job.id)}`;
  return `/products/${product.id}/creative`;
}

// shortcut: a fixed per-shot guess until the backend reports an ETA; replace with the router's
// own estimate once real engines run (mock renders are much faster).
const BASE_SECONDS = 60;
const SECONDS_PER_SHOT = 40;
const DEFAULT_SHOTS = 5;

/**
 * Seconds left for a rendering job: from its own progress once it has some, else the guess.
 * @param {{ created_at: string, started_at?: string | null, progress_percentage?: number, shots?: any[] }} job
 * @param {Date} now
 */
export function etaSeconds(job, now) {
  const start = Date.parse(job.started_at || job.created_at);
  const elapsed = Math.max(0, (now.getTime() - start) / 1000);
  const p = Number(job.progress_percentage) || 0;
  if (p >= 10 && p < 100) return Math.max(0, Math.round((elapsed * (100 - p)) / p));
  const shots = job.shots?.length || DEFAULT_SHOTS;
  return Math.max(0, Math.round(BASE_SECONDS + SECONDS_PER_SHOT * shots - elapsed));
}

/** "2:05" for the countdown; null once the estimate has run out. */
export function formatEta(seconds) {
  if (seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, '0')}`;
}
