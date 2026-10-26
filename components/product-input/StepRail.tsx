import { BookOpen } from 'lucide-react';

/** The real ad flow. Only step 1 lives on this screen; later steps need a saved product. */
export const FLOW_STEPS = ['Produit', 'Analyse produit', 'Configuration créative', 'Storyboard'];

export function StepRail({ onOpenGuide }: { onOpenGuide: () => void }) {
  return (
    <div className="flex h-full flex-col justify-between gap-8">
      <nav aria-label="Étapes de création de la publicité">
        <ol className="space-y-1">
          {FLOW_STEPS.map((label, i) => {
            const current = i === 0;
            return (
              <li
                key={label}
                aria-current={current ? 'step' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${
                  current ? 'bg-white font-semibold text-ink' : 'text-ink-muted'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                    current ? 'bg-trend-orange text-white' : 'border border-line bg-white'
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  {label}
                  {current && <span className="sr-only"> (étape en cours)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="space-y-2 px-3 text-sm">
        <p className="text-ink-muted">
          Une fiche claire donne une analyse plus juste et une publicité plus convaincante.
        </p>
        <button
          type="button"
          onClick={onOpenGuide}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-trend-orange hover:text-trend-orange-strong focus-visible:outline-2 focus-visible:outline-trend-orange"
        >
          <BookOpen className="size-4" aria-hidden />
          Conseils pour la fiche
        </button>
      </div>
    </div>
  );
}

/** Phone and tablet: the rail folds into one line above the title. */
export function StepLine() {
  return (
    <p className="text-sm text-ink-muted lg:hidden">
      <span className="font-semibold text-ink">Étape 1 sur {FLOW_STEPS.length} · Produit</span>
      <span aria-hidden> — </span>
      <span>ensuite : {FLOW_STEPS[1]}</span>
    </p>
  );
}
