import type { ReactNode } from 'react';
import { focusRing } from '../dashboard/DashShell';

// Shared look of the Shopify screens: studio tokens only, one orange primary per screen.

export const primaryBtn = `inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-trend-orange px-4 text-[13px] font-semibold text-on-accent transition hover:bg-trend-orange-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-studio-raised-2 disabled:text-studio-meta disabled:active:scale-100 ${focusRing}`;

export const secondaryBtn = `inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-[10px] border border-studio-rule-strong bg-studio-surface px-3.5 text-[13px] font-medium text-studio-text transition hover:bg-studio-raised-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:text-studio-meta disabled:hover:bg-studio-surface ${focusRing}`;

export const textBtn = `inline-flex h-[38px] shrink-0 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-medium transition ${focusRing}`;

export const field =
  'h-[38px] w-full rounded-[10px] border border-studio-rule-strong bg-studio-surface px-3 text-[13px] text-studio-text outline-none transition placeholder:text-studio-meta focus:border-accent-line disabled:text-studio-meta';

export const labelText = 'mb-1.5 block text-[12.5px] font-medium text-studio-muted';

export const panel = 'rounded-[12px] border border-studio-rule bg-studio-surface p-5 sm:p-6';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-studio-raised-2 text-studio-muted',
};

/** A status: always an icon plus a label, never the accent. */
export function Badge({
  tone,
  icon,
  children,
}: {
  tone: Tone;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[6px] px-2 text-[12px] font-medium whitespace-nowrap ${TONE[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** A one-line result under an action: icon, sentence, in its status colour. */
export function Notice({
  tone,
  icon,
  children,
}: {
  tone: Tone;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-[10px] px-3 py-2.5 text-[13px] leading-snug ${TONE[tone]}`}
    >
      <span className="mt-px shrink-0">{icon}</span>
      <span>{children}</span>
    </p>
  );
}
