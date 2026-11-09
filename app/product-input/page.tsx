'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, HelpCircle, Package } from 'lucide-react';
import { DashShell } from '../../components/dashboard/DashShell';
import { ActionBar } from '../../components/product-input/ActionBar';
import { GuideDialog, Lightbox } from '../../components/product-input/dialogs';
import { ImportPanel } from '../../components/product-input/ImportPanel';
import { ProductInfoForm } from '../../components/product-input/ProductInfoForm';
import { Stepper } from '../../components/product-input/StepRail';
import { useProductDraft } from '../../components/product-input/use-product-draft';
import { useProduct } from '../../hooks/use-products';
import { CreativeAdWorkflow, type Step } from '../../components/creative/CreativeAdWorkflow';
import { nextStepHref } from '../../lib/product-input-rules.mjs';
import { takePendingPhotos } from '../../lib/pending-photos';
import { CAPTURE_EVENT, takeExtensionCapture } from '../../lib/extension-capture';

const focusField = (id: string) => document.getElementById(id)?.focus();

// Page stepper (0 Product, 1 Format, 2 Angle) <-> workflow steps. The analysis, storyboard,
// visuals and render run without a screen: the render is followed on /generate.
const STEPPER_OF: Record<Step, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2 };
const STEP_OF: Record<number, Step> = { 1: 2, 2: 3 };

export default function ProductInputRoute() {
  return (
    <Suspense>
      <ProductInputPage />
    </Suspense>
  );
}

function ProductInputPage() {
  const router = useRouter();
  // Once saved, the product stays on this page (?product=) through the format, the angle and
  // the video; a reload resumes where the workflow stands.
  const productId = useSearchParams().get('product');
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [shownStep, setShownStep] = useState<Step>(2);
  const draft = useProductDraft();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  // Fetch product info if in workflow mode
  const { product } = useProduct({
    productId: productId ?? undefined,
    fetchOnMount: !!productId,
  });

  // The dashboard sends `?url=` (imported on arrival: the sheet opens prefilled to review),
  // `?mode=upload`, or `?mode=manual` with an optional `describe=` typed in its composer.
  const { setMode, setUrl, setField, addFiles, runExtract } = draft;
  const arrived = useRef(false);

  useEffect(() => {
    if (arrived.current) return; // dev StrictMode runs effects twice: import once
    arrived.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('product')) return; // resuming a saved product: nothing to import
    const pasted = params.get('url');
    const mode = params.get('mode');

    if (params.get('from') === 'extension') {
      setMode('url');
      const importCapture = () => {
        const c = takeExtensionCapture();
        if (!c) return false;
        setUrl(c.url);
        void runExtract(c.url, c.html);
        return true;
      };
      // The extension may write the page before or after this effect runs.
      if (!importCapture()) window.addEventListener(CAPTURE_EVENT, importCapture, { once: true });
    } else if (pasted) {
      setMode('url');
      setUrl(pasted);
      void runExtract(pasted);
    } else if (mode === 'manual') {
      setMode('manual');
      const described = params.get('describe');
      if (described) setField('description', described);
    } else if (mode === 'upload') {
      setMode('upload');
    }

    // Photos picked in the dashboard composer (kept across the login detour).
    const photos = takePendingPhotos();
    if (photos.length) addFiles(photos);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the query once on arrival
  }, []);

  const handleContinue = async () => {
    const { errors } = draft.check;
    const id = await draft.submit();
    if (id) {
      setSelectedStep(null);
      router.replace(nextStepHref(id));
      return;
    }
    // Blocked: errors are now shown under each field; take the merchant to the first one.
    if (errors.title) focusField('product-title');
    else if (errors.description) focusField('product-description');
    else if (errors.price) focusField('product-price');
  };

  const productImg = product?.images?.find((img) => img.is_primary)?.url || product?.main_image_url;

  return (
    <DashShell>
      <main className="flex flex-1 flex-col justify-between">
        <div className="w-full flex-1 px-4 sm:px-8 lg:px-12 pb-16 pt-4 max-w-[1560px] mx-auto">
          {/* Header area with product context */}
          <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6">
            {productId && product && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:px-5 sm:py-3 backdrop-blur-sm w-full">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {productImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImg} alt="" className="size-full object-cover" />
                    ) : (
                      <Package className="size-5 text-studio-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-studio-muted">Selected product</p>
                    <p className="text-sm font-bold text-white truncate max-w-sm sm:max-w-lg md:max-w-xl">
                      {product.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {product.price && (
                    <span className="rounded-full bg-trend-orange/10 px-3 py-1 text-xs font-bold text-trend-orange">
                      {product.price} {product.currency || '€'}
                    </span>
                  )}
                  <Link
                    href={`/products/${productId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-studio-muted transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    <span>Product page</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
                  {productId ? 'Create your ad' : 'Add a product'}
                </h1>
                <p className="mt-1.5 text-sm text-studio-muted">
                  {productId
                    ? 'Pick the format and the angle. TrendED writes the script and makes the video.'
                    : 'Import from a link or photos. You check every detail before the analysis.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex h-9 w-fit shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 text-xs font-medium text-studio-muted transition hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-trend-orange"
              >
                <HelpCircle className="size-3.5 text-trend-orange" aria-hidden />
                <span>Tips & guide</span>
              </button>
            </div>

            {/* Stepper progress tracker */}
            <div>
              <Stepper
                current={productId ? STEPPER_OF[shownStep] : 0}
                onSelect={productId ? (i) => setSelectedStep(STEP_OF[i]) : undefined}
              />
            </div>
          </div>

          {/* Workflow step content */}
          {productId ? (
            <div className="mt-8">
              <CreativeAdWorkflow
                key={productId}
                productId={productId}
                autoAnalyze
                selectedStep={selectedStep}
                onSelectStep={setSelectedStep}
                onStepChange={setShownStep}
              />
            </div>
          ) : (
            /* Product import panel */
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <section aria-labelledby="pi-source" className="lg:col-span-5">
                <h2 id="pi-source" className="text-base font-semibold text-white">
                  Product source
                </h2>
                <p className="mt-1 text-xs text-studio-muted">
                  A product link, photos or your own words.
                </p>
                <div className="mt-5">
                  <ImportPanel
                    draft={draft}
                    onOpenImage={setLightbox}
                    onStartManual={() => focusField('product-title')}
                  />
                </div>
              </section>

              <section
                aria-labelledby="pi-sheet"
                className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-12"
              >
                <h2 id="pi-sheet" className="text-base font-semibold text-white">
                  Product details
                </h2>
                <p className="mt-1 text-xs text-studio-muted">The key facts your ad is built on.</p>
                <div className="mt-5">
                  <ProductInfoForm draft={draft} />
                </div>
              </section>
            </div>
          )}
        </div>

        {!productId && <ActionBar draft={draft} onContinue={() => void handleContinue()} />}
      </main>

      <Lightbox
        images={draft.images}
        index={lightbox}
        onIndex={setLightbox}
        onClose={closeLightbox}
        onMakeCover={(i) => {
          draft.makeCover(i);
          setLightbox(0);
        }}
      />
      <GuideDialog open={guideOpen} onClose={closeGuide} />
    </DashShell>
  );
}
