'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, RotateCw, Sparkles } from 'lucide-react';
import { CreativeStrategy } from '../../lib/types/creative';
import { HeuristicBadge } from './CreativeStatus';

interface Props {
  strategy: CreativeStrategy;
  /** Picks the angle; the script, visuals and video follow without another screen. */
  onChooseAngle: (angleId: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  isProducing?: boolean;
  isRegenerating?: boolean;
}

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

// Archetype labels from Creative Intelligence, simplified.
const ARCHETYPE: Record<string, string> = {
  problem_solution: 'Problem → Solution',
  product_demo: 'Product demo',
  before_after: 'Before / After',
  social_proof: 'UGC social proof',
  unboxing: 'Unboxing',
  sensory_focus: 'Sensory close-up',
  cinematic_storytelling: 'Cinematic story',
  founder_story: 'Founder story',
  comparative_challenge: 'Side-by-side test',
  myth_busting: 'Myth busting',
};

const archetypeLabel = (id: string) => ARCHETYPE[id] ?? id.replace(/_/g, ' ');

/**
 * Modern minimalist angle selection view.
 * Combines horizontal and vertical spatial design in a 2-column comparison grid,
 * enabling merchants to evaluate creative angles side-by-side without endless vertical scrolling.
 */
export function StrategyPreview({
  strategy,
  onChooseAngle,
  onRegenerate,
  isProducing = false,
  isRegenerating = false,
}: Props) {
  const [angleId, setAngleId] = useState<string | null>(
    strategy.chosen_angle_id ?? strategy.angles[0]?.id ?? null,
  );
  const busy = isProducing || isRegenerating;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold tracking-[-0.01em] text-white">Pick your ad angle</h2>
            <HeuristicBadge entity={strategy} />
          </div>
          <span className="text-xs font-semibold text-studio-muted">
            {strategy.angles.length} angles
          </span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-studio-muted">
          Each angle stages this product a different way
          {strategy.brief?.audience ? ` for ${strategy.brief.audience}` : ''}. Only real product
          facts are used, never fake reviews.
        </p>
      </div>

      {/* Accessible radio group with modern 2-column side-by-side grid */}
      <fieldset disabled={busy} className="m-0 p-0 border-0">
        <legend className="sr-only">Available ad angles</legend>

        <div
          className={`grid gap-4 sm:gap-5 lg:gap-6 items-stretch ${
            strategy.angles.length <= 2
              ? 'grid-cols-1 md:grid-cols-2'
              : strategy.angles.length === 3
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
          }`}
        >
          {strategy.angles.map((angle, idx) => {
            const checked = angleId === angle.id;

            return (
              <label
                key={angle.id}
                className={`group relative flex flex-col justify-between cursor-pointer rounded-3xl border p-5 sm:p-6 transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-trend-orange ${
                  checked
                    ? 'border-trend-orange bg-trend-orange/[0.05] shadow-[0_4px_30px_-5px_rgba(255,98,45,0.22)] ring-1 ring-trend-orange/40'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                {/* Native accessible radio input */}
                <input
                  type="radio"
                  name="creative-angle"
                  value={angle.id}
                  checked={checked}
                  onChange={() => setAngleId(angle.id)}
                  className="sr-only"
                />

                <div>
                  {/* Top bar: Badge, archetype chip, custom indicator */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-studio-muted">
                        Angle {idx + 1}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-studio-muted">
                        {archetypeLabel(angle.archetype)}
                      </span>
                    </div>

                    <div
                      className={`flex size-5 items-center justify-center rounded-full border transition-all duration-200 ${
                        checked
                          ? 'border-trend-orange bg-trend-orange text-black'
                          : 'border-white/30 bg-transparent group-hover:border-white/60'
                      }`}
                    >
                      {checked && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Title & Promise */}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-[-0.01em]">
                      {angle.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-dash-soft leading-relaxed">
                      {angle.promise}
                    </p>
                  </div>
                </div>

                {/* Hook callout */}
                <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/25 px-3.5 py-2.5 text-xs text-studio-muted">
                  <span className="font-semibold text-white/90">Hook: </span>
                  <span className="italic">
                    “{angle.problem.charAt(0).toUpperCase() + angle.problem.slice(1)}”
                  </span>
                </div>

                {checked && (
                  <span className="absolute -top-2.5 right-6 flex items-center gap-1 rounded-full bg-gradient-to-r from-trend-orange to-ember-text px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
                    <Sparkles className="size-3" />
                    Selected
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Action buttons footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          aria-busy={isRegenerating}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-semibold text-studio-muted transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-50 ${focus}`}
        >
          <RotateCw className={`size-3.5 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden />
          <span>{isRegenerating ? 'Generating new angles…' : 'Suggest other angles'}</span>
        </button>

        <button
          type="button"
          onClick={() => angleId && onChooseAngle(angleId)}
          disabled={!angleId || busy}
          aria-busy={isProducing}
          className={`group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-trend-orange to-ember-text px-8 text-sm font-bold text-black shadow-[0_10px_30px_-10px_rgba(255,98,45,0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 ${focus}`}
        >
          {isProducing ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Starting your ad…</span>
            </>
          ) : (
            <>
              <span>Generate my ad</span>
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
