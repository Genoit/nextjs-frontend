'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adsApi, type AdvertiserDetail } from '../../../../lib/api/ads';
import { reachLabel } from '../../../../lib/ads-rules.mjs';
import { AdGrid, shortDate } from '../../../../components/ads/AdCard';
import {
  AdsError,
  EmptyState,
  FollowButton,
  Monogram,
} from '../../../../components/ads/AdvertiserRow';
import { focusRing } from '../../../../components/dashboard/DashShell';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-studio-muted">{label}</dt>
      <dd className="mt-1 truncate text-[17px] font-semibold text-white tabular-nums">{value}</dd>
    </div>
  );
}

export default function AdvertiserPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const [adv, setAdv] = useState<AdvertiserDetail | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    adsApi.advertiser(pageId).then(
      (a) => alive && setAdv(a),
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [pageId]);

  const back = (
    <Link
      href="/ads/advertisers"
      className={`inline-flex items-center gap-1.5 rounded text-[13px] text-studio-muted hover:text-white ${focusRing}`}
    >
      <ArrowLeft className="size-4" aria-hidden />
      All advertisers
    </Link>
  );

  if (error) {
    return (
      <>
        {back}
        <AdsError error={error} className="mt-4" />
      </>
    );
  }
  if (!adv) {
    return (
      <>
        {back}
        <div
          className="mt-4 h-[180px] animate-pulse rounded-[14px] bg-dash-panel"
          aria-busy="true"
        />
      </>
    );
  }

  return (
    <>
      {back}
      <section className="mt-4 rounded-[14px] border border-dash-line bg-dash-panel p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Monogram name={adv.name} size="size-12" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] leading-tight font-semibold break-words text-white">
              {adv.name || 'Unnamed page'}
            </h2>
            <p className="mt-1 text-[12.5px] text-studio-meta tabular-nums">Page {adv.page_id}</p>
          </div>
          <FollowButton key={adv.page_id} advertiser={adv} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Stat label="Active ads" value={adv.active_ads.toLocaleString('en-US')} />
          <Stat
            label="EU reach (Meta estimate)"
            value={reachLabel(adv.total_reach || null).replace(' EU reach (Meta estimate)', '')}
          />
          <Stat
            label="Oldest active ad since"
            value={adv.oldest_active_start ? shortDate(adv.oldest_active_start) : '—'}
          />
        </dl>
      </section>

      <h2 className="mt-9 mb-4 text-[15px] font-semibold text-white">
        Latest ads{' '}
        <span className="font-normal text-studio-meta tabular-nums">{adv.ads.length}</span>
      </h2>
      {adv.ads.length === 0 ? (
        <EmptyState title="No ads indexed for this advertiser">
          <p>Follow it to get an alert when it launches new ads.</p>
        </EmptyState>
      ) : (
        <AdGrid ads={adv.ads} />
      )}
    </>
  );
}
