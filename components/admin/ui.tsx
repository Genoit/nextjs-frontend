import { ChevronDown, Search } from 'lucide-react';
import type { ReactNode } from 'react';

/** Small building blocks shared by the admin list pages (same look as Users/Transactions). */

export function AdminHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-ink">{title}</h1>
      <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{subtitle}</p>
    </div>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs">
      <p className="text-xs text-ink-muted font-medium">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {hint && <p className="text-[10px] text-ink-muted mt-1 truncate">{hint}</p>}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-line/90 bg-studio-ground py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-muted shadow-2xs focus:border-trend-orange focus:ring-1 focus:ring-trend-orange transition"
      />
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-studio-ground border border-line rounded-xl px-3 py-2 pr-8 text-xs font-medium text-ink-soft cursor-pointer hover:bg-studio-surface"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
    </div>
  );
}

const TONES = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-studio-raised text-ink-soft',
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Maps the statuses the backend returns (jobs, attempts, extraction) to a badge colour. */
export function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (['completed', 'connected', 'succeeded', 'active'].includes(s)) return 'success';
  if (['failed', 'blocked', 'error'].includes(s)) return 'danger';
  if (['pending', 'submitted', 'submitting', 'processing', 'rendering', 'draft'].includes(s))
    return 'warning';
  return 'neutral';
}

export function AdminTable({
  columns,
  loading,
  error,
  isEmpty,
  emptyText,
  footer,
  children,
}: {
  columns: string[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const message = error ?? (loading ? 'Loading…' : isEmpty ? emptyText : null);
  return (
    <div className="bg-studio-ground rounded-2xl border border-line/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream border-b border-line text-ink-muted text-[11px] font-semibold uppercase tracking-wider select-none">
            <tr>
              {columns.map((c) => (
                <th key={c} className="py-3 px-4 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-normal">
            {message ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-ink-muted">
                  {message}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-ink-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

export const cell = 'py-3 px-4 align-middle text-ink-soft';

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs ${className}`}
    >
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[11px] text-ink-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <div className="pt-4">
      <h2 className="text-base font-bold text-ink">{children}</h2>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

const RANGES = [7, 30, 90, 365];

export function PeriodPicker({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Period"
      className="inline-flex self-start rounded-full border border-line bg-studio-ground p-1"
    >
      {RANGES.map((d) => (
        <button
          key={d}
          type="button"
          role="radio"
          aria-checked={days === d}
          onClick={() => onChange(d)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            days === d ? 'bg-trend-orange text-on-accent' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {d === 365 ? '1y' : `${d}d`}
        </button>
      ))}
    </div>
  );
}
