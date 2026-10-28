// Pure display rules for the per-shot video render (module 4, model router).
// Plain ESM + JSDoc so `node --test` can import it without a TS loader.

import { ROLE_LABELS } from './creative-rules.mjs';

export const SIMULATION_LABEL = 'Simulation';

/** Shot status (ShotRenderResponse.status) -> French word shown next to its icon. */
export const SHOT_STATUS_LABELS = {
  pending: 'En attente',
  routing: 'Choix du moteur…',
  rendering: 'Rendu en cours…',
  completed: 'Terminé',
  failed: 'Échec',
  blocked: 'Bloqué',
  needs_action: 'Action requise',
  cancelled: 'Annulé',
};

/** Router reason codes (blueprint §3) -> French sentence. */
export const ROUTE_REASONS = {
  disabled: 'Moteur désactivé.',
  aspect_unsupported: "Format d'image non pris en charge.",
  duration_unreachable: 'Durée du plan impossible à atteindre.',
  refs_unsupported: 'Images de référence non prises en charge.',
  resolution_unavailable_for_tier: 'Résolution indisponible pour ce niveau de qualité.',
  price_unknown: 'Tarif inconnu : jamais utilisé sans prix.',
  breaker_open: 'Moteur suspendu après des erreurs récentes.',
  concurrency_full: 'Trop de rendus en cours sur ce moteur.',
  over_budget: 'Dépasserait le budget du job.',
  mock_excluded: 'Simulation écartée : un moteur réel est disponible.',
  no_eligible_engine: 'Aucun moteur compatible avec ce plan.',
  best_score: 'Meilleur score parmi les moteurs compatibles.',
};

export const QUALITY_TIERS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

const TERMINAL_JOB = ['completed', 'failed', 'cancelled', 'blocked'];

/** @param {string | null | undefined} status */
export function isTerminalJob(status) {
  return TERMINAL_JOB.includes(status ?? '');
}

/** @param {string | null | undefined} tier */
export function tierLabel(tier) {
  return QUALITY_TIERS.find((t) => t.value === tier)?.label ?? 'Standard';
}

/**
 * Status pill of one shot. Unknown statuses are never shown as a success.
 * @param {{ status?: string } | null | undefined} shot
 * @returns {{ key: string, label: string }}
 */
export function shotStatusView(shot) {
  const s = shot?.status ?? '';
  if (Object.hasOwn(SHOT_STATUS_LABELS, s)) {
    return { key: s, label: /** @type {Record<string,string>} */ (SHOT_STATUS_LABELS)[s] };
  }
  return { key: 'unknown', label: 'Statut inconnu' };
}

/** @param {string | null | undefined} code */
export function routeReasonText(code) {
  return (
    (code && Object.hasOwn(ROUTE_REASONS, code) && /** @type {any} */ (ROUTE_REASONS)[code]) ||
    'Raison non précisée.'
  );
}

/**
 * Fails closed: a missing is_mock counts as a simulation, never as a real AI render.
 * @param {{ is_mock?: boolean } | null | undefined} entity
 */
export function isMock(entity) {
  return entity?.is_mock !== false;
}

/**
 * "80 % sur 12 essais"; no sample means the rate is only the prior, so say so.
 * @param {number | string | null | undefined} rate 0..1
 * @param {number | null | undefined} n sample size
 */
export function successRateText(rate, n) {
  const r = Number(rate);
  if (!n || n <= 0 || rate === null || rate === undefined || !Number.isFinite(r)) {
    return "pas encore d'historique";
  }
  return `${Math.round(r * 100)} % sur ${n} essai${n > 1 ? 's' : ''}`;
}

/** @param {number | string | null | undefined} v */
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

/** @param {number} n */
export function usd(n) {
  return `${n.toFixed(2).replace('.', ',')} $`;
}

/**
 * Budget bar of a job: numbers + a sentence, never color alone.
 * @param {{ budget_usd?: string | number | null, budget_remaining_usd?: string | number | null }} job
 * @returns {{ budget: number, remaining: number, spent: number, pct: number, over: boolean, label: string } | null}
 */
export function budgetView(job) {
  const budget = num(job?.budget_usd);
  const remainingRaw = num(job?.budget_remaining_usd);
  if (budget === null || !Number.isFinite(budget) || budget <= 0) return null;
  const remaining = remainingRaw !== null && Number.isFinite(remainingRaw) ? remainingRaw : budget;
  const spent = Math.max(0, budget - remaining);
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const over = remaining < 0;
  const label = over
    ? `Budget dépassé : ${usd(spent)} engagés pour ${usd(budget)}`
    : `${usd(spent)} engagés sur ${usd(budget)} · reste ${usd(remaining)}`;
  return { budget, remaining, spent, pct, over, label };
}

/**
 * An attempt whose fate at the provider is unknown may have been billed.
 * @param {{ possibly_billed?: boolean, status?: string, actual_cost_usd?: unknown } | null | undefined} attempt
 */
export function isPossiblyBilled(attempt) {
  if (!attempt) return false;
  if (attempt.possibly_billed === true) return true;
  return attempt.status === 'unknown' && (attempt.actual_cost_usd ?? null) === null;
}

/**
 * Amount that may already have been billed for a shot (sum of estimates of such attempts).
 * @param {{ attempts?: Array<any> }} shot
 * @returns {string} "≈ 0,40 $" or "montant inconnu"
 */
export function possiblyBilledText(shot) {
  let total = 0;
  let known = false;
  for (const a of shot?.attempts ?? []) {
    if (!isPossiblyBilled(a)) continue;
    const e = num(a.estimated_cost_usd);
    if (e !== null && Number.isFinite(e)) {
      total += e;
      known = true;
    }
  }
  return known ? `≈ ${usd(total)}` : 'montant inconnu';
}

/**
 * Which inline action a shot offers. confirm_rerender only for needs_action shots;
 * pick_engine (blocked) can only be retried at job level when the job stopped.
 * @param {{ action?: string | null, status?: string }} shot
 * @param {string | null | undefined} jobStatus
 * @returns {{ kind: 'confirm_rerender' } | { kind: 'pick_engine', canRetry: boolean } | null}
 */
export function shotAction(shot, jobStatus) {
  if (shot?.action === 'confirm_rerender' && shot.status === 'needs_action') {
    return { kind: 'confirm_rerender' };
  }
  if (shot?.action === 'pick_engine' || shot?.status === 'blocked') {
    return { kind: 'pick_engine', canRetry: jobStatus === 'failed' || jobStatus === 'blocked' };
  }
  return null;
}

/** @param {number | string | null | undefined} v */
const seconds = (v) => {
  const n = num(v);
  return n === null || !Number.isFinite(n)
    ? null
    : `${String(Math.round(n * 10) / 10).replace('.', ',')} s`;
};

/**
 * "rendu 6 s, plan 5 s" (the montage trims the extra second).
 * @param {{ duration_billed_s?: unknown, duration_shot_s?: unknown }} shot
 */
export function durationText(shot) {
  const billed = seconds(/** @type {any} */ (shot?.duration_billed_s));
  const planned = seconds(/** @type {any} */ (shot?.duration_shot_s));
  if (billed && planned && billed !== planned) return `rendu ${billed}, plan ${planned}`;
  return planned ? `plan ${planned}` : billed ? `rendu ${billed}` : '';
}

/** @param {{ scene_order?: number, persuasive_role?: string | null }} shot */
export function shotTitle(shot) {
  const role = shot?.persuasive_role && /** @type {any} */ (ROLE_LABELS)[shot.persuasive_role];
  return `Plan ${shot?.scene_order ?? '?'}${role ? ` · ${role}` : ''}`;
}

/** Old jobs (before module 4) have no shots. @param {{ shots?: unknown }} job */
export function shotsOf(job) {
  return Array.isArray(job?.shots)
    ? [...job.shots].sort((a, b) => (a.scene_order ?? 0) - (b.scene_order ?? 0))
    : [];
}

/**
 * Polite live text for shots whose status changed (or that appeared) between two polls ("" when nothing changed).
 * @param {{ shots?: Array<any> } | null | undefined} prev
 * @param {{ shots?: Array<any> } | null | undefined} next
 */
export function shotTransitionMessage(prev, next) {
  if (!prev || !next) return '';
  const before = new Map(shotsOf(prev).map((s) => [s.shot_id, s.status]));
  const lines = [];
  for (const shot of shotsOf(next)) {
    // A shot that first appears is announced too (shots are created after routing starts).
    if (before.get(shot.shot_id) === shot.status) continue;
    const { label } = shotStatusView(shot);
    const sim = shot.status === 'completed' && isMock(shot) ? ' (simulation)' : '';
    lines.push(`Plan ${shot.scene_order} : ${label.replace('…', '')}${sim}.`);
  }
  return lines.join(' ');
}
