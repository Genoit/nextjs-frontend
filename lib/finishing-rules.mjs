// Pure display rules for video finishing (module 6): final report, exports, music, history.
// Plain ESM + JSDoc so `node --test` can import it without a TS loader.

import { CHECK_STATUS_LABELS } from './render-rules.mjs';

/** Finishing check names (backend module 6) -> French. Unknown names are shown as-is. */
export const FINISHING_CHECK_LABELS = {
  duration: 'Durée',
  resolution: 'Résolution',
  fps: 'Images par seconde',
  audio_present: 'Piste audio',
  loudness_integrated: 'Volume sonore (LUFS)',
  true_peak: 'Crête sonore (dBTP)',
  captions_burned: 'Sous-titres incrustés',
  voiceover: 'Voix off',
  music: 'Musique',
  vo_overflow: 'Voix off plus longue que le plan',
  compliance: 'Conformité publicitaire',
};

/** @param {string} name */
export function finishingCheckLabel(name) {
  return (
    (Object.hasOwn(FINISHING_CHECK_LABELS, name) &&
      /** @type {Record<string,string>} */ (FINISHING_CHECK_LABELS)[name]) ||
    name
  );
}

/** @param {string} status */
export function checkStatusLabel(status) {
  return /** @type {Record<string,string>} */ (CHECK_STATUS_LABELS)[status] ?? status;
}

// Everything else (fail, warn, unavailable, unknown statuses) is listed: fail closed.
const QUIET = ['pass', 'skipped'];

/**
 * Badges that keep a degraded finish from looking like a full success.
 * A report without a voiceover block cannot prove a real voice: "incertaine".
 * @param {{ voiceover?: { is_mock?: boolean, status?: string } | null, music?: unknown } | null | undefined} report
 * @returns {string[]}
 */
export function finishingBadges(report) {
  if (!report) return [];
  const badges = [];
  const vo = report.voiceover;
  if (vo?.is_mock === true) badges.push('Voix simulée');
  else if (vo?.status === 'unavailable' || vo?.status === 'none') badges.push('Sans voix off');
  else if (!vo || vo.status !== 'real') badges.push('Voix off incertaine');
  if (!report.music) badges.push('Sans musique');
  return badges;
}

/**
 * Final report: issues listed, passed/skipped only counted. `passed` must be true and no
 * check may fail for the report to read as passed.
 * @param {{ checks?: Array<any>, passed?: boolean } | null | undefined} report
 */
export function finishingView(report) {
  if (!report) return null;
  const checks = Array.isArray(report.checks) ? report.checks : [];
  const issues = checks.filter((c) => !QUIET.includes(c?.status));
  return {
    passed: report.passed === true && !checks.some((c) => c?.status === 'fail'),
    blockingFails: checks.filter((c) => c?.status === 'fail' && c?.blocking).length,
    issues,
    others: checks.filter((c) => QUIET.includes(c?.status)),
    passedCount: checks.filter((c) => c?.status === 'pass').length,
    badges: finishingBadges(report),
  };
}

/** Formats offered on demand, in button order. */
export const EXPORT_RATIOS = ['9:16', '1:1', '16:9'];

export const RATIO_DIMENSIONS = {
  '9:16': '1080×1920',
  '1:1': '1080×1080',
  '16:9': '1920×1080',
  '4:5': '1080×1350',
};

/** Tailwind aspect class per ratio (literal strings so Tailwind keeps them). */
export const RATIO_ASPECT_CLASS = {
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '4:5': 'aspect-[4/5]',
};

export const EXPORT_STATUS_LABELS = {
  pending: 'En attente',
  rendering: 'Rendu en cours…',
  completed: 'Prêt',
  failed: 'Échec',
};

/** @param {{ status?: string } | null | undefined} exp */
export function isExportInFlight(exp) {
  return exp?.status === 'pending' || exp?.status === 'rendering';
}

/** @param {Array<{ status?: string }> | null | undefined} list */
export function anyExportInFlight(list) {
  return (list ?? []).some(isExportInFlight);
}

/** @param {{ created_at?: string, updated_at?: string }} e */
const stamp = (e) => Date.parse(e?.updated_at ?? e?.created_at ?? '') || 0;

/**
 * Latest export per ratio (a completed one wins over a newer failure: it stays downloadable).
 * @template {{ aspect_ratio: string, status: string, created_at?: string, updated_at?: string }} T
 * @param {T[] | null | undefined} list
 * @returns {Record<string, T>}
 */
export function exportsByRatio(list) {
  /** @type {Record<string, T>} */
  const out = {};
  for (const e of list ?? []) {
    const cur = out[e.aspect_ratio];
    const done = e.status === 'completed';
    const curDone = cur?.status === 'completed';
    const better = !cur || (done && !curDone) || (done === curDone && stamp(e) >= stamp(cur));
    if (better) out[e.aspect_ratio] = e;
  }
  return out;
}

/**
 * One row per format: completed formats only offer a download, in-flight ones only a
 * status, missing or failed ones the export button. The primary ratio always shows.
 * @param {Array<any> | null | undefined} list
 * @param {string | null | undefined} primaryRatio
 * @returns {Array<{ ratio: string, exp: any | null, canExport: boolean }>}
 */
export function exportRows(list, primaryRatio) {
  const by = exportsByRatio(list);
  const ratios = [...EXPORT_RATIOS];
  for (const r of [primaryRatio, ...Object.keys(by)]) {
    if (r && !ratios.includes(r)) ratios.push(r);
  }
  return ratios.map((ratio) => {
    const exp = by[ratio] ?? null;
    return { ratio, exp, canExport: !exp || exp.status === 'failed' };
  });
}

/**
 * Polite live text for exports whose status changed (or that appeared) between two lists.
 * @param {Array<any> | null | undefined} prev
 * @param {Array<any> | null | undefined} next
 */
export function exportTransitionMessage(prev, next) {
  if (!prev || !next) return '';
  const before = new Map(prev.map((e) => [e.id, e.status]));
  return next
    .filter((e) => before.get(e.id) !== e.status)
    .map((e) => {
      const label = /** @type {Record<string,string>} */ (EXPORT_STATUS_LABELS)[e.status];
      return `Export ${e.aspect_ratio} : ${(label ?? 'statut inconnu').replace('…', '')}.`;
    })
    .join(' ');
}

/**
 * Where a media URL from the API is fetched: same-API paths need the Bearer token,
 * a foreign absolute URL (presigned) is used as-is and must not carry the token.
 * @param {string | null | undefined} url
 * @param {string} apiBase e.g. "http://localhost:8000/api/v1"
 * @returns {{ kind: 'authed', endpoint: string } | { kind: 'direct', url: string } | null}
 */
export function mediaSource(url, apiBase) {
  if (!url) return null;
  const base = apiBase.replace(/\/+$/, '');
  if (/^https?:\/\//.test(url)) {
    if (url.startsWith(`${base}/`)) return { kind: 'authed', endpoint: url.slice(base.length) };
    return { kind: 'direct', url };
  }
  const prefix = new URL(base).pathname.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return {
    kind: 'authed',
    endpoint: prefix && path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path,
  };
}

export const MUSIC_MAX_MB = 15;
const MUSIC_EXT = ['mp3', 'wav', 'm4a'];

/**
 * Client-side pre-check of a music upload (the server stays authoritative).
 * @param {{ name: string, size: number } | null | undefined} file
 * @returns {string | null} French error, or null when acceptable
 */
export function musicFileError(file) {
  if (!file) return 'Choisissez un fichier audio.';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!MUSIC_EXT.includes(ext)) return 'Format non pris en charge : MP3, WAV ou M4A uniquement.';
  if (file.size > MUSIC_MAX_MB * 1024 * 1024) {
    return `Fichier trop volumineux : ${MUSIC_MAX_MB} Mo maximum.`;
  }
  if (file.size === 0) return 'Le fichier est vide.';
  return null;
}

/** "1:05"; "—" when unknown. @param {number | string | null | undefined} s */
export function trackDuration(s) {
  const n = Number(s);
  if (s === null || s === undefined || s === '' || !Number.isFinite(n) || n < 0) return '—';
  const total = Math.round(n);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** "upbeat, calm" -> ["upbeat", "calm"]. @param {string} text */
export function parseMoods(text) {
  return [
    ...new Set(
      text
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
    ),
  ];
}

/** Music choice of the setup: auto (mood match), none, or a track id. */
export const MUSIC_AUTO = 'auto';
export const MUSIC_NONE = 'none';

/**
 * Initial choice from stored music_preferences.
 * @param {Record<string, unknown> | null | undefined} prefs
 */
export function musicChoiceOf(prefs) {
  if (typeof prefs?.track_id === 'string' && prefs.track_id) return prefs.track_id;
  return prefs?.mood === MUSIC_NONE ? MUSIC_NONE : MUSIC_AUTO;
}

/**
 * music_preferences to save. "none" stores mood "none" (no library mood matches it) and
 * no track, so the montage has no music bed.
 * @param {string} choice MUSIC_AUTO, MUSIC_NONE or a track id
 * @param {string} mood
 */
export function musicPreferences(choice, mood) {
  if (choice === MUSIC_NONE) return { mood: MUSIC_NONE, track_id: null };
  if (choice === MUSIC_AUTO) return { mood, track_id: null };
  return { mood, track_id: choice };
}

/**
 * History row: completed formats (deduped, primary first) + thumbnail + cost.
 * @param {{ exports?: Array<any>, thumbnail_url?: string | null, actual_cost?: string | number | null }} job
 */
export function historyView(job) {
  const formats = [];
  for (const e of job?.exports ?? []) {
    if (e?.status === 'completed' && !formats.includes(e.aspect_ratio))
      formats.push(e.aspect_ratio);
  }
  return {
    formats,
    thumbnailUrl: job?.thumbnail_url ?? null,
    cost: job?.actual_cost ?? null,
  };
}
