import { AlertTriangle, CheckCircle2, CircleDashed, GitCompare, Loader2 } from 'lucide-react';
import type { ShopifyListing, SyncState } from '../../lib/api/shopify';
import { SYNC_LABEL } from '../../lib/shopify-rules.mjs';
import { Badge, type Tone } from './ui';

const ic = 'size-3.5';
const LOOK: Record<SyncState, { tone: Tone; icon: React.ReactNode }> = {
  pending_review: { tone: 'neutral', icon: <CircleDashed className={ic} aria-hidden /> },
  syncing: { tone: 'neutral', icon: <Loader2 className={`${ic} animate-spin`} aria-hidden /> },
  synced: { tone: 'success', icon: <CheckCircle2 className={ic} aria-hidden /> },
  error: { tone: 'danger', icon: <AlertTriangle className={ic} aria-hidden /> },
  conflict: { tone: 'warning', icon: <GitCompare className={ic} aria-hidden /> },
};

export function SyncBadge({ state }: { state: SyncState }) {
  const look = LOOK[state] ?? LOOK.pending_review;
  return (
    <Badge tone={look.tone} icon={look.icon}>
      {SYNC_LABEL[state] ?? state}
    </Badge>
  );
}

/** One row per store the product was sent to: the shop, its sync state, and the last error. */
export function SyncBadges({ listings }: { listings: ShopifyListing[] }) {
  if (listings.length === 0) return null;
  return (
    <ul className="divide-y divide-studio-rule">
      {listings.map((l) => (
        <li
          key={l.id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 first:pt-0 last:pb-0"
        >
          <span className="min-w-0 flex-1 truncate text-[13px] text-studio-text">
            {l.shop_domain}
          </span>
          <SyncBadge state={l.state} />
          {l.state === 'error' && l.last_error && (
            <span className="w-full text-[12.5px] break-words text-studio-muted">
              {l.last_error}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
