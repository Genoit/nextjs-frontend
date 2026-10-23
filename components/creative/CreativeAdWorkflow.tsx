'use client';

import React, { useState } from 'react';
import { Sparkles, Sliders, Lightbulb, Film, Play, RotateCw, AlertCircle } from 'lucide-react';
import { useCreative } from '../../hooks/use-creative';
import { ProductIntelligenceView } from './ProductIntelligenceView';
import { UGCSetupForm } from './UGCSetupForm';
import { StrategyPreview } from './StrategyPreview';
import { StoryboardEditor } from './StoryboardEditor';
import { VideoGenerationTracker } from './VideoGenerationTracker';
import { StoryboardSceneCreatePayload, UGCSetupCreatePayload } from '../../lib/types/creative';

interface Props {
  productId: string;
  initialStep?: 1 | 2 | 3 | 4 | 5;
}

export function CreativeAdWorkflow({ productId, initialStep = 1 }: Props) {
  const [userSelectedStep, setUserSelectedStep] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const {
    intelligence,
    ugcSetup,
    strategy,
    storyboard,
    activeJob,
    isLoadingIntelligence,
    isSavingUgcSetup,
    isGeneratingStrategy,
    isValidatingStrategy,
    isGeneratingStoryboard,
    isUpdatingStoryboard,
    isStartingJob,
    error,
    saveUgcSetup,
    generateStrategy,
    validateStrategy,
    generateStoryboard,
    updateStoryboard,
    startVideoGeneration,
    cancelVideoGeneration,
    retryVideoGeneration,
    resetError,
  } = useCreative(productId);

  // Derive current step automatically from loaded/completed resources if user hasn't manually selected a step
  const currentStep: 1 | 2 | 3 | 4 | 5 =
    userSelectedStep ??
    (activeJob ? 5 : storyboard ? 4 : strategy ? 3 : ugcSetup ? 2 : initialStep);

  // Handlers for step progression
  const handleUgcSetupSubmit = async (payload: UGCSetupCreatePayload) => {
    const saved = await saveUgcSetup(payload);
    if (saved) {
      // Immediately trigger strategy generation
      const strat = await generateStrategy(productId);
      if (strat) {
        setUserSelectedStep(3);
      }
    }
  };

  const handleValidateStrategy = async () => {
    if (!strategy) return;
    await validateStrategy(strategy.id);
  };

  const handleGenerateStoryboard = async () => {
    if (!strategy) return;
    const sb = await generateStoryboard(strategy.id);
    if (sb) {
      setUserSelectedStep(4);
    }
  };

  const handleUpdateStoryboard = async (scenes: StoryboardSceneCreatePayload[], title?: string) => {
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
            { num: 2, label: 'UGC Setup', icon: Sliders },
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
                  {isPassed ? '✓' : s.num}
                </div>
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={resetError}
            className="text-red-500 hover:text-red-800 font-bold"
          >
            Fermer
          </button>
        </div>
      )}

      {/* STEP 1: Product Intelligence */}
      {currentStep === 1 && (
        <>
          {isLoadingIntelligence && (
            <div className="p-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-600">
                Extraction factuelle des caractéristiques du produit en cours...
              </p>
            </div>
          )}
          {!isLoadingIntelligence && intelligence && (
            <ProductIntelligenceView
              report={intelligence}
              onProceedToSetup={() => setUserSelectedStep(2)}
            />
          )}
        </>
      )}

      {/* STEP 2: UGC Setup */}
      {currentStep === 2 && (
        <UGCSetupForm
          key={ugcSetup?.id || 'new'}
          productId={productId}
          initialSetup={ugcSetup}
          onSubmit={handleUgcSetupSubmit}
          isLoading={isSavingUgcSetup || isGeneratingStrategy}
        />
      )}

      {/* STEP 3: Creative Strategy */}
      {currentStep === 3 && (
        <>
          {isGeneratingStrategy && (
            <div className="p-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-600">
                Génération de la stratégie créative persuasive en cours...
              </p>
            </div>
          )}
          {!isGeneratingStrategy && strategy && (
            <StrategyPreview
              strategy={strategy}
              onValidate={handleValidateStrategy}
              onGenerateStoryboard={handleGenerateStoryboard}
              isValidating={isValidatingStrategy}
              isGeneratingStoryboard={isGeneratingStoryboard}
            />
          )}
        </>
      )}

      {/* STEP 4: Storyboard */}
      {currentStep === 4 && (
        <>
          {isGeneratingStoryboard && (
            <div className="p-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-600">
                Scénarisation et découpage des scènes en cours...
              </p>
            </div>
          )}
          {!isGeneratingStoryboard && storyboard && (
            <StoryboardEditor
              storyboard={storyboard}
              onUpdate={handleUpdateStoryboard}
              onLaunchVideo={handleLaunchVideo}
              isUpdating={isUpdatingStoryboard}
              isLaunching={isStartingJob}
            />
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
