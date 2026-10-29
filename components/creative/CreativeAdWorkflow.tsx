'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Lightbulb,
  Film,
  Images,
  Play,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { useCreative } from '../../hooks/use-creative';
import { useAssets } from '../../hooks/use-assets';
import { AssetBoard } from '../assets/AssetBoard';
import { ProductSheetView } from './ProductSheetView';
import { CreativeConfigForm } from './CreativeConfigForm';
import { StrategyPreview } from './StrategyPreview';
import { StoryboardEditor } from './StoryboardEditor';
import { VideoGenerationTracker } from './VideoGenerationTracker';
import { VideoHistory } from './VideoHistory';
import {
  CreativeConfigCreatePayload,
  QualityTier,
  StoryboardSceneCreatePayload,
} from '../../lib/types/creative';
import { QUALITY_TIERS } from '../../lib/render-rules.mjs';

// Prefix of the backend 409 detail when no product analysis exists yet.
const ANALYSIS_MISSING = "Lancez d'abord l'analyse produit";

interface Props {
  productId: string;
  initialStep?: Step;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function CreativeAdWorkflow({ productId, initialStep = 1 }: Props) {
  const [userSelectedStep, setUserSelectedStep] = useState<Step | null>(null);
  const [qualityTier, setQualityTier] = useState<QualityTier>('standard');

  const {
    creativeConfig,
    strategy,
    storyboard,
    storyboardVersions,
    cost,
    activeJob,
    isSavingConfig,
    isGeneratingStrategy,
    isGeneratingStoryboard,
    isUpdatingStoryboard,
    isAcceptingStoryboard,
    isStartingJob,
    error,
    errorStatus,
    saveCreativeConfig,
    generateStrategy,
    generateStoryboardForAngle,
    loadStoryboard,
    updateStoryboard,
    acceptStoryboard,
    startVideoGeneration,
    cancelVideoGeneration,
    retryVideoGeneration,
    rerenderShot,
    acceptShot,
    openVideoJob,
    jobLiveMessage,
    resetError,
  } = useCreative(productId);

  // Derive current step automatically from loaded/completed resources if user hasn't manually selected a step
  const currentStep: Step =
    userSelectedStep ??
    (activeJob
      ? 6
      : storyboard?.accepted
        ? 5
        : storyboard
          ? 4
          : strategy
            ? 3
            : creativeConfig
              ? 2
              : initialStep);

  // Visuals belong to one accepted storyboard; a new (non-accepted) version falls back to the gate.
  const assets = useAssets(storyboard?.accepted ? storyboard.id : null);
  const bannerError = error ?? assets.error;

  // Same gate as the storyboard step (backend: sum(duration_s) == target ± 0.5), plus any
  // asset operation in flight.
  const launchDisabledReason = (() => {
    if (!storyboard) return null;
    const total = storyboard.scenes.reduce((acc, sc) => acc + Number(sc.duration_seconds || 0), 0);
    const target = storyboard.spec?.target_duration ?? storyboard.target_duration;
    if (Math.abs(total - target) > 0.5) {
      return 'La durée totale des plans ne correspond pas à la durée cible : ajustez le storyboard.';
    }
    if (assets.isLoading) return 'Chargement des visuels…';
    if (assets.isPreparing || assets.busyPlanId) return 'Une opération est en cours.';
    return null;
  })();
  const dismissError = () => {
    resetError();
    assets.resetError();
  };

  const handleConfigSubmit = async (payload: CreativeConfigCreatePayload) => {
    const saved = await saveCreativeConfig(payload);
    if (saved) {
      const strat = await generateStrategy(productId, { configId: saved.id });
      if (strat) {
        setUserSelectedStep(3);
      }
    }
  };

  const handleRegenerateStrategy = async () => {
    await generateStrategy(productId, { configId: creativeConfig?.id, force: true });
  };

  const handleGenerateStoryboard = async (angleId: string, force = false) => {
    if (!strategy) return;
    const sb = await generateStoryboardForAngle(strategy.id, angleId, force);
    if (sb) {
      setUserSelectedStep(4);
    }
  };

  const handleSaveStoryboard = async (scenes: StoryboardSceneCreatePayload[], title: string) => {
    if (!storyboard) return;
    await updateStoryboard(storyboard.id, { scenes, title });
  };

  const handleLaunchVideo = async () => {
    if (!storyboard) return;
    const job = await startVideoGeneration(productId, storyboard.id, qualityTier);
    if (job) {
      setUserSelectedStep(6);
    } else {
      // e.g. 409 "Préparation des visuels en cours": refresh what the board shows.
      void assets.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Navigation Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
        <div className="relative flex items-center justify-between overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Intelligence', icon: Sparkles },
            { num: 2, label: 'Configuration créative', icon: Sliders },
            { num: 3, label: 'Stratégie', icon: Lightbulb },
            { num: 4, label: 'Storyboard', icon: Film },
            { num: 5, label: 'Visuels produit', icon: Images },
            { num: 6, label: 'Génération', icon: Play },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isPassed = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setUserSelectedStep(s.num as Step)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#BA3807] text-white shadow-xs'
                    : isPassed
                      ? 'bg-[#FFF5ED] text-[#BA3807] hover:bg-[#FED7AA]/30'
                      : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-[#BA3807]'
                      : isPassed
                        ? 'bg-[#BA3807] text-white'
                        : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  <span aria-hidden>{isPassed ? '✓' : s.num}</span>
                  {isPassed && <span className="sr-only">Étape terminée :</span>}
                </div>
                <Icon className="w-3.5 h-3.5" aria-hidden />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner (409 = precondition such as a missing product analysis) */}
      {bannerError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3 text-xs text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
            <span>{bannerError}</span>
          </div>
          <div className="flex items-center gap-3">
            {errorStatus === 409 && currentStep !== 1 && error?.startsWith(ANALYSIS_MISSING) && (
              <button
                type="button"
                onClick={() => {
                  resetError();
                  setUserSelectedStep(1);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-800 font-bold hover:bg-red-100"
              >
                Aller à l&apos;analyse produit
              </button>
            )}
            <button
              type="button"
              onClick={dismissError}
              className="text-red-500 hover:text-red-800 font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Product Intelligence */}
      {currentStep === 1 && (
        <ProductSheetView productId={productId} onProceedToSetup={() => setUserSelectedStep(2)} />
      )}

      {/* STEP 2: Creative configuration */}
      {currentStep === 2 && (
        <CreativeConfigForm
          // Remount once when the saved config arrives (useState initialisers), not on every save.
          key={`${productId}:${creativeConfig ? 'saved' : 'new'}`}
          productId={productId}
          initialConfig={creativeConfig}
          onSubmit={handleConfigSubmit}
          isLoading={isSavingConfig || isGeneratingStrategy || isGeneratingStoryboard}
        />
      )}

      {/* STEP 3: Brief + angle picker */}
      {currentStep === 3 && (
        <>
          {isGeneratingStrategy && !strategy && (
            <div className="p-12 text-center space-y-3" role="status">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" aria-hidden />
              <p className="text-sm font-semibold text-zinc-600">
                Génération du brief et des angles en cours…
              </p>
            </div>
          )}
          {strategy && (
            <StrategyPreview
              key={strategy.id}
              strategy={strategy}
              onGenerateStoryboard={handleGenerateStoryboard}
              onRegenerate={handleRegenerateStrategy}
              isGeneratingStoryboard={isGeneratingStoryboard}
              isRegenerating={isGeneratingStrategy}
            />
          )}
          {!isGeneratingStrategy && !strategy && (
            <p className="p-12 text-center text-sm text-zinc-500">
              Aucune stratégie : enregistrez d&apos;abord la configuration créative.
            </p>
          )}
        </>
      )}

      {/* STEP 4: Storyboard editor + versions */}
      {currentStep === 4 && (
        <>
          {storyboard ? (
            <StoryboardEditor
              key={storyboard.id}
              storyboard={storyboard}
              versions={storyboardVersions}
              cost={cost}
              onSave={handleSaveStoryboard}
              onAccept={async () => {
                if (await acceptStoryboard(storyboard.id)) setUserSelectedStep(5);
              }}
              onSelectVersion={async (id) => {
                await loadStoryboard(id);
              }}
              onRegenerate={async () => {
                if (strategy?.chosen_angle_id) {
                  await handleGenerateStoryboard(strategy.chosen_angle_id, true);
                }
              }}
              onPrepareAssets={() => setUserSelectedStep(5)}
              isUpdating={isUpdatingStoryboard}
              isAccepting={isAcceptingStoryboard}
              isGenerating={isGeneratingStoryboard}
            />
          ) : isGeneratingStoryboard ? (
            <div className="p-12 text-center space-y-3" role="status">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" aria-hidden />
              <p className="text-sm font-semibold text-zinc-600">
                Scénarisation et découpage des plans en cours…
              </p>
            </div>
          ) : (
            <p className="p-12 text-center text-sm text-zinc-500">
              Aucun storyboard : choisissez d&apos;abord un angle.
            </p>
          )}
        </>
      )}

      {/* STEP 5: Product visuals (asset pipeline) */}
      {currentStep === 5 &&
        (storyboard?.accepted ? (
          <AssetBoard
            storyboard={storyboard}
            board={assets.board}
            launchDisabledReason={launchDisabledReason}
            isLoading={assets.isLoading}
            loadError={assets.loadError}
            isPreparing={assets.isPreparing}
            isLaunching={isStartingJob}
            busyPlanId={assets.busyPlanId}
            liveMessage={assets.liveMessage}
            productId={productId}
            onPrepare={() => void assets.prepare()}
            onReload={() => void assets.reload()}
            onOverride={assets.setSourceMode}
            onRetry={assets.retry}
            onLaunchVideo={() => void handleLaunchVideo()}
            launchOptions={
              <div className="flex items-center gap-2">
                <label htmlFor="quality-tier" className="text-sm font-semibold text-ink">
                  Qualité
                </label>
                <select
                  id="quality-tier"
                  value={qualityTier}
                  onChange={(e) => setQualityTier(e.target.value as QualityTier)}
                  disabled={isStartingJob}
                  className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
                >
                  {QUALITY_TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        ) : (
          <div className="space-y-3 p-12 text-center">
            <p className="text-sm text-ink-muted">
              Acceptez une version du storyboard pour préparer les visuels produit.
            </p>
            <button
              type="button"
              onClick={() => setUserSelectedStep(4)}
              className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-trend-orange hover:text-trend-orange-strong focus-visible:outline-2 focus-visible:outline-trend-orange"
            >
              Retour au storyboard
            </button>
          </div>
        ))}

      {/* STEP 6: Video Generation Job Tracker */}
      {currentStep === 6 && (
        <>
          {isStartingJob && (
            <div className="p-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-600">
                Initialisation du job de génération vidéo...
              </p>
            </div>
          )}
          {!isStartingJob && activeJob && (
            <VideoGenerationTracker
              job={activeJob}
              onCancel={cancelVideoGeneration}
              onRetry={() => retryVideoGeneration(activeJob.id)}
              onRerender={rerenderShot}
              onAccept={acceptShot}
              liveMessage={jobLiveMessage}
            />
          )}
          {!isStartingJob && !activeJob && (
            <p className="p-12 text-center text-sm text-zinc-500">
              Aucune génération en cours : lancez la vidéo depuis l&apos;étape Visuels produit.
            </p>
          )}
          <VideoHistory
            productId={productId}
            refreshKey={`${activeJob?.id ?? ''}:${activeJob?.status ?? ''}`}
            activeJobId={activeJob?.id ?? null}
            onOpen={openVideoJob}
          />
        </>
      )}
    </div>
  );
}
