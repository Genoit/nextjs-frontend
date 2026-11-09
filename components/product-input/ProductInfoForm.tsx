'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Sparkles, X } from 'lucide-react';
import { LIMITS } from '../../lib/product-input-rules.mjs';
import { AUDIENCES, CURRENCIES, ImportedField } from './types';
import { inputClass, secondaryButton } from './ImportPanel';
import { ProductDraft } from './use-product-draft';

function ImportedBadge({ id }: { id: string }) {
  return (
    <span
      id={id}
      className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-400"
    >
      <Sparkles className="size-2.5" aria-hidden />
      Imported
    </span>
  );
}

export function ProductInfoForm({ draft }: { draft: ProductDraft }) {
  const { fields, setField, touch, errorFor, imported, benefits, changeBenefits } = draft;
  const [benefitInput, setBenefitInput] = useState('');
  const is = (f: ImportedField) => imported.has(f);

  const hasImportedDetail = is('price') || is('brand') || is('category') || is('currency');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  // Auto-open additional details once if an import populated them
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
    <div className="space-y-6">
      {/* Product Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="product-title" className="text-sm font-semibold text-white">
            Product Name <span className="text-trend-orange">*</span>
          </label>
          {is('title') && <ImportedBadge id="product-title-imported" />}
        </div>
        <input
          id="product-title"
          type="text"
          value={fields.title}
          maxLength={LIMITS.title}
          onChange={(e) => setField('title', e.target.value)}
          onBlur={() => touch('title')}
          placeholder="e.g. Rechargeable Portable Blender"
          required
          aria-invalid={!!titleErr}
          aria-describedby={titleErr ? 'product-title-msg' : undefined}
          className={inputClass}
        />
        {titleErr && (
          <p id="product-title-msg" className="text-sm text-red-400">
            {titleErr}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="product-description" className="text-sm font-semibold text-white">
            Description <span className="text-trend-orange">*</span>
          </label>
          {is('description') && <ImportedBadge id="product-description-imported" />}
        </div>
        <textarea
          id="product-description"
          rows={3}
          value={fields.description}
          maxLength={LIMITS.description}
          onChange={(e) => setField('description', e.target.value)}
          onBlur={() => touch('description')}
          placeholder="What is this product, how does it work, and what makes it special?"
          required
          aria-invalid={!!descErr}
          aria-describedby={descErr ? 'product-description-msg' : undefined}
          className={`${inputClass} h-auto min-h-[160px] py-3 resize-y leading-relaxed`}
        />
        {descErr && (
          <p id="product-description-msg" className="text-sm text-red-400">
            {descErr}
          </p>
        )}
      </div>

      {/* Progressive Disclosure: Additional Details Accordion */}
      <details
        open={detailsOpen}
        onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
        className="group rounded-xl border border-white/10 bg-white/[0.02] transition-colors"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-sm font-semibold text-studio-muted transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <span>Additional details</span>
            <span className="font-normal text-studio-muted/70">(pricing, brand, audience)</span>
            {summary && !detailsOpen && (
              <span className="rounded bg-white/5 px-2 py-0.5 text-xs font-normal text-studio-muted">
                {summary}
              </span>
            )}
          </span>
          <ChevronDown
            className="size-3.5 shrink-0 text-studio-muted transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>

        <div className="space-y-3.5 border-t border-white/5 p-3.5 pt-3">
          {/* Price & Currency */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="product-price" className="text-sm font-medium text-studio-muted">
                  Price
                </label>
                {is('price') && <ImportedBadge id="product-price-imported" />}
              </div>
              <input
                id="product-price"
                type="text"
                inputMode="decimal"
                value={fields.price}
                onChange={(e) => setField('price', e.target.value.replace(',', '.'))}
                onBlur={() => touch('price')}
                placeholder="29.90"
                aria-invalid={!!priceErr}
                aria-describedby={priceErr ? 'product-price-msg' : undefined}
                className={`${inputClass} tabular-nums`}
              />
              {priceErr && (
                <p id="product-price-msg" className="text-sm text-red-400">
                  {priceErr}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="product-currency" className="text-sm font-medium text-studio-muted">
                Currency
              </label>
              <div className="relative">
                <select
                  id="product-currency"
                  value={fields.currency}
                  onChange={(e) => setField('currency', e.target.value)}
                  className={`${inputClass} appearance-none pr-8`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-studio-ground text-white">
                      {c.label}
                    </option>
                  ))}
                  {!CURRENCIES.some((c) => c.code === fields.currency) && (
                    <option value={fields.currency} className="bg-studio-ground text-white">
                      {fields.currency}
                    </option>
                  )}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-studio-muted"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="product-brand" className="text-sm font-medium text-studio-muted">
                  Brand
                </label>
                {is('brand') && <ImportedBadge id="product-brand-imported" />}
              </div>
              <input
                id="product-brand"
                type="text"
                value={fields.brand}
                maxLength={LIMITS.brand}
                onChange={(e) => setField('brand', e.target.value)}
                placeholder="e.g. Blendy"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="product-category" className="text-sm font-medium text-studio-muted">
                  Category
                </label>
                {is('category') && <ImportedBadge id="product-category-imported" />}
              </div>
              <input
                id="product-category"
                type="text"
                value={fields.category}
                maxLength={LIMITS.category}
                onChange={(e) => setField('category', e.target.value)}
                placeholder="e.g. Kitchen appliances"
                className={inputClass}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label htmlFor="product-audience" className="text-sm font-medium text-studio-muted">
              Target Audience
            </label>
            <div className="relative">
              <select
                id="product-audience"
                value={draft.audience}
                onChange={(e) => draft.setAudience(e.target.value)}
                className={`${inputClass} appearance-none pr-8`}
              >
                <option value="" className="bg-studio-ground text-white">
                  Select target audience (optional)
                </option>
                {AUDIENCES.map((a) => (
                  <option key={a} value={a} className="bg-studio-ground text-white">
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-studio-muted"
                aria-hidden
              />
            </div>
          </div>

          {/* Key Benefits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="product-benefits" className="text-sm font-medium text-studio-muted">
                Key Benefits
              </label>
              {is('benefits') && <ImportedBadge id="product-benefits-imported" />}
            </div>

            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5" aria-label="Added benefits">
                {benefits.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1 pl-2.5 pr-1.5 text-sm text-white"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => changeBenefits(benefits.filter((x) => x !== b))}
                      aria-label={`Remove “${b}”`}
                      className="rounded p-0.5 text-studio-muted hover:bg-white/10 hover:text-white"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
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
                placeholder={
                  benefits.length >= LIMITS.benefits
                    ? 'Maximum benefits added'
                    : 'Add a key benefit (press Enter)'
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={addBenefit}
                disabled={!benefitInput.trim() || benefits.length >= LIMITS.benefits}
                className={`${secondaryButton} shrink-0 px-3 disabled:opacity-40`}
              >
                <Plus className="size-4" aria-hidden />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
