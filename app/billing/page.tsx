'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clapperboard,
  FileSearch,
  Languages,
  Loader2,
  RotateCcw,
  Star,
} from 'lucide-react';
import { SocialIcon, type Social } from '../../components/SocialIcon';
import { goToLogin, useAuth } from '../../lib/auth';
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
const SPC_DEFAULT = 15;

/** Networks the plans are shown for: each one sets the ad length the card counts in. */
const NETWORKS: { id: Social; label: string; adSeconds: number }[] = [
  { id: 'tiktok', label: 'TikTok', adSeconds: 15 },
  { id: 'instagram', label: 'Instagram', adSeconds: 15 },
  { id: 'facebook', label: 'Facebook', adSeconds: 30 },
  { id: 'youtube', label: 'YouTube', adSeconds: 30 },
];

const PREVIOUS: Record<PlanId, string | null> = {
  free: null,
  starter: 'Free',
  pro: 'Starter',
  business: 'Pro',
};

// How every 15 s ad is cut: one credit pays for exactly this.
const BEATS = [
  { beat: 'Hook', s: 2, text: 'Two seconds that stop the scroll.' },
  { beat: 'Problem', s: 3, text: 'The problem your buyer already has.' },
  { beat: 'Product', s: 5, text: 'Your product, shown from the facts on its page.' },
  { beat: 'Proof', s: 3, text: 'Proof the product page really gives.' },
  { beat: 'Call to action', s: 2, text: 'The one thing to do next.' },
];

const INCLUDED = [
  {
    Icon: FileSearch,
    title: 'Product analysis',
    text: 'Read from your link or photos',
    points: [
      'Facts, benefits and buyer',
      'Photos checked for the ad',
      'Edit everything before use',
    ],
  },
  {
    Icon: Clapperboard,
    title: 'Strategy and storyboard',
    text: 'Angles and shots planned for you',
    points: ['Several ad angles', 'Shot by shot storyboard', 'Change any shot'],
  },
  {
    Icon: Languages,
    title: 'Formats and languages',
    text: 'One ad, cut for each network',
    points: ['9:16, 1:1 and 16:9', 'English, French, Spanish, German', 'Voice and music included'],
  },
  {
    Icon: RotateCcw,
    title: 'Credits back',
    text: 'Pay only for finished video',
    points: ['Cancel a render: credits back', 'Failed render: free retry', 'No commitment'],
  },
];

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
    a: 'Stripe. TrendED never sees your card. Prices are in USD and billed monthly; the Founder offer takes 25% off your first 3 months at checkout.',
  },
];

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';
const cta = `inline-flex h-11 items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold tracking-wide uppercase transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`;
const ctaMain = `${cta} bg-trend-orange text-on-accent hover:bg-trend-orange-strong`;
const ctaSoft = `${cta} bg-studio-raised text-studio-text hover:bg-studio-hover`;

type Actions = {
  summary: BillingSummary | null;
  busy: string | null;
  onChoose: (id: PlanId) => void;
  onManage: () => void;
};

function PlanAction({ plan, summary, busy, onChoose, onManage }: Actions & { plan: BillingPlan }) {
  const paid = plan.id !== 'free';
  const featured = plan.id === RECOMMENDED;
  const subscribed = summary ? isSubscribed(summary) : false;
  if (summary?.plan === plan.id) {
    return (
      <p className="flex h-11 items-center justify-center rounded-[10px] border border-studio-rule text-[13.5px] font-semibold tracking-wide text-studio-muted uppercase">
        Your plan
      </p>
    );
  }
  if (!paid) {
    return (
      <Link href="/dashboard" className={`${ctaSoft} w-full`}>
        Start free
      </Link>
    );
  }
  if (!plan.available) {
    return (
      <button type="button" disabled className={`${ctaSoft} w-full`}>
        Not available yet
      </button>
    );
  }
  if (subscribed) {
    return (
      <button
        type="button"
        onClick={onManage}
        disabled={busy !== null}
        className={`${featured ? ctaMain : ctaSoft} w-full`}
      >
        {busy === 'portal' && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Switch plan
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onChoose(plan.id)}
      disabled={busy !== null}
      className={`${featured ? ctaMain : ctaSoft} w-full`}
    >
      {busy === plan.id && <Loader2 className="size-4 animate-spin" aria-hidden />}
      Choose {PLAN_LABEL[plan.id]}
    </button>
  );
}

function PlanCard({
  plan,
  founder,
  network,
  spc,
  ...actions
}: Actions & {
  plan: BillingPlan;
  founder: boolean;
  network: (typeof NETWORKS)[number];
  spc: number;
}) {
  const paid = plan.id !== 'free';
  const featured = plan.id === RECOMMENDED;
  const credits = paid ? plan.monthly_credits : FREE_TRIAL_CREDITS;
  const price = Number(plan.price_usd);
  const discounted = paid && founder;
  const ads = adsFor(credits, network.adSeconds, spc);
  const previous = PREVIOUS[plan.id];
  const points = paid
    ? [
        `${creditsText(credits)} every month`,
        `${videoTime(credits, spc)} of finished video`,
        `${adsFor(credits, 15, spc)} ads of 15 s or ${adsFor(credits, 30, spc)} of 30 s`,
        'Cancel anytime',
      ]
    : [
        `${creditsText(credits)} at sign-up`,
        'Product analysis from a link or photos',
        'Strategy and storyboard',
        '9:16, 1:1 and 16:9 formats',
      ];

  return (
    <li
      className={`relative flex flex-col rounded-[14px] border bg-studio-surface p-6 ${
        featured
          ? 'border-trend-orange shadow-[0_20px_50px_-24px_rgb(255_107_26/0.55)]'
          : 'border-studio-rule'
      }`}
    >
      {featured && (
        <span className="absolute -top-px right-5 inline-flex items-center gap-1 rounded-b-[8px] bg-trend-orange px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-on-accent uppercase">
          <Star className="size-3" fill="currentColor" aria-hidden />
          Most popular
        </span>
      )}
      <span className="w-fit rounded-[6px] bg-studio-raised px-2 py-0.5 text-[12.5px] font-medium text-studio-text">
        {PLAN_LABEL[plan.id]}
      </span>
      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none font-bold tracking-[-0.02em] text-studio-text tabular-nums">
          ${discounted ? founderPrice(price) : price}
        </span>
        <span className="text-[13.5px] text-studio-muted">/month</span>
        {discounted && (
          <span className="text-[13.5px] text-studio-meta tabular-nums line-through">${price}</span>
        )}
      </p>
      <p className="mt-3 text-[13px] font-medium text-studio-text">
        {paid
          ? `Up to ${ads} ${network.label} ads of ${network.adSeconds} s`
          : 'One 15 s ad to try'}
      </p>
      <p className="mt-1 min-h-[36px] text-[12.5px] leading-snug text-studio-muted">
        {PLAN_PITCH[plan.id]}
      </p>

      <p className="mt-5 text-[10.5px] font-semibold tracking-wider text-studio-meta uppercase">
        {previous ? `Everything in ${previous}, and:` : 'Includes:'}
      </p>
      <ul className="mt-3 flex-1 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-[13.5px] leading-snug text-studio-text">
            <Check className="mt-0.5 size-3.5 shrink-0 text-trend-orange" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <PlanAction plan={plan} {...actions} />
      </div>
    </li>
  );
}

function CompareTable({ plans, spc }: { plans: BillingPlan[]; spc: number }) {
  const credits = (p: BillingPlan) => (p.id === 'free' ? FREE_TRIAL_CREDITS : p.monthly_credits);
  const rows: [string, (p: BillingPlan) => string][] = [
    ['Price', (p) => (p.id === 'free' ? '$0' : `$${Number(p.price_usd)}/month`)],
    ['Credits', (p) => (p.id === 'free' ? '1 at sign-up' : `${p.monthly_credits} a month`)],
    ['Finished video', (p) => videoTime(credits(p), spc)],
    ['15 s ads', (p) => String(adsFor(credits(p), 15, spc))],
    ['30 s ads', (p) => String(adsFor(credits(p), 30, spc))],
    ['Product analysis', () => 'Free'],
    ['Strategy and storyboard', () => 'Free'],
    ['Formats', () => '9:16, 1:1, 16:9'],
    ['Cancelled render', () => 'Credits back'],
  ];
  return (
    <div className="mt-8 overflow-x-auto rounded-[14px] border border-studio-rule">
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead className="bg-studio-surface">
          <tr>
            <th scope="col" className="px-5 py-3.5 font-medium text-studio-muted">
              Feature
            </th>
            {plans.map((p) => (
              <th
                key={p.id}
                scope="col"
                className={`px-5 py-3.5 font-semibold ${p.id === RECOMMENDED ? 'text-trend-orange' : 'text-studio-text'}`}
              >
                {PLAN_LABEL[p.id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-studio-rule">
              <th scope="row" className="px-5 py-3 font-normal text-studio-muted">
                {label}
              </th>
              {plans.map((p) => (
                <td key={p.id} className="px-5 py-3 text-studio-text tabular-nums">
                  {value(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Carousel of the five beats one credit pays for. */
function Beats() {
  const track = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section aria-labelledby="beats-title" className="py-20">
      <h2
        id="beats-title"
        className="mx-auto max-w-[620px] px-4 text-center text-[30px] leading-tight font-bold tracking-[-0.02em] text-studio-text sm:text-[38px]"
      >
        What one credit buys: fifteen seconds of ad
      </h2>
      <ul
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:px-[max(16px,calc((100vw_-_1180px)/2))] sm:scroll-px-[max(16px,calc((100vw_-_1180px)/2))]"
      >
        {BEATS.map((b, i) => (
          <li key={b.beat} className="w-[280px] shrink-0 snap-start sm:w-[300px]">
            <div className="flex aspect-[4/3] flex-col justify-between rounded-[14px] bg-[linear-gradient(150deg,rgb(255_107_26/0.28),rgb(255_107_26/0.04))] p-5 ring-1 ring-studio-rule">
              <span className="text-[13px] text-studio-muted tabular-nums">
                Beat {i + 1} of {BEATS.length}
              </span>
              <span className="text-[44px] leading-none font-bold text-studio-text tabular-nums">
                {b.s} s
              </span>
            </div>
            <p className="mt-4 text-[17px] font-semibold text-studio-text">{b.beat}</p>
            <p className="mt-1 text-[14.5px] leading-snug text-studio-muted">{b.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center gap-3">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => slide(d)}
            aria-label={d < 0 ? 'Previous beat' : 'Next beat'}
            className={`flex size-10 items-center justify-center rounded-full border border-studio-rule-strong text-studio-text hover:bg-studio-raised ${focus}`}
          >
            {d < 0 ? (
              <ArrowLeft className="size-4" aria-hidden />
            ) : (
              <ArrowRight className="size-4" aria-hidden />
            )}
          </button>
        ))}
      </div>
      <ul className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-3 px-4 text-[13.5px] text-studio-muted">
        <li>Payments by Stripe</li>
        <li>Prices in USD, billed monthly</li>
        <li>Cancel anytime</li>
        <li>Credits back on cancelled renders</li>
      </ul>
    </section>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<BillingPlan[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [founder, setFounder] = useState(true);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    // Visitors see the public plans; a signed-in merchant also gets their balance and offer.
    Promise.all([billingApi.getPlans(), isAuthenticated ? billingApi.getSummary() : null])
      .then(([p, s]) => {
        setCanceled(new URLSearchParams(window.location.search).get('canceled') === '1');
        setPlans(p);
        setSummary(s);
        if (s) setFounder(s.founder_offer && !isSubscribed(s));
      })
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : 'Billing could not be loaded.'),
      );
  }, [isAuthenticated, isLoading]);

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
  const choose = (id: PlanId) => {
    if (!isAuthenticated) return goToLogin(router, '/billing');
    void go(id, () => billingApi.checkout(id));
  };
  const manage = () => void go('portal', () => billingApi.portal());

  const spc = summary?.seconds_per_credit ?? SPC_DEFAULT;
  const offerOpen = !summary || (summary.founder_offer && !isSubscribed(summary));
  const renews =
    summary?.current_period_end &&
    new Date(summary.current_period_end).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  const actions = { summary, busy, onChoose: choose, onManage: manage };

  return (
    <main className="text-studio-text">
      {/* Hero band with the networks the plans are counted for. */}
      <section className="bg-[linear-gradient(180deg,rgb(255_107_26/0.10),rgb(255_107_26/0.03))] pt-14">
        <div className="mx-auto max-w-[1180px] px-4 text-center">
          <h1 className="text-[34px] leading-tight font-bold tracking-[-0.02em] sm:text-[46px]">
            Choose your plan
          </h1>
          <p className="mt-3 text-[15.5px] text-studio-muted sm:text-[17px]">
            One credit is 15 seconds of finished ad. Analysis and storyboards are free. Cancel any
            time.
          </p>
          {summary && (
            <p className="mt-3 text-[14.5px] text-studio-text">
              You are on {PLAN_LABEL[summary.plan]} with {creditsText(summary.credits)} left (
              {videoTime(summary.credits, spc)} of video).
              {isSubscribed(summary) && renews ? ` Credits renew on ${renews}.` : ''}
            </p>
          )}
          {summary?.subscription_status === 'past_due' && (
            <p className="mt-2 text-[14.5px] text-danger">
              Your last payment failed. Update your card to keep your plan.
            </p>
          )}
          <div
            role="tablist"
            aria-label="Network the ads run on"
            className="mx-auto mt-9 flex max-w-[720px] overflow-x-auto [scrollbar-width:none]"
          >
            {NETWORKS.map((n) => {
              const on = n.id === network.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setNetwork(n)}
                  className={`flex h-14 min-w-[150px] flex-1 items-center justify-center gap-2.5 border-t-2 text-[15px] font-semibold transition ${focus} ${
                    on
                      ? 'border-trend-orange bg-studio-ground text-studio-text'
                      : 'border-transparent text-studio-muted hover:text-studio-text'
                  }`}
                >
                  <SocialIcon name={n.id} />
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" aria-label="Plans" className="mx-auto max-w-[1180px] px-4 pt-10">
        <div className="flex justify-end">
          <div
            role="radiogroup"
            aria-label="Price shown"
            className="flex items-center gap-1 text-[12.5px]"
          >
            {offerOpen && (
              <>
                <button
                  type="button"
                  role="radio"
                  aria-checked={founder}
                  onClick={() => setFounder(true)}
                  className={`rounded px-1 ${focus} ${founder ? 'font-semibold text-trend-orange' : 'text-studio-muted hover:text-studio-text'}`}
                >
                  Founder (-25% for 3 months)
                </button>
                <span aria-hidden className="text-studio-meta">
                  |
                </span>
              </>
            )}
            <button
              type="button"
              role="radio"
              aria-checked={!founder || !offerOpen}
              onClick={() => setFounder(false)}
              className={`rounded px-1 ${focus} ${!founder || !offerOpen ? 'font-semibold text-trend-orange' : 'text-studio-muted hover:text-studio-text'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {canceled && (
          <p role="status" className="mt-4 text-[14.5px]">
            Checkout canceled. Nothing was charged.
          </p>
        )}
        {(loadError || actionError) && (
          <p role="alert" className="mt-4 text-[14.5px] text-danger">
            {loadError || actionError}
          </p>
        )}

        {plans ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                founder={founder && offerOpen}
                network={network}
                spc={spc}
                {...actions}
              />
            ))}
          </ul>
        ) : (
          !loadError && (
            <ul
              aria-busy="true"
              aria-label="Loading plans"
              className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-[440px] animate-pulse rounded-[14px] bg-studio-surface" />
              ))}
            </ul>
          )
        )}

        {summary?.has_billing_account && (
          <p className="mt-5 text-center">
            <button
              type="button"
              onClick={manage}
              disabled={busy !== null}
              className={`text-[14px] text-studio-muted underline underline-offset-4 hover:text-studio-text ${focus}`}
            >
              Manage billing and invoices
            </button>
          </p>
        )}

        {plans && (
          <div className="mt-10 text-center">
            <button
              type="button"
              aria-expanded={compare}
              onClick={() => setCompare((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded text-[14.5px] font-semibold text-trend-orange hover:text-trend-orange-strong ${focus}`}
            >
              Compare all features
              <ChevronDown
                className={`size-4 transition-transform ${compare ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {compare && <CompareTable plans={plans} spc={spc} />}
          </div>
        )}
      </section>

      <Beats />

      {/* Included in every plan: the parts that never use credits. */}
      <section aria-labelledby="included-title" className="mx-auto max-w-[1180px] px-4 pb-24">
        <h2
          id="included-title"
          className="text-center text-[30px] leading-tight font-bold tracking-[-0.02em] sm:text-[38px]"
        >
          Included in every plan
        </h2>
        <p className="mt-3 text-center text-[15.5px] text-studio-muted">
          Everything before the render is free, on every plan.
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map(({ Icon, title, text, points }) => (
            <li
              key={title}
              className="rounded-[14px] border border-studio-rule bg-studio-surface p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-[10px] bg-trend-orange/15 text-trend-orange">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-5 text-[15.5px] font-semibold">{title}</p>
              <p className="mt-0.5 text-[15px] font-bold tabular-nums">
                0 credits{' '}
                <span className="text-[12.5px] font-normal text-studio-muted">on every plan</span>
              </p>
              <p className="mt-4 text-[13px] font-semibold">{text}</p>
              <ul className="mt-2.5 space-y-1.5">
                {points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-[12.5px] text-studio-muted">
                    <Check className="mt-0.5 size-3 shrink-0 text-trend-orange" aria-hidden />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-3">
          <a href="#plans" className={`${ctaMain} px-7`}>
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="text-[13px] text-studio-muted">1 free credit at sign-up · Cancel anytime</p>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="bg-studio-surface/60 py-24">
        <div className="mx-auto max-w-[1180px] px-4">
          <h2
            id="faq-title"
            className="text-center text-[30px] leading-tight font-bold tracking-[-0.02em] sm:text-[38px]"
          >
            Frequently asked questions
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group h-fit rounded-[12px] border border-studio-rule bg-studio-ground px-5"
              >
                <summary
                  className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-semibold [&::-webkit-details-marker]:hidden ${focus}`}
                >
                  {q}
                  <ChevronDown
                    className="size-4 shrink-0 -rotate-90 text-trend-orange transition-transform group-open:rotate-0"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 text-[14px] leading-relaxed text-studio-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-24">
        <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#2a1206,#0f0a07_60%)] px-6 py-16 text-center ring-1 ring-trend-orange/25">
          {/* Confetti marks, decoration only. */}
          {[
            'left-[10%] top-[18%] bg-trend-orange',
            'right-[14%] top-[22%] bg-trend-gold',
            'left-[18%] bottom-[22%] bg-studio-meta',
            'right-[22%] bottom-[26%] bg-trend-orange',
            'left-[6%] top-[58%] bg-trend-gold',
            'right-[8%] top-[60%] bg-studio-meta',
          ].map((c) => (
            <span
              key={c}
              aria-hidden
              className={`absolute hidden h-1.5 w-4 rounded-full sm:block ${c}`}
            />
          ))}
          <h2 className="relative text-[28px] leading-tight font-bold tracking-[-0.02em] sm:text-[36px]">
            Make your first ad today
          </h2>
          <p className="relative mt-3 text-[15.5px] text-studio-muted sm:text-[17px]">
            Paste a product link and get a ready-to-post video ad.
          </p>
          <Link href="/dashboard" className={`relative mx-auto mt-8 ${ctaMain} px-7`}>
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="relative mt-3 text-[13px] text-studio-muted">
            1 free credit at sign-up · Cancel anytime
          </p>
        </div>
      </section>

      <footer className="border-t border-studio-rule">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-8 text-[13px] text-studio-muted sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/dashboard" className="hover:text-studio-text">
              Studio
            </Link>
            <a href="#plans" className="hover:text-studio-text">
              Plans
            </a>
            <a href="#faq-title" className="hover:text-studio-text">
              Questions
            </a>
            <Link href="/settings" className="hover:text-studio-text">
              Settings
            </Link>
          </nav>
          <p>TrendED, 2026 · Payments by Stripe</p>
        </div>
      </footer>
    </main>
  );
}
