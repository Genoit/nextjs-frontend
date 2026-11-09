'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronDown, ExternalLink, Play, Star } from 'lucide-react';
import { ProductPreview } from '../../lib/types/product';
import { CustomerReviewItem } from './types';

const PLATFORM_NAMES: Record<string, string> = {
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  alibaba: 'Alibaba',
  shopify: 'Shopify',
  ebay: 'eBay',
  etsy: 'Etsy',
  walmart: 'Walmart',
  generic: 'Website',
  unknown: 'Website',
  other: 'Website',
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

  const [expanded, setExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(videos[0] ?? null);

  const platform =
    PLATFORM_NAMES[preview.source_platform?.toLowerCase()] ?? preview.source_platform ?? 'Store';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all">
      <div className="flex items-start gap-3.5">
        {poster ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-studio-ground">
            <Image src={poster} alt="" fill unoptimized className="object-cover" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="size-3" aria-hidden />
              Imported from {platform}
            </span>

            {preview.price !== null && preview.price !== undefined && (
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-sm font-semibold tabular-nums text-white">
                {Number(preview.price).toLocaleString('en-US')} {preview.currency ?? 'EUR'}
              </span>
            )}

            {preview.rating !== null && preview.rating !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-sm font-medium text-amber-300">
                <Star className="size-2.5 fill-current" aria-hidden />
                {Number(preview.rating).toFixed(1)}
              </span>
            )}

            {imageCount > 0 && (
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-sm text-studio-muted">
                {imageCount} photo{imageCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <p className="line-clamp-1 text-sm font-medium text-white">
            {preview.title || 'Product found'}
          </p>

          <p className="text-sm text-studio-muted">
            Information prefilled in the form below. Review or edit anytime.
          </p>
        </div>

        {preview.source_url && (
          <a
            href={preview.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-studio-muted hover:bg-white/5 hover:text-white"
            title="Open original page"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
      </div>

      {(videos.length > 0 || reviews.length > 0) && (
        <div className="mt-3 border-t border-white/5 pt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-sm text-studio-muted hover:text-white"
          >
            <span>
              {videos.length > 0 && `${videos.length} video${videos.length > 1 ? 's' : ''}`}
              {videos.length > 0 && reviews.length > 0 && ' · '}
              {reviews.length > 0 && `${reviews.length} reviews`}
            </span>
            <ChevronDown
              className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 pt-1">
              {videos.length > 0 && (
                <div className="space-y-2">
                  {selectedVideo && (
                    <video
                      key={selectedVideo}
                      src={selectedVideo}
                      controls
                      preload="metadata"
                      poster={poster}
                      className="aspect-video max-h-48 w-full rounded-lg bg-black"
                    />
                  )}
                  {videos.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {videos.map((v, i) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelectedVideo(v)}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
                            v === selectedVideo
                              ? 'bg-white/10 text-white'
                              : 'text-studio-muted hover:bg-white/5'
                          }`}
                        >
                          <Play className="size-2.5 fill-current" aria-hidden />
                          Video {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {reviews.length > 0 && (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {reviews.slice(0, 5).map((r, i) => (
                    <div key={i} className="rounded-lg bg-white/[0.02] p-2.5 text-sm">
                      <div className="flex items-center justify-between text-studio-muted">
                        <span className="font-medium text-white">{r.author || 'Client'}</span>
                        {r.rating && <span>{r.rating} / 5</span>}
                      </div>
                      {r.comment && (
                        <p className="mt-1 line-clamp-2 text-studio-muted">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
