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

/** Where a card leads: the editor once finished, else the ad flow that tracks it. */
export function creationHref({ product, job }) {
  return job.status === 'completed' ? `/studio/${job.id}` : `/products/${product.id}/creative`;
}
