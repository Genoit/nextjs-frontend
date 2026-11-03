import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TEMPLATES,
  isValidTemplate,
  pickedTemplate,
  templateHandoff,
} from '../lib/template-rules.mjs';

// Concept ids of CreativeConfigForm's CONCEPT_FAMILIES (backend CreativeConceptType).
const CONCEPTS = [
  'founder_story',
  'cinematic_storytelling',
  'sensory_focus',
  'product_demo',
  'problem_solution',
  'before_after',
  'social_proof',
  'unboxing',
  'comparative_challenge',
  'myth_busting',
];

describe('templates', () => {
  it('only use values the setup form accepts, with beats that add up', () => {
    for (const t of TEMPLATES) {
      assert.ok(isValidTemplate(t), t.id);
      assert.ok(CONCEPTS.includes(t.concept_type), t.id);
    }
  });
  it('have unique ids and cover every concept', () => {
    assert.strictEqual(new Set(TEMPLATES.map((t) => t.id)).size, TEMPLATES.length);
    assert.deepStrictEqual(new Set(TEMPLATES.map((t) => t.concept_type)), new Set(CONCEPTS));
  });
});

describe('pickedTemplate', () => {
  const forP = templateHandoff('unboxing', 'p1');
  const forNew = templateHandoff('unboxing', null);
  it('applies to the product it was picked for, even with a saved setup', () => {
    assert.strictEqual(pickedTemplate(forP, 'p1', true)?.id, 'unboxing');
    assert.strictEqual(pickedTemplate(forP, 'p2', false), null);
  });
  it('applies a new-product pick only without a saved setup', () => {
    assert.strictEqual(pickedTemplate(forNew, 'p9', false)?.id, 'unboxing');
    assert.strictEqual(pickedTemplate(forNew, 'p9', true), null);
  });
  it('ignores unknown ids and broken data', () => {
    assert.strictEqual(pickedTemplate(templateHandoff('nope', 'p1'), 'p1', false), null);
    assert.strictEqual(pickedTemplate('{oops', 'p1', false), null);
    assert.strictEqual(pickedTemplate(null, 'p1', false), null);
  });
});
