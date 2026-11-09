'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { fetchAdminAnalytics } from '../../../lib/api/admin';
import type { AdminAnalyticsResponse, AdminCount } from '../../../lib/types/admin';
import { AdminHeader, AdminTable, Badge, Kpi, cell, errorText } from '../../../components/admin/ui';
import { BarList, ColumnChart, Donut, LineChart, money } from '../../../components/admin/charts';

const RANGES = [7, 30, 90, 365];

const bars = (rows: AdminCount[]) => rows.map((r) => ({ label: r.label, value: r.count }));
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');

function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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

function SectionTitle({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <div className="pt-4">
      <h2 className="text-base font-bold text-ink">{children}</h2>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

function UserCell({ id, name, email }: { id: string; name: string; email: string }) {
  return (
    <>
      <Link href={`/admin/users/${id}`} className="font-semibold text-ink hover:underline">
        {name}
      </Link>
      <p className="text-[11px] text-ink-muted">{email}</p>
    </>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loadedDays, setLoadedDays] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchAdminAnalytics(days)
      .then((res) => {
        if (!live) return;
        setData(res);
        setError(null);
      })
      .catch((err) => live && setError(errorText(err, 'Could not load analytics')))
      .finally(() => live && setLoadedDays(days));
    return () => {
      live = false;
    };
  }, [days]);

  // Refetch keeps the previous render, dimmed, instead of a spinner.
  const refreshing = loadedDays !== days;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AdminHeader
          title="User analytics"
          subtitle="Who pays, who abuses the free plan, and what people make. Live from the database."
        />
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
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                days === d ? 'bg-trend-orange text-on-accent' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {d === 365 ? '1y' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-xs text-danger">
          {error}
        </p>
      )}

      {!data ? (
        !error && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-trend-orange border-t-transparent" />
          </div>
        )
      ) : (
        <AnalyticsBody data={data} dimmed={refreshing} />
      )}
    </div>
  );
}

function AnalyticsBody({ data, dimmed }: { data: AdminAnalyticsResponse; dimmed: boolean }) {
  const { revenue: rev, preferences: prefs } = data;
  const fmt = (n: number) => money(n, rev.currency);

  return (
    <div className={`space-y-5 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Revenue" value={fmt(rev.total_paid)} hint={`${rev.payments} payments`} />
        <Kpi label="Paying users" value={rev.paying_users} hint="Paid at least once" />
        <Kpi label="Video jobs" value={prefs.jobs} hint="Started in the period" />
        <Kpi
          label="Completion rate"
          value={pct(prefs.completed_jobs, prefs.jobs)}
          hint={`${prefs.completed_jobs} completed`}
        />
        <Kpi
          label="Export rate"
          value={pct(prefs.exported_jobs, prefs.completed_jobs)}
          hint="Completed videos exported"
        />
      </div>

      <Panel title="Daily activity" subtitle="New accounts, imported products and started videos">
        <LineChart
          dates={data.activity.map((d) => d.date)}
          series={[
            { label: 'Signups', values: data.activity.map((d) => d.signups) },
            { label: 'Products', values: data.activity.map((d) => d.products) },
            { label: 'Video jobs', values: data.activity.map((d) => d.jobs) },
          ]}
        />
      </Panel>

      {/* ---------------------------------------------------------------- revenue */}
      <SectionTitle hint="Real amounts from paid Stripe invoices.">Revenue</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Revenue per day" className="lg:col-span-2">
          <ColumnChart
            label="Revenue"
            format={fmt}
            points={rev.daily.map((d) => ({ date: d.date, value: d.amount }))}
          />
        </Panel>
        <Panel title="Payment methods" subtitle="Revenue by the method each payer last used">
          <BarList
            items={rev.methods.map((m) => ({
              label: m.label,
              value: m.amount,
              hint: `· ${m.users} user${m.users > 1 ? 's' : ''}`,
            }))}
            format={fmt}
            empty="No payments in this period"
          />
        </Panel>
      </div>

      <AdminTable
        columns={['Top payers', 'Plan', 'Total paid', 'Payments', 'Method', 'Last payment']}
        loading={false}
        error={null}
        isEmpty={!rev.top_payers.length}
        emptyText="No payments in this period."
      >
        {rev.top_payers.map((p) => (
          <tr key={p.user_id} className="hover:bg-studio-surface">
            <td className={cell}>
              <UserCell id={p.user_id} name={p.name} email={p.email} />
            </td>
            <td className={cell}>{p.plan}</td>
            <td className={`${cell} font-semibold tabular-nums text-ink`}>{fmt(p.total_paid)}</td>
            <td className={`${cell} tabular-nums`}>{p.payments}</td>
            <td className={cell}>{p.payment_method}</td>
            <td className={cell}>{p.last_paid}</td>
          </tr>
        ))}
      </AdminTable>

      {/* ---------------------------------------------------------------- abuse */}
      <SectionTitle hint="Free-plan users who crossed at least one threshold, highest score first. Open a user to suspend or ban.">
        Free-plan abuse
      </SectionTitle>
      <AdminTable
        columns={['User', 'Score', 'Products', 'Jobs', 'Cancelled', 'Linked accounts', 'Why']}
        loading={false}
        error={null}
        isEmpty={!data.abuse.length}
        emptyText="No free-plan user crossed an abuse threshold in this period."
      >
        {data.abuse.map((a) => (
          <tr key={a.user_id} className="hover:bg-studio-surface">
            <td className={cell}>
              <UserCell id={a.user_id} name={a.name} email={a.email} />
              {a.status !== 'Active' && (
                <span className="mt-1 inline-block">
                  <Badge tone="danger">{a.status}</Badge>
                </span>
              )}
            </td>
            <td className={`${cell} font-bold tabular-nums text-ink`}>{a.score}</td>
            <td className={`${cell} tabular-nums`}>{a.products}</td>
            <td className={`${cell} tabular-nums`}>{a.jobs}</td>
            <td className={`${cell} tabular-nums`}>{a.cancelled_jobs}</td>
            <td className={`${cell} tabular-nums`}>{a.linked_accounts}</td>
            <td className={cell}>
              {a.reasons.length ? (
                <div className="flex max-w-xs flex-wrap gap-1">
                  {a.reasons.map((r) => (
                    <Badge key={r} tone="warning">
                      {r}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-ink-muted">Normal use</span>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* ---------------------------------------------------------------- renewals */}
      <SectionTitle hint="Users with two or more plan grants in the period, closest grants first.">
        Fast renewals and top-ups
      </SectionTitle>
      <AdminTable
        columns={['User', 'Plan', 'Grants', 'Shortest gap', 'Last grant']}
        loading={false}
        error={null}
        isEmpty={!data.renewals.length}
        emptyText="Nobody renewed or upgraded more than once in this period."
      >
        {data.renewals.map((r) => (
          <tr key={r.user_id} className="hover:bg-studio-surface">
            <td className={cell}>
              <UserCell id={r.user_id} name={r.name} email={r.email} />
            </td>
            <td className={cell}>{r.plan}</td>
            <td className={`${cell} tabular-nums`}>{r.grants}</td>
            <td className={cell}>
              <Badge tone={r.min_gap_days < 20 ? 'warning' : 'neutral'}>
                {r.min_gap_days} days
              </Badge>
            </td>
            <td className={cell}>{r.last_grant}</td>
          </tr>
        ))}
      </AdminTable>

      {/* ---------------------------------------------------------------- preferences */}
      <SectionTitle hint="What users pick when they set up an ad, and what they import.">
        What users like
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Panel title="Platforms">
          <Donut items={bars(prefs.platforms)} />
        </Panel>
        <Panel title="Formats">
          <Donut items={bars(prefs.formats)} />
        </Panel>
        <Panel title="Durations">
          <Donut items={bars(prefs.durations)} />
        </Panel>
        <Panel title="Languages">
          <Donut items={bars(prefs.languages)} />
        </Panel>
        <Panel title="Objectives">
          <Donut items={bars(prefs.objectives)} />
        </Panel>
        <Panel title="Video job outcomes">
          <Donut items={bars(prefs.job_outcomes)} />
        </Panel>
        <Panel title="Creative angles">
          <BarList items={bars(prefs.angles).slice(0, 8)} />
        </Panel>
        <Panel title="Product sources">
          <BarList items={bars(prefs.sources)} />
        </Panel>
        <Panel title="Product categories">
          <BarList items={bars(prefs.categories)} />
        </Panel>
      </div>
    </div>
  );
}
