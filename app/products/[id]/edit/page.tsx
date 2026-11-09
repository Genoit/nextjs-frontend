'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { ProductForm } from '../../../../components/products/ProductForm';
import { useProduct } from '../../../../hooks/use-products';
import { Product } from '../../../../lib/types/product';

// ============================================
// Edit Product Page - Edit an existing product
// ============================================

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { product, isLoading, error } = useProduct({
    productId,
    fetchOnMount: true,
  });

  const handleSuccess = (updatedProduct: Product) => {
    // Redirect to product detail page
    router.push(`/products/${updatedProduct.id}`);
  };

  const handleCancel = () => {
    router.push(`/products/${productId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
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

            <h1 className="text-2xl font-bold text-ink">Edit Product</h1>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trend-orange border-t-transparent" />
            <p className="mt-4 text-sm text-ink-muted">Loading product...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
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

            <h1 className="text-2xl font-bold text-ink">Edit Product</h1>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center py-12">
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
            <p className="mt-2 text-sm text-danger">{error || 'Product not found'}</p>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 rounded-lg border border-line bg-studio-ground px-4 py-2 text-sm font-medium text-ink-soft hover:bg-studio-surface transition"
            >
              Back to Product
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show form
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
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

            <h1 className="text-2xl font-bold text-ink">Edit Product</h1>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-studio-ground p-6 shadow-sm">
            <ProductForm product={product} onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
