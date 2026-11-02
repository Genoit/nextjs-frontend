import { Check } from 'lucide-react';

/** The real ad flow. Only step 1 lives on this screen; later steps need a saved product. */
export const FLOW_STEPS = [
  'Product',
  'Analysis',
  'Creative setup',
  'Storyboard',
  'Product visuals',
];

/** Horizontal progress for the ad flow; on phones it folds to "Step 1 of 5". */
export function Stepper({ current = 0 }: { current?: number }) {
  return (
    <nav aria-label="Ad creation steps">
      <p className="text-sm text-studio-muted sm:hidden">
        <span className="font-medium text-studio-text">
          Step {current + 1} of {FLOW_STEPS.length} · {FLOW_STEPS[current]}
        </span>
        {current + 1 < FLOW_STEPS.length && <span> · next: {FLOW_STEPS[current + 1]}</span>}
      </p>
      <ol className="hidden items-center gap-2 sm:flex">
        {FLOW_STEPS.map((label, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li
              key={label}
              aria-current={now ? 'step' : undefined}
              className="flex min-w-0 items-center gap-2"
            >
              {i > 0 && <span aria-hidden className="h-px w-6 shrink-0 bg-studio-rule lg:w-10" />}
              <span
                aria-hidden
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                  now
                    ? 'bg-trend-orange text-white'
                    : done
                      ? 'bg-cream text-trend-orange-strong'
                      : 'border border-studio-rule text-studio-meta'
                }`}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={`truncate text-sm ${now ? 'font-medium text-studio-text' : 'text-studio-muted'}`}
              >
                {label}
                {now && <span className="sr-only"> (current step)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
