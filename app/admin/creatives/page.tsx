'use client';

import { useEffect, useState } from 'react';
import { fetchAdminCreatives } from '../../../lib/api/admin';
import type { AdminCreativesResponse } from '../../../lib/types/admin';
import { AdminPagination } from '../../../components/admin/AdminPagination';
import {
  AdminHeader,
  AdminTable,
  Badge,
  FilterSelect,
  Kpi,
  SearchBox,
  cell,
  errorText,
  statusTone,
} from '../../../components/admin/ui';

export default function AdminCreativesPage() {
  const [data, setData] = useState<AdminCreativesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let live = true;
    fetchAdminCreatives({ search, provider: provider === 'all' ? undefined : provider, page })
      .then((res) => {
        if (!live) return;
        setData(res);
        setError(null);
      })
      .catch((err) => live && setError(errorText(err, 'Failed to load creatives')))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [search, provider, page]);

  const counts = data?.counts_by_provider ?? {};
  const creatives = data?.creatives ?? [];
  const providers = Object.keys(counts).filter((k) => k !== 'all');

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Creatives"
        subtitle="Storyboards written by Creative Intelligence for every merchant."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="All storyboards" value={(counts.all ?? 0).toLocaleString()} />
        {providers.map((p) => (
          <Kpi
            key={p}
            label={`Written by ${p}`}
            value={(counts[p] ?? 0).toLocaleString()}
            hint={p === 'deterministic' ? 'Rule-based fallback, no API call' : undefined}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title, product or email"
        />
        <FilterSelect
          label="Provider"
          value={provider}
          onChange={(v) => {
            setProvider(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All providers' },
            ...providers.map((p) => ({ value: p, label: p })),
          ]}
        />
      </div>

      <AdminTable
        columns={[
          'Storyboard',
          'Product',
          'Owner',
          'Provider',
          'Status',
          'Duration',
          'Cost',
          'Created',
        ]}
        loading={loading && !data}
        error={error}
        isEmpty={creatives.length === 0}
        emptyText="No storyboards match your criteria."
        footer={
          <AdminPagination
            page={page}
            pageSize={data?.page_size ?? 10}
            total={data?.total ?? 0}
            noun="storyboards"
            onPage={setPage}
          />
        }
      >
        {creatives.map((c) => {
          const state = c.generation_status === 'completed' ? c.status : c.generation_status;
          return (
            <tr key={c.id} className="hover:bg-studio-surface/60">
              <td className={cell}>
                <span className="font-semibold text-ink block truncate max-w-[260px]">
                  {c.title}
                </span>
              </td>
              <td className={cell}>
                <span className="block truncate max-w-[180px]">{c.product_title}</span>
              </td>
              <td className={cell}>{c.user_email}</td>
              <td className={cell}>
                <span className="text-ink">{c.provider}</span>
                {c.model && <span className="block text-[10px] text-ink-muted">{c.model}</span>}
              </td>
              <td className={cell}>
                <Badge tone={statusTone(state)}>{state}</Badge>
              </td>
              <td className={cell}>{c.target_duration}s</td>
              <td className={`${cell} whitespace-nowrap`}>
                {c.cost_usd != null ? `$${c.cost_usd.toFixed(4)}` : '—'}
              </td>
              <td className={`${cell} whitespace-nowrap`}>{c.created_at}</td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
