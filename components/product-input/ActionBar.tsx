import Link from 'next/link';
import { ArrowRight, Check, Circle, Loader2 } from 'lucide-react';
import { frenchList } from '../../lib/product-input-rules.mjs';
import { primaryButton, secondaryButton } from './ImportPanel';
import { ProductDraft } from './use-product-draft';

// Looks disabled but stays focusable, so its reason (aria-describedby) is announced.
const blockedButton =
  'inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-line bg-cream px-5 text-sm font-semibold text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

export function ActionBar({ draft, onContinue }: { draft: ProductDraft; onContinue: () => void }) {
  const { check, save, images, fields, benefits, audience } = draft;
  const uploading = images.some((i) => i.uploading);
  const missing = check.blocking.filter((b) => !b.startsWith('la fin'));
  const blocked = check.blocking.length > 0;
  const busy = save.state === 'busy' || save.state === 'done';

  const items = [
    { label: 'Nom', done: !check.errors.title && !!fields.title.trim(), required: true },
    { label: 'Description', done: !check.errors.description, required: true },
    { label: 'Photo', done: images.some((i) => !i.uploading) },
    { label: 'Points forts', done: benefits.length > 0 },
    { label: 'Audience', done: !!audience },
  ];

  let message: string;
  if (save.state === 'busy') message = 'Enregistrement du produit…';
  else if (save.state === 'done') message = "Produit enregistré. Ouverture de l'analyse produit…";
  else if (missing.length) message = `Pour continuer, complétez ${frenchList(missing)}.`;
  else if (uploading) message = 'Photos en cours d’envoi, patientez un instant.';
  else if (check.recommended.length)
    message = `Prêt à continuer. Conseillé aussi : ${frenchList(check.recommended)}.`;
  else message = 'Fiche complète, prête pour l’analyse.';

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:rounded-b-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div
            className="hidden flex-wrap gap-x-6 gap-y-1 text-sm md:flex"
            aria-label="Complétude de la fiche"
            role="group"
          >
            {[true, false].map((req) => (
              <div key={String(req)} className="flex flex-wrap items-center gap-x-3">
                <span className="text-ink-muted">{req ? 'Obligatoire :' : 'Conseillé :'}</span>
                <ul className="contents">
                  {items
                    .filter((it) => !!it.required === req)
                    .map((it) => (
                      <li
                        key={it.label}
                        className={`flex items-center gap-1.5 ${it.done ? 'text-ink' : 'text-ink-muted'}`}
                      >
                        {it.done ? (
                          <Check className="size-4 text-success" aria-hidden />
                        ) : (
                          <Circle className="size-3.5" aria-hidden />
                        )}
                        {it.label}
                        <span className="sr-only">{it.done ? ' : fait' : ' : à faire'}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <p id="continue-status" aria-live="polite" className="text-sm text-ink">
            {message}
          </p>
          {save.state === 'error' && (
            <p role="alert" className="text-sm text-danger">
              {save.error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Link href="/dashboard" className={secondaryButton}>
            Retour
          </Link>
          <button
            type="button"
            onClick={onContinue}
            aria-disabled={blocked || busy}
            aria-describedby="continue-status"
            className={`flex-1 md:flex-none ${blocked ? blockedButton : primaryButton}`}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : null}
            Continuer vers l&apos;analyse
            {!busy && <ArrowRight className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
}
