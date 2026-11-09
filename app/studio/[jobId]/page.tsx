'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  Loader2,
  Maximize,
  Music,
  PanelBottom,
  PanelTop,
  Pause,
  Play,
  Redo2,
  RectangleHorizontal,
  Sparkles,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  ZoomIn,
} from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { focusRing } from '../../../components/dashboard/DashShell';
import { creativeApi } from '../../../lib/api/creative';
import { productApi } from '../../../lib/api/product';
import { useApiMediaUrl } from '../../../hooks/use-assets';
import {
  compactEdits,
  currentExport,
  fullEdits,
  pushHistory,
  rulerMarks,
  sameRender,
  sceneBlocks,
  timecode,
} from '../../../lib/studio-rules.mjs';
import type {
  EditSettings,
  ExportAspectRatio,
  MusicTrack,
  VideoExport,
  VideoGenerationJob,
} from '../../../lib/types/creative';

type Draft = { track_id: string | null; edits: EditSettings };
type Tab = 'captions' | 'music' | 'effects';

const CAPTION_STYLES: { id: EditSettings['caption_style']; label: string; tile: string }[] = [
  {
    id: 'bold',
    label: 'Bold outline',
    tile: 'text-white font-black [-webkit-text-stroke:1.5px_#000] [paint-order:stroke]',
  },
  { id: 'box', label: 'White box', tile: 'bg-white px-1.5 text-[#101010] font-extrabold' },
  {
    id: 'highlight',
    label: 'Orange box',
    tile: 'bg-trend-orange px-1.5 text-white font-extrabold',
  },
  { id: 'minimal', label: 'Minimal', tile: 'text-white text-[16px] font-semibold' },
];
const POSITIONS: { id: EditSettings['caption_position']; label: string; Icon: typeof PanelTop }[] =
  [
    { id: 'top', label: 'Top', Icon: PanelTop },
    { id: 'middle', label: 'Middle', Icon: RectangleHorizontal },
    { id: 'bottom', label: 'Bottom', Icon: PanelBottom },
  ];
const ANIMATIONS: { id: EditSettings['caption_animation']; label: string }[] = [
  { id: 'pop', label: 'Pop in' },
  { id: 'fade', label: 'Soft fade in' },
  { id: 'karaoke', label: 'Karaoke, word by word' },
  { id: 'none', label: 'No animation' },
];
const EFFECTS: { id: EditSettings['effect']; label: string; css: string }[] = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.35) contrast(1.05)' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.25) saturate(1.2)' },
  { id: 'cool', label: 'Cool', css: 'hue-rotate(-12deg) saturate(0.9) brightness(1.03)' },
  { id: 'bw', label: 'Black & white', css: 'grayscale(1)' },
  { id: 'vignette', label: 'Vignette', css: 'brightness(0.92)' },
];
const DEFAULT_MUSIC_DB = -20; // backend finishing_music_gain_db
const iconButton = `flex size-9 items-center justify-center rounded-full hover:bg-studio-raised disabled:opacity-35 ${focusRing}`;
const ctaButton = `inline-flex items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-cta-top to-cta-bottom font-semibold text-on-ember ${focusRing}`;

/** Frames of the rendered video for the timeline strip (same-origin blob URLs only). */
function useFilmstrip(src: string | null, count: number): string[] {
  const [frames, setFrames] = useState<{ src: string; list: string[] } | null>(null);
  // Held here: an off-DOM <video> only referenced by its own handlers gets collected mid-load.
  const holder = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!src?.startsWith('blob:')) return;
    let cancelled = false;
    const video = document.createElement('video');
    holder.current = video;
    video.muted = true;
    video.preload = 'auto';
    video.src = src;
    const canvas = document.createElement('canvas');
    const out: string[] = [];
    // Muted 16x playback, one grab per slot: seeking re-decodes from the keyframe each time.
    const grab = () => {
      if (cancelled) return;
      const d = video.duration;
      while (out.length < count && video.currentTime >= (out.length * d) / count) {
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        out.push(canvas.toDataURL('image/jpeg', 0.6));
      }
      if (out.length >= count || video.ended) {
        video.pause();
        setFrames({ src, list: out });
      } else {
        video.requestVideoFrameCallback(grab);
      }
    };
    video.onloadeddata = () => {
      if (!('requestVideoFrameCallback' in video)) return; // no strip on old browsers
      canvas.height = 96;
      canvas.width = Math.round((96 * video.videoWidth) / Math.max(video.videoHeight, 1));
      video.onended = () => !cancelled && setFrames({ src, list: out });
      video.playbackRate = 16;
      video.requestVideoFrameCallback(grab);
      video.play().catch(() => {});
    };
    return () => {
      cancelled = true;
      video.removeAttribute('src');
    };
  }, [src, count]);
  return frames && frames.src === src ? frames.list : [];
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex items-center gap-3 rounded-full text-[14.5px] text-studio-text ${focusRing}`}
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-trend-orange' : 'bg-studio-hover'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.4)] transition-transform duration-200 ease-out ${on ? 'translate-x-5' : ''}`}
        />
      </span>
      {label}
    </button>
  );
}

function FieldTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2.5 text-[13.5px] font-semibold text-studio-text">{children}</h3>;
}

function choice(active: boolean) {
  return `rounded-[10px] border transition-colors ${
    active
      ? 'border-trend-orange bg-accent-soft text-trend-orange'
      : 'border-studio-rule-strong bg-studio-raised text-studio-muted hover:bg-studio-raised-2 hover:text-studio-text'
  } ${focusRing}`;
}

function Editor({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<VideoGenerationJob | null>(null);
  const [title, setTitle] = useState('Untitled ad');
  const [exports, setExports] = useState<VideoExport[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [shownId, setShownId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<{ past: Draft[]; index: number }>({
    past: [],
    index: -1,
  });
  const [tab, setTab] = useState<Tab>('captions');
  const [rendering, setRendering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [peaks, setPeaks] = useState<{ id: string; bars: number[] } | null>(null);
  const [zoom, setZoom] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const ratio = ((job?.edl_timeline?.aspect_ratio as string) || '9:16') as ExportAspectRatio;
  const duration = Number(job?.edl_timeline?.total_duration) || 15;
  const blocks = useMemo(() => sceneBlocks(job?.edl_timeline), [job]);
  const shown = exports.find((e) => e.id === shownId) ?? null;
  const media = useApiMediaUrl(shown?.download_url);
  const thumb = useApiMediaUrl(job?.thumbnail_url);
  const strip = useFilmstrip(media.url, 12);

  useEffect(() => {
    let alive = true;
    Promise.all([
      creativeApi.getVideoJob(jobId),
      creativeApi.listExports(jobId),
      creativeApi.listMusicTracks().catch(() => [] as MusicTrack[]),
    ])
      .then(([j, rows, t]) => {
        if (!alive) return;
        const r = ((j.edl_timeline?.aspect_ratio as string) || '9:16') as ExportAspectRatio;
        const cur = currentExport(rows, r);
        const start: Draft = {
          track_id: cur?.track_id ?? null,
          edits: fullEdits(cur?.edits) as EditSettings,
        };
        setJob(j);
        setExports(rows);
        setTracks(t);
        setShownId(cur?.id ?? null);
        setDraft(start);
        setHistory({ past: [start], index: 0 });
        productApi
          .getProduct(j.product_id)
          .then((p) => {
            if (alive && p.title) setTitle(p.title);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [jobId]);

  // Waveform of the chosen track.
  const trackId = draft?.track_id ?? null;
  useEffect(() => {
    if (!trackId || peaks?.id === trackId) return;
    let alive = true;
    creativeApi
      .trackPeaks(trackId)
      .then((bars) => alive && setPeaks({ id: trackId, bars }))
      .catch(() => alive && setPeaks({ id: trackId, bars: [] }));
    return () => {
      alive = false;
    };
  }, [trackId, peaks?.id]);

  const applied: Draft | null = shown
    ? { track_id: shown.track_id, edits: fullEdits(shown.edits) as EditSettings }
    : null;
  const dirty = !!draft && !!applied && !sameRender(draft, applied);

  const update = useCallback((next: Draft) => {
    setDraft(next);
    setHistory((h) => pushHistory(h, next));
    setError(null);
  }, []);
  const setEdit = <K extends keyof EditSettings>(key: K, value: EditSettings[K]) => {
    if (draft) update({ ...draft, edits: { ...draft.edits, [key]: value } });
  };

  // A look already rendered once (undo, redo, back to a setting) plays at once, no render.
  const rendered = draft
    ? exports.find(
        (e) =>
          e.status === 'completed' &&
          e.aspect_ratio === ratio &&
          sameRender(draft, { track_id: e.track_id, edits: e.edits ?? {} }),
      )
    : undefined;
  if (rendered && rendered.id !== shownId && !rendering) setShownId(rendered.id);

  // Poll a render until it completes or fails.
  useEffect(() => {
    if (!rendering) return;
    const timer = window.setInterval(async () => {
      try {
        const rows = await creativeApi.listExports(jobId);
        setExports(rows);
        const row = rows.find((e) => e.id === rendering);
        if (row?.status === 'completed') {
          setShownId(row.id);
          setRendering(null);
        } else if (row?.status === 'failed') {
          setError(row.error || 'The render failed. Try again.');
          setRendering(null);
        }
      } catch {
        // The next tick retries.
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [rendering, jobId]);

  const render = async () => {
    if (!draft) return;
    setError(null);
    try {
      const row = await creativeApi.createExport(jobId, {
        aspect_ratio: ratio,
        track_id: draft.track_id,
        edits: compactEdits(draft.edits) as EditSettings,
      });
      setExports((rows) => [...rows.filter((e) => e.id !== row.id), row]);
      if (row.status === 'completed') setShownId(row.id);
      else if (row.status === 'failed') setError(row.error || 'The render failed. Try again.');
      else setRendering(row.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The render could not start.');
    }
  };

  const go = (step: -1 | 1) => {
    const index = history.index + step;
    const entry = history.past[index];
    if (!entry) return;
    setHistory({ ...history, index });
    setDraft(entry);
  };

  const seek = (t: number) => {
    const clamped = Math.max(0, Math.min(duration, t));
    if (videoRef.current) videoRef.current.currentTime = clamped;
    setTime(clamped);
  };
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-studio-ground px-4 text-center">
        <AlertCircle className="size-8 text-danger" aria-hidden />
        <p className="text-[16px] text-studio-text">This video could not be opened.</p>
        <Link href="/studio" className={`text-[14.5px] text-trend-orange underline ${focusRing}`}>
          Back to your videos
        </Link>
      </div>
    );
  }
  if (!job || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-ground">
        <Loader2 className="size-6 animate-spin text-studio-muted" aria-label="Loading" />
      </div>
    );
  }

  const tall = ratio === '9:16' || ratio === '4:5';
  const pct = (t: number) => `${(t / duration) * 100}%`;
  const musicTitle = tracks.find((t) => t.id === draft.track_id)?.title;
  const bars = draft.track_id && peaks?.id === draft.track_id ? peaks.bars : [];
  const canExport = !!media.url && !dirty && !rendering;

  return (
    <div className="min-h-screen bg-studio-ground text-studio-text selection:bg-trend-orange/40">
      <header className="flex h-16 items-center gap-3 border-b border-studio-rule px-4 md:px-6">
        <Link href="/studio" aria-label="Back to your videos" className={iconButton}>
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-[17px] font-semibold">{title}</h1>
        <a
          href={canExport ? (media.url ?? undefined) : undefined}
          download="trended-ad.mp4"
          aria-disabled={!canExport}
          title={dirty ? 'Render your changes before exporting' : undefined}
          className={`h-10 px-5 text-[15px] aria-disabled:cursor-not-allowed aria-disabled:opacity-45 ${ctaButton}`}
        >
          <Download className="size-4" aria-hidden />
          Export
        </a>
      </header>

      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section
          ref={stageRef}
          aria-label="Preview"
          className="flex flex-col overflow-hidden rounded-[16px] border border-studio-rule bg-stage"
        >
          <div className="relative flex min-h-[280px] flex-1 items-center justify-center">
            {media.url ? (
              <video
                ref={videoRef}
                key={media.url}
                src={media.url}
                playsInline
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                className={`${tall ? 'h-[min(58vh,620px)] w-auto' : 'max-h-[58vh] w-full'} object-contain`}
              />
            ) : (
              <p className="text-[14.5px] text-studio-muted">
                {media.failed
                  ? 'The video file could not be loaded.'
                  : shown
                    ? 'Loading the video…'
                    : 'No finished file in this format yet.'}
              </p>
            )}
            {rendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                <Loader2 className="size-7 animate-spin text-trend-orange" aria-hidden />
                <p className="text-[14.5px]">Rendering your changes…</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-studio-rule bg-studio-rail px-3 py-2.5 sm:gap-3 sm:px-4">
            <button
              type="button"
              onClick={toggle}
              disabled={!media.url}
              aria-label={playing ? 'Pause' : 'Play'}
              className={iconButton}
            >
              {playing ? (
                <Pause className="size-5" fill="currentColor" aria-hidden />
              ) : (
                <Play className="size-5" fill="currentColor" aria-hidden />
              )}
            </button>
            <span className="shrink-0 text-[13.5px] tabular-nums text-studio-muted">
              <span className="text-studio-text">{timecode(time)}</span> / {timecode(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.05}
              value={time}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-trend-orange"
            />
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) videoRef.current.muted = !muted;
                setMuted(!muted);
              }}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className={iconButton}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-5" aria-hidden />
              ) : (
                <Volume2 className="size-5" aria-hidden />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (videoRef.current) {
                  videoRef.current.volume = next;
                  videoRef.current.muted = next === 0;
                }
                setVolume(next);
                setMuted(next === 0);
              }}
              aria-label="Volume"
              className="hidden h-1 w-20 cursor-pointer accent-trend-orange sm:block"
            />
            <button
              type="button"
              onClick={() => void stageRef.current?.requestFullscreen?.()}
              aria-label="Full screen"
              className={iconButton}
            >
              <Maximize className="size-5" aria-hidden />
            </button>
          </div>
        </section>

        <aside
          aria-label="Edit settings"
          className="rounded-[16px] border border-studio-rule bg-studio-surface"
        >
          <div role="tablist" className="flex gap-1 border-b border-studio-rule px-3">
            {(
              [
                ['captions', 'Captions', Type],
                ['music', 'Music', Music],
                ['effects', 'Effects', Sparkles],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-3.5 text-[14.5px] font-medium transition-colors ${
                  tab === id
                    ? 'border-trend-orange text-studio-text'
                    : 'border-transparent text-studio-muted hover:text-studio-text'
                } ${focusRing}`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="space-y-6 p-5">
            {tab === 'captions' && (
              <>
                <Toggle
                  on={draft.edits.captions}
                  onChange={(v) => setEdit('captions', v)}
                  label="Show captions"
                />
                <fieldset
                  disabled={!draft.edits.captions}
                  className="space-y-6 disabled:opacity-40"
                >
                  <div>
                    <FieldTitle>Style</FieldTitle>
                    <div className="grid grid-cols-4 gap-2">
                      {CAPTION_STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={draft.edits.caption_style === s.id}
                          aria-label={s.label}
                          title={s.label}
                          onClick={() => setEdit('caption_style', s.id)}
                          className={`flex h-16 items-center justify-center text-[20px] ${choice(draft.edits.caption_style === s.id)}`}
                        >
                          <span className={`rounded-[4px] leading-tight ${s.tile}`}>Aa</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldTitle>Position</FieldTitle>
                    <div className="grid grid-cols-3 gap-2">
                      {POSITIONS.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={draft.edits.caption_position === id}
                          onClick={() => setEdit('caption_position', id)}
                          className={`flex h-11 items-center justify-center gap-1.5 text-[13.5px] ${choice(draft.edits.caption_position === id)}`}
                        >
                          <Icon className="size-4" aria-hidden />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldTitle>Animation</FieldTitle>
                    <div className="relative">
                      <Sparkles
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-trend-orange"
                        aria-hidden
                      />
                      <select
                        value={draft.edits.caption_animation}
                        onChange={(e) =>
                          setEdit(
                            'caption_animation',
                            e.target.value as EditSettings['caption_animation'],
                          )
                        }
                        aria-label="Caption animation"
                        className={`h-11 w-full appearance-none rounded-[10px] border border-studio-rule-strong bg-studio-raised pr-3 pl-10 text-[14.5px] text-studio-text ${focusRing}`}
                      >
                        {ANIMATIONS.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>
                <Toggle
                  on={draft.edits.overlay_text}
                  onChange={(v) => setEdit('overlay_text', v)}
                  label="Show on-screen text"
                />
              </>
            )}

            {tab === 'music' && (
              <>
                <div>
                  <FieldTitle>Track</FieldTitle>
                  <ul className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
                    {[{ id: null, title: 'No music', licence: '' }, ...tracks].map((t) => (
                      <li key={t.id ?? 'none'}>
                        <button
                          type="button"
                          aria-pressed={draft.track_id === t.id}
                          onClick={() => update({ ...draft, track_id: t.id })}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${choice(draft.track_id === t.id)}`}
                        >
                          <Music className="size-4 shrink-0" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] text-studio-text">
                              {t.title}
                            </span>
                            {t.licence && (
                              <span className="block truncate text-[12.5px] text-studio-meta">
                                {t.licence}
                              </span>
                            )}
                          </span>
                          {draft.track_id === t.id && <Check className="size-4" aria-hidden />}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {tracks.length === 0 && (
                    <p className="mt-2 text-[13px] text-studio-muted">
                      No tracks yet. Upload one from the ad flow.
                    </p>
                  )}
                </div>
                <fieldset disabled={!draft.track_id} className="disabled:opacity-40">
                  <FieldTitle>Music volume</FieldTitle>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={-40}
                      max={0}
                      step={1}
                      value={draft.edits.music_gain_db ?? DEFAULT_MUSIC_DB}
                      onChange={(e) => setEdit('music_gain_db', Number(e.target.value))}
                      aria-label="Music volume in decibels"
                      className="h-1 flex-1 cursor-pointer accent-trend-orange"
                    />
                    <span className="w-14 text-right text-[13px] tabular-nums text-studio-muted">
                      {draft.edits.music_gain_db ?? DEFAULT_MUSIC_DB} dB
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] text-studio-meta">
                    The music dips under the voice-over automatically.
                  </p>
                </fieldset>
              </>
            )}

            {tab === 'effects' && (
              <div>
                <FieldTitle>Colour look</FieldTitle>
                <div className="grid grid-cols-3 gap-2">
                  {EFFECTS.map((fx) => (
                    <button
                      key={fx.id}
                      type="button"
                      aria-pressed={draft.edits.effect === fx.id}
                      onClick={() => setEdit('effect', fx.id)}
                      className={`overflow-hidden p-1 text-[12.5px] ${choice(draft.edits.effect === fx.id)}`}
                    >
                      <span
                        className="block aspect-square rounded-[7px] bg-studio-hover bg-cover bg-center"
                        style={{
                          backgroundImage: thumb.url ? `url(${thumb.url})` : undefined,
                          filter: fx.css,
                          boxShadow:
                            fx.id === 'vignette'
                              ? 'inset 0 0 18px 6px rgb(0 0 0 / 0.75)'
                              : undefined,
                        }}
                      />
                      <span className="mt-1 block truncate py-0.5">{fx.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[12.5px] text-studio-meta">
                  Swatches are a preview. The look is burned into the video when you render.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section
          aria-label="Timeline"
          className="min-w-0 rounded-[16px] border border-studio-rule bg-studio-surface p-3"
        >
          <div className="flex items-center gap-1 pb-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={history.index <= 0 || !!rendering}
              aria-label="Undo"
              className={iconButton}
            >
              <Undo2 className="size-[18px]" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={history.index >= history.past.length - 1 || !!rendering}
              aria-label="Redo"
              className={iconButton}
            >
              <Redo2 className="size-[18px]" aria-hidden />
            </button>
            <span className="ml-auto flex items-center gap-2 pr-1 text-studio-muted">
              <ZoomIn className="size-4" aria-hidden />
              <input
                type="range"
                min={1}
                max={4}
                step={0.25}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Timeline zoom"
                className="h-1 w-24 cursor-pointer accent-trend-orange"
              />
            </span>
          </div>
          <div className="flex">
            <div className="flex w-9 shrink-0 flex-col pt-7 text-studio-muted" aria-hidden>
              {[RectangleHorizontal, Type, Music, Sparkles].map((Icon, i) => (
                <span key={i} className="flex h-12 items-center justify-center">
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <div
                className="relative cursor-pointer pr-3"
                style={{ width: `${zoom * 100}%`, minWidth: '520px' }}
                onPointerDown={(e) => {
                  const box = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - box.left) / (box.width - 12)) * duration);
                }}
              >
                <div className="relative h-7 text-[11.5px] tabular-nums text-studio-meta">
                  {rulerMarks(duration, Math.round(6 * zoom)).map((t) => (
                    <span
                      key={t}
                      className={`absolute top-0 ${t === 0 ? '' : t >= duration - 1e-6 ? '-translate-x-full' : '-translate-x-1/2'}`}
                      style={{ left: pct(t) }}
                    >
                      {timecode(t)}
                    </span>
                  ))}
                  <div className="absolute inset-x-0 bottom-1 h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-studio-rule-strong)_0_1px,transparent_1px_12px)]" />
                </div>
                <div className="flex h-12 items-center">
                  <div className="flex h-10 w-full overflow-hidden rounded-[8px] bg-studio-raised">
                    {strip.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-full min-w-0 flex-1 object-cover"
                      />
                    ))}
                  </div>
                </div>
                <div className="relative h-12">
                  {blocks.map((b) => {
                    const text = draft.edits.captions
                      ? b.voice
                      : draft.edits.overlay_text
                        ? b.overlay
                        : '';
                    return text ? (
                      <span
                        key={b.order}
                        title={text}
                        className="absolute top-1.5 flex h-9 items-center gap-1.5 rounded-[8px] border border-[#8b6cf0]/60 bg-[#5b3fc4]/70 px-2 text-[12.5px] text-white"
                        style={{ left: pct(b.start), width: `calc(${pct(b.duration)} - 3px)` }}
                      >
                        <Type className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{text}</span>
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="relative h-12">
                  {draft.track_id ? (
                    <div className="absolute inset-x-0 top-1.5 flex h-9 items-center gap-2 overflow-hidden rounded-[8px] bg-trend-orange px-2 text-[12.5px] font-medium text-on-accent">
                      <Music className="size-3.5 shrink-0" aria-hidden />
                      <span className="shrink-0">{musicTitle ?? 'Music'}</span>
                      <span className="flex h-full min-w-0 flex-1 items-center gap-px" aria-hidden>
                        {bars.map((v, i) => (
                          <span
                            key={i}
                            className="flex-1 rounded-full bg-on-accent/45"
                            style={{ height: `${Math.max(8, v * 80)}%` }}
                          />
                        ))}
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-1.5 flex h-9 items-center px-2 text-[12.5px] text-studio-meta">
                      No music
                    </span>
                  )}
                </div>
                <div className="relative h-12">
                  {draft.edits.effect !== 'none' ? (
                    <span className="absolute inset-x-0 top-1.5 flex h-9 items-center gap-1.5 rounded-[8px] border border-[#8b6cf0]/60 bg-[#5b3fc4]/70 px-2 text-[12.5px] text-white">
                      <Sparkles className="size-3.5" aria-hidden />
                      {EFFECTS.find((f) => f.id === draft.edits.effect)?.label}
                    </span>
                  ) : (
                    <span className="absolute top-1.5 flex h-9 items-center px-2 text-[12.5px] text-studio-meta">
                      No effect
                    </span>
                  )}
                </div>
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-trend-orange"
                  style={{ left: `calc((100% - 12px) * ${time / duration})` }}
                >
                  <span className="absolute -top-0.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-trend-orange" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-live="polite"
          className="flex flex-col justify-center gap-3 rounded-[16px] border border-studio-rule bg-studio-surface p-5"
        >
          {rendering ? (
            <div className="flex items-start gap-3">
              <Loader2
                className="mt-0.5 size-6 shrink-0 animate-spin text-trend-orange"
                aria-hidden
              />
              <div>
                <p className="text-[15px] font-semibold">Rendering…</p>
                <p className="mt-0.5 text-[13.5px] text-studio-muted">
                  Captions, music and look are being burned into the video.
                </p>
              </div>
            </div>
          ) : dirty ? (
            <>
              <div>
                <p className="text-[15px] font-semibold">Unrendered changes</p>
                <p className="mt-0.5 text-[13.5px] text-studio-muted">
                  Render to see them in the video. Editor renders are free.
                </p>
              </div>
              <button type="button" onClick={render} className={`h-11 text-[15px] ${ctaButton}`}>
                <Sparkles className="size-4" aria-hidden />
                Render changes
              </button>
              <button
                type="button"
                onClick={() => applied && update(applied)}
                className={`self-center text-[13.5px] text-studio-muted underline-offset-4 hover:text-studio-text hover:underline ${focusRing}`}
              >
                Discard changes
              </button>
            </>
          ) : shown ? (
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dash-green text-on-accent">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-semibold">Ready to export</p>
                <p className="mt-0.5 text-[13.5px] text-studio-muted">
                  The video matches these settings.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-studio-muted">
              This video has no finished file in its own format yet.
            </p>
          )}
          {error && (
            <p role="alert" className="flex items-start gap-2 text-[13.5px] text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default function StudioEditorPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <ProtectedRoute>{jobId ? <Editor jobId={jobId} /> : null}</ProtectedRoute>;
}
