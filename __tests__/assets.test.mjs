import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  PREPARE_FIRST,
  assetStatusView,
  boardCostText,
  boardSummary,
  decisionLabel,
  fidelityView,
  isSimulated,
  launchBlockReason,
  licenceWarning,
  overrideBlockReason,
  reasonText,
  transitionMessage,
  usedSource,
} from '../lib/asset-rules.mjs';

/** A ScenePlanResponse as the backend sends it (direct reference by default). */
const plan = (over = {}) => ({
  id: 'p1',
  scene_id: 's1',
  scene_order: 1,
  persuasive_role: 'demo',
  visual_type: 'product',
  duration_seconds: '4.0',
  decision: 'direct_reference',
  reasons: ['clean_background'],
  source_mode: 'auto',
  status: 'direct',
  used_source: 'original',
  source_asset_id: 'a-src',
  final_asset_id: 'a-src',
  result_asset_id: null,
  reference_asset_ids: [],
  operation: null,
  provider: null,
  model: null,
  licence: null,
  is_heuristic: false,
  fidelity: null,
  fallback_reason: null,
  estimated_cost_usd: '0',
  actual_cost_usd: '0',
  error: null,
  ...over,
});

const processed = (over = {}) =>
  plan({
    decision: 'processing',
    reasons: ['cluttered_background_on_packshot'],
    operation: 'replace_background',
    status: 'completed',
    used_source: 'processed',
    final_asset_id: 'a-res',
    result_asset_id: 'a-res',
    provider: 'runpod',
    model: 'bg-v2',
    licence: 'commercial',
    is_heuristic: false,
    fidelity: { checked: true, passed: true, score: 0.94, threshold: 0.9, checker: 'pillow-v1' },
    estimated_cost_usd: '0.0400',
    actual_cost_usd: '0.0380',
    ...over,
  });

const mock = (over = {}) =>
  processed({
    provider: 'mock_local',
    model: 'border-key-v1',
    licence: 'internal',
    is_heuristic: true,
    estimated_cost_usd: '0',
    actual_cost_usd: '0',
    ...over,
  });

const board = (plans, over = {}) => ({
  storyboard_id: 'sb',
  is_heuristic: plans.some((p) => p.is_heuristic),
  total_estimated_usd: '0',
  total_actual_usd: '0',
  plans,
  ...over,
});

const scene = (id, refs = ['u']) => ({ id, reference_urls: refs });

describe('Asset pipeline display rules', () => {
  it('treats a missing flag as simulated (fails closed)', () => {
    assert.strictEqual(isSimulated({}), true);
    assert.strictEqual(isSimulated(null), true);
    assert.strictEqual(isSimulated({ is_heuristic: false }), false);
  });

  it('never shows a simulated result as faithful, even if it passed', () => {
    const v = fidelityView(mock());
    assert.deepStrictEqual(v, { label: 'Fidélité non évaluée (simulation)', tone: 'neutral' });
  });

  it('labels fidelity with a French comma score', () => {
    assert.deepStrictEqual(fidelityView(processed()), {
      label: 'Fidèle au produit (score 0,94 ≥ 0,90)',
      tone: 'ok',
    });
    const altered = processed({
      status: 'fallback',
      used_source: 'original',
      fallback_reason: 'fidelity_failed',
      fidelity: { checked: true, passed: false, score: 0.71, threshold: 0.9, checker: 'x' },
    });
    assert.strictEqual(fidelityView(altered).label, 'Produit altéré (score 0,71 < 0,90)');
    const otherCriterion = processed({
      status: 'fallback',
      used_source: 'original',
      fidelity: { checked: true, passed: false, score: 1, threshold: 0.9, checker: 'x' },
    });
    assert.strictEqual(fidelityView(otherCriterion).label, 'Produit altéré');
    const noScore = processed({
      fidelity: { checked: true, passed: true, score: null, threshold: 0.9, checker: 'x' },
    });
    assert.strictEqual(fidelityView(noScore).label, 'Fidèle au produit');
    assert.strictEqual(fidelityView(processed({ fidelity: null })).label, 'Fidélité non vérifiée');
    assert.strictEqual(fidelityView(plan()), null);
  });

  it('applies status precedence', () => {
    const none = plan({
      decision: 'no_reference',
      reasons: ['no_product_reference'],
      status: 'no_reference',
    });
    assert.strictEqual(assetStatusView(none).key, 'not_required');
    const unusable = plan({
      decision: 'no_reference',
      reasons: ['unusable_reference'],
      status: 'no_reference',
    });
    assert.strictEqual(assetStatusView(unusable).key, 'missing_original');
    assert.strictEqual(assetStatusView(mock({ status: 'fallback' })).key, 'fallback');
    assert.strictEqual(assetStatusView(processed({ status: 'unknown' })).key, 'fallback');
    assert.strictEqual(assetStatusView(mock()).key, 'simulated');
    assert.strictEqual(assetStatusView(processed()).key, 'processed');
    assert.strictEqual(assetStatusView(processed({ fidelity: null })).key, 'unverified');
    assert.strictEqual(
      assetStatusView(plan({ status: 'processing' })).label,
      'Traitement en cours…',
    );
  });

  it('only trusts a processed source backed by a final asset', () => {
    assert.strictEqual(usedSource(processed()), 'processed');
    assert.strictEqual(usedSource(processed({ final_asset_id: null })), 'original');
    assert.strictEqual(usedSource(plan()), 'original');
    assert.strictEqual(usedSource(plan({ decision: 'no_reference', used_source: 'none' })), 'none');
  });

  it('warns on licences, but not for commercial, direct or the internal mock', () => {
    assert.strictEqual(licenceWarning(plan()), null);
    assert.strictEqual(licenceWarning(processed()), null);
    assert.strictEqual(licenceWarning(mock()), null);
    assert.match(
      licenceWarning(processed({ licence: 'non_commercial' })),
      /^Licence non commerciale \(bg-v2\)/,
    );
    assert.strictEqual(
      licenceWarning(processed({ licence: null })),
      'Licence du moteur inconnue : vérifiez avant diffusion.',
    );
  });

  it('formats board costs honestly', () => {
    assert.strictEqual(boardCostText(board([plan()]), 'total_estimated_usd'), 'aucun');
    assert.strictEqual(
      boardCostText(board([plan(), mock()]), 'total_actual_usd'),
      '0 $ (simulation)',
    );
    const real = board([processed()], {
      total_estimated_usd: '0.0400',
      total_actual_usd: '0.0380',
    });
    assert.strictEqual(boardCostText(real, 'total_actual_usd'), '0.0380 $');
    const partial = board([processed(), processed({ id: 'p2', actual_cost_usd: null })], {
      total_actual_usd: '0.0380',
    });
    assert.match(boardCostText(partial, 'total_actual_usd'), /^partiel \(0\.0380 \$ mesurés\)/);
  });

  it('summarises the board', () => {
    const none = plan({
      id: 'p3',
      decision: 'no_reference',
      reasons: ['no_product_reference'],
      status: 'no_reference',
    });
    const s = boardSummary(
      board([plan(), processed({ id: 'p2' }), none, plan({ id: 'p4', status: 'pending' })]),
    );
    assert.strictEqual(s.line, '4 plans · 1 en référence directe · 1 traité · 1 sans produit');
    assert.strictEqual(s.ready, 2);
    assert.strictEqual(s.required, 3);
    assert.strictEqual(s.licences, '—');
  });

  it('explains why the video cannot be launched', () => {
    const scenes = [scene('s1'), scene('s2'), scene('s3')];
    const ok = [
      plan({ scene_id: 's1' }),
      processed({ id: 'p2', scene_id: 's2', scene_order: 2 }),
      mock({ id: 'p3', scene_id: 's3', scene_order: 3 }),
    ];
    assert.strictEqual(launchBlockReason(null, scenes), PREPARE_FIRST);
    assert.strictEqual(launchBlockReason(board(ok), scenes), null);
    assert.strictEqual(launchBlockReason(board(ok.slice(0, 2)), scenes), PREPARE_FIRST);
    const running = [...ok.slice(0, 2), mock({ id: 'p3', scene_id: 's3', status: 'processing' })];
    assert.strictEqual(
      launchBlockReason(board(running), scenes),
      'Attendez la fin du traitement des visuels.',
    );
    const nc = [
      ...ok.slice(0, 2),
      processed({ id: 'p3', scene_id: 's3', scene_order: 3, licence: 'non_commercial' }),
    ];
    assert.strictEqual(
      launchBlockReason(board(nc), scenes),
      "Plan 3 : licence non commerciale — forcez l'image d'origine pour ce plan.",
    );
    const missing = [
      ...ok.slice(0, 2),
      plan({
        id: 'p3',
        scene_id: 's3',
        scene_order: 3,
        decision: 'no_reference',
        reasons: ['unusable_reference'],
      }),
    ];
    assert.strictEqual(
      launchBlockReason(board(missing), scenes),
      'Plan 3 : image produit manquante.',
    );
    // No product in any scene: nothing to prepare, the legacy path is allowed.
    assert.strictEqual(launchBlockReason(null, [scene('s1', []), scene('s2', null)]), null);
  });

  it('labels decisions and reasons', () => {
    assert.strictEqual(decisionLabel(processed()), 'Traitement : remplacement du fond');
    assert.strictEqual(
      decisionLabel(plan({ source_mode: 'force_original', reasons: ['user_forced_original'] })),
      'Référence directe · choisi par vous',
    );
    assert.strictEqual(decisionLabel(processed({ operation: null })), 'Traitement');
    assert.strictEqual(reasonText('nope'), 'Raison non précisée.');
    assert.strictEqual(reasonText('toString'), 'Raison non précisée.');
    assert.strictEqual(
      reasonText('low_resolution'),
      'Image en basse résolution : qualité vidéo limitée.',
    );
  });

  it('blocks source changes while a job runs', () => {
    assert.strictEqual(
      overrideBlockReason(plan({ status: 'pending' })),
      'Traitement en cours pour ce plan.',
    );
    assert.strictEqual(overrideBlockReason(plan(), { busy: true }), 'Une opération est en cours.');
    assert.strictEqual(overrideBlockReason(plan()), null);
  });

  it('announces finished plans once', () => {
    const before = board([
      mock({ status: 'processing' }),
      processed({ id: 'p2', scene_order: 2, status: 'pending' }),
    ]);
    const after = board([
      mock({ used_source: 'original', final_asset_id: 'a-src' }),
      processed({
        id: 'p2',
        scene_order: 2,
        status: 'fallback',
        used_source: 'original',
        fallback_reason: 'fidelity_failed',
      }),
    ]);
    assert.strictEqual(
      transitionMessage(before, after),
      "Plan 1 : traitement simulé, image d'origine utilisée. Plan 2 : image d'origine conservée (produit altéré). Tous les visuels sont prêts.",
    );
    assert.strictEqual(transitionMessage(after, after), '');
    assert.strictEqual(transitionMessage(null, after), '');
  });

  it('fails closed on the used source', () => {
    assert.strictEqual(usedSource(processed({ fidelity: null })), 'original');
    const failed = processed({
      fidelity: { checked: true, passed: false, score: 0.5, threshold: 0.9, checker: 'x' },
    });
    assert.strictEqual(usedSource(failed), 'original');
    assert.strictEqual(usedSource(processed({ status: 'fallback' })), 'original');
    assert.strictEqual(usedSource(mock({ fidelity: null })), 'processed');
  });

  it('allows the internal licence only for a flagged simulation', () => {
    const fakeInternal = processed({ licence: 'internal' });
    assert.match(licenceWarning(fakeInternal), /inconnue/);
    const scenes = [scene('s1')];
    assert.strictEqual(
      launchBlockReason(board([fakeInternal]), scenes),
      'Plan 1 : Licence du moteur inconnue : vérifiez avant diffusion.',
    );
    assert.strictEqual(launchBlockReason(board([mock()]), scenes), null);
    assert.strictEqual(
      launchBlockReason(board([processed({ licence: 'unknown' })]), scenes),
      'Plan 1 : Licence du moteur inconnue : vérifiez avant diffusion.',
    );
  });

  it('never announces a simulation as a finished treatment', () => {
    const before = board([mock({ status: 'processing' })]);
    assert.strictEqual(
      transitionMessage(before, board([mock()])),
      'Plan 1 : traitement simulé, résultat simulé utilisé. Tous les visuels sont prêts.',
    );
    const real = transitionMessage(
      board([processed({ status: 'processing' })]),
      board([processed()]),
    );
    assert.strictEqual(real, 'Plan 1 : traitement terminé. Tous les visuels sont prêts.');
  });
});
