'use client';

import React from 'react';
import Link from 'next/link';
import { Product, SourcePlatform, AvailabilityStatus } from '../../lib/types/product';
import { ProductImageSingle } from './ProductImages';
import { useProducts } from '../../hooks/use-products';

// ============================================
// ProductList Component
// Displays a list of products with loading, empty, and error states
// ============================================

export interface ProductListProps {
  className?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
  onProductClick?: (product: Product) => void;
}

export function ProductList({
  className = '',
  showPagination = true,
  itemsPerPage = 12,
  onProductClick,
}: ProductListProps) {
  const {
    products,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    isEmpty,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
  } = useProducts({
    initialPageSize: itemsPerPage,
    fetchOnMount: true,
  });

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
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Products</h2>
          <Link
            href="/products/new"
            className="rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#9A3412] transition"
          >
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-64 w-full animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50"
            />
          ))}
        </div>

        <p className="text-center text-sm text-zinc-500">Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Products</h2>
          <Link
            href="/products/new"
            className="rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#9A3412] transition"
          >
            Add Product
          </Link>
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
          <h3 className="mt-4 text-lg font-semibold text-red-800">Error loading products</h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Products</h2>
          <Link
            href="/products/new"
            className="rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#9A3412] transition"
          >
            Add Product
          </Link>
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">No products found</h3>
          <p className="mt-2 text-sm text-zinc-500">
            You don&apos;t have any products yet. Start by adding your first product.
          </p>
          <Link
            href="/products/new"
            className="mt-4 rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#9A3412] transition"
          >
            Add Your First Product
          </Link>
        </div>
      </div>
    );
  }

  // Success state with products
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Products <span className="text-zinc-500 font-normal">({total})</span>
          </h2>
        </div>

        <Link
          href="/products/new"
          className="rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#9A3412] transition"
        >
          Add Product
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            onClick={(e) => {
              if (onProductClick) {
                e.preventDefault();
                handleProductClick(product);
              }
            }}
            className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-[#C2410C] transition"
          >
            <div className="aspect-square w-full overflow-hidden bg-zinc-50">
              {product.main_image_url ? (
                <ProductImageSingle
                  image={product.images.find((img) => img.is_primary) || null}
                  mainImageUrl={product.main_image_url}
                  className="h-full w-full"
                  size="lg"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                  <svg
                    className="h-8 w-8 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-[#C2410C] transition">
                {product.title}
              </h3>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                  {product.compare_at_price !== null && product.compare_at_price > 0 && (
                    <span className="text-xs text-zinc-500 line-through">
                      {formatCurrency(product.compare_at_price, product.currency)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {product.source_platform && (
                    <span className="bg-zinc-100 px-2 py-1 rounded">
                      {getPlatformText(product.source_platform)}
                    </span>
                  )}
                  {product.brand && (
                    <span className="bg-zinc-100 px-2 py-1 rounded">{product.brand}</span>
                  )}
                </div>

                <span
                  className={`px-2 py-1 rounded ${
                    product.availability === 'in_stock'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {getAvailabilityText(product.availability)}
                </span>
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                Added: {formatDate(product.created_at)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-zinc-200 pt-4"
          aria-label="Pagination"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!canGoToPreviousPage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="text-sm text-zinc-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={!canGoToNextPage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
            </span>
          </div>
        </nav>
      )}
    </div>
  );
}

// ============================================
// ProductGrid Component (simplified version)
// ============================================

export interface ProductGridProps {
  products: Product[];
  className?: string;
  onProductClick?: (product: Product) => void;
}

export function ProductGrid({ products, className = '', onProductClick }: ProductGridProps) {
  const formatCurrency = (amount: number | null, currency: string): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <p className="text-sm text-zinc-500">No products to display</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          onClick={(e) => {
            if (onProductClick) {
              e.preventDefault();
              onProductClick(product);
            }
          }}
          className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-[#C2410C] transition"
        >
          <div className="aspect-square w-full overflow-hidden bg-zinc-50">
            {product.main_image_url ? (
              <ProductImageSingle
                image={product.images.find((img) => img.is_primary) || null}
                mainImageUrl={product.main_image_url}
                className="h-full w-full"
                size="lg"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                <svg
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-[#C2410C] transition">
              {product.title}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">
                  {formatCurrency(product.price, product.currency)}
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-zinc-500">
              Added: {formatDate(product.created_at)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ProductList;
