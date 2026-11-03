'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  CirclePlay,
  Clock3,
  Database,
  Film,
  ImageUp,
  Link2,
  Monitor,
  Package,
  PenLine,
  Smartphone,
  Sparkles,
  Square,
  Zap,
} from 'lucide-react';
import type { BillingSummary } from '../../lib/api/billing';
import type { VideoGenerationJob } from '../../lib/types/creative';
import {
  DashShell,
  focusRing,
  loadEntries,
  productImage,
  RowMenu,
  Thumb,
  type Entry,
  type Load,
} from '../../components/dashboard/DashShell';
import {
  createHref,
  durationText,
  jobBadge,
  latestJob,
  monthStats,
  timeAgo,
} from '../../lib/dashboard-rules.mjs';

// shortcut: jobs are fetched per product (N+1) for the 12 most recent products, so the month
// stats only count those; add a user-wide jobs endpoint when users have more products.
const RECENT_LIMIT = 12;
// Read by CreativeConfigForm as its default aspect ratio.
const FORMAT_KEY = 'trended.outputFormat';

const FORMATS = [
  { value: '9:16', label: '9:16 Vertical', Icon: Smartphone },
  { value: '1:1', label: '1:1 Square', Icon: Square },
  { value: '16:9', label: '16:9 Landscape', Icon: Monitor },
];

const STATUS_DOT: Record<string, string> = {
  ready: 'text-dash-green',
  simulated: 'text-studio-muted',
  active: 'text-warning',
  failed: 'text-danger',
  idle: 'text-studio-meta',
};
const NOT_A_TAG = ['null', 'unknown', 'generic', 'manual', 'custom', 'other'];

const formatOf = (job: VideoGenerationJob | null) => job?.exports?.[0]?.aspect_ratio ?? null;

function Hero({ empty }: { empty: boolean }) {
  return (
    <section className="relative">
      {/* The studio picture bleeds right and fades into the ground on its left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 hidden h-[176px] w-[52%] md:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, #000 30%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 30%)',
        }}
      >
        <Image
          src="/studio-hero.jpg"
          alt=""
          fill
          priority
          sizes="54vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dash-ground to-transparent" />
      </div>
      <div className="relative px-5 pt-3 pb-[22px] lg:px-9">
        <h1 className="text-[34px] leading-[1.1] font-bold tracking-[-0.03em] text-white sm:text-[42px]">
          Turn products into ads.
        </h1>
        <p className="mt-2.5 text-[15px] text-[#a8a8a8] sm:text-[16px]">
          Create cinematic product videos that make people stop scrolling.
        </p>
        <Link
          href="/product-input"
          className={`mt-6 inline-flex h-[42px] items-center gap-2.5 rounded-[9px] bg-gradient-to-b from-[#a2300a] to-ember-deep px-5 text-[14.5px] font-semibold text-white shadow-[0_0_28px_rgb(184_56_8/0.35),inset_0_1px_0_rgb(255_255_255/0.12)] transition hover:brightness-110 active:scale-[0.98] ${focusRing}`}
        >
          <Sparkles className="size-[18px]" aria-hidden />
          {empty ? 'Create your first ad' : 'Create a new ad'}
        </Link>
      </div>
    </section>
  );
}

function CreatePanel() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [format, setFormat] = useState('9:16');
  const FormatIcon = FORMATS.find((f) => f.value === format)?.Icon ?? Smartphone;
  const keepFormat = () => {
    try {
      sessionStorage.setItem(FORMAT_KEY, format);
    } catch {
      // storage blocked: the ad studio falls back to 9:16
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    keepFormat();
    router.push(createHref(link));
  };
  return (
    <form
      onSubmit={submit}
      className="grid gap-6 rounded-[14px] border border-dash-line bg-dash-panel px-[22px] py-4 lg:grid-cols-[minmax(0,1fr)_auto_182px_minmax(240px,280px)] lg:items-center lg:gap-x-[30px]"
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-white">Create a product ad</h2>
        <p className="mt-1 text-[11.5px] text-studio-muted">
          From product image or URL to cinematic video.
        </p>
        <div className="mt-3.5 flex gap-2">
          <span
            className="flex size-[43px] shrink-0 items-center justify-center rounded-[9px] border border-[#2a2a2a] bg-dash-raised text-studio-muted"
            aria-hidden
          >
            <Link2 className="size-[18px]" />
          </span>
          <label htmlFor="product-link" className="sr-only">
            Product page link
          </label>
          <input
            id="product-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste your product URL..."
            className="h-[43px] min-w-0 flex-1 rounded-[9px] border border-[#2a2a2a] bg-dash-raised px-3.5 text-[13px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60"
          />
        </div>
        <Link
          href="/product-input?mode=manual"
          onClick={keepFormat}
          className={`mt-3.5 inline-flex items-center gap-2.5 rounded-md text-[13px] text-[#d4d4d4] transition hover:text-white ${focusRing}`}
        >
          <PenLine className="size-4" aria-hidden />
          Enter product details manually
        </Link>
      </div>

      <div
        className="relative hidden h-full min-h-[120px] items-center justify-center lg:flex"
        aria-hidden
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-dash-line" />
        <span className="relative flex size-8 items-center justify-center rounded-full border border-dash-line bg-dash-panel text-[10.5px] text-studio-muted">
          OR
        </span>
      </div>

      <Link
        href="/product-input"
        onClick={keepFormat}
        className={`flex h-[100px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#3a3a3a] bg-white/[0.015] text-[12.5px] text-[#cfcfcf] transition hover:border-[#555] hover:text-white ${focusRing}`}
      >
        <ImageUp className="size-6 text-studio-muted" strokeWidth={1.5} aria-hidden />
        Upload product image
      </Link>

      <div className="flex flex-col gap-3">
        <label htmlFor="output-format" className="text-[14px] font-medium text-white">
          Output format
        </label>
        <div className="relative">
          <FormatIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-studio-muted"
            aria-hidden
          />
          <select
            id="output-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-[43px] w-full appearance-none rounded-[9px] border border-[#2a2a2a] bg-dash-raised pr-10 pl-10 text-[13px] text-white outline-none focus:border-ember-text/60"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-studio-muted"
            aria-hidden
          />
        </div>
        <button
          type="submit"
          className={`inline-flex h-[43px] items-center justify-center gap-2.5 rounded-[9px] bg-ember text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] transition hover:bg-ember-strong active:scale-[0.99] ${focusRing}`}
        >
          <Sparkles className="size-[18px]" aria-hidden />
          Generate ad
        </button>
      </div>
    </form>
  );
}

function ProductCard({ entry }: { entry: Entry }) {
  const job = entry.jobs ? latestJob(entry.jobs) : null;
  const badge = entry.jobs === null ? { tone: 'idle', label: 'Status unavailable' } : jobBadge(job);
  const format = formatOf(job);
  const tags = [entry.product.category, entry.product.brand, entry.product.source_platform]
    .filter((t) => t && !NOT_A_TAG.includes(String(t)))
    .join(' · ');
  return (
    <li className="overflow-hidden rounded-[12px] border border-dash-line bg-[#111]">
      <Link href={`/products/${entry.product.id}`} className={`group relative block ${focusRing}`}>
        <Thumb
          src={job?.thumbnail_url || productImage(entry.product)}
          className="h-[148px] w-full transition duration-500 group-hover:brightness-110"
          iconSize="size-8"
        />
        {format && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/60 px-1.5 py-0.5 text-[11.5px] text-white tabular-nums">
            <Film className="size-3" aria-hidden />
            {format}
          </span>
        )}
      </Link>
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-2">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2">
            <Link
              href={`/products/${entry.product.id}`}
              className="truncate text-[12.5px] font-semibold text-white hover:underline"
            >
              {entry.product.title}
            </Link>
            <span
              className={`inline-flex shrink-0 items-center gap-1 text-[10.5px] ${STATUS_DOT[badge.tone]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {badge.label}
            </span>
          </p>
          <p className="mt-1 truncate text-[10.5px] text-studio-meta capitalize">
            {tags || 'No category'}
          </p>
        </div>
        <div className="mt-0.5 text-studio-muted">
          <RowMenu product={entry.product} up />
        </div>
      </div>
    </li>
  );
}

function LatestProducts({ load, retry }: { load: Load; retry: () => void }) {
  return (
    <section aria-labelledby="products-title" className="min-w-0">
      <h2
        id="products-title"
        className="flex items-center gap-2 text-[14px] font-semibold text-white"
      >
        <Sparkles className="size-4 text-coin" fill="currentColor" aria-hidden />
        Your latest products
      </h2>
      {load.state === 'loading' ? (
        <ul aria-hidden className="mt-3 grid gap-[13px] sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[205px] animate-pulse rounded-[12px] bg-white/[0.03]" />
          ))}
        </ul>
      ) : load.state === 'error' ? (
        <p className="mt-3 text-[13px] text-studio-muted">
          Your products could not be loaded.{' '}
          <button type="button" onClick={retry} className="text-ember-text hover:underline">
            Retry
          </button>
        </p>
      ) : load.entries.length === 0 ? (
        <Link
          href="/product-input"
          className="mt-3 flex h-[205px] flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#333] text-[13px] text-studio-muted transition hover:text-white"
        >
          <Package className="size-7" strokeWidth={1.25} aria-hidden />
          Add your first product: its card appears here.
        </Link>
      ) : (
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-[13px] sm:grid-cols-3">
          {load.entries.slice(0, 3).map((entry) => (
            <ProductCard key={entry.product.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentCreations({ load }: { load: Load }) {
  const now = new Date();
  const rows =
    load.state === 'ready'
      ? load.entries
          .flatMap(({ product, jobs }) => (jobs ?? []).map((job) => ({ product, job })))
          .sort((a, b) => Date.parse(b.job.created_at) - Date.parse(a.job.created_at))
          .slice(0, 3)
      : [];
  return (
    <section
      aria-labelledby="recent-title"
      className="rounded-[14px] border border-dash-line bg-[#151515] px-[18px] pt-3.5 pb-1.5"
    >
      <div className="flex items-center justify-between border-b border-dash-line pb-2.5">
        <h2 id="recent-title" className="text-[14.5px] font-medium text-white">
          Recent creations
        </h2>
        <Link href="/projects" className="text-[12.5px] text-ember-text hover:underline">
          View all
        </Link>
      </div>
      {load.state === 'loading' ? (
        <ul aria-hidden className="space-y-2 py-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[50px] animate-pulse rounded-lg bg-white/[0.03]" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-studio-meta">No ad generated yet.</p>
      ) : (
        <ul>
          {rows.map(({ product, job }) => {
            const badge = jobBadge(job);
            const format = formatOf(job);
            const ready = badge.tone === 'ready';
            const done = ready || badge.tone === 'simulated';
            return (
              <li key={job.id} className="flex items-center gap-3.5 py-[5px]">
                <Link
                  href={`/products/${product.id}/creative`}
                  className={`shrink-0 rounded-md ${focusRing}`}
                >
                  <Thumb
                    src={job.thumbnail_url || productImage(product)}
                    className="h-[48px] w-[65px] rounded-md"
                    iconSize="size-4"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.id}/creative`}
                    className="block truncate text-[12.5px] font-semibold text-white hover:underline"
                  >
                    {product.title}
                  </Link>
                  {format && (
                    <p className="text-[11.5px] text-studio-muted tabular-nums">{format}</p>
                  )}
                  <p
                    className={`mt-0.5 flex items-center gap-1.5 text-[11.5px] ${ready ? 'text-[#d4d4d4]' : STATUS_DOT[badge.tone]}`}
                  >
                    {done ? (
                      <CheckCircle2
                        className={`size-3.5 ${ready ? 'text-dash-green' : 'text-studio-muted'}`}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" aria-hidden />
                    )}
                    {ready ? 'Completed' : badge.label}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-studio-muted">
                  {timeAgo(job.completed_at || job.created_at, now)}
                </span>
                <span className="shrink-0 text-studio-muted">
                  <RowMenu product={product} up />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Stat({
  Icon,
  label,
  value,
  sub,
  subTone = 'text-studio-muted',
}: {
  Icon: typeof Clock3;
  label: string;
  value: string;
  sub: string;
  subTone?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 lg:px-6">
      <Icon className="size-[26px] shrink-0 text-studio-muted" strokeWidth={1.3} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-[11.5px] text-studio-muted">{label}</p>
        <p className="mt-0.5 text-[19px] font-semibold text-white tabular-nums">{value}</p>
        <p className={`truncate text-[11px] ${subTone}`}>{sub}</p>
      </div>
    </div>
  );
}

function Stats({
  load,
  summary,
  total,
}: {
  load: Load;
  summary: BillingSummary | null;
  total: number | null;
}) {
  const jobs = load.state === 'ready' ? load.entries.flatMap((e) => e.jobs ?? []) : [];
  const s = monthStats(jobs, new Date());
  const ready = load.state === 'ready';
  const count = (n: number) => (ready ? String(n) : '…');
  // shortcut: credits used = plan allowance minus balance; wrong once top-ups exist, swap for a
  // usage endpoint then.
  const used = summary && total ? Math.max(0, total - summary.credits) : null;
  return (
    <section
      aria-label="This month"
      className="grid grid-cols-2 divide-dash-line rounded-[14px] border border-dash-line bg-dash-panel sm:grid-cols-3 lg:grid-cols-5 lg:divide-x"
    >
      <Stat
        Icon={CirclePlay}
        label="Videos generated"
        value={count(s.generated)}
        sub="This month"
      />
      <Stat
        Icon={Clock3}
        label="Rendering"
        value={count(s.rendering)}
        sub={s.rendering > 0 ? 'In progress' : 'Nothing running'}
        subTone={s.rendering > 0 ? 'text-ember-text' : 'text-studio-muted'}
      />
      <Stat Icon={CircleCheck} label="Completed" value={count(s.completed)} sub="This month" />
      <Stat
        Icon={Zap}
        label="Avg. generation time"
        value={ready ? durationText(s.avgSeconds) : '…'}
        sub="Per video"
      />
      <Stat
        Icon={Database}
        label="Credits used"
        value={used === null ? '—' : used.toLocaleString('en-US')}
        sub="This period"
      />
    </section>
  );
}

export default function DashboardPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });

  useEffect(() => {
    let alive = true;
    loadEntries(RECENT_LIMIT).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const retry = () => {
    setLoad({ state: 'loading' });
    loadEntries(RECENT_LIMIT).then(setLoad);
  };
  const empty = load.state === 'ready' && load.entries.length === 0;

  return (
    <DashShell search>
      {({ summary, total }) => (
        <main className="pb-8">
          <Hero empty={empty} />
          <div className="flex flex-col gap-[15px] px-5 lg:pr-8 lg:pl-9">
            <CreatePanel />
            <div className="grid grid-cols-[minmax(0,1fr)] gap-[26px] xl:grid-cols-[minmax(0,1fr)_345px]">
              <LatestProducts load={load} retry={retry} />
              <RecentCreations load={load} />
            </div>
            <Stats load={load} summary={summary} total={total} />
          </div>
        </main>
      )}
    </DashShell>
  );
}
