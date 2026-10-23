'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { ProductIntelligenceReport } from '../../lib/types/creative';

interface Props {
  report: ProductIntelligenceReport;
  onProceedToSetup?: () => void;
}

export function ProductIntelligenceView({ report, onProceedToSetup }: Props) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF5ED] to-white border border-[#FED7AA]/70 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#BA3807]/10 text-[#BA3807] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Product Intelligence Engine</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">
              Analyse factuelle du produit : {report.product_title}
            </h2>
            <p className="text-sm text-zinc-500">
              Séparation stricte des faits vérifiés et des hypothèses marketing non confirmées.
            </p>
          </div>
          {onProceedToSetup && (
            <button
              type="button"
              onClick={onProceedToSetup}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-sm font-semibold shadow-xs transition"
            >
              <span>Configurer la pub UGC</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Confirmed Facts */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Caractéristiques confirmées</h3>
              <p className="text-xs text-zinc-500">
                {report.confirmed_facts.length} éléments validés dans la fiche
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1">
            {report.confirmed_facts.map((fact, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <span className="font-medium text-zinc-500 capitalize">{fact.attribute}</span>
                <span className="font-semibold text-zinc-800 text-right">{fact.value}</span>
              </div>
            ))}
            {report.confirmed_facts.length === 0 && (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aucune caractéristique brute trouvée.
              </p>
            )}
          </div>
        </div>

        {/* 2. Documented Benefits */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-blue-700">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Bénéfices documentés</h3>
              <p className="text-xs text-zinc-500">Avantages explicitement cités par la marque</p>
            </div>
          </div>

          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {report.documented_benefits.map((b, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-zinc-800 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>{b.benefit}</span>
              </li>
            ))}
            {report.documented_benefits.length === 0 && (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aucun bénéfice explicite extrait.
              </p>
            )}
          </ul>
        </div>

        {/* 3. Commercial Proofs */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Preuves commerciales disponibles</h3>
              <p className="text-xs text-zinc-500">
                Notes, avis clients réels et garanties vérifiées
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {report.commercial_proofs.map((proof, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-zinc-900">{proof.proof_type}</span>
                  <p className="text-zinc-600 mt-0.5">{proof.value}</p>
                </div>
                {proof.verified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Vérifié
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                    À valider
                  </span>
                )}
              </div>
            ))}
            {report.commercial_proofs.length === 0 && (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aucune preuve commerciale vérifiée disponible.
              </p>
            )}
          </div>
        </div>

        {/* 4. Marketing Hypotheses (Caution banner) */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-amber-800">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Hypothèses marketing (Non confirmées)
              </h3>
              <p className="text-xs text-amber-700 font-medium">
                Ne jamais traiter ces hypothèses comme des faits prouvés
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {report.marketing_hypotheses.map((hyp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">{hyp.hypothesis}</span>
                  <span className="text-[10px] font-semibold text-amber-600 uppercase">
                    Hypothèse
                  </span>
                </div>
                <p className="text-zinc-600">{hyp.rationale}</p>
              </div>
            ))}
            {report.marketing_hypotheses.length === 0 && (
              <p className="text-xs text-zinc-400 py-4 text-center">
                Aucune hypothèse non confirmée.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Missing Information checklist */}
      {report.missing_information.length > 0 && (
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-600">
            <span className="font-semibold text-zinc-900">
              Informations manquantes pour la production :{' '}
            </span>
            {report.missing_information.join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
}
