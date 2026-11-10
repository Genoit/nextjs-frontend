'use client';

import { useEffect, useState } from 'react';
import { adsApi, type AdOut, type SearchPage } from '../../../lib/api/ads';
import { RemakeDialog } from '../../../components/ads/RemakeDialog';
import { AdGrid, CaptureSteps } from '../../../components/ads/AdCard';
import {
  AdsError,
  EmptyState,
  GridSkeleton,
  LoadMore,
} from '../../../components/ads/AdvertiserRow';

export default function CapturesPage() {
  const [page, setPage] = useState<SearchPage | null>(null);
  const [remake, setRemake] = useState<AdOut | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [more, setMore] = useState<{ busy: boolean; error: unknown }>({ busy: false, error: null });

  useEffect(() => {
    let alive = true;
    adsApi.captures().then(
      (p) => alive && setPage(p),
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = async () => {
    if (!page?.next_cursor) return;
    setMore({ busy: true, error: null });
    try {
      const next = await adsApi.captures(page.next_cursor);
      setPage({ ...next, items: [...page.items, ...next.items] });
      setMore({ busy: false, error: null });
    } catch (e) {
      setMore({ busy: false, error: e });
    }
  };

  if (error) return <AdsError error={error} />;
  if (!page) return <GridSkeleton rows={3} />;
  if (page.items.length === 0) {
    return (
      <EmptyState title="No captures yet">
        <p>
          A capture saves an ad&apos;s video or images from Meta&apos;s Ad Library, so you can watch
          it here and remake it for your product. Captures are private to you.
        </p>
        <CaptureSteps />
      </EmptyState>
    );
  }
  return (
    <>
      <AdGrid ads={page.items} onRemake={setRemake} />
      <RemakeDialog ad={remake} onClose={() => setRemake(null)} />
      {page.next_cursor && <LoadMore busy={more.busy} onClick={loadMore} />}
      {more.error != null && <AdsError error={more.error} className="mt-3 text-center" />}
    </>
  );
}
