'use client';

import { useState } from 'react';
import { AutopilotFacts } from '../../lib/types/autopilot';
import { MAX_BENEFITS, canConfirm, cleanFacts } from '../../lib/autopilot-rules.mjs';

type Props = {
  facts: AutopilotFacts;
  adCount: number;
  busy: boolean;
  error: string | null;
  onConfirm: (facts: AutopilotFacts) => void;
};

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink focus-visible:outline-2 focus-visible:outline-trend-orange';

/** The ~10 s check: facts are never invented, so the merchant confirms them once. */
export function FactCheck({ facts, adCount, busy, error, onConfirm }: Props) {
  const [name, setName] = useState(facts.name);
  const [price, setPrice] = useState(facts.price ?? '');
  const [benefits, setBenefits] = useState<string[]>(
    [...facts.benefits, '', '', ''].slice(0, MAX_BENEFITS),
  );
  const draft = { name, price, benefits, image_urls: facts.image_urls };
  const ready = canConfirm(draft) && !busy;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onConfirm(cleanFacts(draft));
      }}
    >
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Photos du produit">
        {facts.image_urls.length === 0 ? (
          <p className="text-sm text-danger">
            Aucune photo : ajoutez-en une sur la fiche produit, la pub montre le vrai produit.
          </p>
        ) : (
          facts.image_urls.slice(0, 6).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- merchant URLs from any domain
            <img
              key={url}
              src={url}
              alt=""
              className="size-20 shrink-0 rounded-lg border border-line object-cover"
            />
          ))
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Nom du produit</span>
        <input
          className={field}
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Prix</span>
        <input
          className={field}
          value={price}
          maxLength={40}
          placeholder="Laissez vide : la pub n'affichera aucun prix"
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink">
          Bénéfices réels (jusqu&apos;à {MAX_BENEFITS})
        </legend>
        {benefits.map((b, i) => (
          <input
            key={i}
            aria-label={`Bénéfice ${i + 1}`}
            className={field}
            value={b}
            maxLength={200}
            onChange={(e) => setBenefits(benefits.map((x, j) => (j === i ? e.target.value : x)))}
          />
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready}
        className="w-full rounded-xl bg-trend-orange px-5 py-3 text-[15px] font-bold text-white hover:bg-trend-orange-strong disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
      >
        {busy ? 'Envoi…' : `C'est bon, créer ${adCount > 1 ? `mes ${adCount} pubs` : 'ma pub'}`}
      </button>
    </form>
  );
}
