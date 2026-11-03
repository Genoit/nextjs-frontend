'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ActionBar } from '../../components/product-input/ActionBar';
import { GuideDialog, Lightbox } from '../../components/product-input/dialogs';
import { ImportPanel } from '../../components/product-input/ImportPanel';
import { ProductInfoForm } from '../../components/product-input/ProductInfoForm';
import { Stepper } from '../../components/product-input/StepRail';
import { useProductDraft } from '../../components/product-input/use-product-draft';
import { nextStepHref } from '../../lib/product-input-rules.mjs';

const focusField = (id: string) => document.getElementById(id)?.focus();

export default function ProductInputPage() {
  const router = useRouter();
  const draft = useProductDraft();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  // The dashboard sends `?url=` (link import, prefilled) or `?mode=manual`.
  const { setMode, setUrl } = draft;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pasted = params.get('url');
    if (pasted) {
      setMode('url');
      setUrl(pasted);
    } else if (params.get('mode') === 'manual') {
      setMode('manual');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read the query once on arrival
  }, []);

  const handleContinue = async () => {
    const { errors } = draft.check;
    const id = await draft.submit();
    if (id) {
      router.push(nextStepHref(id));
      return;
    }
    // Blocked: errors are now shown under each field; take the merchant to the first one.
    if (errors.title) focusField('product-title');
    else if (errors.description) focusField('product-description');
    else if (errors.price) focusField('product-price');
  };

  const topbar = (
    <>
      <button
        type="button"
        onClick={() => setGuideOpen(true)}
        className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-studio-muted transition hover:bg-studio-surface hover:text-studio-text focus-visible:outline-2 focus-visible:outline-trend-orange"
      >
        <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline">Tips for a good sheet</span>
        <span className="sr-only sm:hidden">Tips for a good sheet</span>
      </button>
    </>
  );

  return (
    <ProtectedRoute>
      <AppShell active="/product-input" topbar={topbar}>
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 pt-8 pb-12 sm:px-6 lg:pt-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="font-editorial text-[28px] leading-[1.1] text-studio-text sm:text-[32px]">
                  Add a product
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-5 text-studio-muted">
                  Import it or fill in the sheet. You review everything before the analysis starts.
                </p>
              </div>
              <Stepper current={0} />
            </div>

            <div className="mt-8 divide-y divide-studio-rule border-t border-studio-rule">
              <div className="py-8">
                <ImportPanel
                  draft={draft}
                  onOpenImage={setLightbox}
                  onStartManual={() => focusField('product-title')}
                />
              </div>
              <div className="py-8">
                <ProductInfoForm draft={draft} />
              </div>
            </div>
          </div>

          <ActionBar draft={draft} onContinue={() => void handleContinue()} />
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
      </AppShell>
    </ProtectedRoute>
  );
}
