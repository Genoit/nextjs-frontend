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
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF5ED] to-white border border-[#FED7AA]/80 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#BA3807] text-white text-xs font-bold uppercase tracking-wider">
            Brief & angles
          </span>
          <HeuristicBadge entity={strategy} />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            Zéro faux avis, uniquement des faits sourcés
          </span>
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Choisissez un angle publicitaire</h3>
        <p className="text-xs text-zinc-600">
          Chaque angle s&apos;appuie sur la fiche produit. Les éléments marqués « à valider » sont
          des hypothèses, pas des faits.
        </p>
        <GenerationMeta meta={strategy} />
      </div>

      {brief && (
        <section
          aria-labelledby="brief-title"
          className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3 text-xs"
        >
          <h4 id="brief-title" className="text-sm font-bold text-zinc-900">
            Brief créatif
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <dt className="font-semibold text-zinc-500">Audience</dt>
              <dd className="text-zinc-800">{brief.audience}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-500">Plateforme</dt>
              <dd className="text-zinc-800">{brief.platform}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-500">Durée cible</dt>
              <dd className="text-zinc-800">{brief.target_duration} s</dd>
            </div>
          </dl>
          {(brief.needs_validation ?? []).length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
              <p className="font-bold text-amber-900">Hypothèses à valider</p>
              <ul className="list-disc pl-4 text-zinc-700">
                {brief.needs_validation.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {(brief.forbidden_claims ?? []).length > 0 && (
            <div className="space-y-1">
              <p className="font-bold text-zinc-700">Allégations interdites</p>
              <ul className="list-disc pl-4 text-zinc-600">
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
        <legend className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#BA3807]" aria-hidden />
          <span>Angles proposés ({strategy.angles.length})</span>
        </legend>
        {strategy.angles.map((angle) => {
          const checked = angleId === angle.id;
          return (
            <label
              key={angle.id}
              className={`block p-4 rounded-2xl border bg-white cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#BA3807] ${
                checked
                  ? 'border-[#BA3807] ring-1 ring-[#BA3807]'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="creative-angle"
                  value={angle.id}
                  checked={checked}
                  onChange={() => setAngleId(angle.id)}
                  className="mt-1 accent-[#BA3807]"
                />
                <div className="space-y-1.5 text-xs min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{angle.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold">
                      {angle.archetype}
                    </span>
                    {checked && (
                      <span className="text-[10px] font-bold text-[#BA3807]">Sélectionné</span>
                    )}
                  </div>
                  <p>
                    <span className="font-semibold text-zinc-500">Promesse : </span>
                    {angle.promise}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">Problème : </span>
                    {angle.problem}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">Émotion : </span>
                    {angle.emotion}
                  </p>
                  {(angle.persuasion_principles ?? []).length > 0 && (
                    <p className="flex flex-wrap items-center gap-1">
                      <span className="font-semibold text-zinc-500">Principes : </span>
                      {angle.persuasion_principles.map((code) => (
                        <span
                          key={code}
                          className="px-1.5 py-0.5 rounded bg-[#FFF5ED] text-[#BA3807] font-mono text-[10px]"
                        >
                          {code}
                        </span>
                      ))}
                    </p>
                  )}
                  {(angle.risks ?? []).length > 0 && (
                    <p className="text-amber-800">
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
          className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
        >
          <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden />
          <span>{isRegenerating ? 'Régénération…' : 'Régénérer les angles'}</span>
        </button>
        <button
          type="button"
          onClick={() => angleId && onGenerateStoryboard(angleId)}
          disabled={!angleId || isGeneratingStoryboard || isRegenerating}
          aria-busy={isGeneratingStoryboard}
          className="px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
        >
          <span>{isGeneratingStoryboard ? 'Création…' : 'Générer le storyboard de cet angle'}</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
