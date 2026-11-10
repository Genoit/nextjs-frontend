'use client';

import { useEffect, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { creativeApi } from '../../lib/api/creative';
import type { CreativeStrategy, StrategySummary } from '../../lib/types/creative';
import { inspiredLabel, strategyChoices } from '../../lib/ads-rules.mjs';

interface Props {
  productId: string;
  strategy: CreativeStrategy;
  onOpen: (strategyId: string) => Promise<unknown>;
  disabled?: boolean;
}

/**
 * Switch between the standard strategy and each remake ("Inspired by Nike's ad"). Shown only
 * when the product has more than one; a lone remake still says which ad inspired it.
 */
export function StrategyPicker({ productId, strategy, onOpen, disabled = false }: Props) {
  const [summaries, setSummaries] = useState<StrategySummary[] | null>(null);

  // Refetched per strategy shown: a new remake or a regeneration changes the list.
  useEffect(() => {
    let alive = true;
    creativeApi.listStrategies(productId).then(
      (list) => alive && setSummaries(list),
      () => alive && setSummaries(null), // secondary: the angles still show
    );
    return () => {
      alive = false;
    };
  }, [productId, strategy.id]);

  const choices = strategyChoices(summaries ?? []);
  const current = strategy.ref_ad_id ?? null;

  if (choices.length < 2) {
    if (!current) return null;
    const name = summaries?.find((s) => s.ref_ad_id === current)?.ref_page_name;
    return (
      <p className="inline-flex items-center gap-2 text-sm text-dash-soft">
        <Wand2 className="size-4 shrink-0 text-studio-meta" aria-hidden />
        {summaries ? inspiredLabel(name ?? null) : 'Inspired by an ad you picked'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span id="strategy-picker-label" className="text-sm font-semibold text-white">
        Strategy
      </span>
      <div
        role="radiogroup"
        aria-labelledby="strategy-picker-label"
        className="flex min-w-0 flex-wrap gap-1 self-start rounded-xl bg-dash-panel p-1"
      >
        {choices.map((c) => {
          const checked = c.refAdId === current;
          return (
            <label
              key={c.id}
              className={`inline-flex h-9 min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-trend-orange has-[:disabled]:cursor-not-allowed ${
                checked
                  ? 'bg-studio-raised-2 text-white'
                  : 'text-studio-muted hover:bg-studio-raised hover:text-white'
              }`}
            >
              <input
                type="radio"
                name="creative-strategy"
                value={c.id}
                checked={checked}
                disabled={disabled}
                onChange={() => void onOpen(c.id)}
                className="sr-only"
              />
              {c.refAdId && <Wand2 className="size-3.5 shrink-0" aria-hidden />}
              <span className="truncate">{c.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
