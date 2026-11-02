'use client';

import { useState } from 'react';
import { ExternalLink, Play, Star } from 'lucide-react';
import { ProductPreview } from '../../lib/types/product';
import { listText } from '../../lib/product-input-rules.mjs';
import { CustomerReviewItem } from './types';

const linkButton =
  'min-h-11 text-sm font-semibold text-trend-orange hover:text-trend-orange-strong focus-visible:outline-2 focus-visible:outline-trend-orange rounded';

const PLATFORM_NAMES: Record<string, string> = {
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  alibaba: 'Alibaba',
  shopify: 'Shopify',
  ebay: 'eBay',
  etsy: 'Etsy',
  walmart: 'Walmart',
  generic: 'the page',
  unknown: 'the page',
  other: 'the page',
};

export function ExtractionPreview({
  preview,
  imageCount,
  poster,
  onReview,
}: {
  preview: ProductPreview;
  imageCount: number;
  poster?: string;
  onReview: () => void;
}) {
  const raw = preview.raw_metadata ?? {};
  const videos = (Array.isArray(raw.videos) ? raw.videos : []).filter(
    (v): v is string => typeof v === 'string',
  );
  const reviews = (
    Array.isArray(raw.customer_reviews) ? raw.customer_reviews : []
  ) as CustomerReviewItem[];
  const [video, setVideo] = useState<string | null>(videos[0] ?? null);
  const [showReviews, setShowReviews] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const platform =
    PLATFORM_NAMES[preview.source_platform?.toLowerCase()] ?? preview.source_platform ?? 'the page';
  const found = [
    preview.title && 'name',
    preview.description && 'description',
    preview.price !== null && preview.price !== undefined && 'price',
    imageCount > 0 && `${imageCount} photo${imageCount > 1 ? 's' : ''}`,
  ].filter(Boolean) as string[];
  const missing = [
    !preview.title && 'the name',
    !preview.description && 'the description',
    imageCount === 0 && 'the photos',
  ].filter(Boolean) as string[];
  const partial = missing.length > 0 || preview.extraction_status === 'partial';
  const desc = preview.description ?? '';

  return (
    <div className="animate-rise space-y-4 rounded-xl bg-cream p-4 motion-reduce:animate-none">
      <div role="status" className="space-y-1">
        <p className="text-[15px] font-semibold text-ink">
          {partial ? 'Partial import' : 'Imported'} from {platform}
        </p>
        <p className="text-sm text-ink">
          {found.length > 0 ? `Prefilled: ${listText(found)}. ` : ''}
          Review the fields marked “Imported” in the sheet.
        </p>
        {missing.length > 0 && (
          <p className="text-sm text-ink">
            Not found on the page: {listText(missing)}. Fill it in by hand.
          </p>
        )}
        <button type="button" onClick={onReview} className={linkButton}>
          Review the sheet
        </button>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {preview.price !== null && preview.price !== undefined && (
          <div>
            <dt className="text-ink-muted">Listed price</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {Number(preview.price).toLocaleString('en-US')} {preview.currency ?? ''}
            </dd>
          </div>
        )}
        {preview.rating !== null && preview.rating !== undefined && (
          <div>
            <dt className="text-ink-muted">Rating</dt>
            <dd className="flex items-center gap-1 font-semibold tabular-nums text-ink">
              <Star className="size-3.5 fill-trend-gold text-trend-gold" aria-hidden />
              {Number(preview.rating).toFixed(1)}
              {preview.reviews_count ? (
                <span className="font-normal text-ink-muted">
                  ({preview.reviews_count.toLocaleString('en-US')} reviews)
                </span>
              ) : null}
            </dd>
          </div>
        )}
        {preview.availability && preview.availability !== 'unknown' && (
          <div>
            <dt className="text-ink-muted">Availability</dt>
            <dd className="font-semibold text-ink">
              {preview.availability === 'in_stock' ? 'In stock' : preview.availability}
            </dd>
          </div>
        )}
      </dl>

      {desc && (
        <div className="space-y-1">
          <p
            className={`whitespace-pre-line text-sm leading-relaxed text-ink ${
              showDesc ? '' : 'line-clamp-3'
            }`}
          >
            {desc}
          </p>
          {desc.length > 220 && (
            <button type="button" onClick={() => setShowDesc((v) => !v)} className={linkButton}>
              {showDesc ? 'Show less' : 'Read the full description'}
            </button>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">
            Videos found{' '}
            <span className="font-normal tabular-nums text-ink-muted">({videos.length})</span>
          </p>
          {video && (
            <video
              key={video}
              src={video}
              controls
              preload="metadata"
              poster={poster}
              className="aspect-video w-full rounded-lg bg-ink"
            />
          )}
          {videos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {videos.slice(0, 8).map((v, i) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVideo(v)}
                  aria-pressed={v === video}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-trend-orange ${
                    v === video
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink hover:border-ink'
                  }`}
                >
                  <Play className="size-3 fill-current" aria-hidden />
                  Video {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            aria-expanded={showReviews}
            aria-controls="extracted-reviews"
            onClick={() => setShowReviews((v) => !v)}
            className={linkButton}
          >
            {showReviews ? 'Hide reviews' : `Read customer reviews (${reviews.length})`}
          </button>
          {showReviews && (
            <ul id="extracted-reviews" className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {reviews.map((r, i) => (
                <li key={i} className="rounded-lg bg-white p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{r.author || 'Customer'}</span>
                    {typeof r.rating === 'number' && (
                      <span className="tabular-nums text-ink-muted">
                        {Math.min(5, Math.max(0, r.rating)).toFixed(1)} / 5
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-1 font-medium text-ink">{r.title}</p>}
                  {r.comment && <p className="mt-1 line-clamp-3 text-ink">{r.comment}</p>}
                  {r.date && <p className="mt-1 text-xs text-ink-muted">{r.date}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview.source_url && (
        <a
          href={preview.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          View the source page
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}
