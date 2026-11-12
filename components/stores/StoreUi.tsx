'use client';

import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CircleCheck,
  Loader2,
  Minus,
  Pause,
  Pencil,
  Plus,
  Store,
} from 'lucide-react';
import { ApiRequestError } from '../../lib/api/core';
import { adsErrorCode } from '../../lib/api/ads';
import type { StoreChange, StoreOut, StoreProduct } from '../../lib/api/stores';
import { changeText, money, storeState, storesErrorText } from '../../lib/stores-rules.mjs';
import { shortDate } from '../ads/AdCard';
import { focusRing } from '../dashboard/DashShell';
import { Badge } from '../shopify/ui';

/** Shown for any store call that failed; a 402 links to the plans. */
export function StoresError({ error, className = '' }: { error: unknown; className?: string }) {
  const paywall = error instanceof ApiRequestError && error.status === 402;
  return (
    <p role="alert" className={`text-[13px] text-danger ${className}`}>
      {storesErrorText(adsErrorCode(error))}
      {paywall && (
        <>
          {' '}
          <Link href="/billing" className={`rounded text-white underline ${focusRing}`}>
            See plans
          </Link>
        </>
      )}
    </p>
  );
}

const STATE_ICON = {
  success: CircleCheck,
  warning: Loader2,
  danger: Ban,
  neutral: Pause,
} as const;

export function StateBadge({ store }: { store: Pick<StoreOut, 'status' | 'paused'> }) {
  const state = storeState(store.status, store.paused);
  const Icon = STATE_ICON[state.tone];
  return (
    <Badge
      tone={state.tone}
      icon={
        <Icon
          className={`size-3.5 ${state.tone === 'warning' ? 'animate-spin' : ''}`}
          aria-hidden
        />
      }
    >
      {state.label}
    </Badge>
  );
}

function Thumb({ product }: { product: StoreProduct | null }) {
  if (!product?.image_url) {
    return (
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-dash-raised text-studio-meta"
      >
        {/* A store-level change (theme, app) or a product without a picture. */}
        <Store className="size-4.5" strokeWidth={1.75} />
      </span>
    );
  }
  return (
    // Remote store images: any host, so next/image's allow-list does not fit.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image_url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className="size-11 shrink-0 rounded-[8px] bg-dash-raised object-cover"
    />
  );
}

const TONE = {
  up: { Icon: ArrowUpRight, cls: 'text-warning' },
  down: { Icon: ArrowDownRight, cls: 'text-dash-green' },
  plus: { Icon: Plus, cls: 'text-dash-green' },
  minus: { Icon: Minus, cls: 'text-studio-muted' },
  edit: { Icon: Pencil, cls: 'text-studio-muted' },
} as const;

function ProductLink({ product }: { product: StoreProduct }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block truncate rounded text-[13.5px] font-medium text-white hover:underline ${focusRing}`}
    >
      {product.title || product.handle}
    </a>
  );
}

/** One dated change: what moved, on which product. */
export function ChangeRow({ change, currency }: { change: StoreChange; currency: string | null }) {
  const { text, tone } = changeText(change, change.product?.currency ?? currency);
  const { Icon, cls } = TONE[tone];
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Thumb product={change.product} />
      <div className="min-w-0 flex-1">
        {change.product && <ProductLink product={change.product} />}
        <p className={`flex items-start gap-1.5 text-[13px] ${change.product ? 'mt-0.5' : ''}`}>
          <Icon className={`mt-[2px] size-3.5 shrink-0 ${cls}`} aria-hidden />
          <span className="min-w-0 break-words text-dash-soft">{text}</span>
        </p>
      </div>
      <time
        dateTime={change.created_at}
        className="shrink-0 text-[12.5px] text-studio-meta tabular-nums"
      >
        {shortDate(change.created_at)}
      </time>
    </li>
  );
}

export function ProductRow({ product }: { product: StoreProduct }) {
  const onSale = product.compare_at_price != null;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Thumb product={product} />
      <div className="min-w-0 flex-1">
        <ProductLink product={product} />
        <p className="mt-0.5 truncate text-[12.5px] text-studio-muted">
          First seen {shortDate(product.first_seen_at)}
          {product.available === false && ' · Sold out'}
        </p>
      </div>
      <p className="shrink-0 text-right text-[13.5px] tabular-nums">
        {product.price == null ? (
          <span className="text-studio-meta">Price not read yet</span>
        ) : (
          <>
            <span className="font-semibold text-white">
              {money(product.price, product.currency)}
            </span>
            {onSale && (
              <span className="block text-[12px] text-studio-meta line-through">
                {money(product.compare_at_price, product.currency)}
              </span>
            )}
          </>
        )}
      </p>
    </li>
  );
}

export const listBox =
  'divide-y divide-dash-line rounded-[14px] border border-dash-line bg-dash-panel';
