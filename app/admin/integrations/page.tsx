'use client';

import { useEffect, useState } from 'react';
import { fetchAdminIntegrations } from '../../../lib/api/admin';
import type { AdminIntegrationItem } from '../../../lib/types/admin';
import {
  AdminHeader,
  AdminTable,
  Badge,
  Kpi,
  cell,
  errorText,
  statusTone,
} from '../../../components/admin/ui';

export default function AdminIntegrationsPage() {
  const [items, setItems] = useState<AdminIntegrationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchAdminIntegrations()
      .then((res) => live && setItems(res))
      .catch((err) => live && setError(errorText(err, 'Failed to load integrations')));
    return () => {
      live = false;
    };
  }, []);

  const list = items ?? [];
  const connected = list.filter((i) => i.status === 'Connected').length;
  const failures = list.reduce((sum, i) => sum + (i.failures_30d ?? 0), 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Integrations"
        subtitle="External services TrendED calls, read from the server configuration and usage logs."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi label="Connected" value={`${connected} / ${list.length}`} />
        <Kpi label="Not configured" value={list.length - connected} />
        <Kpi label="Failures" value={failures} hint="last 30 days" />
      </div>

      <AdminTable
        columns={[
          'Service',
          'Used for',
          'Status',
          'Model',
          'Calls (30 d)',
          'Failures (30 d)',
          'Last used',
        ]}
        loading={items === null}
        error={error}
        isEmpty={list.length === 0}
        emptyText="No integrations."
      >
        {list.map((i) => (
          <tr key={i.key}>
            <td className={`${cell} font-semibold text-ink`}>{i.name}</td>
            <td className={cell}>{i.category}</td>
            <td className={cell}>
              <Badge tone={statusTone(i.status)}>{i.status}</Badge>
            </td>
            <td className={`${cell} font-mono text-[11px]`}>{i.model ?? '—'}</td>
            <td className={cell}>{i.calls_30d ?? 'not logged'}</td>
            <td className={cell}>{i.failures_30d ?? '—'}</td>
            <td className={cell}>{i.last_used}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
