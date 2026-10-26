'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ActionBar } from '../../components/product-input/ActionBar';
import { GuideDialog, Lightbox } from '../../components/product-input/dialogs';
import { ImportPanel } from '../../components/product-input/ImportPanel';
import { ProductInfoForm } from '../../components/product-input/ProductInfoForm';
import { StepLine, StepRail } from '../../components/product-input/StepRail';
import { UserMenu } from '../../components/product-input/UserMenu';
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

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh flex-col bg-cream text-ink">
        <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <Image src="/symbol.png" alt="" width={28} height={28} className="object-contain" />
            <span className="text-lg font-bold tracking-tight">TrendED</span>
            <span className="sr-only">: retour au tableau de bord</span>
          </Link>
          <UserMenu />
        </header>

        <div className="flex flex-1">
          <aside className="hidden w-60 shrink-0 px-3 pb-6 pt-4 lg:block">
            <div className="sticky top-4 h-[calc(100dvh-5.5rem)]">
              <StepRail onOpenGuide={() => setGuideOpen(true)} />
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col bg-white lg:mb-2 lg:mr-2 lg:rounded-2xl lg:border lg:border-line">
            <div className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8">
              <div className="mb-8 space-y-2">
                <StepLine />
                <h1 className="text-[26px] font-black leading-tight tracking-tight text-ink md:text-[32px]">
                  Ajouter un produit
                </h1>
                <p className="max-w-2xl text-[15px] text-ink-muted">
                  Importez-le depuis sa page ou remplissez sa fiche. Vous relirez tout avant de
                  lancer l&apos;analyse.
                </p>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="min-h-11 text-sm font-semibold text-trend-orange hover:text-trend-orange-strong focus-visible:outline-2 focus-visible:outline-trend-orange lg:hidden"
                >
                  Conseils pour la fiche
                </button>
              </div>

              <div className="grid items-start gap-12 xl:grid-cols-2 xl:gap-14">
                <ImportPanel
                  draft={draft}
                  onOpenImage={setLightbox}
                  onStartManual={() => focusField('product-title')}
                />
                <ProductInfoForm draft={draft} />
              </div>
            </div>

            <ActionBar draft={draft} onContinue={() => void handleContinue()} />
          </main>
        </div>

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
      </div>
    </ProtectedRoute>
  );
}
