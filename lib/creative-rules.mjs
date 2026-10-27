// Pure display rules for Creative Intelligence (module 2).
// Plain ESM + JSDoc so `node --test` can import it without a TS loader.

export const HEURISTIC_LABEL = 'Simulation — pas une génération IA';
export const COST_NOT_MEASURED = 'non mesuré';

/**
 * GET /creative/products/{id}/creative-config answers 200 `null` when none exists.
 * @template T
 * @param {T | null | undefined} data
 * @returns {T | null}
 */
export function configOrNull(data) {
  return data && typeof data === 'object' ? data : null;
}

/**
 * Badge text for deterministic (non-LLM) output, or null for a real generation.
 * Fails closed: a missing flag counts as heuristic, never as an AI success.
 * @param {{ is_heuristic?: boolean } | null | undefined} entity
 * @returns {string | null}
 */
export function heuristicLabel(entity) {
  if (!entity) return null;
  return entity.is_heuristic !== false ? HEURISTIC_LABEL : null;
}

/**
 * Format a USD cost (Decimal string from the API). A 0 is only shown when the API
 * flags the output as heuristic; otherwise 0 or null means nothing was measured.
 * @param {string | number | null | undefined} value
 * @param {boolean} [isHeuristic]
 * @returns {string}
 */
export function formatCost(value, isHeuristic = false) {
  if (value === null || value === undefined || value === '') return COST_NOT_MEASURED;
  const n = Number(value);
  if (!Number.isFinite(n)) return COST_NOT_MEASURED;
  if (n === 0) return isHeuristic ? '0 $ (simulation)' : COST_NOT_MEASURED;
  return `${n.toFixed(4)} $`;
}

/**
 * Format a cumulated total of GET /strategy/{id}/cost. A real (non-heuristic) total
 * missing one of its components is partial and must not look measured.
 * @param {string | number | null | undefined} total
 * @param {{ is_heuristic: boolean, analysis_cost: unknown, strategy_cost: unknown,
 *   storyboard_cost: unknown }} cost
 * @returns {string}
 */
export function formatCostTotal(total, cost) {
  if (cost.is_heuristic) return formatCost(total, true);
  const formatted = formatCost(total, false);
  if (formatted === COST_NOT_MEASURED) return formatted;
  const parts = [cost.analysis_cost, cost.strategy_cost, cost.storyboard_cost];
  return parts.some((v) => v === null || v === undefined)
    ? `partiel (${formatted} mesurés)`
    : formatted;
}

/**
 * Why a storyboard version cannot be accepted, or null when it can.
 * @param {{ accepted?: boolean, is_latest?: boolean, generation_status?: string,
 *   violations?: Array<{ severity: string }> } | null | undefined} storyboard
 * @param {{ dirty?: boolean, busy?: boolean }} [state] unsaved edits / request in flight
 * @returns {string | null}
 */
export function acceptBlockReason(storyboard, { dirty = false, busy = false } = {}) {
  if (!storyboard) return 'Aucun storyboard.';
  if (storyboard.accepted) return 'Cette version est déjà acceptée.';
  if (busy) return 'Une opération est en cours.';
  if (dirty) return 'Enregistrez ou annulez vos modifications avant d’accepter.';
  if (storyboard.generation_status && storyboard.generation_status !== 'completed') {
    return "La génération de cette version n'est pas terminée.";
  }
  if (storyboard.is_latest !== true) return 'Seule la dernière version peut être acceptée.';
  if ((storyboard.violations ?? []).some((v) => v.severity === 'block')) {
    return 'Corrigez les violations bloquantes avant d’accepter.';
  }
  return null;
}

/** French label of a scene's persuasive role (StoryboardEditor select, asset board rows). */
export const ROLE_LABELS = {
  hook: 'Accroche',
  problem: 'Problème',
  demo: 'Démonstration',
  proof: 'Preuve',
  contrast: 'Contraste',
  cta: "Appel à l'action",
  other: 'Autre',
};

// Fields accepted by the backend StoryboardSceneEdit (StoryboardSceneCreate + module 2).
export const SCENE_PAYLOAD_KEYS = [
  'scene_order',
  'duration_seconds',
  'narrative_function',
  'visual_type',
  'visual_description',
  'video_prompt',
  'camera_movement',
  'voiceover_text',
  'on_screen_text',
  'product_image_url',
  'audio_ambiance',
  'continuity_notes',
  'character_ref_id',
  'environment_ref_id',
  'product_presence',
  'keyframe_url',
  'technical_risks',
  'acceptance_criteria',
  'feasibility_status',
  'feasibility_score',
  'feasibility_notes',
  'fallback_alternative',
  'is_validated',
  'persuasive_role',
  'transition_out',
  'constraints',
  'reference_urls',
];

/**
 * PATCH replaces every scene: keep all fields the backend accepts so nothing is lost.
 * Null/undefined values are omitted so the backend default (or copy) applies.
 * @param {import('./types/creative').StoryboardScene} scene
 * @returns {import('./types/creative').StoryboardSceneCreatePayload}
 */
export function sceneToPayload(scene) {
  /** @type {any} */
  const src = scene;
  /** @type {any} */
  const out = {};
  for (const key of SCENE_PAYLOAD_KEYS) {
    if (src[key] !== null && src[key] !== undefined) out[key] = src[key];
  }
  out.duration_seconds = Number(scene.duration_seconds);
  if (Array.isArray(scene.constraints)) {
    out.constraints = scene.constraints.map((c) => String(c).trim()).filter(Boolean);
  }
  return out;
}
