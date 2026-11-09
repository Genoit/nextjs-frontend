// Delivery settings of an ad (format, length, language, platform). The selling strategy is
// Creative Intelligence's call; these are the only choices the merchant makes.

export const MIN_SECONDS = 10;
export const MAX_SECONDS = 60;
export const SECONDS_STEP = 5;
export const DEFAULT_SECONDS = 15;

/** Ratios the backend accepts; `w`/`h` draw the frame preview. */
export const FORMATS = [
  {
    value: '9:16',
    label: 'Vertical',
    where: 'TikTok, Reels, Shorts',
    w: 9,
    h: 16,
    platform: 'tiktok',
  },
  {
    value: '4:5',
    label: 'Portrait',
    where: 'Instagram, Facebook feed',
    w: 4,
    h: 5,
    platform: 'facebook',
  },
  {
    value: '1:1',
    label: 'Square',
    where: 'Instagram, Facebook feed',
    w: 1,
    h: 1,
    platform: 'instagram_reels',
  },
  { value: '16:9', label: 'Wide', where: 'YouTube, Facebook', w: 16, h: 9, platform: 'youtube' },
];

export const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube Shorts' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English', flag: 'gb' },
  { value: 'fr', label: 'Français', flag: 'fr' },
  { value: 'es', label: 'Español', flag: 'es' },
  { value: 'de', label: 'Deutsch', flag: 'de' },
];

/** Composer -> ad studio hand-off, read once by the creative setup step. */
export const AD_SETTINGS_KEY = 'trended.adSettings';

const FORMAT_VALUES = new Set(FORMATS.map((f) => f.value));
const LANGUAGE_VALUES = new Set(LANGUAGES.map((l) => l.value));

/** Nearest allowed length on the slider. */
export function clampSeconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SECONDS;
  const stepped = Math.round(n / SECONDS_STEP) * SECONDS_STEP;
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, stepped));
}

export const formatSeconds = (s) => (s >= 60 ? '1 min' : `${s}s`);

export const platformOf = (format) => FORMATS.find((f) => f.value === format)?.platform ?? 'tiktok';

/** Settings picked in the composer, or null when absent or incomplete (the step then shows). */
export function parseAdSettings(raw) {
  if (!raw) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || !FORMAT_VALUES.has(data.format) || !LANGUAGE_VALUES.has(data.language)) return null;
  if (!Number.isFinite(Number(data.duration))) return null;
  return {
    aspect_ratio: data.format,
    language: data.language,
    target_duration: clampSeconds(data.duration),
    platform: platformOf(data.format),
  };
}
