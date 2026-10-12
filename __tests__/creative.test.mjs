import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

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
        'components/creative/ProductIntelligenceView.tsx',
        'components/creative/UGCSetupForm.tsx',
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
        'UGCSetup',
        'UGCSetupCreatePayload',
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

    it('should declare ethical and validation attributes on CreativeStrategy', () => {
      assert.ok(content.includes('is_barrier_hypothesis: boolean'));
      assert.ok(content.includes('persuasion_techniques: PersuasionTechnique[]'));
      assert.ok(content.includes('proof_elements: ProofElement[]'));
      assert.ok(content.includes('narrative_structure: NarrativeStructure'));
    });
  });

  describe('Creative API Service Methods', () => {
    const apiPath = path.join(process.cwd(), 'lib/api/creative.ts');
    const content = fs.readFileSync(apiPath, 'utf8');

    it('should provide full CRUD and generation methods matching backend endpoints', () => {
      const methods = [
        'getProductIntelligence',
        'getUGCSetup',
        'saveUGCSetup',
        'updateUGCSetup',
        'generateStrategy',
        'getStrategy',
        'validateStrategy',
        'generateStoryboard',
        'getStoryboard',
        'updateStoryboard',
        'generateVideo',
        'getVideoJob',
        'cancelVideoJob',
        'getAssetDownloadUrl',
      ];

      methods.forEach((m) => {
        assert.ok(content.includes(m), `creativeApi must contain ${m}`);
      });
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
      assert.ok(content.includes('/creative'), 'product-input should navigate to /creative');
    });

    it('StrategyPreview should prohibit fake testimonials and emphasize verified claims', () => {
      const strategyPath = path.join(process.cwd(), 'components/creative/StrategyPreview.tsx');
      const content = fs.readFileSync(strategyPath, 'utf8');
      assert.ok(content.includes('Zéro faux avis'), 'Must clearly state zero fake reviews');
      assert.ok(content.includes('is_barrier_hypothesis'), 'Must distinguish hypotheses');
    });

    it('StoryboardEditor should verify scene duration sum against target duration', () => {
      const editorPath = path.join(process.cwd(), 'components/creative/StoryboardEditor.tsx');
      const content = fs.readFileSync(editorPath, 'utf8');
      assert.ok(content.includes('totalDuration'), 'Must compute total scene duration');
      assert.ok(content.includes('target_duration'), 'Must compare with target duration');
    });
  });
});
