// Pure rules for the product input screen (step 1 of the ad flow).
// Plain ESM + JSDoc so `node --test` can import it without a TS loader.

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const LIMITS = {
  title: 500,
  description: 5000,
  descriptionMin: 20,
  benefit: 80,
  benefits: 8,
  brand: 200,
  category: 200,
  priceMax: 1000000,
};

/**
 * Error message for a file the upload endpoint would reject, or null when it is acceptable.
 * @param {{ name: string, type: string, size: number }} file
 * @returns {string | null}
 */
export function imageFileError(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name} : format non accepté (JPEG, PNG ou WebP uniquement).`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} : fichier trop lourd (10 Mo maximum).`;
  }
  return null;
}

/**
 * Upgrade thumbnail/downscaled image URLs from Amazon, Shopify, AliExpress, eBay, Etsy and
 * Walmart into their full-resolution master assets.
 * @param {string} rawUrl
 * @returns {string}
 */
export function upgradeImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();
  const lower = url.toLowerCase();

  // Amazon CDN: strip dynamic crop/thumbnail tokens (._AC_SR38,50_.jpg -> .jpg)
  if (lower.includes('amazon') || lower.includes('media-amazon')) {
    url = url.replace(/(\._[A-Za-z0-9_,+-]+_\.)(jpe?g|png|webp|gif)/gi, '.$2');
  }
  // Shopify CDN: strip size suffixes (_small.jpg, _100x100.jpg -> .jpg)
  if (lower.includes('cdn.shopify.com')) {
    url = url.replace(
      /_(pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)(\.(?:jpe?g|png|webp))/gi,
      '$2',
    );
    url = url.replace(/([?&])width=\d+/gi, '$1width=2048');
  }
  // AliExpress CDN: strip thumbnail downscaling
  if (lower.includes('alicdn.com')) {
    url = url.replace(/(\.(?:jpe?g|png|webp))_\d+x\d+.*/gi, '$1');
    url = url.replace(/_\d+x\d+\.(?:jpe?g|png|webp)/gi, '.jpg');
  }
  // eBay CDN: upgrade s-l\d+ to s-l1600
  if (lower.includes('ebayimg.com')) {
    url = url.replace(/s-l\d+\.(jpe?g|png|webp)/gi, 's-l1600.$1');
  }
  // Etsy CDN: upgrade thumbnail tokens to the master asset
  if (lower.includes('etsystatic.com')) {
    url = url.replace(/\/il_\d+x[A-Za-z0-9]+\./i, '/il_fullxfull.');
  }
  // Walmart CDN: upgrade image dimension params
  if (lower.includes('walmartimages.com')) {
    url = url.replace(/\?odnHeight=\d+&odnWidth=\d+.*/i, '?odnHeight=2000&odnWidth=2000');
  }
  return url;
}

/**
 * Ordered, de-duplicated full-resolution image URLs of an extraction preview.
 * @param {{ main_image_url?: string | null, images?: unknown }} preview
 * @returns {string[]}
 */
export function previewImageUrls(preview) {
  const raw = [preview.main_image_url, ...(Array.isArray(preview.images) ? preview.images : [])];
  /** @type {string[]} */
  const out = [];
  for (const u of raw) {
    if (typeof u !== 'string' || !u) continue;
    const up = upgradeImageUrl(u);
    if (!out.includes(up)) out.push(up);
  }
  return out;
}

/**
 * Benefit chips from the page's bullet points: at most 5, each cut to the chip limit.
 * @param {unknown} bullets
 * @returns {string[]}
 */
export function bulletsToBenefits(bullets) {
  if (!Array.isArray(bullets)) return [];
  /** @type {string[]} */
  const out = [];
  for (const b of bullets) {
    if (typeof b !== 'string' || !b.trim()) continue;
    const t = b.trim();
    const chip = t.length > LIMITS.benefit ? `${t.slice(0, LIMITS.benefit - 1)}…` : t;
    if (!out.includes(chip)) out.push(chip);
    if (out.length === 5) break;
  }
  return out;
}

/**
 * @typedef {{ title: string, description: string, price: string, imageCount: number,
 *   uploadingCount: number, benefitCount: number, audience: string }} Draft
 * @typedef {'title' | 'description' | 'price'} FieldName
 */

/**
 * Field errors (only blocking ones), what blocks "Continuer", and what is recommended.
 * @param {Draft} d
 * @returns {{ errors: Partial<Record<FieldName, string>>, blocking: string[], recommended: string[] }}
 */
export function validateDraft(d) {
  /** @type {Partial<Record<FieldName, string>>} */
  const errors = {};
  /** @type {string[]} */
  const blocking = [];

  const title = d.title.trim();
  if (!title) errors.title = 'Donnez un nom au produit.';
  else if (title.length > LIMITS.title) errors.title = `${LIMITS.title} caractères maximum.`;

  const desc = d.description.trim();
  if (!desc) errors.description = 'Décrivez le produit en une ou deux phrases.';
  else if (desc.length < LIMITS.descriptionMin)
    errors.description = `Encore ${LIMITS.descriptionMin - desc.length} caractères au minimum.`;
  else if (desc.length > LIMITS.description)
    errors.description = `${LIMITS.description} caractères maximum.`;

  if (d.price.trim() !== '') {
    const n = Number(d.price);
    if (!Number.isFinite(n) || n < 0) errors.price = 'Entrez un prix positif, par exemple 29.90.';
    else if (n > LIMITS.priceMax) errors.price = 'Prix trop élevé.';
  }

  if (errors.title) blocking.push('le nom');
  if (errors.description) blocking.push('la description');
  if (errors.price) blocking.push('un prix valide');
  if (d.uploadingCount > 0) blocking.push('la fin du téléversement des photos');

  /** @type {string[]} */
  const recommended = [];
  if (d.imageCount === 0) recommended.push('une photo');
  if (d.benefitCount === 0) recommended.push('des points forts');
  if (!d.audience) recommended.push("l'audience");

  return { errors, blocking, recommended };
}

/**
 * French list: "a", "a et b", "a, b et c".
 * @param {string[]} items
 * @returns {string}
 */
export function frenchList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

/**
 * Where to land after the product is created. The creative page opens on its
 * "Intelligence" step (product analysis, launched by the merchant) while no creative
 * config exists, so a new product lands on the analysis it needs first.
 * @param {string} productId
 * @returns {string}
 */
export function nextStepHref(productId) {
  return `/products/${encodeURIComponent(productId)}/creative`;
}
