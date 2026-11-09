'use client';

import { useRef, useState } from 'react';
import { AlertCircle, ImagePlus, Link2, Loader2, PenLine, Upload } from 'lucide-react';
import { ExtractionPreview } from './ExtractionPreview';
import { ImageGallery } from './ImageGallery';
import { ImportMode } from './types';
import { ProductDraft } from './use-product-draft';

const MODES: { id: ImportMode; label: string; icon: typeof Upload }[] = [
  { id: 'url', label: 'Product Link', icon: Link2 },
  { id: 'upload', label: 'Upload Photos', icon: ImagePlus },
  { id: 'manual', label: 'Manual Entry', icon: PenLine },
];

export const inputClass =
  'block h-12 w-full rounded-xl border border-white/10 bg-studio-ground px-4 text-[15px] text-white placeholder:text-studio-muted/50 outline-none transition-colors focus:border-trend-orange focus:ring-1 focus:ring-trend-orange/40 aria-[invalid=true]:border-red-500';

export const primaryButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-trend-orange px-4 text-sm font-semibold text-black transition-all hover:bg-trend-orange-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-trend-orange disabled:cursor-not-allowed disabled:opacity-50';

export const darkButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition-all hover:bg-white/15 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-trend-orange disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.07] hover:border-white/20 focus-visible:outline-2 focus-visible:outline-trend-orange';

export function ImportPanel({
  draft,
  onOpenImage,
  onStartManual,
}: {
  draft: ProductDraft;
  onOpenImage: (index: number) => void;
  onStartManual: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [dragging, setDragging] = useState(false);
  const { mode, setMode, images, extract } = draft;
  const pickFiles = () => fileRef.current?.click();

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + MODES.length) % MODES.length;
    setMode(MODES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="space-y-3.5">
      {/* Segmented Mode Selector */}
      <div
        role="tablist"
        aria-label="Import mode"
        className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1"
      >
        {MODES.map((m, i) => {
          const Icon = m.icon;
          const selected = mode === m.id;
          return (
            <button
              key={m.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${m.id}`}
              aria-selected={selected}
              aria-controls={`panel-${m.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setMode(m.id);
                if (m.id === 'manual') onStartManual();
              }}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                selected
                  ? 'border border-white/10 bg-studio-ground text-white shadow-xs font-semibold'
                  : 'text-studio-muted hover:text-white'
              }`}
            >
              <Icon className="size-3 shrink-0" aria-hidden />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files?.length) draft.addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Mode Panel */}
      <div
        role="tabpanel"
        id={`panel-${mode}`}
        aria-labelledby={`tab-${mode}`}
        className="space-y-3"
      >
        {mode === 'url' && (
          <div className="space-y-2.5">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void draft.runExtract();
              }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="product-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    value={draft.url}
                    onChange={(e) => draft.setUrl(e.target.value)}
                    placeholder="https://www.amazon.com/dp/..."
                    aria-invalid={!!draft.urlError}
                    aria-describedby={draft.urlError ? 'url-error' : undefined}
                    className={`${inputClass} pr-12`}
                  />
                  {draft.url && (
                    <button
                      type="button"
                      onClick={() => draft.setUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-studio-muted hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={extract.state === 'busy' || !draft.url.trim()}
                  className={`${primaryButton} shrink-0 px-4`}
                >
                  {extract.state === 'busy' ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      <span>Importing…</span>
                    </>
                  ) : (
                    <span>Import</span>
                  )}
                </button>
              </div>

              {draft.urlError && (
                <p id="url-error" className="text-sm text-red-400">
                  {draft.urlError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1 text-[11px] text-studio-muted">
                <span>Supports:</span>
                {['Amazon', 'Shopify', 'AliExpress', 'eBay', 'Etsy', 'Walmart'].map((s) => (
                  <span key={s} className="rounded bg-white/5 px-1 py-0.5 text-studio-muted">
                    {s}
                  </span>
                ))}
              </div>
            </form>

            {/* Extraction status */}
            <div aria-live="polite">
              {extract.state === 'busy' && (
                <div className="flex items-center gap-2 rounded-xl border border-trend-orange/20 bg-trend-orange/5 p-2.5 text-sm text-trend-orange">
                  <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
                  <span>Reading product page and fetching visuals…</span>
                </div>
              )}

              {extract.state === 'error' && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300"
                >
                  <AlertCircle className="size-3.5 shrink-0 text-red-400 mt-0.5" aria-hidden />
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-white">Import failed</p>
                    <p>{extract.error}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => void draft.runExtract()}
                        className="rounded bg-white/10 px-2 py-0.5 text-sm text-white hover:bg-white/20"
                      >
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('manual');
                          onStartManual();
                        }}
                        className="rounded bg-white/5 px-2 py-0.5 text-sm text-studio-muted hover:text-white"
                      >
                        Fill manually
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {extract.state === 'done' && draft.preview && (
                <ExtractionPreview
                  key={draft.preview.source_url}
                  preview={draft.preview}
                  imageCount={images.filter((i) => i.origin === 'import').length}
                  poster={images[0]?.url}
                  onReview={onStartManual}
                />
              )}
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={pickFiles}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files.length) draft.addFiles(e.dataTransfer.files);
              }}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed min-h-[240px] py-10 px-6 text-center transition-all ${
                dragging
                  ? 'border-trend-orange bg-trend-orange/5 scale-[1.005]'
                  : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-white/5 text-studio-muted">
                <Upload className="size-4 text-white" aria-hidden />
              </div>
              <span className="text-sm font-semibold text-white">
                {dragging ? 'Drop photos here' : 'Drop photos here or click to browse'}
              </span>
              <span className="text-xs text-studio-muted">
                JPEG, PNG or WebP · Max 10 MB per file
              </span>
            </button>
          </div>
        )}

        {mode === 'manual' && images.length === 0 && (
          <button
            type="button"
            onClick={pickFiles}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-8 px-6 text-center transition-all hover:border-white/30 hover:bg-white/[0.04]"
          >
            <Upload className="size-4 text-studio-muted" aria-hidden />
            <span className="text-sm font-medium text-white">Attach product photos (optional)</span>
            <span className="text-[11px] text-studio-muted">Click to browse your computer</span>
          </button>
        )}

        {draft.uploadErrors.length > 0 && (
          <ul role="alert" className="space-y-1 text-sm text-red-400">
            {draft.uploadErrors.map((err) => (
              <li key={err} className="flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                {err}
              </li>
            ))}
          </ul>
        )}

        {/* Photos list if any exist */}
        {images.length > 0 && (
          <div className="pt-1">
            <ImageGallery
              images={images}
              onOpen={onOpenImage}
              onRemove={draft.removeImage}
              onAdd={pickFiles}
            />
          </div>
        )}
      </div>
    </div>
  );
}
