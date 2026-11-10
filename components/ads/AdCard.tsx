'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  CircleHelp,
  CirclePause,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  ImageOff,
  MousePointerClick,
  Users,
  Wand2,
} from 'lucide-react';
import { adsApi, type AdOut } from '../../lib/api/ads';
import { reachLabel, runTimeLabel } from '../../lib/ads-rules.mjs';
import { Popover, focusRing } from '../dashboard/DashShell';

// The capture how-to; the section is written with the extension (Task 11).
export const EXTENSION_HELP_URL =
  'https://github.com/Genoit/nextjs-frontend/blob/HEAD/browser-extension/README.md#capture-meta-ads';

const PLATFORM_LABEL: Record<string, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  MESSENGER: 'Messenger',
  AUDIENCE_NETWORK: 'Audience Network',
  THREADS: 'Threads',
};

export function shortDate(iso: string): string {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function countriesText(codes: string[]): string {
  if (codes.length === 0) return 'EU';
  return codes.length > 3
    ? `${codes.slice(0, 3).join(', ')} +${codes.length - 3}`
    : codes.join(', ');
}

/** The user's own capture, fetched with the auth header (a plain src would 401). */
function CaptureMedia({ id, more }: { id: string; more: number }) {
  const [media, setMedia] = useState<{ url: string; video: boolean } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    let url: string | undefined;
    adsApi.captureBlob(id).then(
      (blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setMedia({ url, video: blob.type.startsWith('video/') });
      },
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  return (
    <div className="relative aspect-[16/10] rounded-t-[13px] bg-dash-raised">
      {media?.video ? (
        <video
          src={media.url}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full rounded-t-[13px] object-contain"
        />
      ) : media ? (
        // eslint-disable-next-line @next/next/no-img-element -- object URL, nothing to optimise
        <img
          src={media.url}
          alt="Your capture of this ad"
          className="absolute inset-0 h-full w-full rounded-t-[13px] object-contain"
        />
      ) : failed ? (
        <p className="flex h-full items-center justify-center gap-2 text-[12.5px] text-studio-meta">
          <ImageOff className="size-4" aria-hidden />
          Capture unavailable
        </p>
      ) : (
        <div className="h-full animate-pulse rounded-t-[13px] bg-dash-raised" aria-hidden />
      )}
      {more > 0 && (
        <span className="absolute top-2.5 right-2.5 rounded-md bg-dash-ground/85 px-2 py-0.5 text-[11.5px] text-dash-soft tabular-nums">
          +{more} more
        </span>
      )}
    </div>
  );
}

/** No capture yet: one quiet line with the how-to, so text-only cards stay compact. */
function CaptureHint() {
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-dash-raised py-1 pr-1 pl-3 text-[12.5px] text-dash-soft">
      <MousePointerClick
        className="size-4 shrink-0 text-studio-meta"
        strokeWidth={1.6}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">Capture with the extension</span>
      <Popover
        label="How to capture an ad"
        className="right-0 bottom-9 w-[min(288px,calc(100vw-64px))] p-3 text-left"
        buttonClassName="size-7 text-studio-meta"
        button={<CircleHelp className="size-4" aria-hidden />}
      >
        {() => (
          <div className="space-y-2 text-[12.5px] leading-[1.5] text-dash-soft">
            <p>
              Open this ad in Meta&apos;s Ad Library with the TrendED extension installed, then
              click <span className="text-white">Capture</span>. The video or image is saved here,
              visible only to you.
            </p>
            <a
              href={EXTENSION_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 rounded text-white underline underline-offset-2 hover:text-dash-soft ${focusRing}`}
            >
              How to capture ads
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        )}
      </Popover>
    </div>
  );
}

function Fact({ Icon, children }: { Icon: typeof Clock; children: ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-studio-meta" aria-hidden />
      <span className="truncate">{children}</span>
    </li>
  );
}

/** One indexed ad. `onRemake` opens the product picker (Task 12). */
export function AdCard({ ad, onRemake }: { ad: AdOut; onRemake?: (ad: AdOut) => void }) {
  const platforms = ad.platforms.map((p) => PLATFORM_LABEL[p.toUpperCase()] ?? p).join(' · ');
  return (
    <article className="flex w-full min-w-0 flex-col rounded-[14px] border border-dash-line bg-dash-panel">
      {ad.my_capture_ids.length > 0 && (
        <CaptureMedia id={ad.my_capture_ids[0]} more={ad.my_capture_ids.length - 1} />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={`/ads/advertisers/${encodeURIComponent(ad.page_id)}`}
            className={`truncate rounded text-[13px] font-semibold text-white hover:underline ${focusRing}`}
          >
            {ad.page_name}
          </Link>
          {ad.long_running && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-dash-green">
              <Flame className="size-3.5" aria-hidden />
              Running 14+ days
            </span>
          )}
        </div>
        {ad.link_title && (
          <p className="mt-2 line-clamp-1 text-[14px] font-medium text-white">{ad.link_title}</p>
        )}
        {ad.body && (
          <p className="mt-1 line-clamp-3 text-[13px] leading-[1.5] text-dash-soft">{ad.body}</p>
        )}
        <ul className="mt-4 grid gap-1.5 text-[12.5px] text-studio-muted">
          <Fact Icon={ad.stop_time ? CirclePause : Clock}>
            {ad.stop_time
              ? `Ran ${runTimeLabel(ad.run_days)}, stopped ${shortDate(ad.stop_time)}`
              : `Active for ${runTimeLabel(ad.run_days)}, since ${shortDate(ad.start_time)}`}
          </Fact>
          <Fact Icon={Users}>{reachLabel(ad.eu_reach)}</Fact>
          <Fact Icon={Globe}>
            {countriesText(ad.countries)}
            {platforms && ` · ${platforms}`}
          </Fact>
        </ul>
        <div className="mt-auto flex flex-col gap-2.5 pt-4">
          {ad.my_capture_ids.length === 0 && <CaptureHint />}
          <button
            type="button"
            onClick={() => onRemake?.(ad)}
            disabled={!onRemake}
            title={onRemake ? undefined : 'Available soon'}
            className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-trend-orange px-4 text-[13px] font-semibold text-on-accent transition hover:bg-trend-orange-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${focusRing}`}
          >
            <Wand2 className="size-4" aria-hidden />
            Remake this ad
          </button>
          <a
            href={ad.library_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-1.5 rounded py-1 text-[12.5px] text-studio-muted transition hover:text-white ${focusRing}`}
          >
            Open in Meta Ad Library
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

/** Responsive grid of ad cards. */
export function AdGrid({ ads, onRemake }: { ads: AdOut[]; onRemake?: (ad: AdOut) => void }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
      {ads.map((ad) => (
        <li key={ad.ad_archive_id} className="flex">
          <AdCard ad={ad} onRemake={onRemake} />
        </li>
      ))}
    </ul>
  );
}
