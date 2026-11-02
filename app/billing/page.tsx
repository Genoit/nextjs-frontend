'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
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
  videoTime,
} from '../../lib/billing-rules.mjs';

const RECOMMENDED: PlanId = 'pro';
// shortcut: mirrors backend billing_signup_credits (Free has no monthly quota); expose it in /billing/plans if it ever changes.
const FREE_TRIAL_CREDITS = 1;

const secondaryButton =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-semibold text-studio-text transition-colors hover:border-studio-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:opacity-60';

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-studio-rule/70 py-2.5 text-sm">
      <dt className="text-studio-muted">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-studio-text">{value}</dd>
    </div>
  );
}

function PlanColumn({
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
  const credits = paid ? plan.monthly_credits : FREE_TRIAL_CREDITS;
  // Keep the rows of every column level: reserve the offer line wherever one column shows it.
  const offerRow = summary.founder_offer && !subscribed;

  let action: React.ReactNode = null;
  if (current) {
    action = (
      <p className="flex h-11 items-center justify-center text-sm font-medium text-studio-muted">
        Your current plan
      </p>
    );
  } else if (!paid) {
    action = null;
  } else if (!plan.available) {
    action = (
      <p className="flex h-11 items-center justify-center text-sm text-studio-muted">
        Not available yet
      </p>
    );
  } else if (subscribed) {
    action = (
      <button type="button" onClick={onManage} disabled={busy !== null} className={secondaryButton}>
        Switch in billing portal
      </button>
    );
  } else {
    action = (
      <button
        type="button"
        onClick={() => onChoose(plan.id)}
        disabled={busy !== null}
        className={
          featured
            ? 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-trend-orange px-4 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-trend-orange-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:opacity-60 motion-reduce:transition-none'
            : secondaryButton
        }
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
      aria-labelledby={`plan-${plan.id}`}
      className={`flex flex-col p-6 ${featured ? 'bg-cream' : 'bg-white'}`}
    >
      <div className="flex min-h-7 items-center justify-between gap-2">
        <h3 id={`plan-${plan.id}`} className="text-base font-semibold text-studio-text">
          {PLAN_LABEL[plan.id]}
        </h3>
        {featured && (
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-trend-orange-strong">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-1 min-h-10 text-sm leading-5 text-studio-muted">{PLAN_PITCH[plan.id]}</p>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="text-[32px] leading-none font-medium tracking-[-0.02em] tabular-nums text-studio-text">
          ${offer ? founderPrice(price) : price}
        </span>
        {offer && (
          <span className="text-sm tabular-nums text-studio-muted line-through">${price}</span>
        )}
        <span className="text-sm text-studio-muted">/ month</span>
      </p>
      {offerRow && (
        <p className="mt-2 min-h-4 text-xs text-trend-orange-strong">
          {offer ? 'Founder price for your first 3 months' : ''}
        </p>
      )}

      <dl className="mt-5 flex-1">
        <Fact label="Credits" value={paid ? `${credits} a month` : `${credits} to try`} />
        <Fact label="Ads of 30 s" value={adsFor(credits, 30, spc)} />
        <Fact label="Ads of 15 s" value={adsFor(credits, 15, spc)} />
        {paid ? (
          <Fact label="Cancel" value="Anytime" />
        ) : (
          <Fact label="Analysis and storyboard" value="Included" />
        )}
      </dl>

      <div className="mt-6 min-h-11">{action}</div>
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

  const renews =
    summary?.current_period_end &&
    new Date(summary.current_period_end).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  const spc = summary?.seconds_per_credit ?? 15;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1100px] px-4 pt-10 pb-20 sm:px-6 lg:pt-14">
        <h1 className="font-editorial text-[32px] leading-[1.1] text-studio-text">
          Plans and credits
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-studio-muted">
          One credit is {spc} seconds of finished video. Pick the plan that matches how many ads you
          publish each month.
        </p>

        {canceled && (
          <p role="status" className="mt-6 rounded-lg bg-studio-surface px-4 py-3 text-sm">
            Checkout canceled. Nothing was charged.
          </p>
        )}
        {(loadError || actionError) && (
          <p role="alert" className="mt-6 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            {loadError || actionError}
          </p>
        )}

        <section
          aria-labelledby="your-plan"
          className="mt-8 flex min-h-[104px] flex-col gap-4 rounded-2xl bg-studio-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          {summary ? (
            <>
              <div>
                <h2 id="your-plan" className="text-sm text-studio-muted">
                  Your plan
                </h2>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-2xl font-semibold text-studio-text">
                    {PLAN_LABEL[summary.plan]}
                  </span>
                  <span className="text-[15px] tabular-nums text-studio-text">
                    {creditsText(summary.credits)} left
                    <span className="text-studio-muted">
                      {' '}
                      · {videoTime(summary.credits, spc)} of video
                    </span>
                  </span>
                </p>
                {isSubscribed(summary) && renews && (
                  <p className="mt-1 text-sm text-studio-muted">Credits renew on {renews}.</p>
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
                  className={`${secondaryButton} sm:w-auto`}
                >
                  {busy === 'portal' ? (
                    <Loader2
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden
                    />
                  ) : (
                    <CreditCard className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  )}
                  Manage billing
                </button>
              )}
            </>
          ) : (
            <div aria-hidden className="space-y-2">
              <div className="h-4 w-20 rounded bg-studio-raised" />
              <div className="h-7 w-56 rounded bg-studio-raised" />
            </div>
          )}
        </section>

        <section aria-labelledby="plans-title" className="mt-12">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="plans-title" className="text-base font-semibold text-studio-text">
              Monthly plans
            </h2>
            {summary?.founder_offer && !isSubscribed(summary) && (
              <p className="text-sm text-trend-orange-strong">
                Launch offer: 25% off your first 3 months, applied at checkout.
              </p>
            )}
          </div>

          {/* One divided sheet: the 1px gaps over the rule colour are the column dividers. */}
          <ul
            aria-busy={!plans}
            className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-studio-rule bg-studio-rule md:grid-cols-2 xl:grid-cols-4"
          >
            {summary && plans
              ? plans.map((p) => (
                  <PlanColumn
                    key={p.id}
                    plan={p}
                    summary={summary}
                    busy={busy}
                    onChoose={choose}
                    onManage={manage}
                  />
                ))
              : !loadError &&
                Array.from({ length: 4 }, (_, i) => (
                  <li key={i} className="h-[392px] bg-white p-6">
                    <div className="h-5 w-24 rounded bg-studio-surface" />
                    <div className="mt-10 h-8 w-20 rounded bg-studio-surface" />
                  </li>
                ))}
          </ul>
        </section>

        <section
          aria-labelledby="how-credits"
          className="mt-14 grid gap-6 border-t border-studio-rule pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10"
        >
          <div>
            <h2 id="how-credits" className="text-base font-semibold text-studio-text">
              How credits work
            </h2>
            <p className="mt-1 text-sm leading-5 text-studio-muted">
              You pay for finished video, not for trying.
            </p>
          </div>
          <dl className="rounded-2xl bg-studio-surface px-5 py-2">
            {[
              ['1 credit', `${spc} s of finished video`],
              ['A 30 s ad', creditsText(Math.ceil(30 / spc))],
              ['When a credit is used', 'Only when a video is rendered'],
              ['Product analysis and storyboard', 'Never use credits'],
              ['Unused credits', 'Do not roll over to the next month'],
              ['Payment', 'By Stripe; TrendED never sees your card'],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:justify-between sm:gap-6 ${i ? 'border-t border-studio-rule/70' : ''}`}
              >
                <dt className="text-studio-muted">{k}</dt>
                <dd className="text-studio-text sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="mt-6 text-xs text-studio-muted">Prices in USD, billed monthly.</p>
      </main>
    </ProtectedRoute>
  );
}
