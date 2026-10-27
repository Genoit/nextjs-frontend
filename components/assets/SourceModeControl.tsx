'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SourceMode } from '../../lib/types/assets';

const OPTIONS: Array<{ value: SourceMode; label: string }> = [
  { value: 'auto', label: 'Automatique' },
  { value: 'force_original', label: "Forcer l'original" },
  { value: 'request_processing', label: 'Demander un traitement' },
];

interface Props {
  /** Unique radio group name (one per plan). */
  name: string;
  value: SourceMode;
  /** Why the source cannot change (job in flight); shown under the control. */
  disabledReason: string | null;
  /** A save is in flight on the board: changes are ignored, focus stays put, no text. */
  busy: boolean;
  /** Shown in the confirmation; null when no job has been estimated yet. */
  estimatedCost: string | null;
  /** This plan's engine is the flagged local mock: processing costs nothing, no confirmation. */
  simulated: boolean;
  onChange: (mode: SourceMode) => Promise<boolean>;
}

/** Native radio group styled as a segmented control; saves on change. */
export function SourceModeControl({
  name,
  value,
  disabledReason,
  busy,
  estimatedCost,
  simulated,
  onChange,
}: Props) {
  // Value the confirmation was opened from: it closes by itself when the value changes.
  const [confirmFrom, setConfirmFrom] = useState<SourceMode | null>(null);
  const [saved, setSaved] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const processingRadioRef = useRef<HTMLInputElement>(null);
  const reasonId = `${name}-reason`;
  const blocked = disabledReason !== null || busy;
  const confirming = confirmFrom === value && !blocked;

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const save = async (mode: SourceMode) => {
    setSaved(false);
    setSaved(await onChange(mode));
  };

  const pick = (mode: SourceMode) => {
    if (mode === value || blocked) return;
    // A real engine may cost money: ask first. Unknown cost still asks (fail safe).
    if (mode === 'request_processing' && !simulated) {
      setConfirmFrom(value);
      return;
    }
    void save(mode);
  };

  const cancel = () => {
    setConfirmFrom(null);
    processingRadioRef.current?.focus();
  };

  const cost =
    estimatedCost && Number(estimatedCost) > 0
      ? `≈ ${Number(estimatedCost).toFixed(4)} $`
      : 'coût non estimé';

  return (
    <div className="space-y-2">
      {/* aria-disabled, not disabled: a disabled input would drop keyboard focus to <body>. */}
      <fieldset aria-describedby={disabledReason ? reasonId : undefined}>
        <legend className="mb-1.5 text-xs font-semibold text-ink">Source de l&apos;image</legend>
        <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
          {OPTIONS.map((opt, i) => (
            <label
              key={opt.value}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-trend-orange has-[[aria-disabled=true]]:cursor-not-allowed has-[[aria-disabled=true]]:text-ink-muted ${
                i > 0 ? 'border-t border-line' : ''
              } ${opt.value === value ? 'bg-cream font-semibold text-ink' : 'text-ink hover:bg-zinc-50'}`}
            >
              <input
                ref={opt.value === 'request_processing' ? processingRadioRef : undefined}
                type="radio"
                name={name}
                value={opt.value}
                checked={opt.value === value}
                aria-disabled={blocked}
                onChange={() => pick(opt.value)}
                className="size-4 accent-trend-orange focus-visible:outline-none"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {simulated && (
        <p className="text-xs text-ink-muted">Le traitement sera simulé (aucun coût).</p>
      )}
      {disabledReason && (
        <p id={reasonId} className="text-xs text-ink-muted">
          {disabledReason}
        </p>
      )}

      {confirming && (
        <div
          role="group"
          aria-label="Confirmer le traitement"
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
          }}
          className="space-y-2 rounded-lg border border-line bg-cream p-3 text-sm text-ink"
        >
          <p>
            Lancer le traitement (<span className="tabular-nums">{cost}</span>) ?
          </p>
          <div className="flex gap-2">
            <button
              ref={confirmRef}
              type="button"
              onClick={() => {
                setConfirmFrom(null);
                processingRadioRef.current?.focus();
                void save('request_processing');
              }}
              className="min-h-11 rounded-lg bg-trend-orange px-4 font-semibold text-white hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
            >
              Lancer
            </button>
            <button
              type="button"
              onClick={cancel}
              className="min-h-11 rounded-lg px-4 font-semibold text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-trend-orange"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <p aria-live="polite" className="min-h-4 text-xs text-emerald-800">
        {saved && !confirming ? 'Enregistré' : ''}
      </p>
    </div>
  );
}
