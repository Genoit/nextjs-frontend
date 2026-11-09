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
  Film,
  Languages,
  Loader2,
  RotateCcw,
  Sparkles,
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

const ctaBase =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const ctaMain = `${ctaBase} bg-gradient-to-r from-trend-orange to-ember-text text-black shadow-[0_10px_25px_-8px_rgba(255,98,45,0.5)] hover:brightness-110 ${focus}`;
const ctaSoft = `${ctaBase} border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10 ${focus}`;

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
      <p className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-bold tracking-wider text-studio-muted uppercase">
        Your plan
      </p>
    );
  }
  if (!paid) {
    return (
      <Link href="/dashboard" className={ctaSoft}>
        Start free
      </Link>
    );
  }
  if (!plan.available) {
    return (
      <button type="button" disabled className={ctaSoft}>
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
        className={featured ? ctaMain : ctaSoft}
      >
        {busy === 'portal' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        Switch plan
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onChoose(plan.id)}
      disabled={busy !== null}
      className={featured ? ctaMain : ctaSoft}
    >
      {busy === plan.id && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
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
      className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 ${
        featured
          ? 'border-trend-orange/80 bg-gradient-to-b from-trend-orange/[0.09] via-white/[0.02] to-transparent shadow-[0_0_50px_-15px_rgba(255,98,45,0.3)] lg:-translate-y-2'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      {featured && (
        <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-trend-orange to-ember-text px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black shadow-md">
          <Star className="size-3 fill-black stroke-none" aria-hidden />
          Most popular
        </span>
      )}

      <div>
        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white">
          {PLAN_LABEL[plan.id]}
        </span>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white tabular-nums">
            ${discounted ? founderPrice(price) : price}
          </span>
          <span className="text-xs text-studio-muted">/month</span>
          {discounted && (
            <span className="text-xs text-studio-muted/70 tabular-nums line-through">${price}</span>
          )}
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-trend-orange">
          <Film className="size-3" />
          <span>
            {paid
              ? `Up to ${ads} ${network.label} ads (${network.adSeconds}s)`
              : 'One 15s ad to try'}
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-studio-muted min-h-[34px]">
          {PLAN_PITCH[plan.id]}
        </p>
      </div>

      <div className="mt-5 flex-1 border-t border-white/[0.06] pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-studio-muted">
          {previous ? `Everything in ${previous}, plus:` : 'Includes:'}
        </p>
        <ul className="mt-3 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs text-white/90">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-trend-orange/15 text-trend-orange">
                <Check className="size-2.5 stroke-[3]" aria-hidden />
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-2">
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
    <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th scope="col" className="px-6 py-4 font-semibold text-studio-muted">
                Feature
              </th>
              {plans.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className={`px-6 py-4 font-bold ${
                    p.id === RECOMMENDED ? 'text-trend-orange' : 'text-white'
                  }`}
                >
                  {PLAN_LABEL[p.id]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map(([label, value]) => (
              <tr key={label} className="transition-colors hover:bg-white/[0.02]">
                <th scope="row" className="px-6 py-3.5 font-medium text-studio-muted">
                  {label}
                </th>
                {plans.map((p) => (
                  <td
                    key={p.id}
                    className={`px-6 py-3.5 tabular-nums ${
                      p.id === RECOMMENDED ? 'font-semibold text-trend-orange' : 'text-white'
                    }`}
                  >
                    {value(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Carousel of the five beats one credit pays for. */
function Beats() {
  const track = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section aria-labelledby="beats-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="rounded-full border border-trend-orange/30 bg-trend-orange/10 px-3 py-1 text-xs font-semibold text-trend-orange">
          Structure narrative
        </span>
        <h2
          id="beats-title"
          className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl"
        >
          What one credit buys: fifteen seconds of ad
        </h2>
        <p className="mt-2 text-sm text-studio-muted">
          Each 15 seconds is crafted following proven viral UGC direct-response frameworks.
        </p>
      </div>

      <ul
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:px-[max(16px,calc((100vw_-_1180px)/2))]"
      >
        {BEATS.map((b, i) => (
          <li key={b.beat} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
            <div className="group flex aspect-[4/3] flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-trend-orange/15 via-white/[0.02] to-transparent p-6 transition-all duration-300 hover:border-trend-orange/40 hover:shadow-[0_0_30px_-5px_rgba(255,98,45,0.2)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                  Beat {i + 1} / {BEATS.length}
                </span>
                <span className="text-xs font-semibold text-trend-orange">Structure UGC</span>
              </div>
              <div className="my-auto text-center py-2">
                <span className="text-5xl font-black tracking-tight text-white tabular-nums">
                  {b.s}s
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{b.beat}</p>
                <p className="mt-1 text-xs text-studio-muted leading-relaxed">{b.text}</p>
              </div>
            </div>
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
            className={`flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10 ${focus}`}
          >
            {d < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
          </button>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 px-4 text-xs text-studio-muted">
        <span>✓ Payments by Stripe</span>
        <span>✓ Prices in USD, billed monthly</span>
        <span>✓ Cancel anytime</span>
        <span>✓ Credits back on cancelled renders</span>
      </div>
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
      {/* Hero band with atmospheric glow and network switch tabs */}
      <section className="relative overflow-hidden pt-12 pb-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,98,45,0.15),transparent)]" />

        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-trend-orange/30 bg-trend-orange/10 px-3.5 py-1 text-xs font-semibold text-trend-orange backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            <span>Tarification transparente · Sans engagement</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Choose your plan
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-studio-muted sm:text-base">
            One credit is 15 seconds of finished ad. Analysis and storyboards are free. Cancel any
            time.
          </p>

          {summary && (
            <div className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white backdrop-blur-sm">
              <span className="font-semibold text-trend-orange">
                {PLAN_LABEL[summary.plan]} Plan
              </span>
              <span className="text-studio-muted">·</span>
              <span>
                {creditsText(summary.credits)} left ({videoTime(summary.credits, spc)} of video)
              </span>
              {isSubscribed(summary) && renews && (
                <>
                  <span className="text-studio-muted">·</span>
                  <span className="text-studio-muted">Credits renew on {renews}</span>
                </>
              )}
            </div>
          )}

          {summary?.subscription_status === 'past_due' && (
            <p className="mx-auto mt-3 max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400">
              Your last payment failed. Update your card to keep your plan.
            </p>
          )}

          {/* Network tabs with sleek segmented pill control */}
          <div
            role="tablist"
            aria-label="Network the ads run on"
            className="mx-auto mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-sm"
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
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${focus} ${
                    on
                      ? 'bg-trend-orange text-black font-bold shadow-lg shadow-trend-orange/20'
                      : 'text-studio-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <SocialIcon name={n.id} mono={on} />
                  <span>{n.label}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      on ? 'bg-black/20 text-black font-bold' : 'bg-white/5 text-studio-muted'
                    }`}
                  >
                    {n.adSeconds}s
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section
        id="plans"
        aria-label="Plans"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6"
      >
        {/* Founder / Monthly pill toggle */}
        <div className="flex justify-center sm:justify-end mb-6">
          <div
            role="radiogroup"
            aria-label="Price shown"
            className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-sm"
          >
            {offerOpen && (
              <button
                type="button"
                role="radio"
                aria-checked={founder}
                onClick={() => setFounder(true)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${focus} ${
                  founder
                    ? 'bg-gradient-to-r from-trend-orange to-ember-text text-black font-bold shadow-md'
                    : 'text-studio-muted hover:text-white'
                }`}
              >
                <Sparkles className="size-3" />
                <span>Founder (-25% for 3 months)</span>
              </button>
            )}
            <button
              type="button"
              role="radio"
              aria-checked={!founder || !offerOpen}
              onClick={() => setFounder(false)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${focus} ${
                !founder || !offerOpen
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-studio-muted hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {canceled && (
          <p
            role="status"
            className="mx-auto mb-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-xs text-studio-muted"
          >
            Checkout canceled. Nothing was charged.
          </p>
        )}
        {(loadError || actionError) && (
          <p
            role="alert"
            className="mx-auto mb-6 max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs text-rose-400"
          >
            {loadError || actionError}
          </p>
        )}

        {plans ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
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
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[0, 1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-[460px] animate-pulse rounded-3xl border border-white/5 bg-white/[0.02]"
                />
              ))}
            </ul>
          )
        )}

        {summary?.has_billing_account && (
          <p className="mt-8 text-center">
            <button
              type="button"
              onClick={manage}
              disabled={busy !== null}
              className={`text-xs font-semibold text-studio-muted underline underline-offset-4 hover:text-white ${focus}`}
            >
              Manage billing and invoices
            </button>
          </p>
        )}

        {/* Feature comparison trigger */}
        {plans && (
          <div className="mt-12 text-center">
            <button
              type="button"
              aria-expanded={compare}
              onClick={() => setCompare((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-trend-orange transition hover:border-trend-orange/30 hover:bg-trend-orange/5 ${focus}`}
            >
              <span>Compare all features</span>
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${compare ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {compare && <CompareTable plans={plans} spc={spc} />}
          </div>
        )}
      </section>

      {/* Beats timeline carousel */}
      <Beats />

      {/* Included in every plan: the parts that never use credits. */}
      <section
        aria-labelledby="included-title"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-studio-muted">
            Inclus sans surcoût
          </span>
          <h2
            id="included-title"
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Included in every plan
          </h2>
          <p className="mt-2 text-sm text-studio-muted">
            Everything before the render is free, on every plan.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map(({ Icon, title, text, points }) => (
            <li
              key={title}
              className="flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-trend-orange/10 text-trend-orange">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-5 text-base font-bold text-white">{title}</p>
                <div className="mt-1 inline-flex items-center rounded-lg bg-white/5 px-2 py-0.5 text-xs font-bold text-trend-orange tabular-nums">
                  0 credits{' '}
                  <span className="ml-1 text-[11px] font-normal text-studio-muted">
                    on every plan
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-studio-muted">{text}</p>
              </div>

              <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-studio-muted">
                    <Check className="mt-0.5 size-3 shrink-0 text-trend-orange" aria-hidden />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-3">
          <a
            href="#plans"
            className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-trend-orange to-ember-text px-8 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-trend-orange/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>Get started</span>
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="text-xs text-studio-muted">1 free credit at sign-up · Cancel anytime</p>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section
        aria-labelledby="faq-title"
        className="border-t border-white/[0.06] bg-white/[0.01] py-24"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-studio-muted">
              Aide & Transparence
            </span>
            <h2
              id="faq-title"
              className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm transition hover:border-white/15"
              >
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden ${focus}`}
                >
                  <span>{q}</span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-studio-muted transition group-open:rotate-180 group-open:text-trend-orange">
                    <ChevronDown className="size-4" aria-hidden />
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-studio-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-trend-orange/30 bg-gradient-to-br from-trend-orange/20 via-black to-studio-ground px-6 py-16 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-trend-orange/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-trend-gold/15 blur-3xl pointer-events-none" />

          <h2 className="relative text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Make your first ad today
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-studio-muted">
            Paste a product link and get a ready-to-post video ad.
          </p>
          <Link
            href="/dashboard"
            className="relative mx-auto mt-8 inline-flex h-12 items-center gap-2.5 rounded-2xl bg-gradient-to-r from-trend-orange to-ember-text px-8 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-trend-orange/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>Get started</span>
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="relative mt-3 text-xs text-studio-muted">
            1 free credit at sign-up · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-studio-ground/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-studio-muted sm:flex-row sm:px-6 lg:px-8">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/dashboard" className="transition hover:text-white">
              Studio
            </Link>
            <a href="#plans" className="transition hover:text-white">
              Plans
            </a>
            <a href="#faq-title" className="transition hover:text-white">
              Questions
            </a>
            <Link href="/settings" className="transition hover:text-white">
              Settings
            </Link>
          </nav>
          <p>TrendED, 2026 · Payments secured by Stripe</p>
        </div>
      </footer>
    </main>
  );
}
