'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { AppShell } from '../../../components/AppShell';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { billingApi, type BillingSummary } from '../../../lib/api/billing';
import { creditsText, isSubscribed, PLAN_LABEL } from '../../../lib/billing-rules.mjs';

// Stripe confirms through a webhook, usually within seconds: poll until the plan shows.
const POLL_MS = 1500;
const MAX_POLLS = 12;

export default function BillingSuccessPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let alive = true;
    let polls = 0;
    const tick = async () => {
      polls += 1;
      try {
        const s = await billingApi.getSummary();
        if (!alive) return;
        setSummary(s);
        if (isSubscribed(s)) return;
      } catch {
        // keep polling: the API may be restarting
      }
      if (!alive) return;
      if (polls >= MAX_POLLS) setGaveUp(true);
      else setTimeout(tick, POLL_MS);
    };
    void tick();
    return () => {
      alive = false;
    };
  }, []);

  const done = summary !== null && isSubscribed(summary);

  return (
    <ProtectedRoute>
      <AppShell active="/billing" topbar={<p className="text-sm font-medium">Billing</p>}>
        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
          {done ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
              <h1 className="mt-5 font-editorial text-[36px] leading-tight text-studio-text">
                You&apos;re on {PLAN_LABEL[summary.plan]}
              </h1>
              <p className="mt-3 text-[15px] text-studio-muted">
                {creditsText(summary.credits)} ready to use. Time to make the next ad.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-trend-orange px-6 text-[15px] font-semibold text-white transition hover:bg-trend-orange-strong"
              >
                Go to Studio
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ) : gaveUp ? (
            <>
              <h1 className="font-editorial text-[32px] leading-tight text-studio-text">
                Payment received
              </h1>
              <p role="status" className="mt-3 text-[15px] text-studio-muted">
                Your plan is still being confirmed. It usually takes under a minute; refresh this
                page or check Billing shortly.
              </p>
              <Link
                href="/billing"
                className="mt-8 inline-flex h-12 items-center rounded-xl border border-studio-rule px-6 text-[15px] font-semibold text-studio-text hover:border-studio-text"
              >
                Open Billing
              </Link>
            </>
          ) : (
            <p role="status" className="flex items-center justify-center gap-2 text-studio-muted">
              <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden />
              Confirming your payment…
            </p>
          )}
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
