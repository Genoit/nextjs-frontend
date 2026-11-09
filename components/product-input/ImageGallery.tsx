'use client';

import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { ProductImageItem } from './types';

export function ImageGallery({
  images,
  onOpen,
  onRemove,
  onAdd,
}: {
  images: ProductImageItem[];
  onOpen: (index: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-studio-text">
          Photos <span className="text-studio-muted">({images.length})</span>
        </span>
        {images.length > 1 && (
          <span className="text-studio-muted">Click photo to enlarge or set cover</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-studio-ground transition-all hover:border-white/20"
          >
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Open photo ${i + 1}${i === 0 ? ' (cover)' : ''}`}
              className="size-full outline-none focus-visible:ring-2 focus-visible:ring-trend-orange"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                unoptimized
                sizes="120px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            {i === 0 && (
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                Cover
              </span>
            )}

            {img.uploading ? (
              <div
                role="status"
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs"
              >
                <span className="size-4 animate-spin rounded-full border-2 border-trend-orange border-t-transparent" />
                <span className="sr-only">Uploading {img.alt}…</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(img.id);
                }}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white focus-visible:opacity-100"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-studio-muted transition-all hover:border-trend-orange/50 hover:bg-trend-orange/[0.03] hover:text-white"
        >
          <Plus className="size-4" aria-hidden />
          <span className="text-xs font-medium">Add</span>
        </button>
      </div>
    </div>
  );
}
