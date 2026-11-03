'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product, SourcePlatform, AvailabilityStatus } from '../../lib/types/product';
import { ProductImages } from './ProductImages';
import { ProductVariants } from './ProductVariants';
import { useProduct, useProductMutations } from '../../hooks/use-products';

// ============================================
// ProductDetail Component
// Displays detailed information about a single product
// ============================================

export interface ProductDetailProps {
  productId: string;
  className?: string;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onBack?: () => void;
}

export function ProductDetail({
  productId,
  className = '',
  showActions = true,
  onEdit,
  onDelete,
  onBack,
}: ProductDetailProps) {
  const router = useRouter();
  const { product, isLoading, error, refresh, clear } = useProduct({
    productId,
    fetchOnMount: true,
  });

  const { deleteProduct, isDeleting, deleteError } = useProductMutations();

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
  const getAvailabilityText = (availability: AvailabilityStatus | null): string => {
    if (!availability) return 'Unknown';

    const map: Record<AvailabilityStatus, string> = {
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      backorder: 'Backorder',
      preorder: 'Pre-order',
      discontinued: 'Discontinued',
      limited: 'Limited',
      unknown: 'Unknown',
    };

    return map[availability] || availability;
  };

  // Get platform display text
  const getPlatformText = (platform: SourcePlatform | null): string => {
    if (!platform) return 'Unknown';

    const platformMap: Record<SourcePlatform, string> = {
      amazon: 'Amazon',
      shopify: 'Shopify',
      woocommerce: 'WooCommerce',
      ebay: 'eBay',
      etsy: 'Etsy',
      walmart: 'Walmart',
      aliexpress: 'AliExpress',
      custom: 'Custom',
      other: 'Other',
    };

    return platformMap[platform] || platform;
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format extraction status
  const getExtractionStatusText = (status: string | null): string => {
    if (!status) return 'N/A';

    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      partial: 'Partial',
    };

    return statusMap[status.toLowerCase()] || status;
  };

  // Format extraction method
  const getExtractionMethodText = (method: string | null): string => {
    if (!method) return 'N/A';

    const methodMap: Record<string, string> = {
      manual: 'Manual',
      url_scraping: 'URL Scraping',
      api_import: 'API Import',
      csv_upload: 'CSV Upload',
      ai_detection: 'AI Detection',
    };

    return methodMap[method.toLowerCase()] || method;
  };

  // Handle edit action
  const handleEdit = () => {
    if (product && onEdit) {
      onEdit(product);
    } else if (product) {
      router.push(`/products/${product.id}/edit`);
    }
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!product) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      )
    ) {
      try {
        const success = await deleteProduct(product.id);
        if (success) {
          clear();
          if (onDelete) {
            onDelete(product);
          }
          router.push('/products');
        }
      } catch (err) {
        // Error is already handled by the hook
        console.error('Delete failed:', err);
      }
    }
  };

  // Handle back action
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/products');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm font-medium text-ink-soft hover:bg-studio-surface transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-trend-orange border-t-transparent" />
          <p className="mt-4 text-sm text-ink-muted">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || deleteError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm font-medium text-ink-soft hover:bg-studio-surface transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft">
            <svg
              className="h-6 w-6 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-danger">Error loading product</h3>
          <p className="mt-2 text-sm text-danger">{error || deleteError}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => refresh()}
              className="rounded-lg bg-danger-soft px-4 py-2 text-sm font-medium text-danger hover:bg-red-200 transition"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-line bg-studio-ground px-4 py-2 text-sm font-medium text-ink-soft hover:bg-studio-surface transition"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm font-medium text-ink-soft hover:bg-studio-surface transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-studio-raised">
            <svg
              className="h-6 w-6 text-ink-soft"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-ink">Product not found</h3>
          <p className="mt-2 text-sm text-ink-muted">
            The product you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 rounded-lg bg-studio-raised px-4 py-2 text-sm font-medium text-ink-soft hover:bg-studio-rule transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Success state - Product detail
  const pill =
    'inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/5 bg-white/10 px-6 text-xs font-bold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-trend-orange disabled:cursor-not-allowed disabled:opacity-50';
  const rows: [string, React.ReactNode][] = [
    ['Brand', product.brand || 'N/A'],
    ['Category', product.category || 'N/A'],
    ['Platform', getPlatformText(product.source_platform)],
    ['Availability', getAvailabilityText(product.availability)],
    [
      'Extraction',
      `${getExtractionStatusText(product.extraction_status)} · ${getExtractionMethodText(product.extraction_method)}`,
    ],
    ['Added', formatDate(product.created_at)],
    ['Updated', formatDate(product.updated_at)],
  ];
  if (product.rating !== null && !isNaN(Number(product.rating)))
    rows.push([
      'Rating',
      `${Number(product.rating).toFixed(1)}${product.reviews_count !== null ? ` · ${product.reviews_count} reviews` : ''}`,
    ]);
  if (product.seller_name) rows.push(['Seller', product.seller_name]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Viewer header: back, title and its facts, like the reference library viewer. */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-trend-orange"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-white sm:text-2xl">{product.title}</h1>
          <p className="truncate text-xs text-ink-muted">
            {formatCurrency(product.price, product.currency)}
            {product.compare_at_price !== null && product.compare_at_price > 0 && (
              <span className="ml-2 line-through">
                {formatCurrency(product.compare_at_price, product.currency)}
              </span>
            )}
            {' · '}
            {getPlatformText(product.source_platform)}
          </p>
        </div>
      </div>

      {/* The product, centred and large. */}
      <div className="mx-auto mt-8 w-full max-w-md">
        <ProductImages
          images={product.images || []}
          mainImageUrl={product.main_image_url}
          showGallery={(product.images?.length ?? 0) > 1}
        />
      </div>

      {product.description && (
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-ink-muted line-clamp-3">
          {product.description}
        </p>
      )}

      {showActions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={handleEdit} className={pill}>
            Edit
          </button>
          <button
            type="button"
            onClick={() => router.push(`/products/${product.id}/creative`)}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-trend-orange px-8 text-sm font-black text-on-accent shadow-glow transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-95 motion-reduce:transition-none"
          >
            Create the ad
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${pill} hover:bg-danger hover:text-on-accent`}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      <details className="group mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111] p-5">
        <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-sm font-bold text-white">
          Product details
          <svg
            className="size-4 text-ink-muted transition group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 border-t border-white/5 pt-3"
            >
              <dt className="text-xs text-ink-muted">{k}</dt>
              <dd className="truncate text-right text-sm text-white">{v}</dd>
            </div>
          ))}
        </dl>
        {product.canonical_url && (
          <a
            href={product.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block truncate text-xs text-ink-muted hover:text-trend-orange"
          >
            {product.canonical_url}
          </a>
        )}
        {(product.variants?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-bold text-white">
              Variants ({product.variants?.length})
            </h2>
            <ProductVariants
              variants={product.variants || []}
              showPrice={true}
              showAvailability={true}
            />
          </div>
        )}
      </details>
    </div>
  );
}

export default ProductDetail;
