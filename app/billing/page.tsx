'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUp, Loader2 } from 'lucide-react';
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

// How every 15 s ad is cut, in real seconds: one credit pays for exactly this.
const BEATS = [
  {
    beat: 'Hook',
    s: 2,
    words: 'Two seconds',
    clause: 'First, the hook that stops the scroll.',
    tone: 'bg-trend-orange text-on-accent',
  },
  {
    beat: 'Problem',
    s: 3,
    words: 'Three seconds',
    clause: 'Then the problem your buyer already has.',
    tone: 'bg-[#f3e3c3] text-on-accent',
  },
  {
    beat: 'Product',
    s: 5,
    words: 'Five seconds',
    clause: 'Then the product, shown from the facts on its page.',
    tone: 'bg-trend-gold text-on-accent',
  },
  {
    beat: 'Proof',
    s: 3,
    words: 'Three seconds',
    clause: 'Then proof the page really gives.',
    tone: 'bg-studio-raised text-ink',
  },
  {
    beat: 'Call to action',
    s: 2,
    words: 'Two seconds',
    clause: 'Last, the call to action.',
    tone: 'bg-trend-orange-strong text-on-accent',
  },
];

const rise = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties;

const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-[background-color,transform] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-60 motion-reduce:transition-none';

/** The 15 s of ad a credit buys, drawn small enough to sit inside the headline. */
function CreditStrip() {
  return (
    <span
      data-ui
      aria-hidden
      className="shutter relative inline-flex h-[0.74em] min-w-[3em] flex-1 overflow-hidden rounded-[14px] max-sm:my-3 max-sm:aspect-[2/1] max-sm:h-auto max-sm:w-full sm:mx-[0.15em]"
    >
      <span className="flex h-full w-full gap-1 font-sans">
        {BEATS.map((b) => (
          <span
            key={b.beat}
            style={{ flexGrow: b.s }}
            className={`flex min-w-0 basis-0 flex-col justify-between rounded-[11px] p-2 text-[13px] leading-tight tracking-normal sm:p-2.5 ${b.tone}`}
          >
            <span className="truncate font-medium">{b.beat}</span>
            <span className="tabular-nums opacity-80">{b.s} s</span>
          </span>
        ))}
      </span>
    </span>
  );
}

function PlanOffer({
  plans,
  summary,
  busy,
  onChoose,
  onManage,
}: {
  plans: BillingPlan[];
  summary: BillingSummary;
  busy: string | null;
  onChoose: (id: PlanId) => void;
  onManage: () => void;
}) {
  const subscribed = isSubscribed(summary);
  const [picked, setPicked] = useState<PlanId>(subscribed ? summary.plan : RECOMMENDED);
  const plan = plans.find((p) => p.id === picked) ?? plans[0];
  const paid = plan.id !== 'free';
  const spc = summary.seconds_per_credit;
  const credits = paid ? plan.monthly_credits : FREE_TRIAL_CREDITS;
  const price = Number(plan.price_usd);
  const offer = paid && summary.founder_offer && !subscribed;
  const shown = offer ? founderPrice(price) : String(price);
  const ads30 = adsFor(credits, 30, spc);
  const ads15 = adsFor(credits, 15, spc);
  const current = summary.plan === plan.id;

  let action = null;
  if (current) {
    action = (
      <p className="flex min-h-12 items-center text-[17px] font-medium">This is your plan</p>
    );
  } else if (paid && !plan.available) {
    action = (
      <button type="button" disabled className={`${button} bg-ink text-on-accent`}>
        Not available yet
      </button>
    );
  } else if (paid && subscribed) {
    action = (
      <button
        type="button"
        onClick={onManage}
        disabled={busy !== null}
        className={`${button} bg-ink text-on-accent hover:bg-white`}
      >
        {busy === 'portal' && (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        )}
        Switch in billing portal
      </button>
    );
  } else if (paid) {
    action = (
      <button
        type="button"
        onClick={() => onChoose(plan.id)}
        disabled={busy !== null}
        className={`${button} bg-trend-orange text-on-accent hover:bg-trend-orange-strong`}
      >
        {busy === plan.id ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : null}
        Choose {PLAN_LABEL[plan.id]}
        {busy !== plan.id && <ArrowRight className="h-4 w-4" aria-hidden />}
      </button>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">
        <div role="radiogroup" aria-label="Plan" className="reveal flex flex-wrap gap-2">
          {plans.map((p) => {
            const on = p.id === plan.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(p.id)}
                className={`min-h-11 rounded-full px-5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  on ? 'bg-ink text-on-accent' : 'bg-studio-ground text-ink hover:bg-cream'
                }`}
              >
                {PLAN_LABEL[p.id]}
                <span className={`ml-2 tabular-nums ${on ? 'text-on-accent/70' : 'text-ink-soft'}`}>
                  ${Number(p.price_usd)}
                </span>
                {p.id === summary.plan && <span className="sr-only"> (your plan)</span>}
              </button>
            );
          })}
        </div>

        <h2
          id="plans-title"
          aria-live="polite"
          className="mt-12 font-editorial text-[11vw] leading-[1] tracking-[-0.02em] text-ink sm:text-[8vw] lg:text-[5.6vw] 2xl:text-[88px]"
        >
          <span className="block">
            {paid ? `${ads30} ads of 30 s a month` : `${ads15} ad of 15 s to try`}
          </span>
          <span className="block">
            for{' '}
            <span className="inline-block bg-trend-orange px-[0.15em] leading-[1] text-on-accent tabular-nums">
              ${shown}
            </span>
            {offer && (
              <span className="ml-[0.3em] align-middle font-sans text-[18px] tracking-normal text-ink-soft line-through sm:text-[22px]">
                ${price}
              </span>
            )}
          </span>
        </h2>

        <p className="mt-10 max-w-[52ch] text-[17px] leading-relaxed text-ink md:text-[20px]">
          {PLAN_LABEL[plan.id]} is {PLAN_PITCH[plan.id].charAt(0).toLowerCase()}
          {PLAN_PITCH[plan.id].slice(1)}{' '}
          {paid
            ? `${creditsText(credits)} every month, or ${ads15} ads of 15 s. Cancel anytime.`
            : `${creditsText(credits)} at sign-up for one 15 s ad.`}{' '}
          Product analysis and storyboards never use credits.
          {offer && (
            <span className="mt-2 block text-[15px] text-trend-orange-strong md:text-[17px]">
              Founder price for your first 3 months, then ${price} a month.
            </span>
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {action}
          {summary.has_billing_account && (
            <button
              type="button"
              onClick={onManage}
              disabled={busy !== null}
              className="min-h-11 text-[15px] text-ink underline underline-offset-4 hover:text-trend-orange-strong"
            >
              Manage billing and invoices
            </button>
          )}
        </div>
      </div>

      {/* The plan's month drawn as what it buys: one 9:16 frame per 15 s credit. */}
      <figure data-ui className="lg:col-span-5">
        <ul aria-hidden className="flex max-w-[540px] flex-wrap gap-1.5">
          {Array.from({ length: credits }, (_, i) => (
            <li
              key={`${plan.id}-${i}`}
              style={{ animationDelay: `${i * 18}ms` }}
              className="rise aspect-[9/16] w-[clamp(22px,2.6vw,38px)] rounded-[6px] bg-studio-meta"
            />
          ))}
        </ul>
        <figcaption className="mt-5 text-[17px] leading-relaxed text-ink">
          {creditsText(credits)}
          {paid ? ' a month' : ''}: {videoTime(credits, spc)} of finished video, one frame per {spc}{' '}
          s.
        </figcaption>
      </figure>
    </div>
  );
}

const FAQ = [
  {
    q: 'When is a credit used?',
    a: 'Only when a video is rendered. Reading your product, the strategy and the storyboard never use credits.',
  },
  {
    q: 'How many credits does an ad use?',
    a: 'One per 15 seconds started: a 15 s ad uses 1 credit, a 30 s ad uses 2.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'No. Paid plans get fresh credits on each billing date; credits left from the month before do not carry over.',
  },
  {
    q: 'What if I cancel a render?',
    a: 'The credits it reserved go back to your balance.',
  },
  {
    q: 'Can I change or stop my plan?',
    a: 'Yes, anytime, from the billing portal. There is no commitment.',
  },
  {
    q: 'Who handles the payment?',
    a: 'Stripe. TrendED never sees your card. Prices are in USD and billed monthly; the launch offer takes 25% off your first 3 months at checkout.',
  },
];

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

  const spc = summary?.seconds_per_credit ?? 15;
  const renews =
    summary?.current_period_end &&
    new Date(summary.current_period_end).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

  return (
    <ProtectedRoute>
      <main className="text-ink">
        {/* Hero: the credit is pictured as the 15 s of ad it pays for. */}
        <section
          aria-labelledby="hero-title"
          className="mx-auto flex max-w-[1440px] flex-col justify-center lg:min-h-[calc(100svh-64px)] px-4 py-16 sm:px-7"
        >
          <h1
            id="hero-title"
            className="font-editorial text-[15vw] leading-[0.95] tracking-[-0.03em] sm:text-[9vw] 2xl:text-[136px]"
          >
            <span className="flex flex-wrap items-center sm:flex-nowrap">
              <span className="rise shrink-0">One credit,</span>
              <CreditStrip />
            </span>
            <span className="rise block sm:text-right" style={rise(120)}>
              fifteen seconds
            </span>
          </h1>
          <p
            className="rise mt-10 max-w-[44ch] text-[17px] leading-relaxed sm:text-[22px]"
            style={rise(240)}
          >
            {summary ? (
              <>
                You are on {PLAN_LABEL[summary.plan]} with {creditsText(summary.credits)} left:{' '}
                {videoTime(summary.credits, spc)} of finished video.
                {isSubscribed(summary) && renews ? ` Credits renew on ${renews}.` : ''}
              </>
            ) : (
              'TrendED plans are counted in finished video, never in tries.'
            )}
          </p>
          {summary?.subscription_status === 'past_due' && (
            <p className="mt-3 text-[17px] text-danger">
              Your last payment failed. Update your card to keep your plan.
            </p>
          )}
          <a
            href="#plans"
            className={`rise mt-8 self-start ${button} bg-ink text-on-accent hover:bg-white`}
            style={rise(360)}
          >
            Find your plan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </section>

        {/* Pricing: the offer is one sentence, and it changes with the plan picked. */}
        <section
          id="plans"
          aria-labelledby="plans-title"
          className="flex min-h-[80svh] scroll-mt-4 flex-col justify-center bg-cream py-24 sm:py-32"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-7">
            {canceled && (
              <p role="status" className="mb-8 text-[17px]">
                Checkout canceled. Nothing was charged.
              </p>
            )}
            {(loadError || actionError) && (
              <p role="alert" className="mb-8 text-[17px] text-danger">
                {loadError || actionError}
              </p>
            )}
            {summary && plans ? (
              <PlanOffer
                plans={plans}
                summary={summary}
                busy={busy}
                onChoose={choose}
                onManage={manage}
              />
            ) : (
              !loadError && (
                <h2
                  id="plans-title"
                  aria-busy="true"
                  className="font-editorial text-[11vw] leading-[1] text-ink-soft sm:text-[8vw] xl:text-[116px]"
                >
                  Loading plans
                </h2>
              )
            )}
          </div>
        </section>

        {/* How it works: the strip from the headline, opened to the full width. */}
        <section
          aria-labelledby="credit-title"
          className="mx-auto max-w-[1440px] px-4 py-32 sm:px-7 sm:py-48"
        >
          <h2
            id="credit-title"
            className="reveal font-editorial text-[11vw] leading-[1] tracking-[-0.02em] sm:text-[6.4vw] 2xl:text-[104px]"
          >
            Where one credit goes
          </h2>
          <ol data-ui className="mt-16 flex flex-col gap-[6px] sm:flex-row">
            {BEATS.map((b, i) => (
              <li
                key={b.beat}
                style={{ flexGrow: b.s, '--reveal-end': `${40 + i * 8}%` } as CSSProperties}
                className="reveal flex basis-0 flex-col"
              >
                <div
                  style={{ minHeight: `max(72px, ${b.s * 4.5}svh)` }}
                  className={`flex flex-col justify-between gap-3 p-5 sm:h-[22vh] ${b.tone}`}
                >
                  <span className="text-[22px] leading-tight sm:text-[clamp(20px,2vw,30px)]">
                    {b.words}
                  </span>
                  <span className="text-[15px] font-medium">{b.beat}</span>
                </div>
                <p className="max-w-[22ch] pt-3 text-[16px] leading-snug sm:pt-4 sm:text-[17px]">
                  {b.clause}
                </p>
              </li>
            ))}
          </ol>
          <p className="reveal mt-14 max-w-[60ch] text-[17px] leading-relaxed">
            That is one 15 s ad, one credit. A 30 s ad runs the same five beats over twice the time
            and uses two.
          </p>
        </section>

        <section
          aria-labelledby="faq-title"
          className="mx-auto max-w-[1440px] px-4 pb-32 sm:px-7 sm:pb-48"
        >
          <h2
            id="faq-title"
            className="reveal font-editorial text-[10vw] leading-[1] tracking-[-0.02em] sm:text-[5.5vw] 2xl:text-[84px]"
          >
            Questions about credits
          </h2>
          <div className="mt-20 md:ml-[33.333%]">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="reveal group -mx-4 mb-7 px-4 py-3 open:bg-cream sm:-mx-6 sm:px-6 sm:py-5"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-[19px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-[23px] [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="relative h-3 w-4 shrink-0 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    <span className="absolute top-[5px] left-0 h-[2px] w-[10px] rotate-45 bg-ink" />
                    <span className="absolute top-[5px] right-0 h-[2px] w-[10px] -rotate-45 bg-ink" />
                  </span>
                </summary>
                <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed sm:text-[17px]">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Close: the way back is the display line. */}
        <footer className="flex min-h-[520px] flex-col justify-between gap-24 bg-trend-orange lg:min-h-[90svh] px-4 py-10 text-on-accent sm:px-7">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-4 text-[15px] sm:flex-row">
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-10">
              <p>TrendED plans and credits</p>
              <p>Payments by Stripe</p>
              <p>Prices in USD, billed monthly</p>
            </div>
            <a
              href="#hero-title"
              className="inline-flex min-h-11 items-center gap-1.5 self-start underline-offset-4 hover:underline sm:self-auto"
            >
              Back to top
              <ArrowUp className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div className="mx-auto w-full max-w-[1440px]">
            <Link
              href="/dashboard"
              className="group block font-editorial text-[17vw] leading-[0.95] tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white sm:text-[11vw] 2xl:text-[168px]"
            >
              <span className="inline-block transition-transform duration-300 group-hover:-translate-x-2 motion-reduce:transition-none">
                Back to Studio
              </span>
            </Link>
            <div className="mt-10 flex flex-col gap-1 text-[14px] sm:flex-row sm:justify-between">
              <span>
                <a href="#plans" className="underline-offset-4 hover:underline">
                  Plans
                </a>
                {' · '}
                <a href="#faq-title" className="underline-offset-4 hover:underline">
                  Questions
                </a>
              </span>
              <span>One credit, fifteen seconds of finished video</span>
              <span>TrendED, 2026</span>
            </div>
          </div>
        </footer>
      </main>
    </ProtectedRoute>
  );
}
