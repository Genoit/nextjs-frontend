// Pure display rules for the Asset Pipeline (module 3).
// Plain ESM + JSDoc so `node --test` can import it without a TS loader.
// Shapes: lib/types/assets.ts (backend AssetBoardResponse / ScenePlanResponse).

import { formatCost } from './creative-rules.mjs';

export const SIMULATED_LABEL = 'Simulé';
export const PREPARE_FIRST = "Préparez d'abord les visuels produit.";

/** @typedef {import('./types/assets').ScenePlan} ScenePlan */
/** @typedef {import('./types/assets').AssetBoard} AssetBoard */

export const DECISION_REASONS = {
  clean_background: "Fond déjà neutre : l'image d'origine convient telle quelle.",
  cluttered_background_on_packshot: 'Fond chargé : un détourage est nécessaire pour ce plan.',
  engine_composes_scene:
    "Le moteur vidéo place lui-même le produit dans la scène : l'image d'origine est la plus fidèle.",
  low_resolution: 'Image en basse résolution : qualité vidéo limitée.',
  processing_disabled: "Traitement désactivé : image d'origine utilisée.",
  no_product_reference: 'Aucun produit dans ce plan : pas de visuel requis.',
  unusable_reference: 'Image produit illisible ou inaccessible.',
  user_forced_original: "Vous avez choisi l'image d'origine.",
  user_requested_processing: 'Vous avez demandé un traitement.',
};

export const FALLBACK_REASONS = {
  fidelity_failed:
    "Le produit a été modifié par le traitement (forme, couleur ou logo) : l'image d'origine est conservée.",
  engine_error: "Le traitement a échoué : l'image d'origine est conservée.",
  ambiguous_timeout: "Délai dépassé côté moteur : l'image d'origine est conservée.",
};

const OPERATIONS = {
  replace_background: 'remplacement du fond',
  remove_background: 'détourage',
  inpaint: 'retouche',
};

/**
 * Fails closed: a missing flag counts as simulated, never as an AI result.
 * @param {{ is_heuristic?: boolean } | null | undefined} entity
 */
export function isSimulated(entity) {
  return entity?.is_heuristic !== false;
}

/**
 * @param {string | null | undefined} code
 * @param {Record<string, string>} [map]
 */
export function reasonText(code, map = DECISION_REASONS) {
  return (code && Object.hasOwn(map, code) && map[code]) || 'Raison non précisée.';
}

/** @param {ScenePlan} plan */
export function hasReason(plan, code) {
  return (plan.reasons ?? []).includes(code);
}

/** The scene shows no product: nothing to prepare (backend decision no_reference/no_product_reference). */
export function isNotRequired(plan) {
  return plan.decision === 'no_reference' && !hasReason(plan, 'unusable_reference');
}

/** The product image exists but cannot be read: blocks the video. */
export function isMissingOriginal(plan) {
  return plan.decision === 'no_reference' && hasReason(plan, 'unusable_reference');
}

export function isInFlight(plan) {
  return plan.status === 'pending' || plan.status === 'processing';
}

/** `unknown` (ambiguous engine answer) is shown as a fallback: the original is kept. */
export function fallbackReason(plan) {
  return plan.fallback_reason ?? (plan.status === 'unknown' ? 'ambiguous_timeout' : null);
}

/** @param {ScenePlan} plan */
export function decisionLabel(plan) {
  let label;
  if (plan.decision === 'processing') {
    const op = plan.operation && OPERATIONS[plan.operation];
    label = op ? `Traitement : ${op}` : 'Traitement';
  } else if (plan.decision === 'direct_reference') {
    label = 'Référence directe';
  } else {
    label = 'Sans visuel produit';
  }
  return plan.source_mode && plan.source_mode !== 'auto' ? `${label} · choisi par vous` : label;
}

/**
 * Status pill of one plan, by precedence.
 * @param {ScenePlan} plan
 * @returns {{ key: string, label: string }}
 */
export function assetStatusView(plan) {
  if (isNotRequired(plan)) return { key: 'not_required', label: 'Aucun produit' };
  if (isMissingOriginal(plan)) return { key: 'missing_original', label: 'Image produit manquante' };
  if (plan.status === 'processing') return { key: 'processing', label: 'Traitement en cours…' };
  if (plan.status === 'pending') return { key: 'pending', label: 'En attente' };
  if (plan.status === 'failed') return { key: 'failed', label: 'Échec du traitement' };
  if (plan.status === 'fallback' || plan.status === 'unknown') {
    return { key: 'fallback', label: 'Original conservé' };
  }
  if (plan.status === 'direct') return { key: 'direct', label: 'Référence directe' };
  if (plan.status === 'completed') {
    if (isSimulated(plan)) return { key: 'simulated', label: SIMULATED_LABEL };
    if (plan.fidelity?.checked && plan.fidelity.passed === true) {
      return { key: 'processed', label: 'Traité' };
    }
  }
  return { key: 'unverified', label: 'Non vérifié' };
}

/**
 * Which image the video consumes. Fails closed: "processed" only for a completed job with a
 * final asset that passed the fidelity check (or a flagged simulation); otherwise the original.
 * @param {ScenePlan} plan
 * @returns {'original' | 'processed' | 'none'}
 */
export function usedSource(plan) {
  if (plan.decision === 'no_reference' || plan.used_source === 'none') return 'none';
  const trusted = plan.fidelity?.passed === true || isSimulated(plan);
  return plan.used_source === 'processed' &&
    plan.final_asset_id &&
    plan.status === 'completed' &&
    trusted
    ? 'processed'
    : 'original';
}

const score2 = (n) => n.toFixed(2).replace('.', ',');

/**
 * @param {ScenePlan} plan
 * @returns {{ label: string, tone: 'ok' | 'warn' | 'neutral' } | null} null when nothing was processed
 */
export function fidelityView(plan) {
  if (!['completed', 'fallback', 'unknown'].includes(plan.status)) return null;
  if (isSimulated(plan)) return { label: 'Fidélité non évaluée (simulation)', tone: 'neutral' };
  const f = plan.fidelity;
  if (!f || !f.checked || typeof f.passed !== 'boolean') {
    return { label: 'Fidélité non vérifiée', tone: 'neutral' };
  }
  const hasScore = typeof f.score === 'number' && Number.isFinite(f.score);
  const hasThreshold = typeof f.threshold === 'number' && Number.isFinite(f.threshold);
  let detail = '';
  // The summary score is one criterion among several: hide it when another one decided.
  const consistent = !hasThreshold || (f.score >= f.threshold) === f.passed;
  if (hasScore && consistent) {
    const cmp = hasThreshold ? ` ${f.passed ? '≥' : '<'} ${score2(f.threshold)}` : '';
    detail = ` (score ${score2(f.score)}${cmp})`;
  }
  return f.passed
    ? { label: `Fidèle au produit${detail}`, tone: 'ok' }
    : { label: `Produit altéré${detail}`, tone: 'warn' };
}

/**
 * The engine's licence may not be used in an ad. 'internal' (the local mock) is only
 * allowed when the plan is flagged as simulated.
 * @param {ScenePlan} plan
 */
function licenceBlocks(plan) {
  if (plan.licence === 'commercial') return false;
  return !(plan.licence === 'internal' && isSimulated(plan));
}

/**
 * Licence warning of the engine that produced a result, or null.
 * @param {ScenePlan} plan
 */
export function licenceWarning(plan) {
  if (!plan.provider || !licenceBlocks(plan)) return null;
  if (plan.licence === 'non_commercial') {
    const name = plan.model ?? plan.provider;
    return `Licence non commerciale (${name}) : ce résultat ne peut pas être utilisé dans une publicité.`;
  }
  return 'Licence du moteur inconnue : vérifiez avant diffusion.';
}

/** @param {ScenePlan} plan */
export function planCostText(plan, field) {
  if (!plan.provider) return 'aucun';
  return formatCost(plan[field], isSimulated(plan));
}

/**
 * Board total; mirrors formatCostTotal: a real total with an unmeasured job is partial.
 * @param {AssetBoard} board
 * @param {'total_estimated_usd' | 'total_actual_usd'} field
 */
export function boardCostText(board, field) {
  const jobs = board.plans.filter((p) => p.provider);
  if (jobs.length === 0) return 'aucun';
  if (board.is_heuristic) return formatCost(board[field], true);
  const formatted = formatCost(board[field], false);
  const planField = field === 'total_actual_usd' ? 'actual_cost_usd' : 'estimated_cost_usd';
  if (formatted === 'non mesuré') return formatted;
  return jobs.some((p) => p[planField] == null) ? `partiel (${formatted} mesurés)` : formatted;
}

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

/** @param {AssetBoard} board */
export function boardSummary(board) {
  const plans = board.plans;
  const required = plans.filter((p) => !isNotRequired(p));
  const ready = required.filter((p) => !isInFlight(p) && !isMissingOriginal(p)).length;
  const count = (keys) => plans.filter((p) => keys.includes(assetStatusView(p).key)).length;
  const direct = count(['direct']);
  const processed = count(['processed', 'simulated', 'unverified']);
  const kept = count(['fallback', 'failed']);
  const none = plans.length - required.length;
  const parts = [
    plural(plans.length, 'plan', 'plans'),
    direct && `${direct} en référence directe`,
    processed && plural(processed, 'traité', 'traités'),
    kept && plural(kept, 'original conservé', 'originaux conservés'),
    none && `${none} sans produit`,
  ].filter(Boolean);
  const licences = plans.filter((p) => licenceWarning(p)).length;
  return {
    line: parts.join(' · '),
    ready,
    required: required.length,
    licences: licences ? `${licences} à vérifier` : '—',
  };
}

/**
 * Why the source of a plan cannot be changed right now, or null.
 * @param {ScenePlan} plan
 * @param {{ busy?: boolean }} [state]
 */
export function overrideBlockReason(plan, { busy = false } = {}) {
  if (isInFlight(plan)) return 'Traitement en cours pour ce plan.';
  if (busy) return 'Une opération est en cours.';
  if (isMissingOriginal(plan)) return "Ajoutez d'abord une image produit.";
  return null;
}

/**
 * Why the video cannot be launched yet, or null.
 * @param {AssetBoard | null | undefined} board
 * @param {Array<{ id: string, reference_urls?: string[] | null }>} scenes
 */
export function launchBlockReason(board, scenes) {
  if (!board) {
    // No plan = legacy path (backend): fine only when no scene carries a product image.
    return scenes.every((s) => !s.reference_urls?.length) ? null : PREPARE_FIRST;
  }
  const byScene = new Map(board.plans.map((p) => [p.scene_id, p]));
  if (scenes.some((s) => !byScene.has(s.id))) return PREPARE_FIRST;
  const plans = [...board.plans].sort((a, b) => a.scene_order - b.scene_order);
  if (plans.some(isInFlight)) return 'Attendez la fin du traitement des visuels.';
  const missing = plans.find(isMissingOriginal);
  if (missing) return `Plan ${missing.scene_order} : image produit manquante.`;
  const blocked = plans.find((p) => usedSource(p) === 'processed' && licenceBlocks(p));
  if (blocked) {
    return blocked.licence === 'non_commercial'
      ? `Plan ${blocked.scene_order} : licence non commerciale — forcez l'image d'origine pour ce plan.`
      : `Plan ${blocked.scene_order} : ${licenceWarning(blocked)}`;
  }
  return null;
}

/**
 * Polite live announcements for plans that just finished (focus never moves).
 * @param {AssetBoard | null} prev
 * @param {AssetBoard} next
 * @returns {string}
 */
export function transitionMessage(prev, next) {
  if (!prev) return '';
  const before = new Map(prev.plans.map((p) => [p.id, p]));
  const lines = [];
  for (const plan of next.plans) {
    const old = before.get(plan.id);
    if (!old || !isInFlight(old) || isInFlight(plan)) continue;
    const n = plan.scene_order;
    const used = usedSource(plan);
    // A simulation is never announced as a finished (real) treatment.
    if (plan.status === 'completed' && isSimulated(plan)) {
      lines.push(
        used === 'processed'
          ? `Plan ${n} : traitement simulé, résultat simulé utilisé.`
          : `Plan ${n} : traitement simulé, image d'origine utilisée.`,
      );
    } else if (used === 'processed') lines.push(`Plan ${n} : traitement terminé.`);
    else if (fallbackReason(plan) === 'fidelity_failed') {
      lines.push(`Plan ${n} : image d'origine conservée (produit altéré).`);
    } else lines.push(`Plan ${n} : image d'origine conservée.`);
  }
  if (lines.length && !next.plans.some(isInFlight)) lines.push('Tous les visuels sont prêts.');
  return lines.join(' ');
}
