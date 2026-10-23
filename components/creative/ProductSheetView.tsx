'use client';

import React from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  HelpCircle,
  Megaphone,
  Palette,
  RotateCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useProductAnalysis } from '../../hooks/use-product-analysis';
import {
  AnalysisStatus,
  Hypothesis,
  ProductAnalysis,
  SheetFact,
  SourceKind,
} from '../../lib/types/product-analysis';

interface Props {
  productId: string;
  onProceedToSetup?: () => void;
}

const SOURCE_LABELS: Record<SourceKind, string> = {
  structured_data: 'Données structurées',
  page_metadata: 'Métadonnées de page',
  page_text: 'Texte de page',
  user_input: 'Saisie marchand',
  image: 'Image produit',
};

const STATUS_STYLES: Record<AnalysisStatus, { label: string; className: string }> = {
  completed: { label: 'Complète', className: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partielle', className: 'bg-amber-100 text-amber-800' },
  failed: { label: 'Échec', className: 'bg-red-100 text-red-700' },
  processing: { label: 'En cours', className: 'bg-zinc-100 text-zinc-700' },
};

const PARTIAL_REASON_LABELS: Record<string, string> = {
  extraction_partial: "L'extraction de la page produit est incomplète.",
  missing_description: 'Aucune description produit disponible.',
  no_reference_image: 'Aucune image de référence exploitable.',
  images_not_analyzed: "Les images n'ont pas été analysées (analyse heuristique).",
};

function partialReasonLabel(reason: string): string {
  if (reason.startsWith('image_unavailable:')) {
    return `Image inaccessible : ${reason.slice('image_unavailable:'.length)}`;
  }
  return PARTIAL_REASON_LABELS[reason] ?? reason;
}

function Card({
  icon,
  title,
  subtitle,
  tone = 'zinc',
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tone?: 'zinc' | 'amber';
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 ${
        tone === 'amber' ? 'border-amber-200' : 'border-zinc-200/80'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function FactList({ facts, empty }: { facts: SheetFact[]; empty: string }) {
  if (facts.length === 0) {
    return <p className="text-xs text-zinc-400 py-3 text-center">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-zinc-100 max-h-72 overflow-y-auto pr-1">
      {facts.map((fact, idx) => (
        <li key={`${fact.attribute}-${idx}`} className="py-2.5 text-xs space-y-1">
          <div className="flex items-start justify-between gap-4">
            <span className="font-medium text-zinc-500 capitalize">{fact.attribute}</span>
            <span className="font-semibold text-zinc-800 text-right break-words min-w-0">
              {fact.value}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="px-1.5 py-0.5 rounded bg-zinc-100">
              {fact.provenance.source ? SOURCE_LABELS[fact.provenance.source] : 'Source inconnue'}
              {' · '}
              {fact.provenance.field}
            </span>
            {fact.risk_flags.includes('health_claim') && (
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold">
                Allégation santé : non utilisable en pub
              </span>
            )}
          </div>
          {fact.provenance.source !== 'image' && fact.provenance.evidence !== fact.value && (
            <blockquote className="border-l-2 border-zinc-200 pl-2 text-[11px] text-zinc-500 italic break-words">
              « {fact.provenance.evidence} »
            </blockquote>
          )}
        </li>
      ))}
    </ul>
  );
}

function HypothesisItem({ label, hypothesis }: { label?: string; hypothesis: Hypothesis }) {
  return (
    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1">
      <div className="flex items-start justify-between gap-3">
        <span className="font-bold text-amber-900">
          {label && <span className="text-amber-700 font-semibold">{label} : </span>}
          {hypothesis.statement}
        </span>
        <span className="text-[10px] font-semibold text-amber-600 uppercase shrink-0">
          À valider
        </span>
      </div>
      <p className="text-zinc-600">{hypothesis.rationale}</p>
    </div>
  );
}

function AnalysisHeader({
  analysis,
  isAnalyzing,
  onAnalyze,
  onProceedToSetup,
}: {
  analysis: ProductAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: (force: boolean) => void;
  onProceedToSetup?: () => void;
}) {
  const status = analysis ? STATUS_STYLES[analysis.status] : null;
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#FFF5ED] to-white border border-[#FED7AA]/70 p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#BA3807]/10 text-[#BA3807] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            <span>Fiche produit structurée</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 break-words">
            {analysis?.sheet?.normalized_name ?? 'Produit non analysé'}
          </h2>
          {analysis && status && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500" role="status">
              <span className={`px-2 py-0.5 rounded-full font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span>
                {analysis.is_heuristic
                  ? 'Analyse heuristique (sans modèle de langage)'
                  : `Analyse IA · ${analysis.model ?? analysis.provider}`}
              </span>
              <span>· v{analysis.version}</span>
              {analysis.actual_cost_usd !== null && (
                <span>· {Number(analysis.actual_cost_usd).toFixed(4)} $</span>
              )}
            </div>
          )}
          {!analysis && (
            <p className="text-sm text-zinc-500">
              Faits vérifiés et hypothèses marketing séparés, chaque fait avec sa source.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onAnalyze(Boolean(analysis))}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold transition disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} aria-hidden />
            <span>
              {isAnalyzing ? 'Analyse…' : analysis ? "Relancer l'analyse" : 'Analyser le produit'}
            </span>
          </button>
          {onProceedToSetup && analysis?.sheet && (
            <button
              type="button"
              onClick={onProceedToSetup}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-sm font-semibold shadow-xs transition"
            >
              <span>Configurer la pub</span>
              <span aria-hidden>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductSheetView({ productId, onProceedToSetup }: Props) {
  const { analysis, isLoading, isAnalyzing, error, analyze } = useProductAnalysis(productId);

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3" role="status">
        <RotateCw className="w-8 h-8 text-[#BA3807] animate-spin mx-auto" aria-hidden />
        <p className="text-sm font-semibold text-zinc-600">Chargement de la fiche produit…</p>
      </div>
    );
  }

  const sheet = analysis?.sheet ?? null;
  const angle = sheet?.marketing_angle;
  const visual = sheet?.visual_identity;

  return (
    <div className="space-y-6">
      <AnalysisHeader
        analysis={analysis}
        isAnalyzing={isAnalyzing}
        onAnalyze={(force) => void analyze(force)}
        onProceedToSetup={onProceedToSetup}
      />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {analysis?.status === 'failed' && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-semibold">L&apos;analyse a échoué. </span>
          {analysis.error ?? 'Erreur inconnue.'}
        </div>
      )}

      {analysis && analysis.partial_reasons.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-semibold">
              Fiche partielle : vérifiez ces points avant de produire.
            </p>
            <ul className="list-disc pl-4 space-y-0.5 break-all">
              {analysis.partial_reasons.map((r) => (
                <li key={r}>{partialReasonLabel(r)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {sheet && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden />}
              title="Faits vérifiés"
              subtitle="Chaque fait cite un extrait exact de sa source"
            >
              <FactList facts={sheet.verified_facts} empty="Aucun fait vérifié." />
            </Card>

            <Card
              icon={<Megaphone className="w-4 h-4 text-blue-600" aria-hidden />}
              title="Affirmations du vendeur"
              subtitle="Le vendeur l'affirme : ce n'est pas une preuve"
            >
              <FactList facts={sheet.seller_claims} empty="Aucune affirmation du vendeur." />
            </Card>

            {sheet.visible_characteristics.length > 0 && (
              <Card
                icon={<Eye className="w-4 h-4 text-indigo-600" aria-hidden />}
                title="Visible sur les images"
              >
                <FactList facts={sheet.visible_characteristics} empty="" />
              </Card>
            )}

            <Card
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />}
              title="Angle marketing (hypothèses)"
              subtitle="Jamais présentés comme des faits"
              tone="amber"
            >
              <div className="space-y-2.5">
                {angle?.customer_problem && (
                  <HypothesisItem label="Problème" hypothesis={angle.customer_problem} />
                )}
                {angle?.target_audience && (
                  <HypothesisItem label="Public" hypothesis={angle.target_audience} />
                )}
                {angle?.demonstrable_solution && (
                  <HypothesisItem
                    label="Solution montrable"
                    hypothesis={angle.demonstrable_solution}
                  />
                )}
                {sheet.marketing_hypotheses.map((h, idx) => (
                  <HypothesisItem key={idx} hypothesis={h} />
                ))}
                {!angle?.customer_problem &&
                  !angle?.target_audience &&
                  !angle?.demonstrable_solution &&
                  sheet.marketing_hypotheses.length === 0 && (
                    <p className="text-xs text-zinc-400 py-3 text-center">Aucune hypothèse.</p>
                  )}
              </div>
            </Card>

            {visual && (
              <Card
                icon={<Palette className="w-4 h-4 text-pink-600" aria-hidden />}
                title="Identité visuelle à préserver"
              >
                <div className="space-y-3 text-xs text-zinc-700">
                  {visual.colors.length > 0 && (
                    <p>
                      <span className="font-semibold">Couleurs : </span>
                      {visual.colors.join(', ')}
                    </p>
                  )}
                  {visual.packaging_shape && (
                    <p>
                      <span className="font-semibold">Emballage : </span>
                      {visual.packaging_shape}
                    </p>
                  )}
                  {visual.elements_to_preserve.length > 0 && (
                    <p>
                      <span className="font-semibold">À ne pas altérer : </span>
                      {visual.elements_to_preserve.join(' · ')}
                    </p>
                  )}
                  {visual.reference_image_urls.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {visual.reference_image_urls.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary merchant CDNs
                        <img
                          key={url}
                          src={url}
                          alt="Image de référence du produit"
                          className="w-16 h-16 rounded-lg object-cover border border-zinc-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400">Aucune image de référence.</p>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sheet.missing_information.length > 0 && (
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" aria-hidden />
                <div className="text-xs text-zinc-600">
                  <p className="font-semibold text-zinc-900 mb-1">Informations manquantes</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {sheet.missing_information.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-red-50/50 border border-red-100 p-4 flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden />
              <div className="text-xs text-zinc-700">
                <p className="font-semibold text-zinc-900 mb-1">À ne jamais inventer</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {sheet.do_not_invent.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {analysis && analysis.grounding_issues.length > 0 && (
            <details className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
              <summary className="cursor-pointer font-semibold text-zinc-800 inline-flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-500" aria-hidden />
                {analysis.grounding_issues.length} élément(s) corrigé(s) par le contrôle de
                provenance
              </summary>
              <ul className="mt-3 space-y-1">
                {analysis.grounding_issues.map((issue, idx) => (
                  <li key={idx} className="break-words">
                    <span className="font-medium">{issue.attribute}</span> —{' '}
                    {issue.reason === 'evidence_not_found'
                      ? 'extrait introuvable dans la source, déplacé en hypothèse'
                      : issue.reason === 'unknown_field'
                        ? 'source citée inexistante, déplacé en hypothèse'
                        : 'risque détecté'}
                    {issue.detail ? ` (${issue.detail})` : ''}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
