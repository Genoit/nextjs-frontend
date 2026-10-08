'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ProductForm } from '../../../components/products/ProductForm';
import { Product } from '../../../lib/types/product';

// ============================================
// New Product Page - Create a new product
// ============================================

export default function NewProductPage() {
  const router = useRouter();

  const handleSuccess = (product: Product) => {
    // Redirect to product detail page
    router.push(`/products/${product.id}`);
  };

  const handleCancel = () => {
    router.push('/products');
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
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

            <h1 className="text-2xl font-bold text-zinc-900">Create New Product</h1>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
