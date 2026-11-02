'use client';

import { useEffect, useState } from 'react';
import { Check, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import {
  billingApi,
  type BillingPlan,
  type BillingSummary,
  type PlanId,
} from '../../lib/api/billing';
import {
  adsFor,
  creditsText,
  founderPrice,
  isSubscribed,
  PLAN_LABEL,
  PLAN_PITCH,
} from '../../lib/billing-rules.mjs';

const RECOMMENDED: PlanId = 'pro';

function PlanCard({
  plan,
  summary,
  busy,
  onChoose,
  onManage,
}: {
  plan: BillingPlan;
  summary: BillingSummary;
  busy: string | null;
  onChoose: (id: PlanId) => void;
  onManage: () => void;
}) {
  const current = summary.plan === plan.id;
  const subscribed = isSubscribed(summary);
  const paid = plan.id !== 'free';
  const price = Number(plan.price_usd);
  const offer = paid && summary.founder_offer && !subscribed;
  const spc = summary.seconds_per_credit;
  const featured = plan.id === RECOMMENDED;

  let action: React.ReactNode;
  if (current) {
    action = (
      <span className="flex h-11 items-center justify-center rounded-lg bg-studio-surface text-sm font-medium text-studio-muted">
        Current plan
      </span>
    );
  } else if (!paid) {
    action = null;
  } else if (!plan.available) {
    action = (
      <span className="flex h-11 items-center justify-center rounded-lg bg-studio-surface text-sm text-studio-muted">
        Not available yet
      </span>
    );
  } else if (subscribed) {
    action = (
      <button
        type="button"
        onClick={onManage}
        disabled={busy !== null}
        className="flex h-11 w-full items-center justify-center rounded-lg border border-studio-rule text-sm font-semibold text-studio-text transition hover:border-studio-text disabled:opacity-60"
      >
        Switch in billing portal
      </button>
    );
  } else {
    action = (
      <button
        type="button"
        onClick={() => onChoose(plan.id)}
        disabled={busy !== null}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:opacity-60 ${
          featured
            ? 'bg-trend-orange text-white hover:bg-trend-orange-strong'
            : 'border border-studio-rule text-studio-text hover:border-studio-text'
        }`}
      >
        {busy === plan.id && (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        )}
        Choose {PLAN_LABEL[plan.id]}
      </button>
    );
  }

  return (
    <li
      className={`flex flex-col rounded-2xl p-5 ${
        featured ? 'border-2 border-trend-orange bg-white' : 'border border-studio-rule bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-studio-text">{PLAN_LABEL[plan.id]}</h2>
        {featured && (
          <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-trend-orange-strong">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-studio-muted">{PLAN_PITCH[plan.id]}</p>

      <div className="mt-5 flex items-baseline gap-2">
        {offer ? (
          <>
            <span className="text-3xl font-semibold tabular-nums text-studio-text">
              ${founderPrice(price)}
            </span>
            <span className="text-sm tabular-nums text-studio-meta line-through">${price}</span>
          </>
        ) : (
          <span className="text-3xl font-semibold tabular-nums text-studio-text">${price}</span>
        )}
        <span className="text-sm text-studio-muted">/ month</span>
      </div>
      {offer && (
        <p className="mt-1 text-xs text-trend-orange-strong">Founder price, first 3 months</p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5 text-sm text-studio-text">
        {paid ? (
          <>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>
                <strong className="font-semibold">{plan.monthly_credits} credits</strong> a month
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>
                {adsFor(plan.monthly_credits, 30, spc)} ads of 30 s, or{' '}
                {adsFor(plan.monthly_credits, 15, spc)} of 15 s
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>Cancel anytime</span>
            </li>
          </>
        ) : (
          <>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>Product analysis and storyboard</span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>1 credit to try a 15 s ad</span>
            </li>
          </>
        )}
      </ul>

      {action && <div className="mt-6">{action}</div>}
    </li>
  );
}

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<BillingPlan[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    Promise.all([billingApi.getSummary(), billingApi.getPlans()])
      .then(([s, p]) => {
        setCanceled(new URLSearchParams(window.location.search).get('canceled') === '1');
        setSummary(s);
        setPlans(p);
      })
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : 'Billing could not be loaded.'),
      );
  }, []);

  const go = async (key: string, call: () => Promise<{ url: string }>) => {
    setBusy(key);
    setActionError(null);
    try {
      const { url } = await call();
      window.location.assign(url);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(null);
    }
  };
  const choose = (id: PlanId) => void go(id, () => billingApi.checkout(id));
  const manage = () => void go('portal', () => billingApi.portal());

  const topbar = <p className="text-sm font-medium text-studio-text">Billing</p>;
  const renews =
    summary?.current_period_end &&
    new Date(summary.current_period_end).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

  return (
    <ProtectedRoute>
      <AppShell active="/billing" topbar={topbar}>
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <h1 className="font-editorial text-[34px] leading-[1.05] tracking-[-0.01em] text-studio-text sm:text-[44px]">
            Plans and credits
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-studio-muted">
            One credit is 15 seconds of finished video, so a 30 s ad uses 2 credits. Credits are
            only used when a video is rendered.
          </p>

          {canceled && (
            <p role="status" className="mt-6 rounded-xl bg-studio-surface px-4 py-3 text-sm">
              Checkout canceled. Nothing was charged.
            </p>
          )}
          {(loadError || actionError) && (
            <p
              role="alert"
              className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {loadError || actionError}
            </p>
          )}

          {summary && (
            <section
              aria-label="Your plan"
              className="mt-8 flex flex-col gap-4 rounded-2xl bg-cream p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-studio-muted">Current plan</p>
                <p className="mt-0.5 text-xl font-semibold text-studio-text">
                  {PLAN_LABEL[summary.plan]}
                  <span className="ml-3 text-base font-normal tabular-nums text-studio-muted">
                    {creditsText(summary.credits)} left
                  </span>
                </p>
                {isSubscribed(summary) && renews && (
                  <p className="mt-1 text-sm text-studio-muted">
                    Credits renew on {renews}. Unused credits do not roll over.
                  </p>
                )}
                {summary.subscription_status === 'past_due' && (
                  <p className="mt-1 text-sm text-danger">
                    Your last payment failed. Update your card to keep your plan.
                  </p>
                )}
              </div>
              {summary.has_billing_account && (
                <button
                  type="button"
                  onClick={manage}
                  disabled={busy !== null}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-studio-rule bg-white px-4 text-sm font-semibold text-studio-text transition hover:border-studio-text disabled:opacity-60"
                >
                  {busy === 'portal' ? (
                    <Loader2
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden
                    />
                  ) : (
                    <CreditCard className="h-4 w-4" aria-hidden />
                  )}
                  Manage billing
                </button>
              )}
            </section>
          )}

          {summary?.founder_offer && !isSubscribed(summary) && (
            <p className="mt-6 flex items-center gap-2 text-sm text-studio-text">
              <Sparkles className="h-4 w-4 text-trend-gold" aria-hidden />
              Launch offer: 25 % off your first 3 months, applied at checkout.
            </p>
          )}

          {summary && plans ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  summary={summary}
                  busy={busy}
                  onChoose={choose}
                  onManage={manage}
                />
              ))}
            </ul>
          ) : (
            !loadError && (
              <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => (
                  <li
                    key={i}
                    className="h-80 rounded-2xl bg-studio-surface motion-safe:animate-pulse"
                  />
                ))}
              </ul>
            )
          )}

          <p className="mt-8 text-xs text-studio-meta">
            Prices in USD, billed monthly. Payments are handled by Stripe; TrendED never sees your
            card.
          </p>
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
