'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, Loader2, Plus } from 'lucide-react';
import { ApiRequestError } from '../../lib/api/core';
import { adsApi, adsErrorCode, type AdvertiserOut } from '../../lib/api/ads';
import { adsErrorText, reachLabel } from '../../lib/ads-rules.mjs';
import { focusRing } from '../dashboard/DashShell';
import { shortDate } from './AdCard';

/** Shown for any ads call that failed; a 402 links to the plans. */
export function AdsError({ error, className = '' }: { error: unknown; className?: string }) {
  const paywall = error instanceof ApiRequestError && error.status === 402;
  return (
    <p role="alert" className={`text-[13px] text-danger ${className}`}>
      {adsErrorText(adsErrorCode(error))}
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

/** Follow / Following toggle (secondary button); errors show under it. */
export function FollowButton({
  advertiser,
  onChange,
}: {
  advertiser: AdvertiserOut;
  onChange?: (following: boolean) => void;
}) {
  const [following, setFollowing] = useState(advertiser.following);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (following) await adsApi.unfollow(advertiser.page_id);
      else await adsApi.follow(advertiser.page_id);
      setFollowing(!following);
      onChange?.(!following);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const Icon = busy ? Loader2 : following ? Check : Plus;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={following}
        aria-label={`${following ? 'Unfollow' : 'Follow'} ${advertiser.name}`}
        className={`inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-[10px] border px-3.5 text-[13px] font-medium transition active:scale-[0.98] disabled:cursor-wait ${
          following
            ? 'border-dash-edge bg-dash-raised text-white hover:border-dash-edge-hover'
            : 'border-dash-edge text-dash-soft hover:border-dash-edge-hover hover:text-white'
        } ${focusRing}`}
      >
        <Icon className={`size-4 ${busy ? 'animate-spin' : ''}`} aria-hidden />
        {following ? 'Following' : 'Follow'}
      </button>
      {error != null && <AdsError error={error} className="max-w-[280px] text-right" />}
    </div>
  );
}

export function Monogram({ name, size = 'size-10' }: { name: string; size?: string }) {
  return (
    <span
      aria-hidden
      className={`flex ${size} shrink-0 items-center justify-center rounded-[10px] bg-dash-raised text-[15px] font-semibold text-dash-soft`}
    >
      {(name.trim()[0] ?? '?').toUpperCase()}
    </span>
  );
}

/** One advertiser in a list: name, counters, follow toggle. */
export function AdvertiserRow({ advertiser }: { advertiser: AdvertiserOut }) {
  const a = advertiser;
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:gap-4">
      <Monogram name={a.name} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/ads/advertisers/${encodeURIComponent(a.page_id)}`}
          className={`block truncate rounded text-[14px] font-semibold text-white hover:underline ${focusRing}`}
        >
          {a.name || 'Unnamed page'}
        </Link>
        <p className="mt-0.5 truncate text-[12.5px] text-studio-muted">
          <span className="tabular-nums">{a.active_ads}</span> active{' '}
          {a.active_ads === 1 ? 'ad' : 'ads'}
          {' · '}
          {reachLabel(a.total_reach || null)}
          {a.oldest_active_start && ` · active since ${shortDate(a.oldest_active_start)}`}
        </p>
      </div>
      <FollowButton advertiser={a} />
    </li>
  );
}

export function AdvertiserList({ advertisers }: { advertisers: AdvertiserOut[] }) {
  return (
    <ul className="divide-y divide-dash-line rounded-[14px] border border-dash-line bg-dash-panel">
      {advertisers.map((a) => (
        <AdvertiserRow key={a.page_id} advertiser={a} />
      ))}
    </ul>
  );
}

/** Empty or unavailable section: says why and what to do next. */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dash-line bg-dash-panel px-6 py-10 sm:px-10">
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
      <div className="mt-2 max-w-[62ch] space-y-2 text-[13.5px] leading-[1.55] text-studio-muted">
        {children}
      </div>
    </div>
  );
}

export function LoadMore({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-dash-edge px-5 text-[13px] font-medium text-dash-soft transition hover:border-dash-edge-hover hover:text-white disabled:cursor-wait ${focusRing}`}
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Load more
      </button>
    </div>
  );
}

export function GridSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="h-[420px] animate-pulse rounded-[14px] bg-dash-panel" />
      ))}
    </ul>
  );
}
