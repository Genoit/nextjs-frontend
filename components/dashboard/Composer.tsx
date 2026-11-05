'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Image as ImageIcon,
  Languages,
  Link2,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { focusRing, Popover } from './DashShell';
import { acceptPhotos, createHref } from '../../lib/dashboard-rules.mjs';
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../../lib/product-input-rules.mjs';
import { goToLogin, useAuth } from '../../lib/auth';
import { setPendingPhotos } from '../../lib/pending-photos';
import { SocialIcon, type Social } from '../SocialIcon';

// Both read by CreativeConfigForm as the defaults of a new ad.
const FORMAT_KEY = 'trended.outputFormat';
const LANGUAGE_KEY = 'trended.videoLanguage';

/** Formats named by where the ad runs; the ratio is what the ad studio stores. */
const FORMATS: { value: string; label: string; option: string; socials: Social[] }[] = [
  {
    value: '9:16',
    label: 'TikTok, Reels, Shorts',
    option: 'TikTok, Reels, Shorts (vertical 9:16)',
    socials: ['tiktok', 'instagram', 'youtube'],
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

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

const chip = `inline-flex h-[42px] items-center gap-2.5 rounded-[12px] border border-white/10 bg-white/[0.035] px-4 text-[14.5px] text-white transition hover:border-white/20 hover:bg-white/[0.07] ${focusRing}`;

type Photo = { file: File; url: string };

/**
 * Product link, description or photos + Generate: hands off to /product-input (link imported on
 * arrival, photos kept in memory). Shared by the dashboard and /generate.
 */
export function Composer({
  credits,
  className = 'mx-auto mt-9 max-w-[1156px]',
}: {
  credits: number | null;
  className?: string;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const field = useRef<HTMLTextAreaElement>(null);
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

  const keepChoices = () => {
    try {
      sessionStorage.setItem(FORMAT_KEY, format);
      sessionStorage.setItem(LANGUAGE_KEY, language);
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
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <form
      onSubmit={submit}
      className={`relative z-20 w-full ${className} rounded-[24px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:p-7`}
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
            e.target.value = ''; // picking the same file again still fires
          }}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={photos.length >= LIMITS.photos}
          aria-label={`Add product photos (${LIMITS.photos} max)`}
          className={`flex h-[72px] w-[72px] shrink-0 sm:h-[84px] sm:w-[90px] items-center justify-center rounded-[14px] bg-white/[0.08] text-white transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <Plus className="size-9" strokeWidth={1.4} aria-hidden />
        </button>
        <label htmlFor="composer" className="sr-only">
          Describe your product or paste its link
        </label>
        <textarea
          ref={field}
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
              className="relative size-[64px] overflow-hidden rounded-[10px] ring-1 ring-white/10"
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
          className={`${chip} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ImageIcon className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Upload Image
        </button>
        <button
          type="button"
          aria-pressed={urlMode}
          onClick={() => {
            setUrlMode(true);
            field.current?.focus();
          }}
          className={`${chip} aria-pressed:border-ember-text/50`}
        >
          <Link2 className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Product URL
        </button>
        <Link href="/products" className={chip}>
          <ShoppingBag className="size-[18px]" strokeWidth={1.6} aria-hidden />
          From Store
        </Link>
        <span aria-hidden className="mx-2 hidden h-[42px] w-px bg-white/10 xl:block" />
        <Popover
          label={`Video format: ${format}`}
          className="bottom-12 left-0 w-[300px] sm:top-12 sm:bottom-auto"
          buttonClassName={`${chip} min-w-[96px] justify-between`}
          button={
            <>
              <span className="pl-1 tabular-nums">{format}</span>
              <ChevronDown className="size-[18px]" aria-hidden />
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
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06] ${
                      f.value === format ? 'bg-white/[0.06]' : ''
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
        <label className={`${chip} relative`}>
          <span className="sr-only">Video language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <Languages className="size-[18px]" strokeWidth={1.6} aria-hidden />
          {LANGUAGES.find((l) => l.value === language)?.label}
          <ChevronDown className="size-[18px]" aria-hidden />
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
