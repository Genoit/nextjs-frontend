'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { adsApi, type AdvertiserPage, type AdvertiserSearchParams } from '../../../lib/api/ads';
import { COUNTRIES, Select, field } from '../../../components/ads/AdFilters';
import {
  AdsError,
  AdvertiserList,
  EmptyState,
  LoadMore,
} from '../../../components/ads/AdvertiserRow';
import { focusRing } from '../../../components/dashboard/DashShell';

export default function AdvertisersPage() {
  const [params, setParams] = useState<AdvertiserSearchParams>({ sort: 'active' });
  const [q, setQ] = useState('');
  const [page, setPage] = useState<AdvertiserPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [more, setMore] = useState<{ busy: boolean; error: unknown }>({ busy: false, error: null });

  useEffect(() => {
    let alive = true;
    adsApi.advertisers(params).then(
      (p) => {
        if (!alive) return;
        setPage(p);
        setError(null);
      },
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [params]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams({ ...params, q: q.trim() || undefined });
  };

  const loadMore = async () => {
    if (!page?.next_cursor) return;
    setMore({ busy: true, error: null });
    try {
      const next = await adsApi.advertisers({ ...params, cursor: page.next_cursor });
      setPage({ ...next, items: [...page.items, ...next.items] });
      setMore({ busy: false, error: null });
    } catch (e) {
      setMore({ busy: false, error: e });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <form role="search" onSubmit={submit} className="flex min-w-0 flex-1 gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search advertisers</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-studio-muted"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              maxLength={200}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Advertiser or page name"
              className={`${field} pl-10`}
            />
          </label>
          <button
            type="submit"
            className={`h-[38px] shrink-0 rounded-[10px] border border-dash-edge bg-dash-raised px-4 text-[13px] font-semibold text-white transition hover:border-dash-edge-hover active:scale-[0.98] ${focusRing}`}
          >
            Search
          </button>
        </form>
        <div className="grid grid-cols-2 gap-2 sm:flex [&>*]:sm:w-[168px]">
          <Select
            label="Country"
            value={params.country ?? ''}
            onChange={(v) => setParams({ ...params, country: v || undefined })}
          >
            <option value="">All EU countries</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </Select>
          <Select
            label="Sort"
            value={params.sort ?? 'active'}
            onChange={(v) => setParams({ ...params, sort: v as 'active' | 'reach' })}
          >
            <option value="active">Most active ads</option>
            <option value="reach">Highest EU reach</option>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <AdsError error={error} />
        ) : !page ? (
          <div className="h-[320px] animate-pulse rounded-[14px] bg-dash-panel" aria-busy="true" />
        ) : page.items.length === 0 ? (
          <EmptyState
            title={
              params.q || params.country ? 'No advertiser matches' : 'No advertisers indexed yet'
            }
          >
            <p>
              Advertisers appear here as their ads enter the index from Meta&apos;s official Ad
              Library API. Search ads to bring in more.
            </p>
          </EmptyState>
        ) : (
          <>
            <AdvertiserList advertisers={page.items} />
            {page.next_cursor && <LoadMore busy={more.busy} onClick={loadMore} />}
            {more.error != null && <AdsError error={more.error} className="mt-3 text-center" />}
          </>
        )}
      </div>
    </>
  );
}
