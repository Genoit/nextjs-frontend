'use client';

import { useRef, useState } from 'react';
import { AlertCircle, ImagePlus, Link2, Loader2, PenLine, Store, Upload } from 'lucide-react';
import { ExtractionPreview } from './ExtractionPreview';
import { ImageGallery } from './ImageGallery';
import { ImportMode } from './types';
import { ProductDraft } from './use-product-draft';

const MODES: { id: ImportMode; label: string; short: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Photos', short: 'Photos', icon: ImagePlus },
  { id: 'url', label: 'Product link', short: 'Link', icon: Link2 },
  { id: 'manual', label: 'Type it in', short: 'Manual', icon: PenLine },
];

export const inputClass =
  'block min-h-11 w-full rounded-[10px] border border-line bg-studio-ground px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted outline-none transition-colors focus:border-trend-orange focus:ring-2 focus:ring-trend-orange/25 aria-[invalid=true]:border-danger';

export const primaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-trend-orange px-5 text-sm font-semibold text-on-accent transition-[transform,background-color] hover:bg-trend-orange-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:cursor-not-allowed disabled:bg-cream disabled:text-ink-muted motion-reduce:transition-none';

/** The near-black action for a step inside the form; orange stays on the screen's one action. */
export const darkButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-on-accent transition-[transform,background-color] hover:bg-black active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:cursor-not-allowed disabled:bg-studio-raised disabled:text-ink-muted motion-reduce:transition-none';

export const secondaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-studio-ground px-4 text-sm font-semibold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

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
    <section
      aria-labelledby="import-title"
      className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10"
    >
      <div>
        <h2 id="import-title" className="text-base font-semibold text-ink">
          Start from
        </h2>
        <p className="mt-1 text-sm leading-5 text-ink-muted">
          Photos, the product page or your own words. Everything stays editable in the sheet.
        </p>
      </div>

      <div className="min-w-0 space-y-5 rounded-2xl bg-studio-surface p-4 sm:p-6">
        <div
          role="tablist"
          aria-label="Import mode"
          className="grid grid-cols-3 gap-1 rounded-[10px] bg-studio-raised p-1"
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
                onClick={() => setMode(m.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-trend-orange ${
                  selected ? 'bg-studio-ground text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate sm:hidden">{m.short}</span>
                <span className="hidden truncate sm:inline">{m.label}</span>
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

        <div
          role="tabpanel"
          id={`panel-${mode}`}
          aria-labelledby={`tab-${mode}`}
          className="space-y-5"
        >
          {mode === 'upload' && (
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
              aria-describedby="upload-rules"
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-studio-ground px-4 py-8 text-center transition-[transform,border-color,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange motion-reduce:transition-none ${
                dragging
                  ? 'scale-[1.01] border-trend-orange bg-cream'
                  : 'border-line hover:border-ink-soft'
              }`}
            >
              <Upload className="size-6 text-ink-soft" strokeWidth={1.75} aria-hidden />
              <span className="text-[15px] font-semibold text-ink">
                {dragging ? 'Drop to add' : 'Choose photos'}
              </span>
              <span className="text-sm text-ink-muted">or drag them here from your computer</span>
              <span id="upload-rules" className="text-sm text-ink-muted">
                JPEG, PNG or WebP · 10 MB max per photo
              </span>
            </button>
          )}

          {mode === 'url' && (
            <div className="space-y-4">
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  void draft.runExtract();
                }}
                className="space-y-2"
              >
                <label htmlFor="product-url" className="block text-sm font-medium text-ink">
                  Product page link
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="product-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    value={draft.url}
                    onChange={(e) => draft.setUrl(e.target.value)}
                    placeholder="https://www.amazon.com/…"
                    aria-invalid={!!draft.urlError}
                    aria-describedby={draft.urlError ? 'url-error url-hint' : 'url-hint'}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={extract.state === 'busy' || !draft.url.trim()}
                    className={`${darkButton} shrink-0`}
                  >
                    {extract.state === 'busy' ? (
                      <>
                        <Loader2
                          className="size-4 animate-spin motion-reduce:animate-none"
                          aria-hidden
                        />
                        Importing…
                      </>
                    ) : (
                      'Import'
                    )}
                  </button>
                </div>
                {draft.urlError && (
                  <p id="url-error" className="text-sm text-danger">
                    {draft.urlError}
                  </p>
                )}
                <p id="url-hint" className="text-sm text-ink-muted">
                  Amazon, AliExpress, Alibaba, Shopify, eBay, Etsy and Walmart are read in detail.
                  Other stores go through a generic reader, sometimes with less detail.
                </p>
              </form>

              <div aria-live="polite">
                {extract.state === 'busy' && (
                  <p role="status" className="flex items-center gap-2 text-sm text-ink">
                    <Loader2
                      className="size-4 animate-spin text-trend-orange motion-reduce:animate-none"
                      aria-hidden
                    />
                    Reading the page… this can take a few seconds.
                  </p>
                )}
                {extract.state === 'error' && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-xl border border-danger/30 p-4 text-sm"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                    <div className="space-y-2">
                      <p className="font-semibold text-ink">Import failed</p>
                      <p className="text-ink">{extract.error}</p>
                      {/robot check/i.test(extract.error) && (
                        <p className="text-ink">
                          Our server is blocked there, your browser is not: open the product page,
                          pass the check if asked, then click the Send to TrendED extension icon.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void draft.runExtract()}
                          className={secondaryButton}
                        >
                          Try again
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMode('manual');
                            onStartManual();
                          }}
                          className={secondaryButton}
                        >
                          Fill it in by hand
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
          )}

          {mode === 'manual' && (
            <div className="space-y-3 rounded-xl border border-studio-rule bg-studio-ground p-4 text-[15px] text-ink">
              <p>
                Fill in the product sheet. A name and a short description are enough to continue;
                photos make a better ad.
              </p>
              <button type="button" onClick={onStartManual} className={secondaryButton}>
                Start with the name
              </button>
            </div>
          )}

          {draft.uploadErrors.length > 0 && (
            <ul role="alert" className="space-y-1 text-sm text-danger">
              {draft.uploadErrors.map((err) => (
                <li key={err} className="flex gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {err}
                </li>
              ))}
            </ul>
          )}

          {(images.length > 0 || mode === 'manual') && (
            <ImageGallery
              images={images}
              onOpen={onOpenImage}
              onRemove={draft.removeImage}
              onAdd={pickFiles}
            />
          )}
        </div>

        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Store className="size-4 shrink-0" aria-hidden />
          Import from your Shopify or WooCommerce store: coming soon.
        </p>
      </div>
    </section>
  );
}
