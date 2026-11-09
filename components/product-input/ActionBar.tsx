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

  let statusText = '';
  if (save.state === 'busy') statusText = 'Saving product…';
  else if (save.state === 'done') statusText = 'Opening analysis…';
  else if (missing.length) statusText = `Required: ${listText(missing)}`;
  else if (uploading) statusText = 'Uploading photos…';
  else statusText = 'Ready for analysis';

  return (
    <div className="sticky bottom-0 z-30 border-t border-white/10 bg-studio-ground/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {ready && !busy ? (
              <span className="flex size-2 rounded-full bg-emerald-400" aria-hidden />
            ) : busy ? (
              <span className="flex size-2 animate-ping rounded-full bg-trend-orange" aria-hidden />
            ) : (
              <span className="flex size-2 rounded-full bg-white/30" aria-hidden />
            )}
            <p
              id="continue-status"
              aria-live="polite"
              className={`truncate text-sm ${
                ready ? 'text-studio-text font-medium' : 'text-studio-muted'
              }`}
            >
              {statusText}
            </p>
          </div>
          {save.state === 'error' && (
            <p role="alert" className="mt-0.5 text-sm text-red-400">
              {save.error}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/dashboard" className={`${secondaryButton} h-9 px-4 text-sm font-medium`}>
            Cancel
          </Link>

          <button
            type="button"
            onClick={onContinue}
            disabled={busy}
            aria-disabled={busy}
            aria-describedby="continue-status"
            className={`${primaryButton} h-9 px-5 text-sm font-semibold`}
          >
            {busy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <span>Continue to analysis</span>
                <ArrowRight className="size-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
