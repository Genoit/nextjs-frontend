'use client';

import React, { useState } from 'react';
import { ProductVariant } from '../../lib/types/product';

// ============================================
// ProductVariants Component
// Displays product variants in a clean, organized format
// ============================================

export interface ProductVariantsProps {
  variants: ProductVariant[];
  className?: string;
  showPrice?: boolean;
  showAvailability?: boolean;
  onVariantSelect?: (variant: ProductVariant) => void;
}

export function ProductVariants({
  variants,
  className = '',
  showPrice = true,
  showAvailability = true,
  onVariantSelect,
}: ProductVariantsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Handle variant selection
  const handleSelect = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (onVariantSelect) {
      onVariantSelect(variant);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null, currency: string): string => {
    if (amount === null || amount === undefined) return 'N/A';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get availability display text
  const getAvailabilityText = (availability: string | null): string => {
    if (!availability) return 'Unknown';

    const availabilityMap: Record<string, string> = {
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      backorder: 'Backorder',
      preorder: 'Pre-order',
      discontinued: 'Discontinued',
      limited: 'Limited',
      unknown: 'Unknown',
    };

    return availabilityMap[availability.toLowerCase()] || availability;
  };

  // Group variants by attributes for better display
  const groupVariantsByAttributes = (): Record<string, ProductVariant[]> => {
    const grouped: Record<string, ProductVariant[]> = {};

    variants.forEach((variant) => {
      // Create a key based on the attributes
      const attributeKeys = Object.keys(variant.attributes || {});

      if (attributeKeys.length === 0) {
        // No attributes, put in "Default" group
        if (!grouped['Default']) grouped['Default'] = [];
        grouped['Default'].push(variant);
        return;
      }

      // Create a key like "Color: Red, Size: L"
      const key = attributeKeys.map((key) => `${key}: ${variant.attributes?.[key]}`).join(', ');

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(variant);
    });

    return grouped;
  };

  // Check if we have variants
  const hasVariants = variants.length > 0;

  if (!hasVariants) {
    return null; // Don't render anything if no variants
  }

  const groupedVariants = groupVariantsByAttributes();
  const variantGroups = Object.entries(groupedVariants);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-semibold text-zinc-900">Variants ({variants.length})</h3>

      <div className="space-y-3">
        {variantGroups.map(([groupKey, groupVariants]) => {
          // For single variant in group, just show it
          if (groupVariants.length === 1) {
            const variant = groupVariants[0];
            const isSelected = selectedVariantId === variant.id;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => handleSelect(variant)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#C2410C] bg-[#C2410C]/5'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-4 w-4 rounded-full border-2 ${
                          isSelected ? 'border-[#C2410C] bg-[#C2410C]' : 'border-zinc-300'
                        }`}
                      />
                      <span className="font-medium text-zinc-900">{groupKey}</span>
                    </div>

                    {/* Show SKU if available */}
                    {variant.sku && (
                      <p className="mt-1 text-xs text-zinc-500">SKU: {variant.sku}</p>
                    )}

                    {/* Show attributes */}
                    {variant.external_id && (
                      <p className="mt-1 text-xs text-zinc-500">
                        External ID: {variant.external_id}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {showPrice && (
                      <div className="flex items-center gap-2">
                        {variant.compare_at_price !== null && variant.compare_at_price > 0 && (
                          <span className="text-xs text-zinc-500 line-through">
                            {formatCurrency(variant.compare_at_price, variant.currency)}
                          </span>
                        )}
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(variant.price, variant.currency)}
                        </span>
                      </div>
                    )}

                    {showAvailability && variant.availability && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          variant.availability === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-700'
                            : variant.availability === 'out_of_stock'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {getAvailabilityText(variant.availability)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }

          // For multiple variants in same group (rare, but possible)
          return (
            <div key={groupKey} className="space-y-2">
              <p className="text-xs font-medium text-zinc-600">{groupKey}</p>
              <div className="space-y-2">
                {groupVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleSelect(variant)}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                        isSelected
                          ? 'border-[#C2410C] bg-[#C2410C]/5'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-3 w-3 rounded-full border-2 ${
                              isSelected ? 'border-[#C2410C] bg-[#C2410C]' : 'border-zinc-300'
                            }`}
                          />
                          {variant.sku && (
                            <span className="text-sm text-zinc-600">{variant.sku}</span>
                          )}
                        </div>

                        {showPrice && (
                          <span className="font-medium text-zinc-900">
                            {formatCurrency(variant.price, variant.currency)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ProductVariantSimple Component
// Simplified display for a single variant
// ============================================

export interface ProductVariantSimpleProps {
  variant: ProductVariant;
  className?: string;
  showPrice?: boolean;
  showAvailability?: boolean;
}

export function ProductVariantSimple({
  variant,
  className = '',
  showPrice = true,
  showAvailability = true,
}: ProductVariantSimpleProps) {
  const formatCurrency = (amount: number | null, currency: string): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAvailabilityText = (availability: string | null): string => {
    if (!availability) return 'Unknown';
    const map: Record<string, string> = {
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      backorder: 'Backorder',
      preorder: 'Pre-order',
      discontinued: 'Discontinued',
      limited: 'Limited',
      unknown: 'Unknown',
    };
    return map[availability.toLowerCase()] || availability;
  };

  return (
    <div className={`rounded-lg border border-zinc-200 p-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-900">{variant.title}</span>
          {variant.sku && <span className="text-xs text-zinc-500">SKU: {variant.sku}</span>}
        </div>

        {Object.entries(variant.attributes || {}).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(variant.attributes || {}).map(([key, value]) => (
              <span key={key} className="text-xs bg-zinc-100 px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            {showPrice && (
              <span className="font-semibold text-zinc-900">
                {formatCurrency(variant.price, variant.currency)}
              </span>
            )}
            {showPrice && variant.compare_at_price !== null && variant.compare_at_price > 0 && (
              <span className="ml-2 text-xs text-zinc-500 line-through">
                {formatCurrency(variant.compare_at_price, variant.currency)}
              </span>
            )}
          </div>

          {showAvailability && variant.availability && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                variant.availability === 'in_stock'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {getAvailabilityText(variant.availability)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductVariants;
