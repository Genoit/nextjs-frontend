import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MAX_IMAGE_BYTES,
  bulletsToBenefits,
  frenchList,
  imageFileError,
  nextStepHref,
  previewImageUrls,
  upgradeImageUrl,
  validateDraft,
} from '../lib/product-input-rules.mjs';

const draft = (over = {}) => ({
  title: 'Mixeur portable',
  description: 'Mixeur rechargeable USB pour smoothies en voyage.',
  price: '',
  imageCount: 1,
  uploadingCount: 0,
  benefitCount: 1,
  audience: 'Sportifs',
  ...over,
});

describe('product input rules', () => {
  it('accepts a complete draft', () => {
    const r = validateDraft(draft());
    assert.deepStrictEqual(r.errors, {});
    assert.deepStrictEqual(r.blocking, []);
    assert.deepStrictEqual(r.recommended, []);
  });

  it('blocks on missing name, short description, bad price and pending uploads', () => {
    const r = validateDraft(
      draft({ title: '  ', description: 'court', price: '-3', uploadingCount: 2 }),
    );
    assert.ok(r.errors.title && r.errors.description && r.errors.price);
    assert.deepStrictEqual(r.blocking, [
      'le nom',
      'la description',
      'un prix valide',
      'la fin du téléversement des photos',
    ]);
  });

  it('only recommends photos, benefits and audience', () => {
    const r = validateDraft(draft({ imageCount: 0, benefitCount: 0, audience: '' }));
    assert.deepStrictEqual(r.blocking, []);
    assert.deepStrictEqual(r.recommended, ['une photo', 'des points forts', "l'audience"]);
  });

  it('rejects wrong type and oversize images', () => {
    assert.ok(imageFileError({ name: 'a.gif', type: 'image/gif', size: 10 }));
    assert.ok(imageFileError({ name: 'a.png', type: 'image/png', size: MAX_IMAGE_BYTES + 1 }));
    assert.strictEqual(imageFileError({ name: 'a.webp', type: 'image/webp', size: 100 }), null);
  });

  it('upgrades CDN thumbnails and de-duplicates preview images', () => {
    assert.strictEqual(
      upgradeImageUrl('https://m.media-amazon.com/images/I/abc._AC_SR38,50_.jpg'),
      'https://m.media-amazon.com/images/I/abc.jpg',
    );
    assert.deepStrictEqual(
      previewImageUrls({
        main_image_url: 'https://i.ebayimg.com/x/s-l300.jpg',
        images: ['https://i.ebayimg.com/x/s-l500.jpg', 'https://cdn.example.com/b.png', 42],
      }),
      ['https://i.ebayimg.com/x/s-l1600.jpg', 'https://cdn.example.com/b.png'],
    );
  });

  it('turns bullet points into at most 5 chips', () => {
    const chips = bulletsToBenefits(['a', 'a', 'b', 'c', 'd', 'e', 'f', 'x'.repeat(120)]);
    assert.deepStrictEqual(chips, ['a', 'b', 'c', 'd', 'e']);
    assert.strictEqual(bulletsToBenefits(['x'.repeat(120)])[0].length, 80);
    assert.deepStrictEqual(bulletsToBenefits(null), []);
  });

  it('formats French lists and the next-step link', () => {
    assert.strictEqual(frenchList(['a', 'b', 'c']), 'a, b et c');
    assert.strictEqual(frenchList(['a']), 'a');
    assert.strictEqual(nextStepHref('p 1'), '/products/p%201/creative');
  });
});
