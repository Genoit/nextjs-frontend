import type React from 'react';
import { Check } from 'lucide-react';

export const FLOW_STEPS = ['Product', 'Format', 'Creative angle'];

// Each step sits at the left edge, centre and right edge of the row.
const ALIGN = ['items-start text-left', 'items-center text-center', 'items-end text-right'];

/** `onSelect` makes the passed steps (except Product, already saved) clickable. */
export function Stepper({
  current = 0,
  onSelect,
}: {
  current?: number;
  onSelect?: (step: number) => void;
}) {
  const fill = current / (FLOW_STEPS.length - 1);

  return (
    <nav aria-label="Creation steps" className="w-full">
      <ol className="relative grid grid-cols-3">
        {/* Track runs between the first and last dot centres (dots are 28px wide). */}
        <div
          aria-hidden
          className="absolute inset-x-3.5 top-3.5 h-0.5 -translate-y-1/2 rounded-full bg-white/10"
        >
          <div
            className="h-full origin-left rounded-full bg-gradient-to-r from-trend-orange to-ember-text transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `scaleX(${fill})` }}
          />
        </div>

        {FLOW_STEPS.map((label, i) => {
          const done = i < current;
          const now = i === current;

          return (
            <li
              key={label}
              className={`relative flex flex-col ${ALIGN[i]}`}
              aria-current={now ? 'step' : undefined}
            >
              <StepTag
                onClick={onSelect && done && i > 0 ? () => onSelect(i) : undefined}
                className={`group flex flex-col gap-2 ${ALIGN[i]} rounded-lg`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 delay-300 motion-reduce:delay-0 ${
                    done
                      ? 'bg-trend-orange text-black group-hover:brightness-110'
                      : now
                        ? 'bg-trend-orange text-black shadow-[0_0_0_4px_rgba(255,98,45,0.18)]'
                        : 'border border-white/15 bg-studio-ground text-studio-muted'
                  }`}
                >
                  {done ? <Check className="size-3.5 stroke-[3]" aria-hidden /> : i + 1}
                </span>
                <span
                  className={`text-xs sm:text-sm transition-colors ${
                    now
                      ? 'font-semibold text-white'
                      : done
                        ? 'text-studio-muted group-hover:text-white'
                        : 'text-studio-muted/60'
                  }`}
                >
                  {label}
                </span>
              </StepTag>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepTag({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${className} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trend-orange`}
    >
      {children}
    </button>
  ) : (
    <span className={className}>{children}</span>
  );
}
