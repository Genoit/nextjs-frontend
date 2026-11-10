'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ExternalLink, Star, X } from 'lucide-react';
import { ProductImageItem } from './types';

/** Native modal <dialog>: top layer, inert page, Escape, focus returns to the opener on close. */
export function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [onClose]);
  return ref;
}

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-lg text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white';

export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  onMakeCover,
}: {
  images: ProductImageItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  onMakeCover: (i: number) => void;
}) {
  const open = index !== null && !!images[index];
  const ref = useModal(open, onClose);
  const img = open ? images[index] : null;
  const n = images.length;
  const go = (delta: number) => index !== null && onIndex((index + delta + n) % n);

  return (
    <dialog
      ref={ref}
      aria-label="Product photos"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink p-3 text-on-accent backdrop:bg-stage/60 sm:p-6"
    >
      {img && index !== null && (
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm tabular-nums" aria-live="polite">
              Photo {index + 1} of {n}
              {index === 0 && ' · cover'}
            </p>
            <div className="flex items-center gap-1">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => onMakeCover(index)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Star className="size-4 text-trend-gold" aria-hidden />
                  Use as cover
                </button>
              )}
              <a
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className={iconButton}
                aria-label="Open the original in a new tab"
              >
                <ExternalLink className="size-5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={onClose}
                className={iconButton}
                aria-label="Close"
                autoFocus
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              src={img.url}
              alt={img.alt}
              fill
              unoptimized
              sizes="90vw"
              className="object-contain"
            />
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className={`${iconButton} absolute left-0 top-1/2 -translate-y-1/2 bg-stage/60`}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className={`${iconButton} absolute right-0 top-1/2 -translate-y-1/2 bg-stage/60`}
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>

          {n > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-1">
              {images.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`relative size-14 shrink-0 overflow-hidden rounded-md outline-offset-2 focus-visible:outline-2 focus-visible:outline-white ${
                    i === index ? 'ring-2 ring-trend-orange' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={t.url}
                    alt=""
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export function GuideDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useModal(open, onClose);
  return (
    <dialog
      ref={ref}
      aria-labelledby="guide-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-studio-ground p-0 text-ink shadow-xl backdrop:bg-stage/40"
    >
      <div className="p-6">
        <h2 id="guide-title" className="text-xl font-bold">
          Writing a good product sheet
        </h2>
        <ul className="mt-4 space-y-4 text-[15px] leading-relaxed">
          <li>
            <p className="font-semibold">Sharp photos</p>
            <p className="text-ink-muted">
              The product alone on a plain background, then in use. The first photo is the cover.
            </p>
          </li>
          <li>
            <p className="font-semibold">A factual description</p>
            <p className="text-ink-muted">
              Material, size, use, what is included. The analysis separates verified facts from
              marketing guesses: the more precise the description, the more facts it has.
            </p>
          </li>
          <li>
            <p className="font-semibold">Concrete benefits</p>
            <p className="text-ink-muted">“Charges in 2 h” rather than “Excellent quality”.</p>
          </li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="inline-flex min-h-11 items-center rounded-lg bg-trend-orange px-5 text-sm font-semibold text-on-accent hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
          >
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}
