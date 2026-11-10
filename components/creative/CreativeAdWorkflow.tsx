'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useCreative } from '../../hooks/use-creative';
import { useProductAnalysis } from '../../hooks/use-product-analysis';
import { CreativeConfigForm } from './CreativeConfigForm';
import { StrategyPreview } from './StrategyPreview';
import { StrategyPicker } from './StrategyPicker';
import { VideoHistory } from './VideoHistory';
import { CreativeConfigCreatePayload, Storyboard, TargetPlatform } from '../../lib/types/creative';
import { AD_SETTINGS_KEY, parseAdSettings } from '../../lib/ad-settings-rules.mjs';

interface Props {
  productId: string;
  openSetup?: boolean;
  /** Controlled mode (/product-input): the page's stepper picks the step. */
  selectedStep?: Step | null;
  onSelectStep?: (step: Step) => void;
  onStepChange?: (step: Step) => void;
  /** Start the product analysis on arrival so it is ready when the setup is saved. */
  autoAnalyze?: boolean;
  /** Remake this Meta ad: the strategy step makes (or reopens) a strategy inspired by it. */
  refAdId?: string;
}

/**
 * 2 setup, 3 angles, 6 video. The product analysis (1), storyboard (4) and product visuals (5)
 * run without a screen: the merchant picks the delivery settings and an angle, nothing else.
 */
export type Step = 1 | 2 | 3 | 4 | 5 | 6;

const SHOWN: ReadonlySet<Step> = new Set<Step>([2, 3, 6]);
const USABLE_ANALYSIS = new Set(['completed', 'partial']);
// The first storyboard plus one forced rewrite, as Autopilot does.
const STORYBOARD_ATTEMPTS = 2;

const sellable = (sb: Storyboard) =>
  sb.generation_status === 'completed' && !sb.violations?.some((v) => v.severity === 'block');

function Working({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-20 text-center" role="status" aria-live="polite">
      <div className="relative mx-auto flex size-14 items-center justify-center">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-trend-orange/20" />
        <span className="relative flex size-12 items-center justify-center rounded-2xl border border-trend-orange/30 bg-trend-orange/10 shadow-[0_0_30px_-5px_rgba(255,98,45,0.3)]">
          <RotateCw className="size-5 animate-spin text-trend-orange" aria-hidden />
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold text-white tracking-[-0.01em]">{title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-studio-muted">{detail}</p>
      </div>
    </div>
  );
}

export function CreativeAdWorkflow({
  productId,
  openSetup = false,
  selectedStep,
  onSelectStep,
  onStepChange,
  autoAnalyze = false,
  refAdId,
}: Props) {
  // openSetup (Templates page) shows the setup even when one is already saved.
  const [localStep, setLocalStep] = useState<Step | null>(openSetup ? 2 : null);
  const picked = selectedStep !== undefined ? selectedStep : localStep;
  const setPicked = onSelectStep ?? setLocalStep;
  const [producing, setProducing] = useState<'script' | 'video' | null>(null);
  const [autoSetup, setAutoSetup] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const router = useRouter();

  const {
    configLoaded,
    strategyChecked,
    creativeConfig,
    strategy,
    activeJob,
    isSavingConfig,
    isGeneratingStrategy,
    error,
    saveCreativeConfig,
    generateStrategy,
    openStrategy,
    generateStoryboardForAngle,
    acceptStoryboard,
    startVideoGeneration,
    openVideoJob,
    resetError,
  } = useCreative(productId, refAdId);

  // The product sheet is for the system only: it is prepared silently, never shown.
  const productAnalysis = useProductAnalysis(productId);
  const { analysis, isLoading: analysisLoading, isAnalyzing, analyze } = productAnalysis;
  const pendingAnalysis = useRef<ReturnType<typeof analyze> | null>(null);
  const ensureAnalysis = useCallback(() => {
    if (analysis && USABLE_ANALYSIS.has(analysis.status)) return Promise.resolve(analysis);
    pendingAnalysis.current ??= analyze(false).finally(() => {
      pendingAnalysis.current = null;
    });
    return pendingAnalysis.current;
  }, [analysis, analyze]);

  const preloaded = useRef(false);
  useEffect(() => {
    if (!autoAnalyze || preloaded.current || analysisLoading || analysis || isAnalyzing) return;
    preloaded.current = true;
    void ensureAnalysis();
  }, [autoAnalyze, analysisLoading, analysis, isAnalyzing, ensureAnalysis]);

  const derived: Step = activeJob ? 6 : strategy ? 3 : 2;
  const currentStep: Step = picked && SHOWN.has(picked) ? picked : derived;

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const ensureReadable = useCallback(async () => {
    setChainError(null);
    const ready = await ensureAnalysis();
    if (ready && USABLE_ANALYSIS.has(ready.status)) return true;
    setChainError(
      'We could not read this product. Check its title and description, then try again.',
    );
    return false;
  }, [ensureAnalysis]);

  const handleConfigSubmit = useCallback(
    async (payload: CreativeConfigCreatePayload) => {
      if (!(await ensureReadable())) return;
      const saved = await saveCreativeConfig(payload);
      if (!saved) return;
      const strat = await generateStrategy(productId, { configId: saved.id, refAdId });
      if (strat) setPicked(3);
    },
    [ensureReadable, saveCreativeConfig, generateStrategy, productId, refAdId, setPicked],
  );

  // Remake with a saved setup: open the angles and make the inspired strategy if none exists.
  // Without a setup, the setup step shows and its submit makes the remake.
  const makeRemake = useCallback(async () => {
    if (!refAdId || !creativeConfig || !(await ensureReadable())) return;
    await generateStrategy(productId, { configId: creativeConfig.id, refAdId });
  }, [refAdId, creativeConfig, ensureReadable, generateStrategy, productId]);
  const remakeStarted = useRef(false);
  useEffect(() => {
    if (!refAdId || remakeStarted.current || !strategyChecked || !creativeConfig) return;
    remakeStarted.current = true;
    setPicked(3);
    if (!strategy) void Promise.resolve().then(makeRemake); // after this render, not inside it
  }, [refAdId, strategyChecked, creativeConfig, strategy, setPicked, makeRemake]);

  // Format, length and language already picked in the dashboard composer: skip the setup.
  const skipChecked = useRef(false);
  useEffect(() => {
    if (skipChecked.current || !configLoaded || creativeConfig || strategy || openSetup) return;
    skipChecked.current = true;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(AD_SETTINGS_KEY);
      sessionStorage.removeItem(AD_SETTINGS_KEY); // one hand-off, one product
    } catch {
      // storage blocked: the setup step shows
    }
    const settings = parseAdSettings(raw);
    if (!settings) return;
    setAutoSetup(true);
    void handleConfigSubmit({
      product_id: productId,
      ...settings,
      platform: settings.platform as TargetPlatform,
    }).finally(() => setAutoSetup(false));
  }, [configLoaded, creativeConfig, strategy, openSetup, productId, handleConfigSubmit]);

  const handleChooseAngle = async (angleId: string) => {
    if (!strategy) return;
    setChainError(null);
    setProducing('script');
    try {
      let storyboard: Storyboard | null = null;
      for (let attempt = 0; attempt < STORYBOARD_ATTEMPTS && !storyboard; attempt++) {
        const sb = await generateStoryboardForAngle(strategy.id, angleId, attempt > 0);
        if (!sb) return; // the error banner says why
        if (sellable(sb)) storyboard = sb;
      }
      if (!storyboard) {
        setChainError('This angle could not be turned into a compliant ad. Pick another angle.');
        return;
      }
      setProducing('video');
      const accepted = storyboard.accepted ? storyboard : await acceptStoryboard(storyboard.id);
      if (!accepted) return;
      const job = await startVideoGeneration(productId, accepted.id, 'standard');
      // The merchant follows the render on /generate; checks and finishing stay out of sight.
      if (job) router.push(`/generate?job=${encodeURIComponent(job.id)}`);
    } finally {
      setProducing(null);
    }
  };

  const banner = chainError ?? error ?? (isAnalyzing ? null : productAnalysis.error);
  const dismiss = () => {
    setChainError(null);
    resetError();
  };

  return (
    <div className="space-y-8">
      {banner && (
        <div
          role="alert"
          className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-soft/40 backdrop-blur-sm px-4 py-3 text-sm text-danger"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {banner}
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md px-2 py-1 font-semibold hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-danger"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentStep === 2 &&
        (autoSetup || (!configLoaded && !openSetup) || (refAdId && !strategyChecked && !error) ? (
          <Working
            title="Finding the angles that sell this product…"
            detail="Using the format, length and language you picked."
          />
        ) : (
          <CreativeConfigForm
            // Remount once when the saved config arrives (useState initialisers), not on every save.
            key={`${productId}:${creativeConfig ? 'saved' : 'new'}`}
            productId={productId}
            initialConfig={creativeConfig}
            onSubmit={handleConfigSubmit}
            isLoading={isSavingConfig || isGeneratingStrategy}
          />
        ))}

      {currentStep === 3 &&
        (producing ? (
          <Working
            title={producing === 'script' ? 'Writing the script…' : 'Starting your video…'}
            detail={
              producing === 'script'
                ? 'Scenes, voice-over and on-screen text for the angle you picked.'
                : 'Each shot is generated and checked before the final cut.'
            }
          />
        ) : isGeneratingStrategy && !strategy ? (
          <Working
            title="Finding the angles that sell this product…"
            detail={
              refAdId
                ? 'Taking the structure of the ad you picked, never its words or footage.'
                : 'Audience, hook and style are chosen for the sale.'
            }
          />
        ) : strategy ? (
          <div className="space-y-6">
            <StrategyPicker
              productId={productId}
              strategy={strategy}
              onOpen={openStrategy}
              disabled={producing !== null || isGeneratingStrategy}
            />
            <StrategyPreview
              key={strategy.id}
              strategy={strategy}
              onChooseAngle={handleChooseAngle}
              onRegenerate={async () => {
                await generateStrategy(productId, {
                  configId: creativeConfig?.id,
                  force: true,
                  // Regenerate the strategy shown: the remake stays a remake.
                  refAdId: strategy.ref_ad_id ?? undefined,
                });
              }}
              isProducing={producing !== null}
              isRegenerating={isGeneratingStrategy}
            />
          </div>
        ) : refAdId && creativeConfig ? (
          <div className="py-16">
            <button
              type="button"
              onClick={() => void makeRemake()}
              className="inline-flex min-h-11 items-center rounded-xl bg-trend-orange px-5 text-sm font-semibold text-on-accent transition hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
            >
              Try the remake again
            </button>
          </div>
        ) : (
          <p className="py-16 text-sm text-studio-muted">Save the format and length first.</p>
        ))}

      {currentStep === 6 && (
        <div className="max-w-3xl py-16">
          <p className="text-base font-semibold text-white">Your ad is being made.</p>
          <Link
            href={activeJob ? `/generate?job=${encodeURIComponent(activeJob.id)}` : '/generate'}
            className="mt-2 inline-flex text-sm font-semibold text-ember-text hover:underline focus-visible:outline-2 focus-visible:outline-ember-text"
          >
            Follow it on Generate
          </Link>
        </div>
      )}

      {/* Video history: the studio's right rail on every step (a list on phones). */}
      <VideoHistory
        productId={productId}
        refreshKey={`${activeJob?.id ?? ''}:${activeJob?.status ?? ''}`}
        activeJobId={activeJob?.id ?? null}
        onOpen={openVideoJob}
      />
    </div>
  );
}
