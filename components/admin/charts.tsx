'use client';

import { useState } from 'react';

/** Single-series charts for the admin analytics page: accent marks, text in ink tokens. */

export function niceMax(value: number): number {
  if (value <= 0) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

export function compact(n: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function money(n: number, currency: string): string {
  return Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    n,
  );
}

/** Horizontal bars: label, bar, value. Every value is printed, so no tooltip is needed. */
export function BarList({
  items,
  format = (n) => n.toLocaleString('en'),
  empty = 'No data in this period',
}: {
  items: { label: string; value: number; hint?: string }[];
  format?: (n: number) => string;
  empty?: string;
}) {
  if (!items.length) return <p className="py-6 text-center text-xs text-ink-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="text-xs">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-ink-soft" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 tabular-nums font-semibold text-ink">
              {format(item.value)}
              {item.hint && <span className="ml-1 font-normal text-ink-muted">{item.hint}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-studio-raised">
            <div
              className="h-full rounded-full bg-trend-orange"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Daily columns with a per-column tooltip (hover or keyboard focus) and a table view. */
export function ColumnChart({
  points,
  format,
  label,
}: {
  points: { date: string; value: number }[];
  format: (n: number) => string;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const ticks = [1, 0.5, 0];
  const day = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="text-[11px] font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {asTable ? 'Show chart' : 'Show table'}
        </button>
      </div>
      {asTable ? (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-line">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-studio-surface text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">{label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {points
                .filter((p) => p.value > 0)
                .map((p) => (
                  <tr key={p.date}>
                    <td className="px-3 py-1.5 text-ink-soft">{day(p.date)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-ink">
                      {format(p.value)}
                    </td>
                  </tr>
                ))}
              {!points.some((p) => p.value > 0) && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-ink-muted">
                    Nothing in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex h-44 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-ink-muted">
            {ticks.map((t) => (
              <span key={t}>{compact(max * t)}</span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-39 flex flex-col justify-between">
              {ticks.map((t) => (
                <div key={t} className="border-t border-line" />
              ))}
            </div>
            <div
              className="relative flex h-39 items-end gap-px"
              onMouseLeave={() => setActive(null)}
              role="list"
              aria-label={label}
            >
              {points.map((p, i) => (
                <div
                  key={p.date}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${day(p.date)}: ${format(p.value)}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="flex h-full min-w-0 flex-1 items-end justify-center outline-none focus-visible:bg-studio-raised/60"
                >
                  <div
                    className={`w-full max-w-6 rounded-t ${
                      active === i ? 'bg-trend-orange-strong' : 'bg-trend-orange'
                    }`}
                    style={{ height: p.value ? `${Math.max(2, (p.value / max) * 100)}%` : 0 }}
                  />
                </div>
              ))}
              {active !== null && (
                <div
                  className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-studio-ground px-2.5 py-1.5 text-[11px] shadow-lg"
                  style={{ left: `${((active + 0.5) / points.length) * 100}%` }}
                >
                  <p className="font-semibold tabular-nums text-ink">
                    {format(points[active].value)}
                  </p>
                  <p className="text-ink-muted">{day(points[active].date)}</p>
                </div>
              )}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
              <span>{points.length ? day(points[0].date) : ''}</span>
              <span>{points.length ? day(points[points.length - 1].date) : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SERIES = [1, 2, 3, 4, 5, 6].map((i) => `var(--color-series-${i})`);

const shortDay = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** Multi-series daily lines on one axis, crosshair tooltip, legend with period totals. */
export function LineChart({
  dates,
  series,
  format = (n) => n.toLocaleString('en'),
}: {
  dates: string[];
  series: { label: string; values: number[] }[];
  format?: (n: number) => string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = niceMax(Math.max(0, ...series.flatMap((s) => s.values)));
  const n = dates.length;
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const y = (v: number) => 100 - (v / max) * 100;
  const ticks = [1, 0.5, 0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {series.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1.5 text-ink-soft">
              <span className="h-0.5 w-3.5 rounded-full" style={{ background: SERIES[i] }} />
              {s.label}
              <span className="font-semibold tabular-nums text-ink">
                {format(s.values.reduce((a, b) => a + b, 0))}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="text-[11px] font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {asTable ? 'Show chart' : 'Show table'}
        </button>
      </div>
      {asTable ? (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-line">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-studio-surface text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                {series.map((s) => (
                  <th key={s.label} className="px-3 py-2 text-right font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {dates.map((d, i) =>
                series.some((s) => s.values[i]) ? (
                  <tr key={d}>
                    <td className="px-3 py-1.5 text-ink-soft">{shortDay(d)}</td>
                    {series.map((s) => (
                      <td key={s.label} className="px-3 py-1.5 text-right tabular-nums text-ink">
                        {format(s.values[i])}
                      </td>
                    ))}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex h-56 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-ink-muted">
            {ticks.map((t) => (
              <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
                {compact(max * t)}
              </span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="relative h-51" onMouseLeave={() => setActive(null)}>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden
              >
                {ticks.map((t) => (
                  <line
                    key={t}
                    x1="0"
                    x2="100"
                    y1={y(max * t)}
                    y2={y(max * t)}
                    stroke="var(--color-line)"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {series.map((s, si) => (
                  <polyline
                    key={s.label}
                    fill="none"
                    stroke={SERIES[si]}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
                  />
                ))}
              </svg>
              {active !== null && (
                <>
                  <div
                    className="pointer-events-none absolute inset-y-0 w-px bg-ink-muted/50"
                    style={{ left: `${x(active)}%` }}
                  />
                  {series.map((s, si) => (
                    <span
                      key={s.label}
                      className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-studio-ground"
                      style={{
                        left: `${x(active)}%`,
                        top: `${y(s.values[active])}%`,
                        background: SERIES[si],
                      }}
                    />
                  ))}
                  <div
                    className={`pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-lg border border-line bg-studio-ground px-2.5 py-2 text-[11px] shadow-lg ${
                      x(active) > 60 ? '-translate-x-[calc(100%+10px)]' : 'translate-x-2.5'
                    }`}
                    style={{ left: `${x(active)}%` }}
                  >
                    <p className="mb-1 text-ink-muted">{shortDay(dates[active])}</p>
                    {series.map((s, si) => (
                      <p key={s.label} className="flex items-center gap-2">
                        <span
                          className="h-0.5 w-3 rounded-full"
                          style={{ background: SERIES[si] }}
                        />
                        <span className="font-semibold tabular-nums text-ink">
                          {format(s.values[active])}
                        </span>
                        <span className="text-ink-muted">{s.label}</span>
                      </p>
                    ))}
                  </div>
                </>
              )}
              <div className="absolute inset-0 flex" role="list" aria-label="Daily activity">
                {dates.map((d, i) => (
                  <div
                    key={d}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${shortDay(d)}: ${series.map((s) => `${format(s.values[i])} ${s.label}`).join(', ')}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="h-full flex-1 outline-none"
                  />
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
              <span>{n ? shortDay(dates[0]) : ''}</span>
              <span>{n ? shortDay(dates[n - 1]) : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Share of a whole. Past five slices the tail folds into "Other" (no generated hues). */
export function Donut({
  items,
  empty = 'No data in this period',
}: {
  items: { label: string; value: number }[];
  empty?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const sorted = [...items].filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const slices =
    sorted.length > 6
      ? [
          ...sorted.slice(0, 5),
          { label: 'Other', value: sorted.slice(5).reduce((a, b) => a + b.value, 0) },
        ]
      : sorted;
  const total = slices.reduce((a, b) => a + b.value, 0);
  if (!total) return <p className="py-6 text-center text-xs text-ink-muted">{empty}</p>;

  const r = 38;
  const circ = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 1.5 : 0; // surface gap between slices
  const lens = slices.map((s) => (s.value / total) * circ);
  const shown = active ?? 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--color-studio-raised)"
            strokeWidth="14"
          />
          {slices.map((s, i) => {
            const offset = lens.slice(0, i).reduce((a, b) => a + b, 0);
            return (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={SERIES[i]}
                strokeWidth={active === i ? 16 : 14}
                strokeDasharray={`${Math.max(0.5, lens[i] - gap)} ${circ}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="cursor-default transition-[stroke-width]"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold tabular-nums text-ink">
            {Math.round((slices[shown].value / total) * 100)}%
          </span>
          <span className="max-w-20 truncate text-[10px] text-ink-muted">
            {slices[shown].label}
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
        {slices.map((s, i) => (
          <li
            key={s.label}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className={`flex items-center gap-2 rounded-md px-1 outline-none ${
              active === i ? 'bg-studio-raised' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: SERIES[i] }} />
            <span className="truncate text-ink-soft" title={s.label}>
              {s.label}
            </span>
            <span className="ml-auto shrink-0 tabular-nums font-semibold text-ink">
              {s.value.toLocaleString('en')}
            </span>
            <span className="w-9 shrink-0 text-right tabular-nums text-ink-muted">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
