'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Globe,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { takeReturnTo, useAuth } from '../../lib/auth';
import { api, ApiRequestError } from '../../lib/api/core';
import ThemeToggle from '../../components/ThemeToggle';
import { BrandLogo } from '../../components/Icons';
import { AD_SETTINGS_KEY } from '../../lib/ad-settings-rules.mjs';

// Pre-configured winning products for users who don't have an active store link yet
const DEMO_PRODUCTS = [
  {
    id: 'posture',
    title: 'Correcteur de Posture Ergonomique Pro',
    category: 'fitness' as const,
    categoryLabel: 'Santé & Bien-être',
    badge: '🔥 +140k ventes en ads',
    tag: 'Best-Seller',
    price: '29.99 €',
    problem: 'Douleurs de dos et mauvaise posture assise prolongée',
    description:
      'Dispositif discret et respirant qui redresse la colonne et soulage les tensions cervicales.',
    icon: '🩺',
    url: 'https://demo.trended.ai/products/posture-corrector-pro',
    hooks: [
      {
        id: 'problem',
        title: 'Le Problème Choc (Scroll-Stopper)',
        tag: 'Rétention Maximale',
        hookText:
          '« Si tu passes plus de 4 heures assis par jour, arrête tout. Regarde ce qui arrive à ton dos... »',
        description:
          'Attaque frontale de la douleur quotidienne avec démonstration percutante dès la 2e seconde.',
        badgeColor: 'border-danger/40 bg-danger/10 text-danger',
      },
      {
        id: 'viral',
        title: 'La Démo Virale TikTok',
        tag: 'Tendance Virale',
        hookText:
          '« J’ai commandé ce gadget viral dont tout le monde parle pour voir si c’était vraiment efficace... »',
        description: 'Style unboxing et test spontané avec réaction immédiate face caméra.',
        badgeColor: 'border-trend-orange/40 bg-trend-orange/10 text-trend-orange',
      },
      {
        id: 'review',
        title: 'Le Témoignage Spontané UGC',
        tag: 'Preuve Sociale Forte',
        hookText:
          '« Honnêtement, j’étais ultra sceptique au début... mais après 7 jours, impossible de m’en passer. »',
        description:
          'Confiance maximale, format selfie authentique recommandé pour les flux Meta et TikTok.',
        badgeColor: 'border-dash-green/40 bg-dash-green/10 text-dash-green',
      },
    ],
  },
  {
    id: 'thermos',
    title: 'Gourde Thermos Intelligente avec Écran LED',
    category: 'home' as const,
    categoryLabel: 'Maison & Gadgets',
    badge: '⚡ Tendance TikTok Viral',
    tag: 'Viral Gadget',
    price: '34.90 €',
    problem: 'Boissons tièdes et brûlures imprévues au bureau ou en voyage',
    description:
      'Gourde isotherme en inox avec capteur tactile qui affiche la température exacte en temps réel.',
    icon: '☕',
    url: 'https://demo.trended.ai/products/smart-led-thermos',
    hooks: [
      {
        id: 'problem',
        title: 'Le Piège Quotidien',
        tag: 'Effet Curiosité',
        hookText:
          '« Combien de fois tu t’es brûlé la langue avec un café trop chaud sans savoir à quelle température il était ? »',
        description: 'Mise en scène d’un moment frustrant que tout le monde a déjà vécu.',
        badgeColor: 'border-danger/40 bg-danger/10 text-danger',
      },
      {
        id: 'viral',
        title: 'La Fonction Magique',
        tag: 'High CTR',
        hookText:
          '« Ce détail à 30 secondes a fait exploser mes vues TikTok... regarde juste l’écran tactile. »',
        description: 'Gros plan sur l’écran tactile LED qui s’allume, effet hypnotique immédiat.',
        badgeColor: 'border-trend-orange/40 bg-trend-orange/10 text-trend-orange',
      },
      {
        id: 'review',
        title: 'L’Indispensable du Bureau',
        tag: 'UGC Lifestyle',
        hookText:
          '« Le seul objet que j’emporte partout avec moi depuis 2 semaines. Tout le monde me demande où je l’ai trouvé. »',
        description: 'Positionnement lifestyle premium qui donne envie d’avoir le même accessoire.',
        badgeColor: 'border-dash-green/40 bg-dash-green/10 text-dash-green',
      },
    ],
  },
  {
    id: 'beauty',
    title: 'Nettoyant Visage Ultrasonique Pro',
    category: 'beauty' as const,
    categoryLabel: 'Beauté & Soins',
    badge: '💄 94% de conversion UGC',
    tag: 'Haute Marge',
    price: '39.99 €',
    problem: 'Points noirs tenaces et soins esthétiques coûteux en institut',
    description:
      'Appareil exfoliant à micro-vibrations soniques qui élimine les impuretés en 3 minutes.',
    icon: '✨',
    url: 'https://demo.trended.ai/products/ultrasonic-skin-scrubber',
    hooks: [
      {
        id: 'problem',
        title: 'L’Erreur de Routine',
        tag: 'Choc Visuel',
        hookText:
          '« Si tu nettoies encore ta peau avec tes doigts, regarde la quantité de saletés qui reste bloquée... »',
        description: 'Démonstration visuelle saisissante de l’extraction des impuretés.',
        badgeColor: 'border-danger/40 bg-danger/10 text-danger',
      },
      {
        id: 'viral',
        title: 'L’Effet Avant / Après',
        tag: 'Preuve Directe',
        hookText:
          '« J’ai remplacé mes séances d’institut à 80€ par cet appareil à la maison... résultat en 3 minutes. »',
        description: 'Comparaison économique percutante et démonstration des résultats immédiats.',
        badgeColor: 'border-trend-orange/40 bg-trend-orange/10 text-trend-orange',
      },
      {
        id: 'review',
        title: 'Le Re-stock d’Urgence',
        tag: 'UGC Facecam',
        hookText:
          '« Ma dermato m’a demandé ce que j’avais changé dans ma routine... voici mon secret numéro un. »',
        description: 'Recommandation personnelle valorisante qui crée un fort sentiment d’urgence.',
        badgeColor: 'border-dash-green/40 bg-dash-green/10 text-dash-green',
      },
    ],
  },
];

const TARGET_MARKETS = [
  { code: 'France', label: 'France 🇫🇷', lang: 'fr', voice: 'Français (Voix UGC Naturelle)' },
  { code: 'United States', label: 'États-Unis 🇺🇸', lang: 'en', voice: 'English (US Native UGC)' },
  { code: 'United Kingdom', label: 'Royaume-Uni 🇬🇧', lang: 'en', voice: 'English (UK Accent)' },
  { code: 'Germany', label: 'Allemagne 🇩🇪', lang: 'de', voice: 'Deutsch (Native)' },
  { code: 'Spain', label: 'Espagne 🇪🇸', lang: 'es', voice: 'Español (Dinámico)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<(typeof DEMO_PRODUCTS)[0]>(
    DEMO_PRODUCTS[0],
  );
  const [customUrl, setCustomUrl] = useState('');
  const [targetMarket, setTargetMarket] = useState('France');
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [businessType, setBusinessType] = useState<
    'dropshipping' | 'dtc_brand' | 'marketplace_seller'
  >('dropshipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulatingAnalysis, setIsSimulatingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace('/login');
    }
  }, [isAuthLoading, token, router]);

  // When step 2 is entered, simulate a 1.2s AI analysis to give that satisfying "IA thinking" feel
  const handleProceedToStep2 = () => {
    setError(null);
    setIsSimulatingAnalysis(true);
    setStep(2);
    setTimeout(() => {
      setIsSimulatingAnalysis(false);
    }, 1200);
  };

  const handleLaunchFirstAd = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    const chosenProductTitle = customUrl.trim() ? customUrl.trim() : selectedDemoProduct.title;
    const chosenProductUrl = customUrl.trim() ? customUrl.trim() : selectedDemoProduct.url;
    const marketObj = TARGET_MARKETS.find((m) => m.code === targetMarket) ?? TARGET_MARKETS[0];

    try {
      // 1. Save ad preferences into sessionStorage for instant pickup by the Studio
      try {
        sessionStorage.setItem(
          AD_SETTINGS_KEY,
          JSON.stringify({
            format: '9:16',
            language: marketObj.lang,
            duration: 15,
            hookAngle: selectedDemoProduct.hooks[selectedHookIndex]?.id,
          }),
        );
      } catch {
        /* storage blocked */
      }

      // 2. Persist backend onboarding steps so user.onboarding_completed becomes true
      await api.saveOnboardingStep1(token, 'dropshipper');
      await api.saveOnboardingStep2(token, {
        business_type: businessType,
        main_category: selectedDemoProduct.category,
        target_market: targetMarket,
        experience_level: 'intermediate',
      });
      await api.saveOnboardingStep3(token, 'manual');
      await api.saveOnboardingStep4(token, ['ads', 'sales']);
      await api.completeOnboarding(token);

      // 3. Forward the user directly into the product creation workflow!
      const destination = `/product-input?url=${encodeURIComponent(chosenProductUrl)}&describe=${encodeURIComponent(
        chosenProductTitle,
      )}`;

      const returnTo = takeReturnTo();
      router.push(returnTo && returnTo !== '/dashboard' ? returnTo : destination);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Impossible d’initialiser votre studio publicitaire. Veuillez réessayer.');
      }
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-ground text-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-trend-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio-ground text-ink selection:bg-trend-orange selection:text-white">
      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-studio-ground/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8" priority />
            <span className="ml-2 hidden rounded-full border border-line bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-ink-muted sm:inline-block">
              Studio Quickstart
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs font-medium text-ink-muted sm:flex">
              <span
                className={`size-2 rounded-full ${step >= 1 ? 'bg-trend-orange' : 'bg-line'}`}
              />
              <span>1. Produit</span>
              <span className="text-line">/</span>
              <span
                className={`size-2 rounded-full ${step >= 2 ? 'bg-trend-orange' : 'bg-line'}`}
              />
              <span>2. Angle UGC</span>
              <span className="text-line">/</span>
              <span
                className={`size-2 rounded-full ${step >= 3 ? 'bg-trend-orange' : 'bg-line'}`}
              />
              <span>3. Lancement</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* ========================================================================= */}
        {/* STEP 1: LE PRODUIT                                                        */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-trend-orange/30 bg-trend-orange/10 px-3.5 py-1 text-xs font-semibold text-trend-orange">
                <Flame className="size-3.5" />
                <span>Étape 1 sur 3 · Objectif : Ta 1ère vidéo en 60 secondes</span>
              </div>
              <h1 className="mt-4 text-[32px] font-extrabold tracking-tight sm:text-[42px]">
                Quel produit veux-tu <span className="text-trend-orange">faire exploser</span> ?
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-[15px] text-ink-muted sm:text-[16px]">
                Colle le lien de ton produit, ou choisis l’un de nos 3 produits gagnants du moment
                pour tester la puissance de l’IA.
              </p>
            </div>

            {/* Option A: Input URL */}
            <div className="mt-8 rounded-2xl border border-line bg-cream/60 p-5 shadow-sm backdrop-blur-xl sm:p-7">
              <label htmlFor="product-url-input" className="block text-sm font-bold text-ink">
                Colle l’URL de ton produit (Shopify, Amazon, AliExpress...) :
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    id="product-url-input"
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://ma-boutique.com/products/mon-produit-phare..."
                    className="h-12 w-full rounded-xl border border-line bg-studio-ground px-4 text-sm text-ink placeholder:text-ink-muted/50 focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/20"
                  />
                  {customUrl && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-trend-orange">
                      Lien détecté ✓
                    </span>
                  )}
                </div>

                {/* Country / Market selector */}
                <div className="relative shrink-0 sm:w-48">
                  <select
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    aria-label="Marché cible"
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-studio-ground px-3.5 text-xs font-semibold text-ink focus:border-trend-orange focus:outline-none"
                  >
                    {TARGET_MARKETS.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <Globe className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="my-8 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                OU CHOISIS UN WINNING PRODUCT TEST
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Option B: 3 Demo Winning Products */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DEMO_PRODUCTS.map((prod) => {
                const isSelected = selectedDemoProduct.id === prod.id && !customUrl.trim();
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setCustomUrl('');
                      setSelectedDemoProduct(prod);
                    }}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-trend-orange bg-cream shadow-md ring-2 ring-trend-orange/20'
                        : 'border-line bg-cream/40 hover:border-trend-orange/60 hover:bg-cream/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-studio-ground text-2xl shadow-sm">
                          {prod.icon}
                        </span>
                        <span className="rounded-full border border-line bg-studio-ground px-2.5 py-0.5 text-[11px] font-bold text-trend-orange">
                          {prod.tag}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[16px] font-bold text-ink group-hover:text-trend-orange transition-colors">
                        {prod.title}
                      </h3>
                      <p className="mt-1 text-xs text-ink-muted line-clamp-2">{prod.problem}</p>
                    </div>

                    <div className="mt-6 border-t border-line/60 pt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-muted">{prod.categoryLabel}</span>
                      <span className="font-bold text-ink">{prod.price}</span>
                    </div>

                    {isSelected && (
                      <span className="absolute right-3.5 top-3.5 flex size-5 items-center justify-center rounded-full bg-trend-orange text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action continue button */}
            <div className="mt-10 flex items-center justify-end">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-cta-top to-cta-bottom px-8 text-sm font-semibold text-on-ember shadow-md transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>Analyser & Découvrir les Hooks UGC</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: L'ANGLE CRÉATIF (HOOKS UGC)                                      */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition"
              >
                <ArrowLeft className="size-4" />
                <span>Retour au choix du produit</span>
              </button>
              <span className="text-xs font-bold text-trend-orange">
                Étape 2 sur 3 · Stratégie de Conversion
              </span>
            </div>

            {isSimulatingAnalysis ? (
              <div className="my-16 flex flex-col items-center justify-center text-center">
                <div className="relative flex size-20 items-center justify-center rounded-full bg-trend-orange/10">
                  <Sparkles className="size-9 text-trend-orange animate-spin" />
                  <div className="absolute inset-0 rounded-full border-2 border-trend-orange border-t-transparent animate-spin" />
                </div>
                <h2 className="mt-6 text-xl font-bold">
                  L’IA analyse le produit & génère 3 angles UGC...
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Extraction des objections clients, scénarisation des 3 premières secondes
                  scroll-stopping.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 text-center">
                  <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[38px]">
                    Choisis ton <span className="text-trend-orange">Hook publicitaire</span>
                  </h1>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
                    L’accroche des 3 premières secondes détermine 80% du succès d’une vidéo sur
                    TikTok et Instagram. Lequel de ces 3 angles préfères-tu tester en premier ?
                  </p>
                </div>

                {/* The 3 generated angles */}
                <div className="mt-8 space-y-4">
                  {selectedDemoProduct.hooks.map((hook, idx) => {
                    const isSelected = selectedHookIndex === idx;
                    return (
                      <button
                        key={hook.id}
                        type="button"
                        onClick={() => setSelectedHookIndex(idx)}
                        className={`group relative flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-5 text-left transition-all ${
                          isSelected
                            ? 'border-trend-orange bg-cream shadow-md ring-2 ring-trend-orange/20'
                            : 'border-line bg-cream/50 hover:border-trend-orange/60 hover:bg-cream'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${hook.badgeColor}`}
                            >
                              {hook.tag}
                            </span>
                            <span className="text-xs font-semibold text-ink-muted">
                              Angle #{idx + 1} : {hook.title}
                            </span>
                          </div>

                          <p className="mt-2.5 text-[15px] font-bold text-ink sm:text-[16px] leading-snug">
                            {hook.hookText}
                          </p>
                          <p className="mt-1 text-xs text-ink-muted">{hook.description}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span
                            className={`flex size-6 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? 'border-trend-orange bg-trend-orange text-white'
                                : 'border-line bg-studio-ground text-transparent group-hover:border-trend-orange/40'
                            }`}
                          >
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <ShieldCheck className="size-4 text-trend-orange" />
                    <span>Scénarisation certifiée conforme aux algorithmes publicitaires 2026</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-cta-top to-cta-bottom px-8 text-sm font-semibold text-on-ember shadow-md transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <span>Valider & Prévisualiser la Création</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: L'APERÇU & LANCEMENT                                             */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition"
              >
                <ArrowLeft className="size-4" />
                <span>Modifier le hook</span>
              </button>
              <span className="text-xs font-bold text-trend-orange">
                Étape 3 sur 3 · Prêt pour le Studio
              </span>
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[38px]">
                Ta première publicité est{' '}
                <span className="text-trend-orange">prête à être tournée</span> !
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
                TrendED a configuré les scènes, la voix off IA et l’habillage vertical. Voici la
                fiche récapitulative :
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Visual Video Mockup */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-3xl border-2 border-trend-orange/40 bg-black shadow-2xl">
                  {/* Background ambient gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

                  {/* Video badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      Format 9:16 Vertical
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-trend-orange text-white">
                      <Play className="size-3.5 fill-current ml-0.5" />
                    </span>
                  </div>

                  {/* Product Icon & Title in video simulation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-5xl">{selectedDemoProduct.icon}</span>
                    <h4 className="mt-4 text-sm font-extrabold text-white line-clamp-2 drop-shadow">
                      {customUrl.trim() ? customUrl.trim() : selectedDemoProduct.title}
                    </h4>
                    <span className="mt-2 rounded-md bg-trend-orange/90 px-2 py-0.5 text-xs font-bold text-white">
                      {selectedDemoProduct.price}
                    </span>
                  </div>

                  {/* Subtitle simulation at bottom */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/80 p-3 backdrop-blur-md border border-white/10">
                    <span className="text-[10px] font-semibold text-trend-orange block uppercase tracking-wider">
                      Accroche (3s) :
                    </span>
                    <p className="mt-1 text-xs text-white font-medium line-clamp-2 leading-relaxed">
                      {selectedDemoProduct.hooks[selectedHookIndex]?.hookText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Parameters and final options */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-line bg-cream/60 p-6 backdrop-blur-xl">
                <div>
                  <h3 className="text-lg font-bold text-ink">Spécifications de la campagne :</h3>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-line bg-studio-ground p-3">
                      <span className="text-ink-muted block">Format Vidéo</span>
                      <span className="mt-1 font-bold text-ink block">9:16 (TikTok & Reels)</span>
                    </div>
                    <div className="rounded-xl border border-line bg-studio-ground p-3">
                      <span className="text-ink-muted block">Durée préconisée</span>
                      <span className="mt-1 font-bold text-ink block">15 secondes</span>
                    </div>
                    <div className="rounded-xl border border-line bg-studio-ground p-3">
                      <span className="text-ink-muted block">Marché / Langue</span>
                      <span className="mt-1 font-bold text-ink block">{targetMarket}</span>
                    </div>
                    <div className="rounded-xl border border-line bg-studio-ground p-3">
                      <span className="text-ink-muted block">Statut</span>
                      <span className="mt-1 font-bold text-dash-green block">
                        1ère Création Offerte
                      </span>
                    </div>
                  </div>

                  {/* Quick Profile Question (fills backend user business_type seamlessly) */}
                  <div className="mt-6 border-t border-line/80 pt-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Ton modèle de vente principal :
                    </label>
                    <div className="mt-2.5 grid grid-cols-3 gap-2">
                      {[
                        ['dropshipping', 'Dropshipping'],
                        ['dtc_brand', 'Marque DTC'],
                        ['marketplace_seller', 'Marketplace'],
                      ].map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBusinessType(val as typeof businessType)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            businessType === val
                              ? 'border-trend-orange bg-trend-orange/10 text-trend-orange'
                              : 'border-line bg-studio-ground text-ink hover:border-trend-orange/40'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <p
                    className="mt-4 rounded-lg bg-danger/10 p-3 text-xs font-semibold text-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-8 border-t border-line pt-5">
                  <button
                    type="button"
                    onClick={handleLaunchFirstAd}
                    disabled={isSubmitting}
                    className="flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-cta-top to-cta-bottom px-6 text-base font-bold text-on-ember shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Création de ton espace de travail...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5 fill-current" />
                        <span>Générer ma première vidéo dans le Studio</span>
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-ink-muted">
                    Accès immédiat sans carte bancaire · Découvre ton script et storyboard complet
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
