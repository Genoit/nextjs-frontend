'use client';

import { useEffect, useState } from 'react';
import { fetchAdminProducts } from '../../../lib/api/admin';
import type { AdminProductsResponse } from '../../../lib/types/admin';
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

const STATUSES = ['completed', 'pending', 'processing', 'failed'];

export default function AdminProductsPage() {
  const [data, setData] = useState<AdminProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let live = true;
    fetchAdminProducts({ search, status: status === 'all' ? undefined : status, page })
      .then((res) => {
        if (!live) return;
        setData(res);
        setError(null);
      })
      .catch((err) => live && setError(errorText(err, 'Failed to load products')))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [search, status, page]);

  const counts = data?.counts_by_status ?? {};
  const products = data?.products ?? [];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Products"
        subtitle="Every product imported by merchants, across all accounts."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="All products" value={(counts.all ?? 0).toLocaleString()} />
        <Kpi label="Extracted" value={(counts.completed ?? 0).toLocaleString()} />
        <Kpi label="Pending extraction" value={(counts.pending ?? 0).toLocaleString()} />
        <Kpi label="Failed extraction" value={(counts.failed ?? 0).toLocaleString()} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title or owner email"
        />
        <FilterSelect
          label="Extraction status"
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
        columns={[
          'Product',
          'Owner',
          'Source',
          'Price',
          'Status',
          'Storyboards',
          'Videos',
          'Added',
        ]}
        loading={loading && !data}
        error={error}
        isEmpty={products.length === 0}
        emptyText="No products match your criteria."
        footer={
          <AdminPagination
            page={page}
            pageSize={data?.page_size ?? 10}
            total={data?.total ?? 0}
            noun="products"
            onPage={setPage}
          />
        }
      >
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-studio-surface/60">
            <td className={cell}>
              <div className="flex items-center gap-3 min-w-0">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- merchant images come from any host
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover bg-studio-raised shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-studio-raised shrink-0" />
                )}
                <span className="font-semibold text-ink truncate max-w-[260px]">{p.title}</span>
              </div>
            </td>
            <td className={cell}>{p.user_email}</td>
            <td className={`${cell} capitalize`}>{p.source_platform}</td>
            <td className={`${cell} whitespace-nowrap`}>
              {p.price != null ? `${p.price.toLocaleString()} ${p.currency ?? ''}` : '—'}
            </td>
            <td className={cell}>
              <Badge tone={statusTone(p.extraction_status)}>{p.extraction_status}</Badge>
            </td>
            <td className={cell}>{p.storyboards}</td>
            <td className={cell}>{p.videos}</td>
            <td className={`${cell} whitespace-nowrap`}>{p.created_at}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
