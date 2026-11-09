'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Sparkles, Volume2 } from 'lucide-react';
import { MusicPicker } from './MusicPicker';
import { Flag, type FlagCode } from '../Flag';
import { MUSIC_NONE, musicChoiceOf, musicPreferences } from '../../lib/finishing-rules.mjs';
import { pickedTemplate, TEMPLATE_KEY } from '../../lib/template-rules.mjs';
import {
  clampSeconds,
  DEFAULT_SECONDS,
  FORMATS,
  formatSeconds,
  LANGUAGES,
  MAX_SECONDS,
  MIN_SECONDS,
  PLATFORMS,
  platformOf,
  SECONDS_STEP,
} from '../../lib/ad-settings-rules.mjs';
import {
  TargetPlatform,
  CreativeConfig,
  CreativeConfigCreatePayload,
} from '../../lib/types/creative';

interface Props {
  productId: string;
  initialConfig?: CreativeConfig | null;
  onSubmit: (payload: CreativeConfigCreatePayload) => Promise<unknown>;
  isLoading?: boolean;
}

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

const DURATION_PRESETS = [
  { seconds: 15, label: '15s', desc: 'Short & punchy' },
  { seconds: 30, label: '30s', desc: 'Best for UGC', popular: true },
  { seconds: 60, label: '60s', desc: 'Full demo' },
];

/**
 * Modern minimalist ad delivery & style configuration form.
 * Combines horizontal and vertical layouts for an ergonomic, zero-fatigue experience:
 * - Left column: Visual format picker (2x2 ratio cards)
 * - Right column: Duration presets + Language & Platform controls
 * - Bottom: Collapsible audio settings & primary CTA
 */
export function CreativeConfigForm({
  productId,
  initialConfig,
  onSubmit,
  isLoading = false,
}: Props) {
  const [preset] = useState(() => {
    try {
      return pickedTemplate(sessionStorage.getItem(TEMPLATE_KEY), productId, !!initialConfig);
    } catch {
      return null;
    }
  });

  const [aspectRatio, setAspectRatio] = useState<string>(
    preset?.aspect_ratio || initialConfig?.aspect_ratio || '9:16',
  );
  const [seconds, setSeconds] = useState<number>(() =>
    clampSeconds(preset?.target_duration || initialConfig?.target_duration || DEFAULT_SECONDS),
  );
  const [platform, setPlatform] = useState<TargetPlatform>(
    (preset?.platform as TargetPlatform) ||
      initialConfig?.platform ||
      (platformOf(aspectRatio) as TargetPlatform),
  );
  const [language, setLanguage] = useState(initialConfig?.language || 'fr');
  const [voiceGender, setVoiceGender] = useState(
    (initialConfig?.voice_preferences?.gender as string) || 'female',
  );
  const [voiceTone, setVoiceTone] = useState(
    preset?.voice_tone ||
      (initialConfig?.voice_preferences?.tone as string) ||
      'natural and enthusiastic',
  );
  const storedMood = initialConfig?.music_preferences?.mood as string | undefined;
  const [musicMood, setMusicMood] = useState(
    preset?.music_mood || (storedMood && storedMood !== MUSIC_NONE ? storedMood : 'upbeat'),
  );
  const [musicChoice, setMusicChoice] = useState(() =>
    musicChoiceOf(initialConfig?.music_preferences),
  );

  const pickFormat = (value: string) => {
    setAspectRatio(value);
    setPlatform(platformOf(value) as TargetPlatform);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      product_id: productId,
      target_duration: seconds,
      platform,
      language,
      aspect_ratio: aspectRatio,
      voice_preferences: { tone: voiceTone.trim(), gender: voiceGender },
      music_preferences: musicPreferences(musicChoice, musicMood),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {preset && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-trend-orange/30 bg-trend-orange/[0.08] px-4 py-3 text-sm text-white backdrop-blur-sm"
        >
          <Sparkles className="size-4 shrink-0 text-trend-orange" aria-hidden />
          <span>
            Template applied: <strong className="font-semibold">{preset.name}</strong>. Check the
            options, then continue.
          </span>
        </div>
      )}

      {/* Balanced 2-column layout combining horizontal and vertical spatial design */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column: Visual Format Picker (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">1. Video format</h2>
                <p className="text-xs text-studio-muted">Pick the main aspect ratio.</p>
              </div>
              <span className="rounded-full border border-trend-orange/30 bg-trend-orange/10 px-2.5 py-1 text-xs font-bold text-trend-orange tabular-nums">
                {aspectRatio}
              </span>
            </div>

            {/* 2x2 grid of formats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {FORMATS.map((f) => {
                const on = aspectRatio === f.value;
                const is916 = f.value === '9:16';
                const scale = 36 / Math.max(f.w, f.h);

                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pickFormat(f.value)}
                    className={`group relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition-all duration-200 ${focus} ${
                      on
                        ? 'border-trend-orange bg-trend-orange/[0.08] text-white shadow-[0_0_25px_-5px_rgba(255,98,45,0.25)]'
                        : 'border-white/[0.08] bg-white/[0.01] text-studio-muted hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {is916 && (
                      <span className="absolute -top-2.5 right-2 rounded-full bg-gradient-to-r from-trend-orange to-ember-text px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black shadow-sm">
                        Recommended
                      </span>
                    )}

                    {/* Proportional wireframe frame */}
                    <div className="flex h-12 items-center justify-center py-1" aria-hidden>
                      <div
                        className={`rounded-[5px] border-2 transition-colors ${
                          on
                            ? 'border-trend-orange bg-trend-orange/20'
                            : 'border-white/20 group-hover:border-white/40'
                        }`}
                        style={{ width: Math.round(f.w * scale), height: Math.round(f.h * scale) }}
                      />
                    </div>

                    <div className="mt-2 w-full">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-bold text-white tabular-nums">{f.value}</span>
                        <span className="text-[11px] text-studio-muted font-normal">{f.label}</span>
                      </div>
                      <span className="mt-0.5 block truncate text-[10px] text-studio-muted/70">
                        {f.where}
                      </span>
                    </div>

                    {on && (
                      <span className="absolute top-2 left-2 flex size-4 items-center justify-center rounded-full bg-trend-orange text-black">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-studio-muted/80">
            9:16 gets the most engagement on TikTok, Reels and Shorts.
          </p>
        </div>

        {/* Right Column: Duration + Language & Platform (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Card 2: Target duration */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">2. Length</h2>
                <p className="text-xs text-studio-muted">Pacing and retention.</p>
              </div>
              <span className="rounded-full border border-trend-orange/30 bg-trend-orange/10 px-2.5 py-0.5 text-xs font-bold text-trend-orange tabular-nums">
                {formatSeconds(seconds)}
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              {DURATION_PRESETS.map((p) => {
                const isSelected = seconds === p.seconds;
                return (
                  <button
                    key={p.seconds}
                    type="button"
                    onClick={() => setSeconds(p.seconds)}
                    className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all ${focus} ${
                      isSelected
                        ? 'border-trend-orange bg-trend-orange/[0.08] text-white shadow-[0_0_15px_-4px_rgba(255,98,45,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.01] text-studio-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{p.label}</span>
                    <span className="text-[10px] text-studio-muted truncate max-w-full">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Range slider */}
            <div className="mt-3.5 space-y-1">
              <input
                id="cfg-duration"
                type="range"
                min={MIN_SECONDS}
                max={MAX_SECONDS}
                step={SECONDS_STEP}
                value={seconds}
                onChange={(e) => setSeconds(clampSeconds(e.target.value))}
                aria-label="Exact length in seconds"
                className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-trend-orange ${focus}`}
              />
              <div
                className="flex justify-between text-[10px] text-studio-muted/70 tabular-nums"
                aria-hidden
              >
                <span>{formatSeconds(MIN_SECONDS)}</span>
                <span>5 s steps</span>
                <span>{formatSeconds(MAX_SECONDS)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Language & platform */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm">
            <div>
              <h2 className="text-base font-bold text-white">3. Ad language</h2>
              <p className="text-xs text-studio-muted">Voice-over and captions.</p>
            </div>

            {/* Language grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => {
                const isSelected = language === l.value;
                return (
                  <button
                    key={l.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setLanguage(l.value)}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl border px-2.5 text-xs font-medium transition-all ${focus} ${
                      isSelected
                        ? 'border-trend-orange bg-trend-orange/[0.08] font-semibold text-white shadow-[0_0_12px_-3px_rgba(255,98,45,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.01] text-studio-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Flag code={l.flag as FlagCode} />
                    <span className="truncate">{l.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Synchronized Platform selector */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
              <label htmlFor="cfg-platform" className="text-studio-muted font-medium truncate">
                Optimized for:
              </label>
              <select
                id="cfg-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as TargetPlatform)}
                className={`h-8 rounded-lg border border-white/10 bg-studio-ground px-2.5 text-xs text-white transition hover:border-white/20 ${focus}`}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Audio & Music Settings (Collapsible progressive disclosure) */}
      <details className="group rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-white/[0.15]">
        <summary className="flex cursor-pointer list-none items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-trend-orange/10 text-trend-orange">
              <Volume2 className="size-4" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Voice & music</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-studio-muted">
                  Optional
                </span>
              </div>
              <p className="text-xs text-studio-muted">
                Tune the voice-over and music (you can change them later).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-studio-muted group-open:hidden md:inline-block">
              {voiceGender === 'female' ? 'Female voice' : 'Male voice'} · {musicMood}
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white/5 text-studio-muted transition-transform duration-200 group-open:rotate-180">
              <ChevronDown className="size-4" />
            </span>
          </div>
        </summary>

        <div className="mt-6 space-y-6 border-t border-white/[0.08] pt-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Voice gender */}
            <fieldset>
              <legend className="text-xs font-semibold text-white">Voice</legend>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                ].map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    aria-pressed={voiceGender === v.value}
                    onClick={() => setVoiceGender(v.value)}
                    className={`h-10 rounded-xl border text-xs font-medium transition ${focus} ${
                      voiceGender === v.value
                        ? 'border-trend-orange bg-trend-orange/10 text-white font-semibold'
                        : 'border-white/10 bg-white/[0.02] text-studio-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Voice tone */}
            <div>
              <label htmlFor="cfg-voiceTone" className="block text-xs font-semibold text-white">
                Voice tone
              </label>
              <input
                id="cfg-voiceTone"
                type="text"
                value={voiceTone}
                onChange={(e) => setVoiceTone(e.target.value)}
                maxLength={100}
                placeholder="e.g. lively, warm, persuasive"
                className={`mt-2.5 h-10 w-full rounded-xl border border-white/10 bg-studio-ground px-3 text-xs text-white placeholder:text-studio-muted/50 transition hover:border-white/20 ${focus}`}
              />
            </div>

            {/* Music mood */}
            <div>
              <label htmlFor="cfg-musicMood" className="block text-xs font-semibold text-white">
                Music mood
              </label>
              <select
                id="cfg-musicMood"
                value={musicMood}
                onChange={(e) => setMusicMood(e.target.value)}
                disabled={musicChoice === MUSIC_NONE}
                className={`mt-2.5 h-10 w-full rounded-xl border border-white/10 bg-studio-ground px-3 text-xs text-white transition hover:border-white/20 disabled:opacity-40 ${focus}`}
              >
                <option value="upbeat">Upbeat</option>
                <option value="calm">Calm</option>
                <option value="corporate">Modern / Business</option>
                <option value="dramatic">Emotional / Storytelling</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <MusicPicker value={musicChoice} onChange={setMusicChoice} />
          </div>
        </div>
      </details>

      {/* Primary CTA button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={`group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-trend-orange to-ember-text px-8 text-sm font-bold text-black shadow-[0_10px_30px_-10px_rgba(255,98,45,0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 ${focus}`}
        >
          {isLoading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Finding angles…</span>
            </>
          ) : (
            <>
              <span>Find the best ad angles</span>
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
