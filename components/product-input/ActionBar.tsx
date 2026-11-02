import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { listText, UPLOADS_PENDING } from '../../lib/product-input-rules.mjs';
import { primaryButton, secondaryButton } from './ImportPanel';
import { ProductDraft } from './use-product-draft';

export function ActionBar({ draft, onContinue }: { draft: ProductDraft; onContinue: () => void }) {
  const { check, save, images } = draft;
  const uploading = images.some((i) => i.uploading);
  const missing = check.blocking.filter((b) => b !== UPLOADS_PENDING);
  const busy = save.state === 'busy' || save.state === 'done';
  const ready = check.blocking.length === 0;

  let message: string;
  if (save.state === 'busy') message = 'Saving the product…';
  else if (save.state === 'done') message = 'Product saved. Opening the analysis…';
  else if (missing.length) message = `To continue, add ${listText(missing)}.`;
  else if (uploading) message = 'Photos are still uploading, one moment.';
  else if (check.recommended.length)
    message = `Ready. For a stronger ad, also add ${listText(check.recommended)}.`;
  else message = 'Sheet complete, ready for the analysis.';

  return (
    <div className="sticky bottom-0 z-30 border-t border-studio-rule bg-studio-ground/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[820px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <p
            id="continue-status"
            aria-live="polite"
            className={`text-sm ${ready ? 'text-studio-text' : 'text-studio-muted'}`}
          >
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
            Back
          </Link>
          {/* Stays clickable when incomplete: a click shows each field's error and focuses it. */}
          <button
            type="button"
            onClick={onContinue}
            aria-disabled={busy}
            aria-describedby="continue-status"
            className={`flex-1 md:flex-none ${primaryButton}`}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : null}
            Continue to analysis
            {!busy && <ArrowRight className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
}
