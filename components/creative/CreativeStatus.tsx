'use client';

import React from 'react';
import { AlertTriangle, Ban, FlaskConical } from 'lucide-react';
import { formatCost, heuristicLabel } from '../../lib/creative-rules.mjs';
import { ComplianceViolation, CreativeGenerationMeta } from '../../lib/types/creative';

/** Badge shown when the output is deterministic, never presented as an AI success. */
export function HeuristicBadge({ entity }: { entity: { is_heuristic?: boolean } | null }) {
  const label = heuristicLabel(entity);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-soft text-warning border border-warning/30 text-xs font-bold">
      <FlaskConical className="w-3.5 h-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** Provider, model and estimated/actual cost of one generation. */
export function GenerationMeta({ meta }: { meta: CreativeGenerationMeta }) {
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
      <div className="flex gap-1">
        <dt>Moteur :</dt>
        <dd className="font-semibold text-ink-soft">
          {meta.is_heuristic ? 'déterministe' : (meta.model ?? meta.provider)}
          {meta.edited_by_user && ' — puis modifié par vous'}
        </dd>
      </div>
      <div className="flex gap-1">
        <dt>Coût estimé :</dt>
        <dd className="font-semibold text-ink-soft">
          {formatCost(meta.estimated_cost_usd, meta.is_heuristic)}
        </dd>
      </div>
      <div className="flex gap-1">
        <dt>Coût réel :</dt>
        <dd className="font-semibold text-ink-soft">
          {formatCost(meta.actual_cost_usd, meta.is_heuristic)}
        </dd>
      </div>
      {meta.reused && (
        <div className="flex gap-1">
          <dt className="sr-only">Cache :</dt>
          <dd>résultat existant réutilisé (aucun nouvel appel)</dd>
        </div>
      )}
    </dl>
  );
}

const SEVERITY = {
  block: {
    label: 'Bloquant',
    Icon: Ban,
    className: 'border-danger/30 bg-danger-soft text-danger',
  },
  warn: {
    label: 'Avertissement',
    Icon: AlertTriangle,
    className: 'border-warning/30 bg-warning-soft text-warning',
  },
} as const;

/** Persuasion/compliance violations: severity is spelled out, not conveyed by color only. */
export function ViolationsPanel({ violations }: { violations: ComplianceViolation[] }) {
  const ordered = [...violations].sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === 'block' ? -1 : 1,
  );
  return (
    <section
      aria-labelledby="violations-title"
      className="rounded-2xl bg-studio-ground border border-line/80 p-5 shadow-2xs space-y-3"
    >
      <h4 id="violations-title" className="text-sm font-bold text-ink">
        Contrôle de persuasion & conformité
      </h4>
      {ordered.length === 0 ? (
        <p className="text-xs text-ink-soft">Aucune violation détectée.</p>
      ) : (
        <ul className="space-y-2">
          {ordered.map((v, idx) => {
            const sev = SEVERITY[v.severity] ?? SEVERITY.warn;
            return (
              <li
                key={`${v.rule_code}-${v.shot_order ?? 'g'}-${idx}`}
                className={`p-3 rounded-xl border text-xs space-y-1 ${sev.className}`}
              >
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  <sev.Icon className="w-3.5 h-3.5" aria-hidden />
                  <span>{sev.label}</span>
                  <span className="font-mono font-semibold">{v.rule_code}</span>
                  <span className="font-medium">
                    {v.shot_order == null ? '· Global' : `· Plan #${v.shot_order}`}
                  </span>
                </div>
                <p>{v.text}</p>
                {v.suggestion && (
                  <p>
                    <span className="font-semibold">Suggestion : </span>
                    {v.suggestion}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
