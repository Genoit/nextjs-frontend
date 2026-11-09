import { CheckCircle2, Circle, FlaskConical, Loader2, XCircle } from 'lucide-react';

export type StatusTone = 'idle' | 'active' | 'ready' | 'simulated' | 'failed';

// Palette 2026-11-02: statuses never use the action orange, and a mock never looks like a success.
const TONES: Record<StatusTone, { className: string; Icon: typeof Circle }> = {
  idle: { className: 'border-line bg-studio-ground text-ink-soft', Icon: Circle },
  active: { className: 'border-warning/30 bg-warning-soft text-warning', Icon: Loader2 },
  ready: { className: 'border-success/30 bg-success-soft text-success', Icon: CheckCircle2 },
  simulated: {
    className: 'border-dashed border-ink-soft/60 bg-studio-ground text-ink-soft',
    Icon: FlaskConical,
  },
  failed: { className: 'border-danger/30 bg-danger-soft text-danger', Icon: XCircle },
};

/** Status pill: icon + label, never color alone. */
export function StatusBadge({
  tone,
  label,
  className = '',
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  const { className: toneClass, Icon } = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass} ${className}`}
    >
      <Icon
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 ${tone === 'active' ? 'motion-safe:animate-spin' : ''}`}
      />
      {label}
    </span>
  );
}
