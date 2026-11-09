'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, GitCompare, Loader2, Lock } from 'lucide-react';
import {
  shopifyApi,
  shopifyErrorCode,
  type ShopifyListing,
  type SyncState,
} from '../../lib/api/shopify';
import { SYNC_LABEL, shopifyErrorText } from '../../lib/shopify-rules.mjs';
import { Badge, secondaryBtn, type Tone } from './ui';

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
export function SyncBadges({
  listings,
  onChange,
}: {
  listings: ShopifyListing[];
  onChange: (next: ShopifyListing) => void;
}) {
  if (listings.length === 0) return null;
  return (
    <ul className="divide-y divide-studio-rule">
      {listings.map((l) => (
        <ListingRow key={l.id} listing={l} onChange={onChange} />
      ))}
    </ul>
  );
}

function ListingRow({
  listing: l,
  onChange,
}: {
  listing: ShopifyListing;
  onChange: (next: ShopifyListing) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keeping Shopify's price in a conflict pins it; this turns the store's pricing rule back on.
  const useRule = async () => {
    setBusy(true);
    setError(null);
    try {
      onChange(await shopifyApi.useRule(l.id));
    } catch (err) {
      setError(shopifyErrorText(shopifyErrorCode(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 first:pt-0 last:pb-0">
      <span className="min-w-0 flex-1 truncate text-[13px] text-studio-text">{l.shop_domain}</span>
      {l.price_source === 'fixed' && (
        <Badge tone="neutral" icon={<Lock className={ic} aria-hidden />}>
          Fixed price
        </Badge>
      )}
      <SyncBadge state={l.state} />
      {l.state === 'error' && l.last_error && (
        <span className="w-full text-[12.5px] break-words text-studio-muted">{l.last_error}</span>
      )}
      {l.price_source === 'fixed' && (
        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-[12.5px] text-studio-muted">
            Prices kept from Shopify. The store’s pricing rule is off for this product.
          </span>
          <button type="button" onClick={useRule} disabled={busy} className={secondaryBtn}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Use the pricing rule again
          </button>
          {error && <span className="w-full text-[12.5px] text-danger">{error}</span>}
        </div>
      )}
    </li>
  );
}
