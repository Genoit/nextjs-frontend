// Pure display rules of the Meta Ad Library screens. Mirrors fastapi-backend app/api/v1/ads.py.

function compact(n) {
  const fmt = (v, unit) => `${Number(v.toFixed(1))}${unit}`;
  if (n >= 1e6) return fmt(n / 1e6, 'M');
  if (n >= 1e4) return `${Math.round(n / 1e3)}K`;
  if (n >= 1e3) return fmt(n / 1e3, 'K');
  return String(n);
}

/** Reach is a Meta estimate for the EU only; spend is never shown. */
export function reachLabel(n) {
  return n == null ? 'Reach not reported' : `${compact(n)} EU reach (Meta estimate)`;
}

export function runTimeLabel(days) {
  return days <= 1 ? '1 day' : `${days} days`;
}

export const ADS_ERROR_TEXT = Object.freeze({
  search_limit_reached: "You've used today's searches. Try again tomorrow or upgrade your plan.",
  follow_limit_reached:
    'You follow as many advertisers as your plan allows. Unfollow one or upgrade.',
  capture_limit_reached: "You've used all your captures. Upgrade your plan to save more ads.",
  capture_lookup_limit: 'Too many lookups for now. Try again in an hour.',
  meta_not_configured: 'Ad search is not available yet. Please try again later.',
  meta_busy: 'The ad library is busy. Try again in a few minutes.',
  ad_not_found: "We couldn't find this ad for that advertiser. Check the link.",
  advertiser_not_found: "We couldn't find this advertiser.",
  capture_not_found: "We couldn't find this capture.",
  unsupported_media: 'Use JPG, PNG, WebP, MP4 or WebM files.',
  file_too_large: 'These files are too large. The limit is 100 MB in total.',
  invalid_cursor: 'This page has expired. Run the search again.',
});

export function adsErrorText(code) {
  return ADS_ERROR_TEXT[code] ?? 'Something went wrong. Please try again.';
}

function libraryUrl(url) {
  try {
    const u = new URL(url);
    const ok =
      (u.hostname === 'www.facebook.com' || u.hostname === 'facebook.com') &&
      u.pathname.startsWith('/ads/library');
    return ok ? u : null;
  } catch {
    return null;
  }
}

export function isAdLibraryUrl(url) {
  return libraryUrl(url) !== null;
}

export function adIdFromLibraryUrl(url) {
  const id = libraryUrl(url)?.searchParams.get('id');
  return id && /^\d+$/.test(id) ? id : null;
}

/**
 * Strategy picker options: the newest strategy of each kind (standard first, then one per
 * remade ad, newest first). `summaries` come newest first from GET /products/{id}/strategies.
 * @param {{ id: string, ref_ad_id: string | null, ref_page_name: string | null }[]} summaries
 * @returns {{ id: string, refAdId: string | null, label: string }[]}
 */
export function strategyChoices(summaries) {
  const seen = new Set();
  const remakes = [];
  let standard = null;
  for (const s of summaries) {
    if (seen.has(s.ref_ad_id)) continue;
    seen.add(s.ref_ad_id);
    if (s.ref_ad_id === null) standard = { id: s.id, refAdId: null, label: 'Standard' };
    else remakes.push({ id: s.id, refAdId: s.ref_ad_id, label: inspiredLabel(s.ref_page_name) });
  }
  return standard ? [standard, ...remakes] : remakes;
}

/** "Inspired by Nike's ad"; the ad (or its advertiser) may since have been removed. */
export function inspiredLabel(pageName) {
  return pageName ? `Inspired by ${pageName}'s ad` : 'Inspired by a removed ad';
}
