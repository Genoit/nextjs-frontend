import { fetchWithAuth, getApiBaseUrl } from './core';

// ============================================
// Billing API (Stripe). 1 credit = seconds_per_credit seconds of video.
// ============================================

export type PlanId = 'free' | 'starter' | 'pro' | 'business';

export interface BillingPlan {
  id: PlanId;
  monthly_credits: number;
  price_usd: string;
  /** false while Stripe or this plan's price is not configured. */
  available: boolean;
}

export interface BillingSummary {
  plan: PlanId;
  credits: number;
  seconds_per_credit: number;
  subscription_status: string | null;
  current_period_end: string | null;
  has_billing_account: boolean;
  founder_offer: boolean;
}

export const billingApi = {
  async getPlans(): Promise<BillingPlan[]> {
    const res = await fetch(`${getApiBaseUrl()}/billing/plans`);
    if (!res.ok) throw new Error('Plans could not be loaded.');
    return res.json() as Promise<BillingPlan[]>;
  },

  getSummary(): Promise<BillingSummary> {
    return fetchWithAuth<BillingSummary>('/billing/me', { method: 'GET' });
  },

  /** Stripe Checkout URL for a paid plan. */
  checkout(plan: PlanId): Promise<{ url: string }> {
    return fetchWithAuth<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  /** Stripe customer portal URL (change plan, card, invoices, cancel). */
  portal(): Promise<{ url: string }> {
    return fetchWithAuth<{ url: string }>('/billing/portal', { method: 'POST' });
  },
};
