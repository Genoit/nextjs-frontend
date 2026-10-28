import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ROUTE_REASONS,
  budgetView,
  checkLabel,
  durationText,
  isMock,
  isPossiblyBilled,
  isTerminalJob,
  measuredText,
  possiblyBilledText,
  qualityView,
  routeReasonText,
  shotAction,
  shotStatusView,
  shotTitle,
  shotTransitionMessage,
  shotsOf,
  successRateText,
  tierLabel,
} from '../lib/render-rules.mjs';

const shot = (over = {}) => ({
  shot_id: 'sh1',
  scene_order: 1,
  persuasive_role: 'hook',
  status: 'pending',
  is_mock: false,
  attempts: [],
  action: null,
  ...over,
});

describe('shotStatusView', () => {
  it('labels every contract status', () => {
    const expected = {
      pending: 'En attente',
      routing: 'Choix du moteur…',
      rendering: 'Rendu en cours…',
      completed: 'Terminé',
      failed: 'Échec',
      blocked: 'Bloqué',
      needs_action: 'Action requise',
      cancelled: 'Annulé',
      checking: 'Contrôle qualité…',
      quality_review: 'À vérifier',
    };
    for (const [status, label] of Object.entries(expected)) {
      assert.deepStrictEqual(shotStatusView({ status }), { key: status, label });
    }
  });
  it('never shows an unknown status as done', () => {
    assert.deepStrictEqual(shotStatusView({ status: 'weird' }), {
      key: 'unknown',
      label: 'Statut inconnu',
    });
    assert.strictEqual(shotStatusView(null).key, 'unknown');
  });
});

describe('routeReasonText', () => {
  it('maps every router reason code of blueprint §3', () => {
    const codes = [
      'disabled',
      'aspect_unsupported',
      'duration_unreachable',
      'refs_unsupported',
      'resolution_unavailable_for_tier',
      'price_unknown',
      'breaker_open',
      'concurrency_full',
      'over_budget',
      'mock_excluded',
      'no_eligible_engine',
      'best_score',
    ];
    assert.deepStrictEqual(Object.keys(ROUTE_REASONS).sort(), [...codes].sort());
    for (const c of codes) assert.notStrictEqual(routeReasonText(c), 'Raison non précisée.');
  });
  it('falls back on unknown, empty or prototype keys', () => {
    assert.strictEqual(routeReasonText('nope'), 'Raison non précisée.');
    assert.strictEqual(routeReasonText(null), 'Raison non précisée.');
    assert.strictEqual(routeReasonText('toString'), 'Raison non précisée.');
  });
});

describe('successRateText', () => {
  it('shows rate and sample size', () => {
    assert.strictEqual(successRateText(0.8, 12), '80 % sur 12 essais');
    assert.strictEqual(successRateText('0.5', 1), '50 % sur 1 essai');
  });
  it('says there is no history when n = 0 (prior only)', () => {
    assert.strictEqual(successRateText(0.8, 0), "pas encore d'historique");
    assert.strictEqual(successRateText(null, 5), "pas encore d'historique");
    assert.strictEqual(successRateText(0.8, undefined), "pas encore d'historique");
  });
});

describe('isMock', () => {
  it('fails closed: missing flag means simulation', () => {
    assert.strictEqual(isMock({}), true);
    assert.strictEqual(isMock(null), true);
    assert.strictEqual(isMock({ is_mock: true }), true);
    assert.strictEqual(isMock({ is_mock: false }), false);
  });
});

describe('budgetView', () => {
  it('computes spent and percentage with a text label', () => {
    const v = budgetView({ budget_usd: '5.00', budget_remaining_usd: '3.75' });
    assert.strictEqual(v.spent, 1.25);
    assert.strictEqual(v.pct, 25);
    assert.strictEqual(v.over, false);
    assert.strictEqual(v.label, '1,25 $ engagés sur 5,00 $ · reste 3,75 $');
  });
  it('flags an exceeded budget and caps the bar', () => {
    const v = budgetView({ budget_usd: 2, budget_remaining_usd: -1 });
    assert.strictEqual(v.over, true);
    assert.strictEqual(v.pct, 100);
    assert.match(v.label, /Budget dépassé/);
  });
  it('is null without a budget (old jobs)', () => {
    assert.strictEqual(budgetView({}), null);
    assert.strictEqual(budgetView({ budget_usd: '0' }), null);
  });
  it('treats a missing remaining as nothing spent', () => {
    assert.strictEqual(budgetView({ budget_usd: '5' }).spent, 0);
  });
});

describe('possibly billed', () => {
  it('trusts the API flag', () => {
    assert.strictEqual(isPossiblyBilled({ possibly_billed: true, status: 'failed' }), true);
    assert.strictEqual(isPossiblyBilled({ possibly_billed: false, status: 'completed' }), false);
  });
  it('warns on an unknown outcome without actual cost even when the flag is missing', () => {
    assert.strictEqual(isPossiblyBilled({ status: 'unknown', actual_cost_usd: null }), true);
    assert.strictEqual(isPossiblyBilled({ status: 'unknown', actual_cost_usd: '0.30' }), false);
    assert.strictEqual(isPossiblyBilled(null), false);
  });
  it('sums the estimates of possibly billed attempts', () => {
    const s = shot({
      attempts: [
        { possibly_billed: true, estimated_cost_usd: '0.40' },
        { possibly_billed: false, estimated_cost_usd: '1.00' },
        { status: 'unknown', estimated_cost_usd: '0.10' },
      ],
    });
    assert.strictEqual(possiblyBilledText(s), '≈ 0,50 $');
    assert.strictEqual(
      possiblyBilledText(shot({ attempts: [{ possibly_billed: true }] })),
      'montant inconnu',
    );
  });
});

describe('shotAction', () => {
  it('asks to confirm a re-render only for needs_action shots', () => {
    assert.deepStrictEqual(
      shotAction(shot({ status: 'needs_action', action: 'confirm_rerender' }), 'rendering'),
      { kind: 'confirm_rerender' },
    );
    assert.strictEqual(shotAction(shot({ status: 'rendering', action: 'confirm_rerender' })), null);
  });
  it('offers a job retry for a blocked shot only once the job stopped', () => {
    const b = shot({ status: 'blocked', action: 'pick_engine' });
    assert.deepStrictEqual(shotAction(b, 'failed'), { kind: 'pick_engine', canRetry: true });
    assert.deepStrictEqual(shotAction(b, 'blocked'), { kind: 'pick_engine', canRetry: true });
    assert.deepStrictEqual(shotAction(b, 'rendering'), { kind: 'pick_engine', canRetry: false });
  });
  it('no action otherwise', () => {
    assert.strictEqual(shotAction(shot({ status: 'completed' }), 'completed'), null);
  });
});

describe('text helpers', () => {
  it('billed vs shot duration', () => {
    assert.strictEqual(
      durationText({ duration_billed_s: 6, duration_shot_s: '5.0' }),
      'rendu 6 s, plan 5 s',
    );
    assert.strictEqual(durationText({ duration_billed_s: 5, duration_shot_s: 5 }), 'plan 5 s');
    assert.strictEqual(durationText({ duration_shot_s: 4.5 }), 'plan 4,5 s');
    assert.strictEqual(durationText({}), '');
  });
  it('shot title with role', () => {
    assert.strictEqual(shotTitle(shot()), 'Plan 1 · Accroche');
    assert.strictEqual(shotTitle(shot({ persuasive_role: null })), 'Plan 1');
  });
  it('tier label and terminal states', () => {
    assert.strictEqual(tierLabel('draft'), 'Brouillon');
    assert.strictEqual(tierLabel(undefined), 'Standard');
    assert.strictEqual(isTerminalJob('blocked'), true);
    assert.strictEqual(isTerminalJob('rendering'), false);
  });
  it('old jobs without shots give an empty list; shots are ordered', () => {
    assert.deepStrictEqual(shotsOf({ scene_job_statuses: { a: 1 } }), []);
    const ordered = shotsOf({ shots: [shot({ scene_order: 2 }), shot({ scene_order: 1 })] });
    assert.deepStrictEqual(
      ordered.map((s) => s.scene_order),
      [1, 2],
    );
  });
});

describe('shotTransitionMessage', () => {
  it('announces only changed shots, and simulations as such', () => {
    const prev = { shots: [shot(), shot({ shot_id: 'sh2', scene_order: 2, status: 'rendering' })] };
    const next = {
      shots: [
        shot(),
        shot({ shot_id: 'sh2', scene_order: 2, status: 'completed', is_mock: undefined }),
      ],
    };
    assert.strictEqual(shotTransitionMessage(prev, next), 'Plan 2 : Terminé (simulation).');
    assert.strictEqual(shotTransitionMessage(next, next), '');
    assert.strictEqual(shotTransitionMessage(null, next), '');
  });
  it('announces shots that first appear', () => {
    assert.strictEqual(
      shotTransitionMessage({ shots: [] }, { shots: [shot({ status: 'routing' })] }),
      'Plan 1 : Choix du moteur.',
    );
    assert.strictEqual(shotTransitionMessage({}, { shots: [shot()] }), 'Plan 1 : En attente.');
  });
});

describe('quality (module 5)', () => {
  const check = (over = {}) => ({
    name: 'duration',
    layer: 'A',
    status: 'pass',
    value: 5.04,
    threshold: 0.5,
    detail: 'ok',
    blocking: true,
    ...over,
  });
  const quality = (over = {}) => ({
    decision: 'regenerate',
    reasons: [],
    checks: [],
    is_mock: false,
    embedder_is_mock: false,
    thresholds_version: 'uncalibrated-2026-10-28',
    overridden_by_user: false,
    created_at: '2026-10-28T00:00:00Z',
    cost_usd: null,
    ...over,
  });

  it('lists fail, warn, unavailable and unknown statuses; only counts pass and skipped', () => {
    const v = qualityView(
      quality({
        checks: [
          check({ name: 'a', status: 'pass' }),
          check({ name: 'b', status: 'fail' }),
          check({ name: 'c', status: 'warn' }),
          check({ name: 'd', status: 'unavailable' }),
          check({ name: 'e', status: 'skipped' }),
          check({ name: 'f', status: 'weird' }),
        ],
      }),
    );
    assert.deepStrictEqual(
      v.issues.map((c) => c.name),
      ['b', 'c', 'd', 'f'],
    );
    assert.deepStrictEqual(
      v.others.map((c) => c.name),
      ['a', 'e'],
    );
    assert.strictEqual(v.passedCount, 1);
  });
  it('flags mock renders and uncalibrated thresholds from the API fields only', () => {
    const v = qualityView(quality());
    assert.strictEqual(v.simulated, false);
    assert.strictEqual(v.uncalibrated, true);
    const w = qualityView(quality({ is_mock: true, thresholds_version: 'v1' }));
    assert.strictEqual(w.simulated, true);
    assert.strictEqual(w.uncalibrated, false);
  });
  it('never shows an unknown decision as accepted; null quality gives no panel', () => {
    assert.strictEqual(qualityView(quality({ decision: 'accept' })).decisionLabel, 'Plan accepté');
    assert.strictEqual(qualityView(quality({ decision: 'toString' })).decision, 'unknown');
    assert.strictEqual(qualityView(null), null);
  });
  it('measured vs threshold, French decimals, missing parts left out', () => {
    assert.strictEqual(
      measuredText({ value: 0.4234, threshold: 0.55 }),
      'mesuré 0,42 / seuil 0,55',
    );
    assert.strictEqual(
      measuredText({ value: '720x1280', threshold: '1080x1920' }),
      'mesuré 720x1280 / seuil 1080x1920',
    );
    assert.strictEqual(measuredText({ value: null, threshold: 20 }), 'seuil 20');
    assert.strictEqual(measuredText({ value: null, threshold: null }), '');
  });
  it('check labels in French, unknown names as-is', () => {
    assert.strictEqual(checkLabel('product_similarity'), 'Ressemblance au produit');
    assert.strictEqual(checkLabel('quality_disabled'), 'quality_disabled');
    assert.strictEqual(checkLabel('toString'), 'toString');
  });
  it('announces the new statuses', () => {
    const prev = { shots: [shot({ status: 'rendering' })] };
    const next = { shots: [shot({ status: 'quality_review' })] };
    assert.strictEqual(shotTransitionMessage(prev, next), 'Plan 1 : À vérifier.');
  });
});
