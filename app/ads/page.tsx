'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adsApi, type AdSearchParams, type SearchPage } from '../../lib/api/ads';
import { AdFilters } from '../../components/ads/AdFilters';
import { AdGrid } from '../../components/ads/AdCard';
import { AdsError, EmptyState, GridSkeleton, LoadMore } from '../../components/ads/AdvertiserRow';

const POLLS = 2; // while Meta is asked for more, re-run the search twice, 4 s apart
const POLL_MS = 4000;

export default function AdSearchPage() {
  const [params, setParams] = useState<AdSearchParams>({ sort: 'recent' });
  const [page, setPage] = useState<SearchPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState<{ busy: boolean; error: unknown }>({ busy: false, error: null });

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;
    const run = () =>
      adsApi.search(params).then(
        (p) => {
          if (!alive) return;
          setPage(p);
          setError(null);
          setLoading(false);
          if (p.refreshing && polls < POLLS) {
            polls += 1;
            timer = setTimeout(run, POLL_MS);
          }
        },
        (e) => {
          if (!alive) return;
          setError(e);
          setLoading(false);
        },
      );
    run();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [params]);

  const loadMore = async () => {
    if (!page?.next_cursor) return;
    setMore({ busy: true, error: null });
    try {
      const next = await adsApi.search({ ...params, cursor: page.next_cursor });
      setPage({ ...next, items: [...page.items, ...next.items] });
      setMore({ busy: false, error: null });
    } catch (e) {
      setMore({ busy: false, error: e });
    }
  };

  const filtered = Boolean(
    params.q ||
    params.country ||
    params.platform ||
    params.started_after ||
    params.active !== undefined,
  );
  const items = page?.items ?? [];

  return (
    <>
      <AdFilters
        value={params}
        onChange={(next) => {
          setLoading(true);
          setParams(next);
        }}
      />

      <div className="mt-6" aria-live="polite">
        {page?.refreshing && !loading && (
          <p className="mb-4 flex items-center gap-2 text-[13px] text-studio-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Asking Meta&apos;s Ad Library for more ads on this search. New ones appear here within
            minutes.
          </p>
        )}
        {loading && !page ? (
          <GridSkeleton />
        ) : error ? (
          <AdsError error={error} />
        ) : items.length === 0 && !filtered ? (
          <EmptyState title="The ad index is still filling up">
            <p>
              Ads come from Meta&apos;s official Ad Library API: ads shown to people in the EU, with
              Meta&apos;s reach estimates. Every 10 minutes we index popular product searches, and
              every search you run asks Meta for more.
            </p>
            <p>Search for a product or a brand to start.</p>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            title={params.q ? `No ads match "${params.q}" yet` : 'No ads match these filters'}
          >
            <p>
              {page?.refreshing
                ? 'We asked Meta for this search. Results land here within a few minutes.'
                : 'Try a broader word, another country or fewer filters.'}
            </p>
          </EmptyState>
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <AdGrid ads={items} />
            {page?.next_cursor && <LoadMore busy={more.busy} onClick={loadMore} />}
            {more.error != null && <AdsError error={more.error} className="mt-3 text-center" />}
          </div>
        )}
      </div>
    </>
  );
}
