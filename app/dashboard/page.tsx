'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronDown,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  Link2,
  Play,
  Plus,
  ShoppingBag,
  Sparkles,
  SquarePlay,
} from 'lucide-react';
import {
  DashShell,
  focusRing,
  loadEntries,
  productImage,
  Thumb,
  type Entry,
  type Load,
} from '../../components/dashboard/DashShell';
import { createHref, jobBadge, latestJob, timeAgo } from '../../lib/dashboard-rules.mjs';
import { outfit } from '../fonts';

// Both read by CreativeConfigForm as the defaults of a new ad.
const FORMAT_KEY = 'trended.outputFormat';
const LANGUAGE_KEY = 'trended.videoLanguage';

const FORMATS = ['9:16', '1:1', '16:9'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

const chip = `inline-flex h-[42px] items-center gap-2.5 rounded-[12px] border border-white/10 bg-white/[0.035] px-4 text-[14.5px] text-white transition hover:border-white/20 hover:bg-white/[0.07] ${focusRing}`;

/** The orange light of the mockup: a beam from the top right and a wide arc below it. */
function Glow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden in-data-[theme=light]:opacity-45"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 65%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 65%, transparent)',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(48%_62%_at_80%_-8%,rgb(255_107_26/0.42),transparent_72%)]" />
      <div className="absolute -top-[180px] right-[-140px] h-[260px] w-[1150px] origin-right -rotate-[34deg] rounded-full bg-[linear-gradient(90deg,transparent,rgb(255_120_40/0.55)_55%,rgb(255_150_60/0.25))] blur-[38px]" />
      <div className="absolute top-[300px] right-[-520px] size-[1150px] rounded-full bg-[radial-gradient(closest-side,transparent_95.5%,rgb(255_107_26/0.4)_99.2%,transparent_100%)] blur-[1.5px]" />
      <div className="absolute top-[300px] right-[-520px] size-[1150px] rounded-full bg-[radial-gradient(closest-side,transparent_88%,rgb(255_107_26/0.13)_99%,transparent_100%)] blur-[24px]" />
    </div>
  );
}

/** The floating orange capsule left of the headline. */
function Capsule() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[128px] left-[calc(50%-610px)] hidden h-[102px] w-[86px] -rotate-[38deg] rounded-[30px] bg-[linear-gradient(150deg,#ffad5c_0%,#f26a14_42%,#c4430a_100%)] shadow-[inset_-10px_-14px_22px_rgb(120_30_0/0.45),inset_8px_10px_16px_rgb(255_220_170/0.45),0_24px_40px_-10px_rgb(0_0_0/0.55)] 2xl:block"
    />
  );
}

function Composer() {
  const router = useRouter();
  const field = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
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
    router.push(createHref(text));
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-9 w-full max-w-[1156px] rounded-[24px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:p-7"
    >
      <div className="flex gap-4 sm:gap-6">
        <Link
          href="/product-input?mode=upload"
          onClick={keepChoices}
          aria-label="Upload a product image"
          className={`flex h-[72px] w-[72px] shrink-0 sm:h-[84px] sm:w-[90px] items-center justify-center rounded-[14px] bg-white/[0.08] text-white transition hover:bg-white/[0.13] ${focusRing}`}
        >
          <Plus className="size-9" strokeWidth={1.4} aria-hidden />
        </Link>
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
      <div className="mt-4 flex flex-wrap items-center gap-3 sm:pl-[104px] 2xl:gap-[17px]">
        <Link href="/product-input?mode=upload" onClick={keepChoices} className={chip}>
          <ImageIcon className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Upload Image
        </Link>
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
        <label className={`${chip} relative min-w-[114px] justify-between`}>
          <span className="sr-only">Video format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <span className="pl-2 tabular-nums">{format}</span>
          <ChevronDown className="size-[18px]" aria-hidden />
        </label>
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

function Promo() {
  return (
    <section className="relative h-[235px] overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#f5a00c_0%,#e8690e_42%,#c94a0a_100%)] text-on-ember">
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 hidden w-[242px] sm:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, #000 22%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 22%)',
        }}
      >
        <Image
          src="/dashboard/promo-phone.png"
          alt=""
          fill
          sizes="242px"
          className="object-cover"
        />
      </div>
      <div className="relative flex h-full max-w-[350px] flex-col justify-center px-[30px]">
        <span className="w-fit rounded-full bg-[#fde9c9] px-2.5 py-0.5 text-[13px] font-medium text-[#3b1d06]">
          New
        </span>
        <h2 className="mt-2.5 text-[25px] leading-tight font-bold tracking-[-0.01em]">
          Create. Convert. Grow.
        </h2>
        <p className="mt-1.5 text-[17px] leading-[1.35] text-[#fff3e8]">
          Your all-in-one solution for AI-powered UGC videos.
        </p>
        <Link
          href="/#how-it-works"
          className={`mt-4 inline-flex h-[42px] w-fit items-center gap-2.5 rounded-full bg-on-ember px-[18px] text-[15px] font-semibold text-[#5a1f04] shadow-[0_6px_16px_-6px_rgb(80_20_0/0.5)] transition hover:bg-[#fff4ea] ${focusRing}`}
        >
          Watch demo
          <Play className="size-3.5" fill="currentColor" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function CardHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[20px] font-medium text-white">{title}</h2>
      <Link
        href={href}
        className={`inline-flex items-center gap-1.5 rounded-md text-[15px] text-dash-soft transition hover:text-white ${focusRing}`}
      >
        See all
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

const card =
  'rounded-[18px] border border-white/[0.08] bg-dash-panel/80 px-[25px] pt-[22px] pb-4 backdrop-blur-sm';

function QuickActions() {
  const actions = [
    {
      title: 'Create UGC Video',
      sub: 'Turn a product into a video',
      href: '/product-input',
      Icon: SquarePlay,
      tile: 'bg-[linear-gradient(150deg,#e2661c,#a83a0a)]',
    },
    {
      title: 'Browse Templates',
      sub: 'Explore proven styles',
      href: '/templates',
      Icon: LayoutTemplate,
      tile: 'bg-[linear-gradient(150deg,#7c5cf0,#4f36b8)]',
    },
  ];
  return (
    <section className={card}>
      <CardHead title="Quick Actions" href="/templates" />
      <ul className="mt-3">
        {actions.map(({ title, sub, href, Icon, tile }) => (
          <li key={href}>
            <Link
              href={href}
              className={`-mx-2 flex items-center gap-6 rounded-[12px] px-2 py-2 transition hover:bg-white/[0.04] ${focusRing}`}
            >
              <span
                className={`flex size-[50px] shrink-0 items-center justify-center rounded-[12px] text-on-ember ${tile}`}
              >
                <Icon className="size-6" strokeWidth={1.7} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[16.5px] font-medium text-white">{title}</span>
                <span className="mt-0.5 block truncate text-[14.5px] text-dash-soft/80">{sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const BADGE: Record<string, { label: string; cls: string }> = {
  ready: { label: 'Ready', cls: 'bg-dash-green/15 text-dash-green' },
  idle: { label: 'Draft', cls: 'bg-white/[0.07] text-dash-soft' },
  active: { label: 'Rendering', cls: 'bg-warning/15 text-warning' },
  simulated: { label: 'Simulated', cls: 'bg-white/[0.07] text-dash-soft' },
  failed: { label: 'Failed', cls: 'bg-danger/15 text-danger' },
};

function ProjectRow({ entry, now }: { entry: Entry; now: Date }) {
  const { product, jobs } = entry;
  const job = jobs ? latestJob(jobs) : null;
  const tone = jobs === null ? 'idle' : jobBadge(job).tone;
  const badge = BADGE[tone];
  const when = job?.completed_at || job?.created_at || product.updated_at || product.created_at;
  return (
    <li>
      <Link
        href={job ? `/products/${product.id}/creative` : `/products/${product.id}`}
        className={`-mx-2 flex items-center gap-6 rounded-[12px] px-2 py-1.5 transition hover:bg-white/[0.04] ${focusRing}`}
      >
        <Thumb
          src={job?.thumbnail_url || productImage(product)}
          className="h-[66px] w-[110px] rounded-[10px] bg-white"
          iconSize="size-6"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16.5px] font-medium text-white">
            {product.title}
          </span>
          {when && (
            <span className="mt-1 block text-[14.5px] text-dash-soft/80">{timeAgo(when, now)}</span>
          )}
        </span>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[13.5px] ${badge.cls}`}>
          {badge.label}
        </span>
      </Link>
    </li>
  );
}

function RecentProjects({ load, retry }: { load: Load; retry: () => void }) {
  const now = new Date();
  return (
    <section className={card}>
      <CardHead title="Recent Projects" href="/projects" />
      {load.state === 'loading' ? (
        <ul aria-hidden className="mt-4 space-y-3">
          {[0, 1].map((i) => (
            <li key={i} className="h-[66px] animate-pulse rounded-[10px] bg-white/[0.04]" />
          ))}
        </ul>
      ) : load.state === 'error' ? (
        <p className="mt-6 text-[14px] text-dash-soft">
          Your projects could not be loaded.{' '}
          <button type="button" onClick={retry} className="text-ember-text hover:underline">
            Retry
          </button>
        </p>
      ) : load.entries.length === 0 ? (
        <Link
          href="/product-input"
          className={`mt-4 flex h-[140px] items-center justify-center rounded-[12px] px-4 text-center border border-dashed border-white/15 text-[14.5px] text-dash-soft transition hover:text-white ${focusRing}`}
        >
          Add your first product: your projects appear here.
        </Link>
      ) : (
        <ul className="mt-3 space-y-1">
          {load.entries.slice(0, 2).map((entry) => (
            <ProjectRow key={entry.product.id} entry={entry} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });

  useEffect(() => {
    let alive = true;
    loadEntries(2).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const retry = () => {
    setLoad({ state: 'loading' });
    loadEntries(2).then(setLoad);
  };

  return (
    <DashShell backdrop={<Glow />}>
      <main className="relative px-5 pb-10 md:pr-12 md:pl-[46px]">
        <section className="relative -mt-3.5 text-center">
          <Capsule />
          <Link
            href="/product-input"
            className={`inline-flex h-10 items-center gap-2 rounded-full border border-ember-text/70 bg-ember-deep/15 px-5 text-[14.5px] text-[#ffc59a] transition hover:bg-ember-deep/30 in-data-[theme=light]:text-ember-text ${focusRing}`}
          >
            AI-Powered Creative Studio
            <Sparkles className="size-4 text-coin" fill="currentColor" aria-hidden />
          </Link>
          <h1
            className={`${outfit.className} mx-auto mt-5 max-w-[760px] text-[40px] leading-[1.1] font-normal tracking-[-0.005em] text-balance text-white sm:text-[52px] lg:text-[64px]`}
          >
            Turn your products into scroll-stopping{' '}
            <span className="font-script text-[1.12em] font-bold text-trend-orange italic">
              UGC.
            </span>
          </h1>
          <p className="mt-2 text-[18px] text-white/90 sm:text-[21px]">
            Create authentic product videos with AI in minutes.
          </p>
        </section>

        <Composer />

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-7 lg:grid-cols-2 2xl:grid-cols-[1.2fr_1fr_1.14fr]">
          <Promo />
          <QuickActions />
          <RecentProjects load={load} retry={retry} />
        </div>
      </main>
    </DashShell>
  );
}
