'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adsApi, type AdvertiserOut } from '../../../lib/api/ads';
import { AdsError, AdvertiserList, EmptyState } from '../../../components/ads/AdvertiserRow';
import { focusRing } from '../../../components/dashboard/DashShell';

export default function FollowingPage() {
  const [list, setList] = useState<AdvertiserOut[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    adsApi.following().then(
      (l) => alive && setList(l),
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <AdsError error={error} />;
  if (!list)
    return (
      <div className="h-[240px] animate-pulse rounded-[14px] bg-dash-panel" aria-busy="true" />
    );
  if (list.length === 0) {
    return (
      <EmptyState title="You don't follow any advertiser yet">
        <p>
          Follow an advertiser to get an alert, in the app and by e-mail, when it launches new ads.
          The ads it runs today are your starting point.
        </p>
        <p>
          <Link href="/ads/advertisers" className={`rounded text-white underline ${focusRing}`}>
            Browse advertisers
          </Link>
        </p>
      </EmptyState>
    );
  }
  return (
    <>
      <p className="mb-3 text-[13px] text-studio-muted">
        We check these advertisers every day and alert you when they launch new ads.
      </p>
      <AdvertiserList advertisers={list} />
    </>
  );
}
