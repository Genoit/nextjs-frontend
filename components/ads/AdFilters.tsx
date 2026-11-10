'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { AdSearchParams, AdSort } from '../../lib/api/ads';
import { focusRing } from '../dashboard/DashShell';

/** Input and select look of the studio screens. */
export const field =
  'h-[38px] w-full rounded-[8px] border border-dash-edge bg-dash-field px-3 text-[13px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60';

export const COUNTRIES = [
  ['FR', 'France'],
  ['DE', 'Germany'],
  ['ES', 'Spain'],
  ['IT', 'Italy'],
  ['NL', 'Netherlands'],
  ['BE', 'Belgium'],
] as const;

const PLATFORMS = [
  ['FACEBOOK', 'Facebook'],
  ['INSTAGRAM', 'Instagram'],
  ['MESSENGER', 'Messenger'],
  ['AUDIENCE_NETWORK', 'Audience Network'],
] as const;

const SORTS: [AdSort, string][] = [
  ['recent', 'Newest first'],
  ['run_time', 'Longest running'],
  ['reach', 'Highest EU reach'],
];

export function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${field} cursor-pointer pr-8`}
      >
        {children}
      </select>
    </label>
  );
}

/** Search box plus filters; the words apply on submit, the selects at once. */
export function AdFilters({
  value,
  onChange,
}: {
  value: AdSearchParams;
  onChange: (next: AdSearchParams) => void;
}) {
  const [q, setQ] = useState(value.q ?? '');
  const set = (patch: AdSearchParams) => onChange({ ...value, ...patch, cursor: undefined });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    set({ q: q.trim() || undefined });
  };
  const status = value.active === undefined ? '' : value.active ? 'active' : 'stopped';
  return (
    <div className="space-y-3">
      <form role="search" onSubmit={submit} className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search ads</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-studio-muted"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            maxLength={200}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Product, brand or words in the ad"
            className={`${field} pl-10`}
          />
        </label>
        <button
          type="submit"
          className={`h-[38px] shrink-0 rounded-[10px] border border-dash-edge bg-dash-raised px-4 text-[13px] font-semibold text-white transition hover:border-dash-edge-hover active:scale-[0.98] ${focusRing}`}
        >
          Search
        </button>
      </form>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*]:sm:w-[168px]">
        <Select
          label="Country"
          value={value.country ?? ''}
          onChange={(v) => set({ country: v || undefined })}
        >
          <option value="">All EU countries</option>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(v) => set({ active: v === '' ? undefined : v === 'active' })}
        >
          <option value="">Any status</option>
          <option value="active">Active only</option>
          <option value="stopped">Stopped only</option>
        </Select>
        <Select
          label="Platform"
          value={value.platform ?? ''}
          onChange={(v) => set({ platform: v || undefined })}
        >
          <option value="">All platforms</option>
          {PLATFORMS.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>
        <label
          className={`${field} col-span-2 flex items-center gap-2 max-sm:order-last focus-within:border-ember-text/60 sm:!w-[236px]`}
        >
          <span className="shrink-0 text-studio-muted">Started after</span>
          <input
            type="date"
            value={value.started_after ?? ''}
            onChange={(e) => set({ started_after: e.target.value || undefined })}
            className="min-w-0 flex-1 bg-transparent text-white outline-none"
          />
        </label>
        <div className="sm:ml-auto">
          <Select
            label="Sort"
            value={value.sort ?? 'recent'}
            onChange={(v) => set({ sort: v as AdSort })}
          >
            {SORTS.map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
