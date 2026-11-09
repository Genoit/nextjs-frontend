'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronDown, Plus, Search, Wand2 } from 'lucide-react';
import {
  DashShell,
  focusRing,
  menuItem,
  Popover,
  productImage,
  Thumb,
} from '../../components/dashboard/DashShell';
import { productApi } from '../../lib/api/product';
import type { Product } from '../../lib/types/product';
import {
  SOURCES,
  TEMPLATE_KEY,
  TEMPLATES,
  templateHandoff,
  type Template,
} from '../../lib/template-rules.mjs';

const PLATFORMS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'instagram_reels', label: 'Instagram Reels' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
];
const PLATFORM_LABEL: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p.label]),
);
const STYLE_LABEL: Record<string, string> = {
  ugc_natural: 'UGC',
  hybrid: 'Hybrid',
  cinematic: 'Cinematic',
};
const BEAT_FILL: Record<string, string> = {
  hook: 'bg-ember',
  context: 'bg-dash-edge-strong',
  reveal: 'bg-[#575757]',
  demonstration: 'bg-[#474747]',
  resolution: 'bg-[#626262]',
  cta: 'bg-coin',
};

/** The template's scenes on a time line, sized by their seconds. */
function Timeline({ t }: { t: Template }) {
  const rows = t.beats.map((b, i) => {
    const from = t.beats.slice(0, i).reduce((s, x) => s + x.seconds, 0);
    return { ...b, from, to: from + b.seconds };
  });
  return (
    <figure className="rounded-[10px] bg-dash-raised p-3.5">
      <figcaption className="sr-only">
        Scene by scene: {rows.map((r) => `${r.label}, ${r.from} to ${r.to} seconds`).join('; ')}
      </figcaption>
      <div className="flex h-[10px] gap-[3px] overflow-hidden rounded-full" aria-hidden>
        {rows.map((r, i) => (
          <span key={i} className={BEAT_FILL[r.role]} style={{ flexGrow: r.seconds }} />
        ))}
      </div>
      <ol className="mt-3 space-y-1.5" aria-hidden>
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[12px]">
            <span className={`size-2 shrink-0 rounded-full ${BEAT_FILL[r.role]}`} />
            <span className="flex-1 truncate text-dash-soft">{r.label}</span>
            <span className="text-studio-muted tabular-nums">
              {r.from}–{r.to}s
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function UseTemplate({ t, products }: { t: Template; products: Product[] | null }) {
  const router = useRouter();
  const pick = (productId: string | null) => {
    try {
      sessionStorage.setItem(TEMPLATE_KEY, templateHandoff(t.id, productId));
    } catch {
      // storage blocked: the setup form opens with its defaults
    }
    router.push(productId ? `/products/${productId}/creative?step=setup` : '/product-input');
  };
  return (
    <Popover
      label={`Use the ${t.name} template`}
      className="right-0 bottom-12 w-64"
      buttonClassName="w-full"
      button={
        <span className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[8px] bg-ember text-[13px] font-semibold text-on-ember transition hover:bg-ember-strong">
          <Wand2 className="size-4" aria-hidden />
          Use template
          <ChevronDown className="size-4" aria-hidden />
        </span>
      }
    >
      {() => (
        <>
          <p className="px-3 pt-1.5 pb-1 text-[11px] text-studio-meta">Apply it to</p>
          <button type="button" onClick={() => pick(null)} className={menuItem}>
            <Plus className="size-4" aria-hidden />A new product
          </button>
          {products === null ? (
            <p className="px-3 py-2 text-[12px] text-studio-meta">Loading your products…</p>
          ) : (
            products.map((p) => (
              <button key={p.id} type="button" onClick={() => pick(p.id)} className={menuItem}>
                <Thumb src={productImage(p)} className="size-6 rounded" iconSize="size-3" />
                <span className="truncate">{p.title}</span>
              </button>
            ))
          )}
        </>
      )}
    </Popover>
  );
}

function Card({ t, products }: { t: Template; products: Product[] | null }) {
  const tags = [
    PLATFORM_LABEL[t.platform],
    t.aspect_ratio,
    `${t.target_duration}s`,
    STYLE_LABEL[t.video_style],
  ];
  return (
    <li className="flex flex-col rounded-[12px] border border-dash-line bg-dash-panel p-3.5">
      <Timeline t={t} />
      <h2 className="mt-4 text-[15px] font-semibold">{t.name}</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-studio-muted">{t.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Setup">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-[6px] bg-white/[0.05] px-2 py-0.5 text-[11.5px] text-dash-soft tabular-nums"
          >
            {tag}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] text-studio-muted">
        Best for <span className="text-dash-soft">{t.bestFor.join(', ')}</span>
      </p>
      {t.note && (
        <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-warning">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          {t.note}
        </p>
      )}
      <div className="mt-auto pt-4">
        <UseTemplate t={t} products={products} />
      </div>
    </li>
  );
}

export default function TemplatesPage() {
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('all');
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let alive = true;
    productApi
      .getProducts({ page_size: 6, sort_by: 'created_at', sort_order: 'desc' })
      .then((r) => alive && setProducts(r.products ?? []))
      .catch(() => alive && setProducts([])); // "A new product" still works
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return TEMPLATES.filter((t) => platform === 'all' || t.platform === platform).filter(
      (t) => !term || [t.name, t.summary, ...t.bestFor].some((s) => s.toLowerCase().includes(term)),
    );
  }, [q, platform]);

  return (
    <DashShell>
      <main className="px-5 pb-10 lg:pr-8 lg:pl-9">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
          <div className="mr-auto">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">Templates</h1>
            <p className="mt-1.5 max-w-[60ch] text-[14px] text-studio-muted">
              Proven short-form ad structures. Pick one and a product: the creative setup is filled
              in for you.
            </p>
          </div>
          <div className="relative w-full sm:w-[255px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-studio-muted"
              aria-hidden
            />
            <label htmlFor="template-search" className="sr-only">
              Search templates
            </label>
            <input
              id="template-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates..."
              className="h-[38px] w-full rounded-[8px] border border-dash-edge bg-dash-field pr-3 pl-10 text-[13px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60"
            />
          </div>
        </div>

        <div role="group" aria-label="Filter by platform" className="mt-6 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={platform === p.key}
              onClick={() => setPlatform(p.key)}
              className={`h-[32px] rounded-[8px] border px-3 text-[13px] transition ${
                platform === p.key
                  ? 'border-ember-text bg-ember/10 text-white'
                  : 'border-dash-edge text-dash-soft hover:text-white'
              } ${focusRing}`}
            >
              {p.label}
            </button>
          ))}
          <span className="ml-auto self-center text-[12.5px] text-studio-muted tabular-nums">
            {shown.length} template{shown.length === 1 ? '' : 's'}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="py-16 text-center text-[13px] text-studio-muted">
            No template matches this search.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((t) => (
              <Card key={t.id} t={t} products={products} />
            ))}
          </ul>
        )}

        <footer className="mt-10 border-t border-dash-line pt-4 text-[12px] text-studio-muted">
          <p>
            Structures compiled from public creative guides; their performance claims are the
            guides’ own. Test each template on your audience.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dash-soft underline-offset-2 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </main>
    </DashShell>
  );
}
