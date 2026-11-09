'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Clock,
  Image as ImageIcon,
  Link2,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { focusRing, Popover } from './DashShell';
import { acceptPhotos, createHref } from '../../lib/dashboard-rules.mjs';
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../../lib/product-input-rules.mjs';
import { goToLogin, useAuth } from '../../lib/auth';
import { setPendingPhotos } from '../../lib/pending-photos';
import { SocialIcon, type Social } from '../SocialIcon';
import { Flag, type FlagCode } from '../Flag';
import {
  AD_SETTINGS_KEY,
  clampSeconds,
  DEFAULT_SECONDS,
  formatSeconds,
  LANGUAGES,
  MAX_SECONDS,
  MIN_SECONDS,
  SECONDS_STEP,
} from '../../lib/ad-settings-rules.mjs';

/** Formats named by where the ad runs; the ratio is what the ad studio stores. */
const FORMATS: { value: string; label: string; option: string; socials: Social[] }[] = [
  {
    value: '9:16',
    label: 'TikTok, Reels, Shorts',
    option: 'TikTok, Reels, Shorts (vertical 9:16)',
    socials: ['tiktok', 'instagram', 'youtube'],
  },
  {
    value: '4:5',
    label: 'Instagram, Facebook feed',
    option: 'Instagram and Facebook feed (portrait 4:5)',
    socials: ['instagram', 'facebook'],
  },
  {
    value: '1:1',
    label: 'Instagram, Facebook feed',
    option: 'Instagram and Facebook feed (square 1:1)',
    socials: ['instagram', 'facebook'],
  },
  {
    value: '16:9',
    label: 'YouTube, Facebook',
    option: 'YouTube and Facebook (wide 16:9)',
    socials: ['youtube', 'facebook'],
  },
];

type Photo = { file: File; url: string };

const heroChip = `inline-flex h-[42px] items-center gap-2.5 rounded-[12px] border border-dash-edge bg-dash-raised/70 px-4 text-[14.5px] text-white transition hover:border-dash-edge-strong hover:bg-dash-raised backdrop-blur-md ${focusRing}`;

/**
 * Product link, description or photos + Generate: hands off to /product-input (link imported on
 * arrival, photos kept in memory). Shared by the dashboard and /generate.
 */
export function Composer({
  credits,
  className = 'mx-auto mt-9 max-w-[1156px]',
  compact = false,
}: {
  credits: number | null;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const previews = useRef<string[]>([]);
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const addPhotos = (list: FileList | null) => {
    if (!list?.length) return;
    const { accepted, errors } = acceptPhotos(photos.length, Array.from(list));
    const added = accepted.map((file) => ({ file, url: URL.createObjectURL(file) }));
    previews.current.push(...added.map((p) => p.url));
    setPhotos((prev) => [...prev, ...added]);
    setPhotoErrors(errors);
  };
  const removePhoto = (url: string) => {
    URL.revokeObjectURL(url);
    previews.current = previews.current.filter((u) => u !== url);
    setPhotos((prev) => prev.filter((p) => p.url !== url));
    setPhotoErrors([]);
  };
  const openPicker = () => picker.current?.click();
  const [urlMode, setUrlMode] = useState(false);
  const [format, setFormat] = useState('9:16');
  const [language, setLanguage] = useState('en');
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);

  // Read once by the ad studio: with all three known it skips its setup step.
  const keepChoices = () => {
    try {
      sessionStorage.setItem(
        AD_SETTINGS_KEY,
        JSON.stringify({ format, language, duration: seconds }),
      );
    } catch {
      // storage blocked: the ad studio falls back to its defaults
    }
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    keepChoices();
    const href = text.trim() || !photos.length ? createHref(text) : '/product-input?mode=upload';
    setPendingPhotos(photos.map((p) => p.file));
    if (!isAuthenticated) {
      goToLogin(router, href); // back to this product once signed in
      return;
    }
    // Free plan has 0 credits and the shortest ad costs 1: plans first, before any work is lost.
    if (credits !== null && credits < 1) {
      router.push('/billing');
      return;
    }
    router.push(href);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  // ---------------------------------------------------------------- COMPACT MODE (e.g. /generate)
  if (compact) {
    return (
      <form onSubmit={submit} className={`relative z-20 w-full ${className}`}>
        <input
          ref={picker}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Floating photo previews above the dock bar */}
        {photos.length > 0 && (
          <div className="mb-2 flex items-center gap-2 overflow-x-auto rounded-2xl border border-dash-edge bg-dash-panel/90 px-3 py-1.5 shadow-float backdrop-blur-xl">
            <span className="text-[12px] font-medium text-dash-soft tabular-nums shrink-0">
              {photos.length}/{LIMITS.photos} photos:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {photos.map((p, i) => (
                <div
                  key={p.url}
                  className="relative size-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-dash-edge"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.url)}
                    className={`absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 hover:opacity-100 transition ${focusRing}`}
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={openPicker}
              disabled={photos.length >= LIMITS.photos}
              className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-dash-soft hover:text-white hover:bg-dash-raised transition ${focusRing}`}
            >
              <Plus className="size-3" /> Add
            </button>
          </div>
        )}

        {photoErrors.length > 0 && (
          <div className="mb-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-1.5 text-[12px] text-danger backdrop-blur-md">
            {photoErrors.join(' · ')}
          </div>
        )}

        {/* Minimal Single-Line Glassmorphism Capsule Bar */}
        <div className="flex h-[48px] sm:h-[50px] w-full items-center gap-2 rounded-full border border-dash-edge bg-dash-panel/85 p-1.5 shadow-float backdrop-blur-2xl transition-all focus-within:border-ember-text/60 focus-within:ring-2 focus-within:ring-ember-text/20">
          <button
            type="button"
            onClick={openPicker}
            disabled={photos.length >= LIMITS.photos}
            aria-label={`Add product photos (${LIMITS.photos} max)`}
            title="Add product photos or images"
            className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border border-dash-edge bg-dash-raised/70 text-dash-soft transition hover:bg-dash-raised hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            <Plus className="size-4" strokeWidth={2} aria-hidden />
          </button>

          <label htmlFor="composer-compact" className="sr-only">
            Paste product link or describe product
          </label>
          <input
            ref={inputRef}
            id="composer-compact"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={
              urlMode
                ? 'Paste product URL…'
                : 'Paste product link (Shopify, Amazon) or describe it…'
            }
            className="min-w-0 flex-1 bg-transparent px-2 text-[14px] text-white caret-ember-text placeholder:text-dash-soft/60 outline-none"
          />

          <Popover
            label={`Video settings: ${format}, ${formatSeconds(seconds)}, ${LANGUAGES.find((l) => l.value === language)?.label}`}
            className="bottom-full mb-3 right-0 w-[290px] border border-dash-edge bg-dash-panel/95 p-3.5 shadow-menu backdrop-blur-2xl"
            buttonClassName={`hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-dash-edge bg-dash-raised/70 px-2.5 text-[12px] font-medium text-dash-soft transition hover:bg-dash-raised hover:text-white shrink-0 ${focusRing}`}
            button={
              <>
                <SlidersHorizontal className="size-3 text-dash-soft" aria-hidden />
                <span className="tabular-nums font-semibold">{format}</span>
                <span className="text-dash-soft/40">·</span>
                <span className="tabular-nums">{formatSeconds(seconds)}</span>
                <ChevronDown className="size-3 text-dash-soft" aria-hidden />
              </>
            }
          >
            {(close) => (
              <div className="space-y-3.5">
                <div>
                  <span className="block text-[11px] font-semibold tracking-wider text-dash-soft uppercase">
                    Aspect ratio
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {FORMATS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormat(f.value)}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition ${
                          f.value === format
                            ? 'border-ember-text/60 bg-ember-text/10 text-white font-medium'
                            : 'border-dash-edge bg-dash-raised/50 text-dash-soft hover:bg-dash-raised hover:text-white'
                        } ${focusRing}`}
                      >
                        <span className="font-semibold tabular-nums">{f.value}</span>
                        <span className="truncate text-[11px] text-dash-soft">
                          {f.label.split(',')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold tracking-wider text-dash-soft uppercase">
                      Duration
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      {formatSeconds(seconds)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_SECONDS}
                    max={MAX_SECONDS}
                    step={SECONDS_STEP}
                    value={seconds}
                    onChange={(e) => setSeconds(clampSeconds(e.target.value))}
                    className={`mt-1.5 w-full cursor-pointer accent-ember-text ${focusRing}`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-dash-edge pt-2.5">
                  <label
                    className={`relative flex h-7 items-center gap-1.5 rounded-md border border-dash-edge bg-dash-raised/60 px-2 text-[12px] text-dash-soft hover:text-white cursor-pointer ${focusRing}`}
                  >
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value} className="bg-dash-panel text-white">
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <Flag
                      code={(LANGUAGES.find((l) => l.value === language)?.flag ?? 'gb') as FlagCode}
                    />
                    <span>{LANGUAGES.find((l) => l.value === language)?.label}</span>
                    <ChevronDown className="size-3" aria-hidden />
                  </label>

                  <Link
                    href="/products"
                    onClick={close}
                    className={`flex h-7 items-center gap-1.5 rounded-md border border-dash-edge bg-dash-raised/60 px-2 text-[12px] text-dash-soft hover:text-white ${focusRing}`}
                  >
                    <ShoppingBag className="size-3" aria-hidden />
                    <span>From Store</span>
                  </Link>
                </div>
              </div>
            )}
          </Popover>

          <button
            type="submit"
            className={`inline-flex h-8 sm:h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-cta-top to-cta-bottom px-4 sm:px-5 text-[13px] font-semibold text-on-ember shadow-sm transition hover:brightness-110 active:scale-95 ${focusRing}`}
          >
            <Sparkles className="size-3.5" fill="currentColor" aria-hidden />
            <span>Generate</span>
          </button>
        </div>
      </form>
    );
  }

  // ---------------------------------------------------------------- HERO MODE (e.g. /dashboard)
  return (
    <form
      onSubmit={submit}
      className={`relative z-20 w-full ${className} rounded-[24px] border border-dash-edge bg-dash-panel/80 p-5 shadow-float backdrop-blur-2xl sm:p-7`}
    >
      <div className="flex gap-4 sm:gap-6">
        <input
          ref={picker}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={photos.length >= LIMITS.photos}
          aria-label={`Add product photos (${LIMITS.photos} max)`}
          className={`flex h-[72px] w-[72px] shrink-0 sm:h-[84px] sm:w-[90px] items-center justify-center rounded-[14px] border border-dash-edge bg-dash-raised/70 text-white transition hover:bg-dash-raised disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <Plus className="size-9" strokeWidth={1.4} aria-hidden />
        </button>
        <label htmlFor="composer" className="sr-only">
          Describe your product or paste its link
        </label>
        <textarea
          ref={textareaRef}
          id="composer"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder={
            urlMode ? 'Paste your product URL…' : 'Describe your product, or upload an image…'
          }
          className="min-w-0 flex-1 resize-none bg-transparent pt-1 text-[16px] sm:pt-4 sm:text-[18px] text-white caret-ember-text outline-none placeholder:text-dash-soft/80"
        />
      </div>
      {photos.length > 0 && (
        <ul
          aria-label="Product photos"
          className="mt-4 flex flex-wrap items-center gap-3 sm:pl-[114px]"
        >
          {photos.map((p, i) => (
            <li
              key={p.url}
              className="relative size-[64px] overflow-hidden rounded-[10px] ring-1 ring-dash-edge"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img
                src={p.url}
                alt={`Photo ${i + 1}: ${p.file.name}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(p.url)}
                aria-label={`Remove ${p.file.name}`}
                className={`absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-danger ${focusRing}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
          <li className="text-[13.5px] text-dash-soft tabular-nums">
            {photos.length}/{LIMITS.photos} photos · front, side and in use give the best render
          </li>
        </ul>
      )}
      {photoErrors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-0.5 text-[13.5px] text-danger sm:pl-[114px]">
          {photoErrors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 sm:pl-[104px] 2xl:gap-[17px]">
        <button
          type="button"
          onClick={openPicker}
          disabled={photos.length >= LIMITS.photos}
          className={`${heroChip} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ImageIcon className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Upload Image
        </button>
        <button
          type="button"
          aria-pressed={urlMode}
          onClick={() => {
            setUrlMode(true);
            textareaRef.current?.focus();
          }}
          className={`${heroChip} aria-pressed:border-ember-text/50`}
        >
          <Link2 className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Product URL
        </button>
        <Link href="/products" className={heroChip}>
          <ShoppingBag className="size-[18px]" strokeWidth={1.6} aria-hidden />
          From Store
        </Link>
        <span aria-hidden className="mx-2 hidden h-[42px] w-px bg-dash-edge xl:block" />
        <Popover
          label={`Video format: ${format}`}
          className="bottom-12 left-0 w-[300px] border border-dash-edge bg-dash-panel/95 backdrop-blur-2xl shadow-menu sm:top-12 sm:bottom-auto"
          buttonClassName={`${heroChip} min-w-[96px] justify-between`}
          button={
            <>
              <span className="pl-1 tabular-nums">{format}</span>
              <ChevronDown className="size-[18px] text-dash-soft" aria-hidden />
            </>
          }
        >
          {(close) => (
            <ul role="listbox" aria-label="Video format">
              {FORMATS.map((f) => (
                <li key={f.value} role="option" aria-selected={f.value === format}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormat(f.value);
                      close();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-dash-raised ${
                      f.value === format ? 'bg-dash-raised' : ''
                    } ${focusRing}`}
                  >
                    <span className="w-10 text-[14.5px] font-semibold text-white tabular-nums">
                      {f.value}
                    </span>
                    <span className="flex -space-x-1.5">
                      {f.socials.map((n) => (
                        <SocialIcon key={n} name={n} mono />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-dash-soft">
                      {f.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover>
        <Popover
          label={`Video length: ${formatSeconds(seconds)}`}
          className="bottom-12 left-0 w-[280px] p-4 border border-dash-edge bg-dash-panel/95 backdrop-blur-2xl shadow-menu sm:top-12 sm:bottom-auto"
          buttonClassName={`${heroChip} min-w-[96px] justify-between`}
          button={
            <>
              <Clock className="size-[18px] text-dash-soft" strokeWidth={1.6} aria-hidden />
              <span className="tabular-nums">{formatSeconds(seconds)}</span>
              <ChevronDown className="size-[18px] text-dash-soft" aria-hidden />
            </>
          }
        >
          {() => (
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="composer-length" className="text-[13px] text-dash-soft">
                  Video length
                </label>
                <output
                  htmlFor="composer-length"
                  className="text-lg font-semibold text-white tabular-nums"
                >
                  {formatSeconds(seconds)}
                </output>
              </div>
              <input
                id="composer-length"
                type="range"
                min={MIN_SECONDS}
                max={MAX_SECONDS}
                step={SECONDS_STEP}
                value={seconds}
                onChange={(e) => setSeconds(clampSeconds(e.target.value))}
                aria-valuetext={formatSeconds(seconds)}
                className={`mt-3 w-full cursor-pointer accent-ember-text ${focusRing}`}
              />
              <div
                className="mt-1.5 flex justify-between text-[12px] text-studio-meta tabular-nums"
                aria-hidden
              >
                <span>{formatSeconds(MIN_SECONDS)}</span>
                <span>{formatSeconds(MAX_SECONDS)}</span>
              </div>
            </div>
          )}
        </Popover>
        <label className={`${heroChip} relative cursor-pointer`}>
          <span className="sr-only">Video language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="bg-dash-panel text-white">
                {l.label}
              </option>
            ))}
          </select>
          <Flag code={(LANGUAGES.find((l) => l.value === language)?.flag ?? 'gb') as FlagCode} />
          {LANGUAGES.find((l) => l.value === language)?.label}
          <ChevronDown className="size-[18px] text-dash-soft" aria-hidden />
        </label>
        <button
          type="submit"
          className={`inline-flex h-[46px] w-full items-center justify-center gap-3 rounded-[12px] bg-gradient-to-b from-cta-top to-cta-bottom px-8 text-[16.5px] font-semibold text-on-ember shadow-[0_10px_28px_-10px_rgb(238_106_31/0.7),inset_0_1px_0_rgb(255_255_255/0.18)] transition hover:brightness-110 active:scale-[0.98] sm:ml-auto sm:w-auto ${focusRing}`}
        >
          <Sparkles className="size-5" fill="currentColor" aria-hidden />
          Generate
        </button>
      </div>
    </form>
  );
}
