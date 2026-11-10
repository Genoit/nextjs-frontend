'use client';

import { useEffect, useState } from 'react';
import { adsApi, type SearchPage } from '../../../lib/api/ads';
import { AdGrid, EXTENSION_HELP_URL } from '../../../components/ads/AdCard';
import {
  AdsError,
  EmptyState,
  GridSkeleton,
  LoadMore,
} from '../../../components/ads/AdvertiserRow';
import { focusRing } from '../../../components/dashboard/DashShell';

export default function CapturesPage() {
  const [page, setPage] = useState<SearchPage | null>(null);
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
        <p>
          <a
            href={EXTENSION_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded text-white underline ${focusRing}`}
          >
            How to capture ads with the extension
          </a>
        </p>
      </EmptyState>
    );
  }
  return (
    <>
      <AdGrid ads={page.items} />
      {page.next_cursor && <LoadMore busy={more.busy} onClick={loadMore} />}
      {more.error != null && <AdsError error={more.error} className="mt-3 text-center" />}
    </>
  );
}
