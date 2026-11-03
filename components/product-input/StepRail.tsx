import { Check } from 'lucide-react';

/** The real ad flow. Only step 1 lives on this screen; later steps need a saved product. */
export const FLOW_STEPS = [
  'Product',
  'Analysis',
  'Creative setup',
  'Storyboard',
  'Product visuals',
];

/** The ad flow as a quiet trail: done steps checked, the current one marked; phones fold it to one line. */
export function Stepper({ current = 0 }: { current?: number }) {
  return (
    <nav aria-label="Ad creation steps">
      <p className="text-sm text-studio-muted sm:hidden">
        <span className="font-medium text-studio-text">
          {FLOW_STEPS[current]}, {current + 1} of {FLOW_STEPS.length}
        </span>
        {current + 1 < FLOW_STEPS.length && <span> · then {FLOW_STEPS[current + 1]}</span>}
      </p>
      <ol className="hidden items-center gap-3 text-sm whitespace-nowrap sm:flex">
        {FLOW_STEPS.map((label, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li
              key={label}
              aria-current={now ? 'step' : undefined}
              className="flex items-center gap-3"
            >
              {i > 0 && <span aria-hidden className="h-px w-4 bg-studio-raised" />}
              <span
                className={`inline-flex items-center gap-1.5 ${now ? 'font-medium text-studio-text' : 'text-studio-muted'}`}
              >
                {now && <span aria-hidden className="size-1.5 rounded-full bg-trend-orange" />}
                {done && <Check className="size-3.5 text-success" aria-hidden />}
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
