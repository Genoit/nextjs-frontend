// Pure rules of the Studio editor (/studio/[jobId]). Mirrors the backend
// EditSettings: an export stores only its non-default settings.

export const DEFAULT_EDITS = Object.freeze({
  captions: true,
  caption_style: 'bold',
  caption_position: 'bottom',
  caption_animation: 'pop',
  overlay_text: true,
  effect: 'none',
  music_gain_db: null,
});

/** Settings without their default values, the way the API stores them. */
export function compactEdits(edits) {
  const out = {};
  for (const [key, value] of Object.entries(edits ?? {})) {
    if (key in DEFAULT_EDITS && value !== DEFAULT_EDITS[key] && value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/** Full settings from an export's stored ones. */
export function fullEdits(stored) {
  return { ...DEFAULT_EDITS, ...compactEdits(stored) };
}

/** Same render? Track and settings both count; key order does not. */
export function sameRender(a, b) {
  if ((a.track_id ?? null) !== (b.track_id ?? null)) return false;
  const x = compactEdits(a.edits);
  const y = compactEdits(b.edits);
  const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
  return [...keys].every((k) => x[k] === y[k]);
}

/** The newest completed export in the job's own ratio: what the editor opens. */
export function currentExport(exports, aspectRatio) {
  return (
    [...(exports ?? [])]
      .filter((e) => e.status === 'completed' && e.aspect_ratio === aspectRatio)
      .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))[0] ?? null
  );
}

/** "00:07" from seconds (floored, never "00:60"). */
export function timecode(seconds) {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Ruler labels: a step of 1, 2, 5, 10 or 15 s giving at most `max` labels. */
export function rulerMarks(duration, max = 6) {
  if (!(duration > 0)) return [0];
  const step = [1, 2, 5, 10, 15, 30, 60].find((s) => duration / s <= max) ?? 60;
  const marks = [];
  for (let t = 0; t <= duration + 1e-6; t += step) marks.push(t);
  return marks;
}

/**
 * Timeline blocks from the stored EDL: voice-over text and on-screen text per scene.
 * @param {any} edl
 * @returns {{ order: number, start: number, duration: number, voice: string, overlay: string }[]}
 */
export function sceneBlocks(edl) {
  const scenes = Array.isArray(edl?.scenes) ? edl.scenes : [];
  return scenes
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.duration))
    .map((s) => ({
      order: s.order,
      start: s.start,
      duration: s.duration,
      voice: typeof s.vo_text === 'string' ? s.vo_text : '',
      overlay: typeof s.overlay_text === 'string' ? s.overlay_text : '',
    }));
}

/** Undo/redo stack of settings snapshots. */
export function pushHistory(history, entry) {
  const past = history.past.slice(0, history.index + 1);
  if (past.length && sameRender(past[past.length - 1], entry)) return history;
  const next = [...past, entry].slice(-50);
  return { past: next, index: next.length - 1 };
}
