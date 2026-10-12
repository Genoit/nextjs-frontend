'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ArrowRight,
  BookmarkCheck,
} from 'lucide-react';
import { CreativeStrategy } from '../../lib/types/creative';

interface Props {
  strategy: CreativeStrategy;
  onValidate: () => Promise<void>;
  onGenerateStoryboard: () => Promise<void>;
  isValidating?: boolean;
  isGeneratingStoryboard?: boolean;
}

export function StrategyPreview({
  strategy,
  onValidate,
  onGenerateStoryboard,
  isValidating = false,
  isGeneratingStoryboard = false,
}: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner with Ethical badge */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF5ED] to-white border border-[#FED7AA]/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#BA3807] text-white text-xs font-bold uppercase tracking-wider">
                Persuasive Creative Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Conforme & Éthique (Zéro faux avis)
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mt-2">
              Stratégie publicitaire persuasive générée
            </h3>
            <p className="text-xs text-zinc-600">
              Chaque argument est directement rattaché aux données factuelles confirmées du produit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!strategy.is_validated ? (
              <button
                type="button"
                onClick={onValidate}
                disabled={isValidating}
                className="px-4 py-2.5 rounded-xl border border-[#BA3807] text-[#BA3807] hover:bg-[#FFF5ED] text-xs font-bold transition flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isValidating ? 'Validation...' : 'Approuver la stratégie'}</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Stratégie Validée
              </span>
            )}

            <button
              type="button"
              onClick={onGenerateStoryboard}
              disabled={isGeneratingStoryboard}
              className="px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <span>{isGeneratingStoryboard ? 'Création...' : 'Générer le storyboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Core Proposition & Barrier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#BA3807]">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Proposition de valeur centrale
            </h4>
          </div>
          <p className="text-sm font-semibold text-zinc-900 leading-relaxed">
            {strategy.value_proposition}
          </p>
          <div className="pt-2 text-xs text-zinc-500 flex items-center gap-2">
            <span className="font-semibold text-zinc-700">Motivation :</span>
            <span>{strategy.core_motivation}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Frein d&apos;achat identifié
              </h4>
            </div>
            {strategy.is_barrier_hypothesis && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Hypothèse à valider
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed">{strategy.purchase_barrier}</p>
          <div className="pt-2 text-xs text-zinc-500">
            {strategy.is_barrier_hypothesis
              ? 'Ce frein est formulé comme hypothèse marketing et sera levé par démonstration concrète.'
              : 'Frein confirmé dans les retours d’expérience du produit.'}
          </div>
        </div>
      </div>

      {/* Persuasion Techniques */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#BA3807]" />
          <span>Techniques de persuasion mobilisées & Rationale</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategy.persuasion_techniques.map((tech, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-1"
            >
              <div className="font-bold text-xs text-[#BA3807]">{tech.technique}</div>
              <p className="text-xs text-zinc-600 leading-normal">{tech.justification}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Arc (6 Steps) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#BA3807]" />
          <span>Structure narrative de la vidéo</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: '1. Hook (Accroche)',
              text: strategy.narrative_structure.hook,
              color: 'border-rose-200 bg-rose-50/30',
            },
            {
              label: '2. Contexte',
              text: strategy.narrative_structure.context,
              color: 'border-orange-200 bg-orange-50/30',
            },
            {
              label: '3. Révélation',
              text: strategy.narrative_structure.reveal,
              color: 'border-amber-200 bg-amber-50/30',
            },
            {
              label: '4. Démonstration',
              text: strategy.narrative_structure.demonstration,
              color: 'border-emerald-200 bg-emerald-50/30',
            },
            {
              label: '5. Résolution',
              text: strategy.narrative_structure.resolution,
              color: 'border-blue-200 bg-blue-50/30',
            },
            {
              label: "6. Appel à l'action",
              text: strategy.narrative_structure.cta,
              color: 'border-purple-200 bg-purple-50/30',
            },
          ].map((step, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${step.color} space-y-1.5`}>
              <div className="font-bold text-xs text-zinc-900">{step.label}</div>
              <p className="text-xs text-zinc-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Elements & CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            Éléments de preuve utilisés
          </h4>
          <div className="space-y-2">
            {strategy.proof_elements.map((proof, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-zinc-800">{proof.text}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    proof.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {proof.status === 'verified' ? 'Vérifié' : 'À valider'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            Recommandation Call-To-Action (CTA)
          </h4>
          <div className="p-4 rounded-xl bg-[#FFF5ED] border border-[#FED7AA] text-sm font-bold text-[#BA3807]">
            &ldquo;{strategy.cta_recommendation}&rdquo;
          </div>
          <p className="text-xs text-zinc-500">
            Adapté à l&apos;objectif de conversion sans fausse urgence ni compte à rebours trompeur.
          </p>
        </div>
      </div>
    </div>
  );
}
