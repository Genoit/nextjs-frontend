'use client';

import { useEffect, useState } from 'react';
import { fetchAdminGenerations } from '../../../lib/api/admin';
import type { AdminGenerationsResponse } from '../../../lib/types/admin';
import { AdminPagination } from '../../../components/admin/AdminPagination';
import {
  AdminHeader,
  AdminTable,
  Badge,
  FilterSelect,
  Kpi,
  cell,
  errorText,
  statusTone,
} from '../../../components/admin/ui';

const STATUSES = ['completed', 'failed', 'pending', 'submitted', 'cancelled'];
const ms = (v: number | null) =>
  v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${v} ms`;
const usd = (v: number | null) => (v == null ? '—' : `$${v.toFixed(v < 1 ? 4 : 2)}`);

export default function AdminGenerationsPage() {
  const [data, setData] = useState<AdminGenerationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let live = true;
    fetchAdminGenerations({
      provider: provider === 'all' ? undefined : provider,
      status: status === 'all' ? undefined : status,
      page,
    })
      .then((res) => {
        if (!live) return;
        setData(res);
        setError(null);
      })
      .catch((err) => live && setError(errorText(err, 'Failed to load AI generations')))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [provider, status, page]);

  const kpis = data?.kpis;
  const rows = data?.generations ?? [];
  const providers = data?.providers ?? [];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="AI Generations"
        subtitle="Every video shot sent to a render provider, with its latency and cost."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Render attempts"
          value={(kpis?.attempts ?? 0).toLocaleString()}
          hint={kpis?.period_label}
        />
        <Kpi
          label="Success rate"
          value={`${kpis?.success_rate ?? 0}%`}
          hint={`${kpis?.failed ?? 0} failed`}
        />
        <Kpi label="Render cost" value={usd(kpis?.cost_usd ?? 0)} hint={kpis?.period_label} />
        <Kpi
          label="Average latency"
          value={ms(kpis?.avg_latency_ms ?? null)}
          hint={kpis?.period_label}
        />
      </div>

      <AdminTable
        columns={['Provider', 'Attempts', 'Succeeded', 'Failed', 'Cost', 'Avg latency']}
        loading={loading && !data}
        error={error}
        isEmpty={providers.length === 0}
        emptyText="No render attempts in the last 30 days."
      >
        {providers.map((p) => (
          <tr key={p.provider}>
            <td className={`${cell} font-semibold text-ink`}>{p.provider}</td>
            <td className={cell}>{p.attempts}</td>
            <td className={cell}>{p.succeeded}</td>
            <td className={cell}>{p.failed}</td>
            <td className={cell}>{usd(p.cost_usd)}</td>
            <td className={cell}>{ms(p.avg_latency_ms)}</td>
          </tr>
        ))}
      </AdminTable>

      <div className="flex flex-col sm:flex-row gap-3">
        <FilterSelect
          label="Provider"
          value={provider}
          onChange={(v) => {
            setProvider(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All providers' },
            ...providers.map((p) => ({ value: p.provider, label: p.provider })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All statuses' },
            ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
          ]}
        />
      </div>

      <AdminTable
        columns={['Date', 'Provider', 'Model', 'Shot', 'Status', 'Latency', 'Cost', 'User']}
        loading={loading && !data}
        error={error}
        isEmpty={rows.length === 0}
        emptyText="No render attempts match your criteria."
        footer={
          <AdminPagination
            page={page}
            pageSize={data?.page_size ?? 10}
            total={data?.total ?? 0}
            noun="attempts"
            onPage={setPage}
          />
        }
      >
        {rows.map((g) => (
          <tr key={g.id} className="hover:bg-studio-surface/60">
            <td className={`${cell} whitespace-nowrap font-mono text-[11px]`}>{g.created_at}</td>
            <td className={cell}>
              <span className="text-ink">{g.provider}</span>
              {g.is_mock && <span className="ml-1.5 text-[10px] text-ink-muted">(mock)</span>}
            </td>
            <td className={cell}>{g.model}</td>
            <td className={cell}>{g.shot_class}</td>
            <td className={cell}>
              <Badge tone={statusTone(g.status)}>{g.status}</Badge>
              {g.error_code && (
                <span className="block text-[10px] text-danger mt-0.5">{g.error_code}</span>
              )}
            </td>
            <td className={cell}>{ms(g.latency_ms)}</td>
            <td className={cell}>{usd(g.cost_usd)}</td>
            <td className={cell}>{g.user_email}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
