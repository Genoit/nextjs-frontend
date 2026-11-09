'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { shopifyApi, type ShopifyAlert } from '../../lib/api/shopify';
import { focusRing } from '../dashboard/DashShell';

/** Dashboard line shown only when a sent product is in conflict or failed to sync. */
export function ShopifyAlertsNotice() {
  const [alerts, setAlerts] = useState<ShopifyAlert[]>([]);
  useEffect(() => {
    shopifyApi.alerts().then(setAlerts, () => undefined); // no line when alerts are unavailable
  }, []);
  if (alerts.length === 0) return null;
  const n = alerts.length;
  const one = n === 1 ? alerts[0] : null;
  return (
    <Link
      href={one ? `/products/${one.product_id}` : '/settings#stores'}
      className={`mx-auto mt-6 flex w-fit max-w-full items-center gap-2.5 rounded-[10px] bg-warning-soft px-3.5 py-2.5 text-[13px] text-warning transition hover:brightness-125 ${focusRing}`}
    >
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">
        {one
          ? `${one.product_title} needs attention in ${one.shop_domain}`
          : `${n} Shopify listings need attention`}
      </span>
      <ChevronRight className="size-4 shrink-0" aria-hidden />
    </Link>
  );
}
