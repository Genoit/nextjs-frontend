'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { autopilotApi } from '../../lib/api/autopilot';
import { AutopilotRun } from '../../lib/types/autopilot';
import { statusLabel } from '../../lib/autopilot-rules.mjs';

export default function AdsPage() {
  const [runs, setRuns] = useState<AutopilotRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    autopilotApi.list().then(setRuns, () => setError('Impossible de charger vos pubs.'));
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-dvh bg-cream px-4 py-8 text-ink sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <nav className="flex items-center justify-between text-sm">
            <Link href="/dashboard" className="font-semibold text-ink-muted hover:text-ink">
              ← Studio
            </Link>
            <Link
              href="/product-input"
              className="rounded-xl bg-trend-orange px-4 py-2 font-bold text-white hover:bg-trend-orange-strong"
            >
              Nouvelle pub
            </Link>
          </nav>
          <h1 className="text-[26px] font-black tracking-tight md:text-[32px]">Vos pubs</h1>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          {runs?.length === 0 && (
            <p className="text-ink-muted">
              Aucune pub pour l&apos;instant. Collez le lien d&apos;un produit pour commencer.
            </p>
          )}
          <ul className="space-y-3">
            {runs?.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/ads/${encodeURIComponent(r.id)}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 hover:border-ink-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{r.facts?.name ?? 'Produit'}</span>
                    <span className="text-sm text-ink-muted">{statusLabel(r.status)}</span>
                  </span>
                  <span className="shrink-0 text-sm text-ink-muted">
                    {r.variants.filter((v) => v.status === 'ready').length}/{r.variant_count} prête
                    {r.variant_count > 1 ? 's' : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </ProtectedRoute>
  );
}
