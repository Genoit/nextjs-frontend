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
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C2410C] border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500">Loading product...</p>
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
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
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
          <h3 className="mt-4 text-lg font-semibold text-red-800">Error loading product</h3>
          <p className="mt-2 text-sm text-red-600">{error || deleteError}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => refresh()}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
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
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <svg
              className="h-6 w-6 text-zinc-600"
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
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">Product not found</h3>
          <p className="mt-2 text-sm text-zinc-500">
            The product you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Success state - Product detail
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Back
        </button>

        <div className="flex-1" />

        {showActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Product detail */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <ProductImages
            images={product.images}
            mainImageUrl={product.main_image_url}
            showGallery={product.images.length > 1}
          />

          {/* Image count */}
          {product.images.length > 0 && (
            <p className="text-center text-sm text-zinc-500">
              {product.images.length} image{product.images.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title and price */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-zinc-900">{product.title}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-zinc-900">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.compare_at_price !== null && product.compare_at_price > 0 && (
                  <span className="text-xl text-zinc-500 line-through">
                    {formatCurrency(product.compare_at_price, product.currency)}
                  </span>
                )}
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.availability === 'in_stock'
                    ? 'bg-emerald-100 text-emerald-700'
                    : product.availability === 'out_of_stock'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {getAvailabilityText(product.availability)}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose max-w-none text-zinc-600">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Product information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Brand
                </dt>
                <dd className="text-sm text-zinc-900">{product.brand || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Category
                </dt>
                <dd className="text-sm text-zinc-900">{product.category || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Platform
                </dt>
                <dd className="text-sm text-zinc-900">
                  {getPlatformText(product.source_platform)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Currency
                </dt>
                <dd className="text-sm text-zinc-900">{product.currency || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  External ID
                </dt>
                <dd className="text-sm font-mono text-zinc-700 truncate">
                  {product.external_id || 'N/A'}
                </dd>
              </div>

              {product.canonical_url && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Canonical URL
                  </dt>
                  <dd className="text-sm text-zinc-700 break-all">
                    <a
                      href={product.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#C2410C] transition"
                    >
                      {product.canonical_url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Seller information */}
          {(product.seller_name || product.seller_url) && (
            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Seller Information</h3>
              <div className="space-y-2">
                {product.seller_name && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Seller Name
                    </dt>
                    <dd className="text-sm text-zinc-900">{product.seller_name}</dd>
                  </div>
                )}
                {product.seller_url && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Seller URL
                    </dt>
                    <dd className="text-sm text-zinc-700">
                      <a
                        href={product.seller_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#C2410C] transition"
                      >
                        {product.seller_url}
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating and reviews */}
          {(product.rating !== null || product.reviews_count !== null) && (
            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-6">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Rating
                  </dt>
                  <dd className="text-2xl font-bold text-zinc-900 mt-1">
                    {product.rating !== null ? product.rating.toFixed(1) : 'N/A'}
                  </dd>
                </div>
                {product.reviews_count !== null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Reviews
                    </dt>
                    <dd className="text-2xl font-bold text-zinc-900 mt-1">
                      {product.reviews_count}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extraction information */}
          <div className="border-t border-zinc-200 pt-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Extraction Information</h3>
            <div className="space-y-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </dt>
                <dd className="text-sm text-zinc-900">
                  {getExtractionStatusText(product.extraction_status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Method
                </dt>
                <dd className="text-sm text-zinc-900">
                  {getExtractionMethodText(product.extraction_method)}
                </dd>
              </div>
              {product.extracted_at && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Extracted At
                  </dt>
                  <dd className="text-sm text-zinc-900">{formatDate(product.extracted_at)}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                Variants ({product.variants.length})
              </h3>
              <ProductVariants
                variants={product.variants}
                showPrice={true}
                showAvailability={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-zinc-200 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Metadata</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Created</dt>
            <dd className="text-sm text-zinc-900">{formatDate(product.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Updated</dt>
            <dd className="text-sm text-zinc-900">{formatDate(product.updated_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Product ID
            </dt>
            <dd className="text-sm font-mono text-zinc-700">{product.id}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
