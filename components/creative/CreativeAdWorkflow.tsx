'use client';

import React, { useState } from 'react';
import { Sparkles, Sliders, Lightbulb, Film, Play, RotateCw, AlertCircle } from 'lucide-react';
import { useCreative } from '../../hooks/use-creative';
import { ProductSheetView } from './ProductSheetView';
import { CreativeConfigForm } from './CreativeConfigForm';
import { StrategyPreview } from './StrategyPreview';
import { StoryboardEditor } from './StoryboardEditor';
import { VideoGenerationTracker } from './VideoGenerationTracker';
import {
  CreativeConfigCreatePayload,
  StoryboardSceneCreatePayload,
} from '../../lib/types/creative';

// Prefix of the backend 409 detail when no product analysis exists yet.
const ANALYSIS_MISSING = "Lancez d'abord l'analyse produit";

interface Props {
  productId: string;
  initialStep?: 1 | 2 | 3 | 4 | 5;
}

export function CreativeAdWorkflow({ productId, initialStep = 1 }: Props) {
  const [userSelectedStep, setUserSelectedStep] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

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
    resetError,
  } = useCreative(productId);

  // Derive current step automatically from loaded/completed resources if user hasn't manually selected a step
  const currentStep: 1 | 2 | 3 | 4 | 5 =
    userSelectedStep ??
    (activeJob ? 5 : storyboard ? 4 : strategy ? 3 : creativeConfig ? 2 : initialStep);

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
    const job = await startVideoGeneration(productId, storyboard.id);
    if (job) {
      setUserSelectedStep(5);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Navigation Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Intelligence', icon: Sparkles },
            { num: 2, label: 'Configuration créative', icon: Sliders },
            { num: 3, label: 'Stratégie', icon: Lightbulb },
            { num: 4, label: 'Storyboard', icon: Film },
            { num: 5, label: 'Génération', icon: Play },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isPassed = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setUserSelectedStep(s.num as 1 | 2 | 3 | 4 | 5)}
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
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3 text-xs text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-3">
            {errorStatus === 409 && currentStep !== 1 && error.startsWith(ANALYSIS_MISSING) && (
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
              onClick={resetError}
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
                await acceptStoryboard(storyboard.id);
              }}
              onSelectVersion={async (id) => {
                await loadStoryboard(id);
              }}
              onRegenerate={async () => {
                if (strategy?.chosen_angle_id) {
                  await handleGenerateStoryboard(strategy.chosen_angle_id, true);
                }
              }}
              onLaunchVideo={handleLaunchVideo}
              isUpdating={isUpdatingStoryboard}
              isAccepting={isAcceptingStoryboard}
              isGenerating={isGeneratingStoryboard}
              isLaunching={isStartingJob}
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

      {/* STEP 5: Video Generation Job Tracker */}
      {currentStep === 5 && (
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
              onRetry={() => (activeJob ? retryVideoGeneration(activeJob.id) : handleLaunchVideo())}
            />
          )}
        </>
      )}
    </div>
  );
}
