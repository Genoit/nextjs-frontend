'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

import { addAdminBudget, deleteAdminBudget, fetchAdminAiCosts } from '../../../lib/api/admin';
import type {
  AdminAiCostGroup,
  AdminAiCostsResponse,
  AdminProviderBudget,
  AdminRunPodLive,
} from '../../../lib/types/admin';
import {
  AdminHeader,
  AdminTable,
  Badge,
  FilterSelect,
  Kpi,
  Panel,
  PeriodPicker,
  SectionTitle,
  cell,
  errorText,
  statusTone,
} from '../../../components/admin/ui';
import { BarList, LineChart, SERIES, compact, money } from '../../../components/admin/charts';

type CallFilter = { provider?: string; model?: string };

const usd = (n: number) => money(n, 'USD');
// Sub-cent call costs would all read $0.00.
const usdFine = (n: number) => (n > 0 && n < 0.01 ? `$${n.toFixed(4)}` : money(n, 'USD'));

const FEATURES: Record<string, string> = {
  product_analysis: 'Product analysis',
  strategy: 'Creative strategy',
  storyboard: 'Storyboard',
  asset_processing: 'Image processing (GPU)',
  video_render: 'Video render',
  quality_check: 'Quality check',
  voiceover: 'Voice-over',
};
const KNOWN_PROVIDERS = ['gemini', 'kling', 'veo', 'runpod', 'elevenlabs', 'tts'];
// Top providers get a line each (sorted by name so colours stay put); the rest fold into Other.
const MAX_LINES = SERIES.length - 1;

const featureLabel = (f: string | null) => (f ? (FEATURES[f] ?? f) : '—');
const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
const when = (iso: string) =>
  new Date(iso).toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const seconds = (ms: number | null) => (ms != null ? `${(ms / 1000).toFixed(1)} s` : '—');
const duration = (s: number) =>
  s >= 3600
    ? `${(s / 3600).toFixed(1)} h`
    : s >= 60
      ? `${Math.round(s / 60)} min`
      : `${Math.round(s)} s`;

export default function AdminAiCostsPage() {
  const [days, setDays] = useState(30);
  const [filter, setFilter] = useState<CallFilter>({});
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<AdminAiCostsResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = `${days}|${filter.provider ?? ''}|${filter.model ?? ''}|${reload}`;

  useEffect(() => {
    let live = true;
    fetchAdminAiCosts({ days, ...filter })
      .then((res) => {
        if (!live) return;
        setData(res);
        setError(null);
      })
      .catch((err) => live && setError(errorText(err, 'Could not load AI costs')))
      .finally(() => live && setLoadedKey(key));
    return () => {
      live = false;
    };
  }, [days, filter, key]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AdminHeader
          title="AI costs & providers"
          subtitle="What every AI call cost, what is left of the credits bought, and GPU usage. Live from the database."
        />
        <PeriodPicker days={days} onChange={setDays} />
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
        // Refetch keeps the previous render, dimmed, instead of a spinner.
        <CostsBody
          data={data}
          dimmed={loadedKey !== key}
          filter={filter}
          onFilter={setFilter}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function CostsBody({
  data,
  dimmed,
  filter,
  onFilter,
  onChanged,
}: {
  data: AdminAiCostsResponse;
  dimmed: boolean;
  filter: CallFilter;
  onFilter: (f: CallFilter) => void;
  onChanged: () => void;
}) {
  const k = data.kpis;
  const shown = data.providers
    .slice(0, MAX_LINES)
    .map((p) => p.key)
    .sort();
  const lines = shown.map((p) => ({
    label: p,
    values: data.daily.map((d) => d.by_provider[p] ?? 0),
  }));
  if (data.providers.length > shown.length) {
    lines.push({
      label: 'Other',
      values: data.daily.map((d) =>
        Object.entries(d.by_provider)
          .filter(([p]) => !shown.includes(p))
          .reduce((sum, [, v]) => sum + v, 0),
      ),
    });
  }
  const limitHint =
    k.month_hard_limit_usd != null
      ? `${Math.round((k.month_spend_usd / k.month_hard_limit_usd) * 100)}% of the ${usd(k.month_hard_limit_usd)} limit`
      : 'No hard limit set';

  return (
    <div className={`space-y-5 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi
          label="AI spend"
          value={usd(k.total_cost_usd)}
          hint={`${compact(k.calls)} calls in ${data.days} days`}
        />
        <Kpi
          label="Cost per finished ad"
          value={k.cost_per_completed_ad_usd != null ? usdFine(k.cost_per_completed_ad_usd) : '—'}
          hint={`${k.completed_ads} ads completed`}
        />
        <Kpi label="This month" value={usd(k.month_spend_usd)} hint={limitHint} />
        <Kpi
          label="Failed calls"
          value={k.failed_calls}
          hint={k.calls ? `${((k.failed_calls / k.calls) * 100).toFixed(1)}% of calls` : '—'}
        />
        <Kpi
          label="Tokens"
          value={compact(k.input_tokens + k.output_tokens)}
          hint={`${compact(k.input_tokens)} in · ${compact(k.output_tokens)} out`}
        />
        <Kpi label="GPU time" value={duration(k.gpu_seconds)} hint="RunPod image jobs" />
      </div>

      <Panel
        title="Spend per provider, per day"
        subtitle="Actual cost when the provider reported it, else our estimate"
      >
        <LineChart dates={data.daily.map((d) => d.date)} series={lines} format={usdFine} />
      </Panel>

      {/* ---------------------------------------------------------------- credits */}
      <SectionTitle hint="Most providers have no balance API, so record each top-up here. Left = bought minus what our calls cost since the first purchase. The run-out date uses the last 7 days.">
        Credits & balances
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-2">
          {data.budgets.map((b) => (
            <BudgetCard key={b.provider} budget={b} onChanged={onChanged} />
          ))}
          <RunPodCard live={data.runpod} />
          {!data.budgets.length && (
            <p className="rounded-2xl border border-dashed border-line p-5 text-xs text-ink-muted">
              No top-up recorded yet. Add one to see what is left and when it runs out.
            </p>
          )}
        </div>
        <BudgetForm
          providers={[...new Set([...KNOWN_PROVIDERS, ...data.providers.map((p) => p.key)])]}
          onSaved={onChanged}
        />
      </div>

      {/* ---------------------------------------------------------------- breakdown */}
      <SectionTitle hint="Where the money goes. Click a model to list its calls below.">
        Breakdown
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Spend by feature">
          <BarList
            items={data.features.map((f) => ({
              label: featureLabel(f.feature),
              value: f.cost_usd,
              hint: `· ${f.calls} calls`,
            }))}
            format={usdFine}
            empty="No AI call in this period"
          />
        </Panel>
        <Panel title="Spend by provider">
          <BarList
            items={data.providers.map((p) => ({
              label: p.key,
              value: p.cost_usd,
              hint: `· ${p.calls} calls${p.failed ? `, ${p.failed} failed` : ''}`,
            }))}
            format={usdFine}
            empty="No AI call in this period"
          />
        </Panel>
      </div>

      <ModelsTable models={data.models} filter={filter} onFilter={onFilter} />
      <CallsTable data={data} filter={filter} onFilter={onFilter} />
    </div>
  );
}

function BudgetCard({
  budget: b,
  onChanged,
}: {
  budget: AdminProviderBudget;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const share = b.bought_usd > 0 ? Math.max(0, Math.min(1, b.remaining_usd / b.bought_usd)) : 0;
  const daysLeft = b.days_left;
  const tone =
    b.remaining_usd <= 0 ? 'danger' : daysLeft != null && daysLeft <= 7 ? 'warning' : 'success';
  const state =
    b.remaining_usd <= 0
      ? 'Used up'
      : daysLeft == null
        ? 'Not in use'
        : daysLeft <= 7
          ? `Runs out in ${Math.max(daysLeft, 0)} d`
          : 'Healthy';

  const remove = async (id: string) => {
    if (!window.confirm('Remove this top-up? What is left will be recalculated.')) return;
    setBusy(id);
    setError(null);
    try {
      await deleteAdminBudget(id);
      onChanged();
    } catch (err) {
      setError(errorText(err, 'Could not remove the top-up'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold capitalize text-ink">{b.provider}</h3>
        <Badge tone={tone}>{state}</Badge>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-ink">{usd(b.remaining_usd)}</p>
      <p className="text-[11px] text-ink-muted">
        left of {usd(b.bought_usd)} bought
        {b.credits != null && ` (${compact(b.credits)} credits)`}
      </p>
      <div
        role="meter"
        aria-label={`${b.provider} credits left`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(share * 100)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-studio-raised"
      >
        <div
          className={`h-full rounded-full ${
            tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning' : 'bg-success'
          }`}
          style={{ width: `${share * 100}%` }}
        />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <dt className="text-ink-muted">Spent</dt>
          <dd className="font-semibold tabular-nums text-ink">{usdFine(b.spent_usd)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Per day</dt>
          <dd className="font-semibold tabular-nums text-ink">{usdFine(b.burn_per_day_usd)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Runs out</dt>
          <dd className="font-semibold text-ink">
            {b.runs_out_on ? day(`${b.runs_out_on}T00:00:00Z`) : '—'}
          </dd>
        </div>
      </dl>
      <details className="mt-3 text-[11px]">
        <summary className="cursor-pointer text-ink-muted hover:text-ink">
          {b.purchases.length} top-up{b.purchases.length > 1 ? 's' : ''}
        </summary>
        <ul className="mt-2 divide-y divide-line">
          {b.purchases.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-1.5">
              <span className="text-ink-soft">
                <span className="font-semibold tabular-nums text-ink">{usd(p.amount_usd)}</span> ·{' '}
                {day(p.bought_at)}
                {p.note && <span className="text-ink-muted"> · {p.note}</span>}
              </span>
              <button
                type="button"
                onClick={() => remove(p.id)}
                disabled={busy === p.id}
                aria-label={`Remove the ${usd(p.amount_usd)} top-up of ${day(p.bought_at)}`}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="mt-1 text-danger">
            {error}
          </p>
        )}
      </details>
    </section>
  );
}

function RunPodCard({ live }: { live: AdminRunPodLive }) {
  const status = !live.configured ? 'Not configured' : live.error ? 'Unreachable' : 'Live';
  return (
    <section className="bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink">RunPod account</h3>
        <Badge tone={!live.configured ? 'neutral' : live.error ? 'danger' : 'success'}>
          {status}
        </Badge>
      </div>
      {!live.configured ? (
        <p className="mt-3 text-xs text-ink-muted">
          Set <code className="text-ink-soft">RUNPOD_API_KEY</code> to read the GPU balance live.
        </p>
      ) : live.error ? (
        <p className="mt-3 text-xs text-danger">{live.error}</p>
      ) : (
        <>
          <p className="mt-3 text-2xl font-bold tabular-nums text-ink">
            {usd(live.balance_usd ?? 0)}
          </p>
          <p className="text-[11px] text-ink-muted">
            balance read from RunPod, refreshed every minute
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt className="text-ink-muted">Spending now</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {live.spend_per_hour_usd != null ? `${usdFine(live.spend_per_hour_usd)}/h` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Spend limit</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {live.spend_limit_usd != null ? usd(live.spend_limit_usd) : '—'}
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}

const field =
  'mt-1 w-full rounded-xl border border-line bg-studio-surface px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-trend-orange/40';
const fieldLabel = 'block text-[11px] font-medium text-ink-soft';

function BudgetForm({ providers, onSaved }: { providers: string[]; onSaved: () => void }) {
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [credits, setCredits] = useState('');
  const [boughtOn, setBoughtOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addAdminBudget({
        provider: provider.trim(),
        amount_usd: Number(amount),
        credits: credits ? Number(credits) : null,
        note: note.trim() || null,
        bought_at: boughtOn || null,
      });
      setAmount('');
      setCredits('');
      setNote('');
      onSaved();
    } catch (err) {
      setError(errorText(err, 'Could not save the top-up'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Record a top-up" subtitle="Credits or tokens you bought from a provider">
      <form onSubmit={submit} className="space-y-3">
        <label className={fieldLabel}>
          Provider
          <input
            required
            list="ai-providers"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="kling"
            className={field}
          />
          <datalist id="ai-providers">
            {providers.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={fieldLabel}>
            Paid (USD)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              className={field}
            />
          </label>
          <label className={fieldLabel}>
            Credits (optional)
            <input
              type="number"
              min="0"
              step="any"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="3000"
              className={field}
            />
          </label>
        </div>
        <label className={fieldLabel}>
          Bought on
          <input
            type="date"
            value={boughtOn}
            onChange={(e) => setBoughtOn(e.target.value)}
            className={field}
          />
        </label>
        <label className={fieldLabel}>
          Note (optional)
          <input
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kling trial pack"
            className={field}
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-trend-orange px-4 py-2 text-xs font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add top-up'}
        </button>
      </form>
    </Panel>
  );
}

function ModelsTable({
  models,
  filter,
  onFilter,
}: {
  models: AdminAiCostGroup[];
  filter: CallFilter;
  onFilter: (f: CallFilter) => void;
}) {
  return (
    <AdminTable
      columns={[
        'Provider / model',
        'Calls',
        'Failed',
        'Tokens in',
        'Tokens out',
        'Avg latency',
        'Cost',
      ]}
      loading={false}
      error={null}
      isEmpty={!models.length}
      emptyText="No AI call in this period."
    >
      {models.map((m) => {
        const pick = { provider: m.provider ?? undefined, model: m.model ?? undefined };
        const active = filter.provider === pick.provider && filter.model === pick.model;
        return (
          <tr key={m.key} className={active ? 'bg-studio-surface' : 'hover:bg-studio-surface'}>
            <td className={cell}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(active ? {} : pick)}
                className="text-left font-semibold text-ink hover:underline"
              >
                {m.provider}
                <span className="font-normal text-ink-muted"> / {m.model ?? 'no model'}</span>
              </button>
            </td>
            <td className={`${cell} tabular-nums`}>{m.calls.toLocaleString('en')}</td>
            <td className={`${cell} tabular-nums`}>{m.failed}</td>
            <td className={`${cell} tabular-nums`}>{compact(m.input_tokens)}</td>
            <td className={`${cell} tabular-nums`}>{compact(m.output_tokens)}</td>
            <td className={`${cell} tabular-nums`}>{seconds(m.avg_latency_ms)}</td>
            <td className={`${cell} font-semibold tabular-nums text-ink`}>{usdFine(m.cost_usd)}</td>
          </tr>
        );
      })}
    </AdminTable>
  );
}

function CallsTable({
  data,
  filter,
  onFilter,
}: {
  data: AdminAiCostsResponse;
  filter: CallFilter;
  onFilter: (f: CallFilter) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Individual calls</h2>
          <p className="text-xs text-ink-muted">
            Latest 100
            {filter.provider &&
              ` for ${filter.provider}${filter.model ? ` / ${filter.model}` : ''}`}
            . Video renders in detail:{' '}
            <Link href="/admin/ai-generations" className="text-ink-soft underline">
              AI Generations
            </Link>
          </p>
        </div>
        <FilterSelect
          label="Provider"
          value={filter.provider ?? ''}
          onChange={(v) => onFilter(v ? { provider: v } : {})}
          options={[
            { value: '', label: 'All providers' },
            ...data.providers.map((p) => ({ value: p.key, label: p.key })),
          ]}
        />
      </div>
      <AdminTable
        columns={[
          'When',
          'Feature',
          'Provider / model',
          'Status',
          'Tokens in / out',
          'Latency',
          'Cost',
        ]}
        loading={false}
        error={null}
        isEmpty={!data.calls.length}
        emptyText="No call matches."
      >
        {data.calls.map((c) => (
          <tr key={`${c.feature}-${c.id}`} className="hover:bg-studio-surface">
            <td className={`${cell} whitespace-nowrap`}>{when(c.at)}</td>
            <td className={cell}>{featureLabel(c.feature)}</td>
            <td className={cell}>
              <span className="font-semibold text-ink">{c.provider}</span>
              {c.model && <span className="text-ink-muted"> / {c.model}</span>}
            </td>
            <td className={cell}>
              {c.status ? <Badge tone={statusTone(c.status)}>{c.status}</Badge> : '—'}
            </td>
            <td className={`${cell} tabular-nums`}>
              {c.input_tokens != null || c.output_tokens != null
                ? `${compact(c.input_tokens ?? 0)} / ${compact(c.output_tokens ?? 0)}`
                : '—'}
            </td>
            <td className={`${cell} tabular-nums`}>{seconds(c.latency_ms)}</td>
            <td className={`${cell} font-semibold tabular-nums text-ink`}>{usdFine(c.cost_usd)}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
