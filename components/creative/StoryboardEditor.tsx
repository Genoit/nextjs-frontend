'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, History, Play, RotateCw, Save } from 'lucide-react';
import {
  PersuasiveRole,
  Storyboard,
  StoryboardScene,
  StoryboardSceneCreatePayload,
  StoryboardVersionSummary,
  StrategyCost,
} from '../../lib/types/creative';
import {
  acceptBlockReason,
  formatCost,
  formatCostTotal,
  sceneToPayload,
} from '../../lib/creative-rules.mjs';
import { GenerationMeta, HeuristicBadge, ViolationsPanel } from './CreativeStatus';

interface Props {
  storyboard: Storyboard;
  versions: StoryboardVersionSummary[];
  cost: StrategyCost | null;
  onSave: (scenes: StoryboardSceneCreatePayload[], title: string) => Promise<void>;
  onAccept: () => Promise<void>;
  onSelectVersion: (storyboardId: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onLaunchVideo: () => Promise<void>;
  isUpdating?: boolean;
  isAccepting?: boolean;
  isGenerating?: boolean;
  isLaunching?: boolean;
}

const ROLE_LABELS: Record<PersuasiveRole, string> = {
  hook: 'Accroche',
  problem: 'Problème',
  demo: 'Démonstration',
  proof: 'Preuve',
  contrast: 'Contraste',
  cta: "Appel à l'action",
  other: 'Autre',
};

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#BA3807] disabled:bg-zinc-50';

export function StoryboardEditor({
  storyboard,
  versions,
  cost,
  onSave,
  onAccept,
  onSelectVersion,
  onRegenerate,
  onLaunchVideo,
  isUpdating = false,
  isAccepting = false,
  isGenerating = false,
  isLaunching = false,
}: Props) {
  const [editedScenes, setEditedScenes] = useState<StoryboardScene[]>(storyboard.scenes);
  const [title, setTitle] = useState(storyboard.title);

  const totalDuration = editedScenes.reduce((acc, sc) => acc + Number(sc.duration_seconds || 0), 0);
  // Backend validator: sum(duration_s) == target_duration ± 0.5
  const spec = storyboard.spec;
  const latestVersion = versions.length ? Math.max(...versions.map((v) => v.version)) : null;
  const targetDuration = spec?.target_duration ?? storyboard.target_duration;
  const isDurationMatching = Math.abs(totalDuration - targetDuration) <= 0.5;
  const dirty =
    title !== storyboard.title ||
    JSON.stringify(editedScenes) !== JSON.stringify(storyboard.scenes);
  const busy = isUpdating || isGenerating || isAccepting;
  const acceptReason = acceptBlockReason(storyboard, { dirty, busy });
  // Only the latest, non-accepted version is editable (the API refuses the others).
  const readOnly = storyboard.accepted || storyboard.is_latest !== true;
  const resetEdits = () => {
    setEditedScenes(storyboard.scenes);
    setTitle(storyboard.title);
  };

  const change = <K extends keyof StoryboardScene>(
    index: number,
    field: K,
    val: StoryboardScene[K],
  ) => {
    setEditedScenes((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2" role="status">
              <span className="px-2.5 py-1 rounded-full bg-[#BA3807] text-white text-xs font-bold uppercase tracking-wider">
                Storyboard v{storyboard.version}
              </span>
              {storyboard.accepted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                  Version acceptée
                </span>
              )}
              <HeuristicBadge entity={storyboard} />
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isDurationMatching
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden />
                <span>
                  Total : {totalDuration.toFixed(1)}s / {targetDuration}s
                  {isDurationMatching ? '' : ' (durée à ajuster)'}
                </span>
              </span>
            </div>
            <label htmlFor="sb-title" className="sr-only">
              Titre du storyboard
            </label>
            <input
              id="sb-title"
              type="text"
              value={title}
              disabled={readOnly}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-zinc-900 border-b border-transparent hover:border-zinc-300 focus:border-[#BA3807] focus:outline-none px-1 py-0.5 disabled:bg-transparent"
            />
            <GenerationMeta meta={storyboard} />
            {readOnly && (
              <p className="text-xs text-zinc-500">
                {storyboard.accepted
                  ? 'Version acceptée : non modifiable. Toute modification passe par une nouvelle génération.'
                  : 'Version antérieure : lecture seule. Seule la dernière version est modifiable.'}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-2 shrink-0">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={busy}
              aria-busy={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
            >
              <RotateCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden />
              <span>{isGenerating ? 'Génération…' : 'Régénérer (nouvelle version)'}</span>
            </button>
            {dirty && !readOnly && (
              <button
                type="button"
                onClick={resetEdits}
                disabled={busy}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition disabled:opacity-60"
              >
                Annuler les modifications
              </button>
            )}
            <button
              type="button"
              onClick={() => onSave(editedScenes.map(sceneToPayload), title)}
              disabled={busy || readOnly || !dirty}
              aria-busy={isUpdating}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-zinc-500" aria-hidden />
              <span>{isUpdating ? 'Sauvegarde…' : 'Enregistrer (nouvelle version)'}</span>
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onAccept}
                disabled={acceptReason !== null}
                aria-busy={isAccepting}
                aria-describedby={acceptReason ? 'accept-reason' : undefined}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                <span>{isAccepting ? 'Acceptation…' : 'Accepter cette version'}</span>
              </button>
              {acceptReason && (
                <p id="accept-reason" className="text-[11px] text-zinc-500 max-w-56 text-right">
                  {acceptReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ViolationsPanel violations={storyboard.violations ?? []} />

          {spec && (spec.promise || spec.concept) && (
            <section
              aria-labelledby="concept-title"
              className="rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-2xs space-y-2 text-xs"
            >
              <h4 id="concept-title" className="text-sm font-bold text-zinc-900">
                Concept
              </h4>
              {spec.angle?.title && (
                <p>
                  <span className="font-semibold text-zinc-500">Angle : </span>
                  {spec.angle.title}
                </p>
              )}
              {spec.promise && (
                <p>
                  <span className="font-semibold text-zinc-500">Promesse : </span>
                  {spec.promise}
                </p>
              )}
              {spec.problem && (
                <p>
                  <span className="font-semibold text-zinc-500">Problème : </span>
                  {spec.problem}
                </p>
              )}
              {spec.concept?.logline && (
                <p>
                  <span className="font-semibold text-zinc-500">Logline : </span>
                  {spec.concept.logline}
                </p>
              )}
              {spec.concept?.script && (
                <p className="whitespace-pre-line text-zinc-700 bg-zinc-50 rounded-xl p-3">
                  {spec.concept.script}
                </p>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section
            aria-labelledby="versions-title"
            className="rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-2xs space-y-3"
          >
            <h4
              id="versions-title"
              className="text-sm font-bold text-zinc-900 flex items-center gap-2"
            >
              <History className="w-4 h-4 text-zinc-500" aria-hidden />
              Versions
            </h4>
            {dirty && (
              <p id="versions-dirty" className="text-[11px] text-amber-800">
                Enregistrez ou annulez vos modifications pour changer de version.
              </p>
            )}
            {versions.length === 0 ? (
              <p className="text-xs text-zinc-500">Historique indisponible.</p>
            ) : (
              <ul className="space-y-1.5">
                {[...versions]
                  .sort((a, b) => b.version - a.version)
                  .map((v) => {
                    const current = v.id === storyboard.id;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => onSelectVersion(v.id)}
                          disabled={dirty || busy}
                          aria-describedby={dirty ? 'versions-dirty' : undefined}
                          aria-current={current ? 'true' : undefined}
                          className={`w-full flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs transition ${
                            current
                              ? 'border-[#BA3807] bg-[#FFF5ED]'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className="font-bold text-zinc-900">v{v.version}</span>
                          {v.version === latestVersion && (
                            <span className="text-[10px] text-zinc-500">dernière</span>
                          )}
                          {v.edited_by_user && (
                            <span className="text-[10px] text-zinc-500">modifiée par vous</span>
                          )}
                          {v.block_count > 0 && (
                            <span className="text-[10px] font-bold text-red-700">
                              {v.block_count} bloquant{v.block_count > 1 ? 's' : ''}
                            </span>
                          )}
                          {v.warn_count > 0 && (
                            <span className="text-[10px] text-amber-800">
                              {v.warn_count} avertissement{v.warn_count > 1 ? 's' : ''}
                            </span>
                          )}
                          {v.accepted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" aria-hidden />
                              acceptée
                            </span>
                          )}
                          {v.is_heuristic && (
                            <span className="text-[10px] text-amber-800">simulation</span>
                          )}
                          {current && <span className="sr-only">(affichée)</span>}
                          <span className="ml-auto text-[10px] text-zinc-400">
                            {new Date(v.created_at).toLocaleString('fr-FR')}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>

          {cost && (
            <section
              aria-labelledby="cost-title"
              className="rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-2xs space-y-2 text-xs"
            >
              <h4 id="cost-title" className="text-sm font-bold text-zinc-900">
                Coût cumulé
              </h4>
              <HeuristicBadge entity={cost} />
              <dl className="space-y-1">
                {(
                  [
                    ['Analyse produit', formatCost(cost.analysis_cost, cost.is_heuristic)],
                    ['Stratégie', formatCost(cost.strategy_cost, cost.is_heuristic)],
                    [
                      'Storyboards (toutes versions)',
                      formatCost(cost.storyboard_cost, cost.is_heuristic),
                    ],
                    ['Total estimé', formatCostTotal(cost.total_estimated, cost)],
                    ['Total réel', formatCostTotal(cost.total_actual, cost)],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="font-semibold text-zinc-800 text-right">{text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <button
            type="button"
            onClick={onLaunchVideo}
            disabled={isLaunching || !storyboard.accepted || !isDurationMatching}
            aria-describedby="launch-hint"
            className="w-full px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" aria-hidden />
            <span>{isLaunching ? 'Lancement…' : 'Générer la vidéo MP4'}</span>
          </button>
          <p id="launch-hint" className="text-[11px] text-zinc-500">
            Disponible une fois une version acceptée.
          </p>
        </aside>
      </div>

      <ol className="space-y-4" aria-label="Plans du storyboard">
        {editedScenes.map((scene, idx) => {
          const p = `shot-${idx}`;
          return (
            <li
              key={scene.id || idx}
              className="rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-2xs space-y-4"
            >
              <fieldset disabled={readOnly} className="space-y-4">
                <legend className="sr-only">Plan #{scene.scene_order}</legend>
                <div className="flex flex-wrap items-end gap-4 border-b border-zinc-100 pb-3">
                  <span
                    className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#BA3807] font-bold text-xs flex items-center justify-center"
                    aria-hidden
                  >
                    #{scene.scene_order}
                  </span>
                  <div>
                    <label
                      htmlFor={`${p}-role`}
                      className="block text-xs font-bold text-zinc-700 mb-1"
                    >
                      Rôle persuasif
                    </label>
                    <select
                      id={`${p}-role`}
                      value={scene.persuasive_role ?? 'other'}
                      onChange={(e) =>
                        change(idx, 'persuasive_role', e.target.value as PersuasiveRole)
                      }
                      className={`${inputClass} bg-white`}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`${p}-duration`}
                      className="block text-xs font-bold text-zinc-700 mb-1"
                    >
                      Durée (s)
                    </label>
                    <input
                      id={`${p}-duration`}
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={Number(scene.duration_seconds)}
                      onChange={(e) =>
                        change(idx, 'duration_seconds', parseFloat(e.target.value) || 1)
                      }
                      className={`${inputClass} w-20 font-bold`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      ['visual_description', 'Description de la scène', 3],
                      ['camera_movement', 'Mouvement de caméra', 3],
                      ['video_prompt', 'Prompt de génération', 3],
                    ] as const
                  ).map(([field, label, rows]) => (
                    <div key={field} className={field === 'video_prompt' ? 'md:col-span-2' : ''}>
                      <label
                        htmlFor={`${p}-${field}`}
                        className="block text-xs font-bold text-zinc-700 mb-1"
                      >
                        {label}
                      </label>
                      <textarea
                        id={`${p}-${field}`}
                        rows={rows}
                        value={scene[field] ?? ''}
                        onChange={(e) => change(idx, field, e.target.value)}
                        className={`${inputClass} ${field === 'video_prompt' ? 'font-mono' : ''}`}
                      />
                    </div>
                  ))}
                  {(
                    [
                      ['voiceover_text', 'Voix-off'],
                      ['on_screen_text', "Texte à l'écran"],
                      ['transition_out', 'Transition de sortie'],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label
                        htmlFor={`${p}-${field}`}
                        className="block text-xs font-bold text-zinc-700 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={`${p}-${field}`}
                        type="text"
                        value={scene[field] ?? ''}
                        onChange={(e) => change(idx, field, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label
                      htmlFor={`${p}-constraints`}
                      className="block text-xs font-bold text-zinc-700 mb-1"
                    >
                      Contraintes (une par ligne)
                    </label>
                    <textarea
                      id={`${p}-constraints`}
                      rows={2}
                      value={(scene.constraints ?? []).join('\n')}
                      onChange={(e) => change(idx, 'constraints', e.target.value.split('\n'))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
