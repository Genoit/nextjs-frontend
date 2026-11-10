'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { autopilotApi } from '../../../lib/api/autopilot';
import { AutopilotRun } from '../../../lib/types/autopilot';
import { statusLabel } from '../../../lib/autopilot-rules.mjs';
import { focusRing } from '../../../components/dashboard/DashShell';

// The autopilot runs list (was /ads before the ad library), inside the /ads layout.
export default function AutopilotRunsPage() {
  const [runs, setRuns] = useState<AutopilotRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    autopilotApi.list().then(setRuns, () => setError("We couldn't load your ads."));
  }, []);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-studio-muted">Ads made in one step from a product link.</p>
        <Link
          href="/product-input"
          className={`inline-flex h-[38px] shrink-0 items-center rounded-[10px] bg-trend-orange px-4 text-[13px] font-semibold text-on-accent transition hover:bg-trend-orange-strong ${focusRing}`}
        >
          New ad
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      {runs?.length === 0 && (
        <p className="text-[13.5px] text-studio-muted">
          No ads yet. Paste a product link to get started.
        </p>
      )}
      <ul className="space-y-3">
        {runs?.map((r) => (
          <li key={r.id}>
            <Link
              href={`/ads/${encodeURIComponent(r.id)}`}
              className={`flex items-center justify-between gap-4 rounded-[14px] border border-dash-line bg-dash-panel p-4 transition hover:border-dash-edge-hover ${focusRing}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-white">
                  {r.facts?.name ?? 'Product'}
                </span>
                <span className="text-[12.5px] text-studio-muted">{statusLabel(r.status)}</span>
              </span>
              <span className="shrink-0 text-[12.5px] text-studio-muted tabular-nums">
                {r.variants.filter((v) => v.status === 'ready').length}/{r.variant_count} ready
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
