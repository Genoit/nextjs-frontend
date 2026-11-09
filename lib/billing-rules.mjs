// Display rules for plans and credits. Plain ESM + JSDoc so `node --test` imports it.

/** @type {Record<string, string>} */
export const PLAN_LABEL = { free: 'Free', starter: 'Starter', pro: 'Pro', business: 'Business' };

/** What each paid plan is for, shown on the plans page. */
/** @type {Record<string, string>} */
export const PLAN_PITCH = {
  free: 'Try the full flow on one product.',
  starter: 'For a store testing its first ads.',
  pro: 'For a store running ads every week.',
  business: 'For brands and agencies with many products.',
};

/**
 * "1 credit", "6 credits".
 * @param {number} n
 */
export function creditsText(n) {
  return `${n} credit${n === 1 ? '' : 's'}`;
}

/**
 * Seconds of video a credit balance buys, e.g. 16 credits x 15 s = "4 min".
 * @param {number} credits
 * @param {number} secondsPerCredit
 */
export function videoTime(credits, secondsPerCredit) {
  const s = credits * secondsPerCredit;
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m} min ${rest} s` : `${m} min`;
}

/**
 * Ads of a given length a balance covers: 16 credits, 30 s ads, 15 s/credit = 8.
 * @param {number} credits
 * @param {number} adSeconds
 * @param {number} secondsPerCredit
 */
export function adsFor(credits, adSeconds, secondsPerCredit) {
  return Math.floor(credits / Math.max(1, Math.ceil(adSeconds / secondsPerCredit)));
}

/**
 * Paid and still billed: show "Manage" rather than "Upgrade".
 * @param {{ plan: string, subscription_status: string | null }} s
 */
export function isSubscribed(s) {
  return (
    s.plan !== 'free' && ['active', 'trialing', 'past_due'].includes(s.subscription_status ?? '')
  );
}

/**
 * Launch price after the Founder discount (-25 %), as a display string.
 * @param {number | string} price
 */
export function founderPrice(price) {
  return (Math.round(Number(price) * 75) / 100).toFixed(2);
}
