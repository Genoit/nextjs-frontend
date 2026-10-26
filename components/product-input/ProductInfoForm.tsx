'use client';

import { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { LIMITS } from '../../lib/product-input-rules.mjs';
import { AUDIENCES, CURRENCIES, ImportedField } from './types';
import { inputClass, secondaryButton } from './ImportPanel';
import { ProductDraft } from './use-product-draft';

function ImportedTag({ id }: { id: string }) {
  return (
    <span id={id} className="rounded bg-info/10 px-1.5 py-0.5 text-xs font-semibold text-info">
      Importé · à relire
    </span>
  );
}

function Counter({ value, max, id }: { value: number; max: number; id?: string }) {
  return (
    <span
      id={id}
      className={`text-xs tabular-nums ${value > max ? 'text-danger' : 'text-ink-muted'}`}
    >
      {value} / {max}
    </span>
  );
}

/** Label row (with required/optional and the import mark), the control, then hint/error and counter. */
function Field({
  id,
  label,
  required,
  importedMark,
  hint,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  /** true: obligatoire, false: facultatif, omitted: no mention (inside an optional group). */
  required?: boolean;
  importedMark?: boolean;
  hint?: string;
  error?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}{' '}
          {required !== undefined && (
            <span className="font-normal text-ink-muted">
              {required ? '(obligatoire)' : '(facultatif)'}
            </span>
          )}
        </label>
        {importedMark && <ImportedTag id={`${id}-imported`} />}
      </div>
      {children}
      {(hint || error || counter) && (
        <div className="flex items-start justify-between gap-3">
          <p id={`${id}-msg`} className={`text-sm ${error ? 'text-danger' : 'text-ink-muted'}`}>
            {error ?? hint}
          </p>
          {counter}
        </div>
      )}
    </div>
  );
}

/** ids for aria-describedby: the message line plus the import mark when present. */
const describe = (id: string, imported: boolean) => `${id}-msg${imported ? ` ${id}-imported` : ''}`;

export function ProductInfoForm({ draft }: { draft: ProductDraft }) {
  const { fields, setField, touch, errorFor, imported, benefits, changeBenefits } = draft;
  const [benefitInput, setBenefitInput] = useState('');
  const is = (f: ImportedField) => imported.has(f);

  const hasImportedDetail = is('price') || is('brand') || is('category') || is('currency');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  // Open "Prix et détails" once when an import fills it, so imported values are seen.
  if (hasImportedDetail && !autoOpened) {
    setAutoOpened(true);
    setDetailsOpen(true);
  }

  const addBenefit = () => {
    const t = benefitInput
      .trim()
      .replace(/^,+|,+$/g, '')
      .slice(0, LIMITS.benefit);
    if (!t || benefits.includes(t) || benefits.length >= LIMITS.benefits) return;
    changeBenefits([...benefits, t]);
    setBenefitInput('');
  };

  const titleErr = errorFor('title');
  const descErr = errorFor('description');
  const priceErr = errorFor('price');
  const summary = [
    fields.price && `${fields.price} ${fields.currency}`,
    fields.brand,
    fields.category,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section aria-labelledby="sheet-title" className="space-y-5">
      <div>
        <h2 id="sheet-title" className="text-xl font-bold text-ink">
          Fiche produit
        </h2>
        <p className="mt-1 text-[15px] text-ink-muted">
          C&apos;est ce que l&apos;analyse lira.
          {imported.size > 0 &&
            ' Les champs marqués « Importé » viennent de la page source : relisez-les.'}
        </p>
      </div>

      <Field
        id="product-title"
        label="Nom du produit"
        required
        importedMark={is('title')}
        error={titleErr}
        hint="Le nom tel que vos clients le cherchent."
        counter={<Counter value={fields.title.length} max={LIMITS.title} />}
      >
        <input
          id="product-title"
          type="text"
          value={fields.title}
          maxLength={LIMITS.title}
          onChange={(e) => setField('title', e.target.value)}
          onBlur={() => touch('title')}
          placeholder="Ex. : Mixeur portable rechargeable"
          required
          aria-invalid={!!titleErr}
          aria-describedby={describe('product-title', is('title'))}
          className={inputClass}
        />
      </Field>

      <Field
        id="product-description"
        label="Description"
        required
        importedMark={is('description')}
        error={descErr}
        hint={`Au moins ${LIMITS.descriptionMin} caractères : matière, usage, ce qui le distingue.`}
        counter={<Counter value={fields.description.length} max={LIMITS.description} />}
      >
        <textarea
          id="product-description"
          rows={5}
          value={fields.description}
          maxLength={LIMITS.description}
          onChange={(e) => setField('description', e.target.value)}
          onBlur={() => touch('description')}
          placeholder="Ex. : Mixeur USB de 380 ml pour smoothies, se recharge en 2 h, lame inox amovible."
          required
          aria-invalid={!!descErr}
          aria-describedby={describe('product-description', is('description'))}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </Field>

      <Field
        id="product-benefits"
        label="Points forts"
        required={false}
        importedMark={is('benefits')}
        hint="Appuyez sur Entrée pour ajouter. Concret : « Se recharge en 2 h »."
        counter={<Counter value={benefits.length} max={LIMITS.benefits} />}
      >
        {benefits.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Points forts ajoutés">
            {benefits.map((b) => (
              <li
                key={b}
                className="inline-flex max-w-full items-center gap-1 rounded-lg bg-cream py-1 pl-2.5 pr-1 text-sm text-ink"
              >
                <span className="truncate">{b}</span>
                <button
                  type="button"
                  onClick={() => changeBenefits(benefits.filter((x) => x !== b))}
                  aria-label={`Retirer « ${b} »`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-trend-orange"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            id="product-benefits"
            type="text"
            value={benefitInput}
            maxLength={LIMITS.benefit}
            disabled={benefits.length >= LIMITS.benefits}
            onChange={(e) => setBenefitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addBenefit();
              } else if (e.key === 'Backspace' && !benefitInput && benefits.length > 0) {
                changeBenefits(benefits.slice(0, -1));
              }
            }}
            placeholder={benefits.length >= LIMITS.benefits ? 'Maximum atteint' : 'Ex. : Sans BPA'}
            aria-describedby={describe('product-benefits', is('benefits'))}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addBenefit}
            disabled={!benefitInput.trim() || benefits.length >= LIMITS.benefits}
            className={`${secondaryButton} shrink-0 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:border-line`}
          >
            <Plus className="size-4" aria-hidden />
            <span>Ajouter</span>
          </button>
        </div>
      </Field>

      <Field
        id="product-audience"
        label="Audience visée"
        required={false}
        hint="Indicatif : vous la préciserez dans la configuration créative."
      >
        <div className="relative">
          <select
            id="product-audience"
            value={draft.audience}
            onChange={(e) => draft.setAudience(e.target.value)}
            aria-describedby="product-audience-msg"
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="">Choisir une audience</option>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
        </div>
      </Field>

      <details
        open={detailsOpen}
        onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
        className="group rounded-xl border border-line"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-trend-orange [&::-webkit-details-marker]:hidden">
          <span>
            Prix et détails <span className="font-normal text-ink-muted">(facultatif)</span>
            {summary && !detailsOpen && (
              <span className="ml-2 font-normal tabular-nums text-ink-muted">{summary}</span>
            )}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden
          />
        </summary>
        <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2">
          <Field id="product-price" label="Prix" importedMark={is('price')} error={priceErr}>
            <input
              id="product-price"
              type="text"
              inputMode="decimal"
              value={fields.price}
              onChange={(e) => setField('price', e.target.value.replace(',', '.'))}
              onBlur={() => touch('price')}
              placeholder="29.90"
              aria-invalid={!!priceErr}
              aria-describedby={describe('product-price', is('price'))}
              className={`${inputClass} tabular-nums`}
            />
          </Field>
          <Field id="product-currency" label="Devise" importedMark={is('currency')}>
            <div className="relative">
              <select
                id="product-currency"
                aria-describedby={is('currency') ? 'product-currency-imported' : undefined}
                value={fields.currency}
                onChange={(e) => setField('currency', e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
                {!CURRENCIES.some((c) => c.code === fields.currency) && (
                  <option value={fields.currency}>{fields.currency}</option>
                )}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
            </div>
          </Field>
          <Field id="product-brand" label="Marque" importedMark={is('brand')}>
            <input
              id="product-brand"
              aria-describedby={is('brand') ? 'product-brand-imported' : undefined}
              type="text"
              value={fields.brand}
              maxLength={LIMITS.brand}
              onChange={(e) => setField('brand', e.target.value)}
              placeholder="Ex. : Blendy"
              className={inputClass}
            />
          </Field>
          <Field id="product-category" label="Catégorie" importedMark={is('category')}>
            <input
              id="product-category"
              aria-describedby={is('category') ? 'product-category-imported' : undefined}
              type="text"
              value={fields.category}
              maxLength={LIMITS.category}
              onChange={(e) => setField('category', e.target.value)}
              placeholder="Ex. : Cuisine"
              className={inputClass}
            />
          </Field>
        </div>
      </details>
    </section>
  );
}
