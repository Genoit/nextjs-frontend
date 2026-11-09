'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { FactCheck } from '../../../components/autopilot/FactCheck';
import { autopilotApi } from '../../../lib/api/autopilot';
import { AutopilotFacts, AutopilotRun, AutopilotVariant } from '../../../lib/types/autopilot';
import { isPolling, statusLabel } from '../../../lib/autopilot-rules.mjs';

const POLL_MS = 3000;

const VARIANT_LABEL: Record<AutopilotVariant['status'], string> = {
  pending: 'En attente',
  storyboarding: 'Écriture du script',
  rendering: 'Tournage des plans',
  exporting: 'Montage',
  ready: 'Prête',
  failed: 'Échec',
};

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function AutopilotRunPage() {
  const runId = useParams().runId as string;
  const [run, setRun] = useState<AutopilotRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      autopilotApi.get(runId).then(
        (r) => {
          setRun(r);
          setError(null);
        },
        (e) => setError(messageOf(e, 'Impossible de charger cette publicité.')),
      ),
    [runId],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Poll only while the pipeline works: never while it waits on the merchant.
  const polling = run ? isPolling(run.status) : false;
  useEffect(() => {
    if (!polling) return;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [polling, load]);

  const confirm = async (facts: AutopilotFacts) => {
    setBusy(true);
    try {
      setRun(await autopilotApi.confirm(runId, facts));
      setError(null);
    } catch (e) {
      setError(messageOf(e, "Impossible d'envoyer la vérification."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-dvh bg-cream px-4 py-8 text-ink sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <nav className="flex items-center justify-between text-sm">
            <Link href="/ads" className="font-semibold text-ink-muted hover:text-ink">
              ← Vos pubs
            </Link>
            {run && (
              <Link
                href={`/products/${encodeURIComponent(run.product_id)}/creative`}
                className="text-ink-muted underline-offset-2 hover:underline"
              >
                Mode avancé
              </Link>
            )}
          </nav>

          <header className="space-y-1">
            <h1 className="text-[26px] font-black leading-tight tracking-tight md:text-[32px]">
              {run ? statusLabel(run.status) : 'Chargement…'}
            </h1>
            {run?.status === 'awaiting_confirmation' && (
              <p className="text-ink-muted">
                10 secondes : on ne publie que des faits vrais. Corrigez si besoin, puis lancez.
              </p>
            )}
            {run && polling && (
              <p className="text-ink-muted" aria-live="polite">
                Vous pouvez quitter cette page : vos pubs continuent de se créer.
              </p>
            )}
          </header>

          {error && !run && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}

          {run?.status === 'awaiting_confirmation' && run.facts && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <FactCheck
                facts={run.facts}
                adCount={run.variant_count}
                busy={busy}
                error={error}
                onConfirm={confirm}
              />
            </section>
          )}

          {run && run.variants.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {run.variants.map((v) => (
                <li key={v.id} className="space-y-3 rounded-2xl border border-line bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {VARIANT_LABEL[v.status]}
                  </p>
                  <p className="font-bold">{v.angle_label ?? 'Angle de vente'}</p>
                  {v.simulated && (
                    <p className="rounded-lg bg-cream px-3 py-2 text-sm font-semibold text-trend-orange-strong">
                      Simulation : moteur vidéo de test, ce n&apos;est pas une vraie pub.
                    </p>
                  )}
                  {v.status === 'ready' && v.download_url ? (
                    <>
                      <video
                        src={v.download_url}
                        poster={v.thumbnail_url ?? undefined}
                        controls
                        playsInline
                        className="aspect-[9/16] w-full rounded-lg bg-ink object-cover"
                      />
                      <a
                        href={v.download_url}
                        download
                        className="block rounded-xl bg-trend-orange px-4 py-2.5 text-center font-bold text-white hover:bg-trend-orange-strong"
                      >
                        Télécharger
                      </a>
                    </>
                  ) : v.status === 'failed' ? (
                    <p className="text-sm text-danger">{v.error ?? 'Cette version a échoué.'}</p>
                  ) : (
                    <div className="aspect-[9/16] w-full animate-pulse rounded-lg bg-studio-raised" />
                  )}
                </li>
              ))}
            </ul>
          )}

          {run?.status === 'failed' && run.error && (
            <p role="alert" className="text-danger">
              {run.error}
            </p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
