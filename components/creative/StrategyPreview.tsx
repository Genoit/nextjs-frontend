'use client';

import React, { useState } from 'react';
import { ArrowRight, Lightbulb, RotateCw, ShieldCheck } from 'lucide-react';
import { CreativeStrategy } from '../../lib/types/creative';
import { GenerationMeta, HeuristicBadge } from './CreativeStatus';

interface Props {
  strategy: CreativeStrategy;
  onGenerateStoryboard: (angleId: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  isGeneratingStoryboard?: boolean;
  isRegenerating?: boolean;
}

export function StrategyPreview({
  strategy,
  onGenerateStoryboard,
  onRegenerate,
  isGeneratingStoryboard = false,
  isRegenerating = false,
}: Props) {
  const [angleId, setAngleId] = useState<string | null>(
    strategy.chosen_angle_id ?? strategy.angles[0]?.id ?? null,
  );
  const brief = strategy.brief;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-r from-cream to-white border border-trend-orange/30 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-trend-orange text-white text-xs font-bold uppercase tracking-wider">
            Brief & angles
          </span>
          <HeuristicBadge entity={strategy} />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-soft text-success text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            Zéro faux avis, uniquement des faits sourcés
          </span>
        </div>
        <h3 className="text-xl font-bold text-ink">Choisissez un angle publicitaire</h3>
        <p className="text-xs text-ink-soft">
          Chaque angle s&apos;appuie sur la fiche produit. Les éléments marqués « à valider » sont
          des hypothèses, pas des faits.
        </p>
        <GenerationMeta meta={strategy} />
      </div>

      {brief && (
        <section
          aria-labelledby="brief-title"
          className="bg-white rounded-2xl border border-line/80 p-5 shadow-2xs space-y-3 text-xs"
        >
          <h4 id="brief-title" className="text-sm font-bold text-ink">
            Brief créatif
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <dt className="font-semibold text-ink-muted">Audience</dt>
              <dd className="text-ink">{brief.audience}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Plateforme</dt>
              <dd className="text-ink">{brief.platform}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Durée cible</dt>
              <dd className="text-ink">{brief.target_duration} s</dd>
            </div>
          </dl>
          {(brief.needs_validation ?? []).length > 0 && (
            <div className="p-3 rounded-xl bg-warning-soft/60 border border-warning/30 space-y-1">
              <p className="font-bold text-warning">Hypothèses à valider</p>
              <ul className="list-disc pl-4 text-ink-soft">
                {brief.needs_validation.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {(brief.forbidden_claims ?? []).length > 0 && (
            <div className="space-y-1">
              <p className="font-bold text-ink-soft">Allégations interdites</p>
              <ul className="list-disc pl-4 text-ink-soft">
                {brief.forbidden_claims.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Native radio group: arrow keys move between angles, Space selects. */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-trend-orange" aria-hidden />
          <span>Angles proposés ({strategy.angles.length})</span>
        </legend>
        {strategy.angles.map((angle) => {
          const checked = angleId === angle.id;
          return (
            <label
              key={angle.id}
              className={`block p-4 rounded-2xl border bg-white cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-trend-orange ${
                checked
                  ? 'border-trend-orange ring-1 ring-trend-orange'
                  : 'border-line hover:border-line'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="creative-angle"
                  value={angle.id}
                  checked={checked}
                  onChange={() => setAngleId(angle.id)}
                  className="mt-1 accent-trend-orange"
                />
                <div className="space-y-1.5 text-xs min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-ink">{angle.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-studio-raised text-ink-soft text-[10px] font-semibold">
                      {angle.archetype}
                    </span>
                    {checked && (
                      <span className="text-[10px] font-bold text-trend-orange">Sélectionné</span>
                    )}
                  </div>
                  <p>
                    <span className="font-semibold text-ink-muted">Promesse : </span>
                    {angle.promise}
                  </p>
                  <p>
                    <span className="font-semibold text-ink-muted">Problème : </span>
                    {angle.problem}
                  </p>
                  <p>
                    <span className="font-semibold text-ink-muted">Émotion : </span>
                    {angle.emotion}
                  </p>
                  {(angle.persuasion_principles ?? []).length > 0 && (
                    <p className="flex flex-wrap items-center gap-1">
                      <span className="font-semibold text-ink-muted">Principes : </span>
                      {angle.persuasion_principles.map((code) => (
                        <span
                          key={code}
                          className="px-1.5 py-0.5 rounded bg-cream text-trend-orange font-mono text-[10px]"
                        >
                          {code}
                        </span>
                      ))}
                    </p>
                  )}
                  {(angle.risks ?? []).length > 0 && (
                    <p className="text-warning">
                      <span className="font-semibold">Risques : </span>
                      {angle.risks.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating || isGeneratingStoryboard}
          aria-busy={isRegenerating}
          className="px-4 py-2.5 rounded-xl border border-line bg-white hover:bg-studio-surface text-ink text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
        >
          <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden />
          <span>{isRegenerating ? 'Régénération…' : 'Régénérer les angles'}</span>
        </button>
        <button
          type="button"
          onClick={() => angleId && onGenerateStoryboard(angleId)}
          disabled={!angleId || isGeneratingStoryboard || isRegenerating}
          aria-busy={isGeneratingStoryboard}
          className="px-5 py-2.5 rounded-xl bg-trend-orange hover:bg-trend-orange-strong disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
        >
          <span>{isGeneratingStoryboard ? 'Création…' : 'Générer le storyboard de cet angle'}</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
