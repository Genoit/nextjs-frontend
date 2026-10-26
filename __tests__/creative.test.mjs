import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  COST_NOT_MEASURED,
  HEURISTIC_LABEL,
  acceptBlockReason,
  configOrNull,
  formatCost,
  formatCostTotal,
  heuristicLabel,
  sceneToPayload,
} from '../lib/creative-rules.mjs';

describe('Creative Video Ad Engine & Pipeline', () => {
  describe('File Structure & Modular Architecture', () => {
    it('should have creative TypeScript types file', () => {
      const typesPath = path.join(process.cwd(), 'lib/types/creative.ts');
      assert.ok(fs.existsSync(typesPath), 'lib/types/creative.ts must exist');
    });

    it('should have creative API service file', () => {
      const apiPath = path.join(process.cwd(), 'lib/api/creative.ts');
      assert.ok(fs.existsSync(apiPath), 'lib/api/creative.ts must exist');
    });

    it('should export creative API in lib/api/index.ts', () => {
      const indexPath = path.join(process.cwd(), 'lib/api/index.ts');
      const content = fs.readFileSync(indexPath, 'utf8');
      assert.ok(content.includes('./creative'), 'lib/api/index.ts must export ./creative');
    });

    it('should have useCreative hook file', () => {
      const hookPath = path.join(process.cwd(), 'hooks/use-creative.ts');
      assert.ok(fs.existsSync(hookPath), 'hooks/use-creative.ts must exist');
    });

    it('should have all creative UI components', () => {
      const components = [
        'components/creative/ProductSheetView.tsx',
        'components/creative/CreativeConfigForm.tsx',
        'components/creative/CreativeStatus.tsx',
        'components/creative/StrategyPreview.tsx',
        'components/creative/StoryboardEditor.tsx',
        'components/creative/VideoGenerationTracker.tsx',
        'components/creative/CreativeAdWorkflow.tsx',
        'components/creative/index.ts',
      ];

      components.forEach((comp) => {
        const fullPath = path.join(process.cwd(), comp);
        assert.ok(fs.existsSync(fullPath), `${comp} must exist`);
      });
    });

    it('should have dedicated /products/[id]/creative page', () => {
      const pagePath = path.join(process.cwd(), 'app/products/[id]/creative/page.tsx');
      assert.ok(fs.existsSync(pagePath), 'app/products/[id]/creative/page.tsx must exist');
    });
  });

  describe('Creative Types & Data Contracts', () => {
    const typesPath = path.join(process.cwd(), 'lib/types/creative.ts');
    const content = fs.readFileSync(typesPath, 'utf8');

    it('should declare all core contracts required by specification', () => {
      const requiredInterfaces = [
        'ProductIntelligenceReport',
        'CreativeConfig',
        'CreativeConfigCreatePayload',
        'CreativeAngle',
        'CreativeBrief',
        'ComplianceViolation',
        'StoryboardVersionSummary',
        'StrategyCost',
        'CreativeStrategy',
        'CreativeStrategyGeneratePayload',
        'Storyboard',
        'StoryboardScene',
        'StoryboardSceneCreatePayload',
        'VideoGenerationJob',
        'GeneratedAsset',
        'QualityReport',
      ];

      requiredInterfaces.forEach((name) => {
        assert.ok(content.includes(name), `types should include interface ${name}`);
      });
    });

    it('should declare allowed campaign objectives and platforms', () => {
      assert.ok(content.includes("'sales' | 'traffic' | 'awareness' | 'retargeting'"));
      assert.ok(content.includes("'tiktok' | 'instagram_reels' | 'facebook' | 'youtube'"));
      assert.ok(content.includes('15 | 30 | 45 | 60'));
    });

    it('should declare honesty and versioning fields of module 2', () => {
      assert.ok(content.includes('is_heuristic: boolean'));
      assert.ok(content.includes('estimated_cost_usd: string | null'));
      assert.ok(content.includes('actual_cost_usd: string | null'));
      assert.ok(content.includes('angles: CreativeAngle[]'));
      assert.ok(content.includes('violations: ComplianceViolation[]'));
      assert.ok(content.includes('severity: ViolationSeverity'));
      assert.ok(content.includes('accepted_at: string | null'));
      assert.ok(content.includes('parent_id: string | null'));
    });
  });

  describe('Creative API Service Methods', () => {
    const apiPath = path.join(process.cwd(), 'lib/api/creative.ts');
    const content = fs.readFileSync(apiPath, 'utf8');

    it('should provide full CRUD and generation methods matching backend endpoints', () => {
      const methods = [
        'getCreativeConfig',
        'saveCreativeConfig',
        'generateStrategy',
        'getStrategy',
        'chooseAngle',
        'generateStoryboard',
        'listStoryboards',
        'getStoryboard',
        'updateStoryboard',
        'acceptStoryboard',
        'getStrategyCost',
        'generateVideo',
        'getVideoJob',
        'cancelVideoJob',
        'getAssetDownloadUrl',
      ];

      methods.forEach((m) => {
        assert.ok(content.includes(m), `creativeApi must contain ${m}`);
      });
    });

    it('should call the renamed creative-config routes, not ugc-setup', () => {
      assert.ok(content.includes('/products/${productId}/creative-config'));
      assert.ok(content.includes('`${CREATIVE_BASE_PATH}/creative-config`'));
      assert.ok(!content.includes('ugc-setup'), 'deprecated ugc-setup routes must not be used');
    });

    it('should call the module 2 storyboard routes', () => {
      assert.ok(content.includes('/strategy/${strategyId}/choose-angle'));
      assert.ok(content.includes('/strategy/${strategyId}/storyboards'));
      assert.ok(content.includes('/storyboard/${storyboardId}/accept'));
      assert.ok(content.includes('/strategy/${strategyId}/cost'));
    });

    it('should construct correct asset download URL', () => {
      assert.ok(
        content.includes('/creative/assets/${assetId}/download') || content.includes('/assets/'),
      );
    });
  });

  describe('Workflow Integration & Ethical Constraints', () => {
    it('ProductDetail should have UGC video creation action', () => {
      const detailPath = path.join(process.cwd(), 'components/products/ProductDetail.tsx');
      const content = fs.readFileSync(detailPath, 'utf8');
      assert.ok(content.includes('/creative'), 'ProductDetail should link to creative route');
      assert.ok(content.includes('Créer une vidéo UGC'), 'ProductDetail should have CTA button');
    });

    it('product-input page should navigate to /creative upon product save', () => {
      const inputPath = path.join(process.cwd(), 'app/product-input/page.tsx');
      const content = fs.readFileSync(inputPath, 'utf8');
      assert.ok(content.includes('nextStepHref'), 'product-input should navigate via nextStepHref');
      const rulesPath = path.join(process.cwd(), 'lib/product-input-rules.mjs');
      const rules = fs.readFileSync(rulesPath, 'utf8');
      assert.ok(rules.includes('/creative'), 'nextStepHref should point to /creative');
    });

    it('StrategyPreview should offer a keyboard-usable angle picker and show hypotheses', () => {
      const strategyPath = path.join(process.cwd(), 'components/creative/StrategyPreview.tsx');
      const content = fs.readFileSync(strategyPath, 'utf8');
      assert.ok(content.includes('Zéro faux avis'), 'Must clearly state zero fake reviews');
      assert.ok(content.includes('type="radio"'), 'Angles must be a native radio group');
      assert.ok(content.includes('<fieldset'), 'Radio group must be a labelled fieldset');
      assert.ok(content.includes('needs_validation'), 'Must distinguish hypotheses');
      assert.ok(content.includes('HeuristicBadge'), 'Must flag deterministic output');
    });

    it('no user-facing "UGC Setup" label remains', () => {
      for (const file of [
        'components/creative/CreativeAdWorkflow.tsx',
        'components/creative/CreativeConfigForm.tsx',
        'app/product-input/page.tsx',
      ]) {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
        assert.ok(!/UGC Setup/i.test(content), `${file} still says "UGC Setup"`);
      }
    });

    it('StoryboardEditor should verify scene duration sum against target duration', () => {
      const editorPath = path.join(process.cwd(), 'components/creative/StoryboardEditor.tsx');
      const content = fs.readFileSync(editorPath, 'utf8');
      assert.ok(content.includes('totalDuration'), 'Must compute total scene duration');
      assert.ok(content.includes('target_duration'), 'Must compare with target duration');
    });
  });

  describe('Creative Intelligence display rules', () => {
    it('maps a missing creative config (200 null) to null', () => {
      assert.strictEqual(configOrNull(null), null);
      assert.strictEqual(configOrNull(undefined), null);
      const config = { id: 'cfg-1', product_id: 'p-1' };
      assert.strictEqual(configOrNull(config), config);
    });

    it('labels heuristic output as a simulation, never as AI (fails closed)', () => {
      assert.strictEqual(HEURISTIC_LABEL, 'Simulation — pas une génération IA');
      assert.strictEqual(heuristicLabel({ is_heuristic: true }), HEURISTIC_LABEL);
      assert.strictEqual(heuristicLabel({ is_heuristic: false }), null);
      assert.strictEqual(heuristicLabel({}), HEURISTIC_LABEL);
      assert.strictEqual(heuristicLabel({ is_heuristic: undefined }), HEURISTIC_LABEL);
      assert.strictEqual(heuristicLabel(null), null);
    });

    it('formats costs without pretending a null or 0 was measured', () => {
      assert.strictEqual(COST_NOT_MEASURED, 'non mesuré');
      assert.strictEqual(formatCost(null), 'non mesuré');
      assert.strictEqual(formatCost(undefined, true), 'non mesuré');
      assert.strictEqual(formatCost('not-a-number'), 'non mesuré');
      assert.strictEqual(formatCost('0'), 'non mesuré');
      assert.strictEqual(formatCost('0.000000', true), '0 $ (simulation)');
      assert.strictEqual(formatCost('0.0123'), '0.0123 $');
    });

    it('marks a real cost total as partial when a component was not measured', () => {
      const full = {
        is_heuristic: false,
        analysis_cost: '0.0010',
        strategy_cost: '0.0020',
        storyboard_cost: '0.0030',
      };
      assert.strictEqual(formatCostTotal('0.0060', full), '0.0060 $');
      const partial = { ...full, analysis_cost: null };
      assert.match(formatCostTotal('0.0050', partial), /^partiel/);
      assert.strictEqual(formatCostTotal(null, partial), 'non mesuré');
      const sim = {
        is_heuristic: true,
        analysis_cost: '0',
        strategy_cost: '0',
        storyboard_cost: '0',
      };
      assert.strictEqual(formatCostTotal('0', sim), '0 $ (simulation)');
    });

    it('keeps every backend scene field in the PATCH payload', () => {
      const scene = {
        id: 'sc-1',
        storyboard_id: 'sb-1',
        created_at: 'x',
        updated_at: 'y',
        scene_order: 1,
        duration_seconds: '5.0',
        narrative_function: 'hook',
        visual_type: 'product',
        visual_description: 'Plan produit',
        video_prompt: 'Product on table',
        camera_movement: 'static',
        character_ref_id: 'char-1',
        environment_ref_id: 'env-1',
        product_presence: 'subtle',
        keyframe_url: 'https://k',
        product_image_url: 'https://p',
        feasibility_status: 'risky',
        feasibility_score: '80.00',
        feasibility_notes: 'note',
        fallback_alternative: 'alt',
        technical_risks: ['blur'],
        acceptance_criteria: ['sharp'],
        is_validated: false,
        voiceover_text: null,
        persuasive_role: 'hook',
        constraints: [' keep logo ', '', 'no text'],
        reference_urls: [],
      };
      const payload = sceneToPayload(scene);
      for (const key of [
        'character_ref_id',
        'environment_ref_id',
        'product_presence',
        'keyframe_url',
        'product_image_url',
        'feasibility_status',
        'feasibility_score',
        'feasibility_notes',
        'fallback_alternative',
        'technical_risks',
        'acceptance_criteria',
        'is_validated',
      ]) {
        assert.deepStrictEqual(payload[key], scene[key], `${key} must be kept`);
      }
      assert.strictEqual(payload.duration_seconds, 5);
      assert.deepStrictEqual(payload.constraints, ['keep logo', 'no text']);
      for (const key of ['id', 'storyboard_id', 'created_at', 'updated_at', 'voiceover_text']) {
        assert.ok(!(key in payload), `${key} must not be sent`);
      }
    });

    describe('accept-disabled rule', () => {
      const base = {
        version: 3,
        is_latest: true,
        accepted: false,
        generation_status: 'completed',
        violations: [],
      };

      it('allows accepting the latest clean version', () => {
        assert.strictEqual(acceptBlockReason(base), null);
      });

      it('allows warnings', () => {
        const sb = { ...base, violations: [{ severity: 'warn' }] };
        assert.strictEqual(acceptBlockReason(sb), null);
      });

      it('blocks on any block violation', () => {
        const sb = { ...base, violations: [{ severity: 'warn' }, { severity: 'block' }] };
        assert.match(acceptBlockReason(sb), /bloquantes/);
      });

      it('blocks a version the backend says is not the latest', () => {
        assert.match(acceptBlockReason({ ...base, is_latest: false }), /dernière version/);
      });

      it('fails closed when is_latest is missing', () => {
        const noFlag = { ...base };
        delete noFlag.is_latest;
        assert.match(acceptBlockReason(noFlag), /dernière version/);
      });

      it('blocks with unsaved edits or a request in flight', () => {
        assert.match(acceptBlockReason(base, { dirty: true }), /modifications/);
        assert.match(acceptBlockReason(base, { busy: true }), /en cours/);
      });

      it('blocks an already accepted or unfinished version', () => {
        assert.match(acceptBlockReason({ ...base, accepted: true }), /déjà acceptée/);
        assert.match(
          acceptBlockReason({ ...base, generation_status: 'processing' }),
          /pas terminée/,
        );
        assert.ok(acceptBlockReason(null));
      });
    });
  });
});
