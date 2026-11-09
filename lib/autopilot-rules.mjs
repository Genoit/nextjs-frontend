// Pure rules of the Autopilot pages: when to poll, what to say, when the fact check can be sent.

const WORKING = ['analyzing', 'planning', 'generating', 'finishing'];

const LABELS = {
  analyzing: 'Lecture de votre produit',
  awaiting_confirmation: 'Vérifiez les infos produit',
  planning: 'Choix des angles de vente',
  generating: 'Création de vos pubs',
  finishing: 'Montage final',
  ready: 'Vos pubs sont prêtes',
  partial: 'Une partie de vos pubs est prête',
  failed: 'Échec de la création',
  cancelled: 'Annulée',
};

export const MAX_BENEFITS = 3;

/** @param {string} status */
export function isPolling(status) {
  return WORKING.includes(status);
}

/** @param {string} status */
export function statusLabel(status) {
  return LABELS[status] ?? 'En cours';
}

/**
 * @param {{ name: string, benefits: string[], image_urls?: string[] }} facts
 */
export function canConfirm(facts) {
  return (
    facts.name.trim().length > 0 &&
    (facts.image_urls ?? []).length > 0 &&
    facts.benefits.length <= MAX_BENEFITS
  );
}

/**
 * What the API receives: trimmed, no blank benefit, `null` price when cleared.
 * @param {{ name: string, price?: string | null, benefits: string[], image_urls?: string[] }} facts
 */
export function cleanFacts(facts) {
  const price = (facts.price ?? '').trim();
  return {
    name: facts.name.trim(),
    price: price || null,
    benefits: facts.benefits.map((b) => b.trim()).filter(Boolean),
    image_urls: facts.image_urls ?? [],
  };
}

/** Idempotency key of one "create my ads" gesture. @param {string} productId */
export function newRunKey(productId) {
  return `${productId}:${crypto.randomUUID()}`;
}
