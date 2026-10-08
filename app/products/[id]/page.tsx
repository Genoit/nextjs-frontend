'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ProductDetail } from '../../../components/products/ProductDetail';

// ============================================
// Product Detail Page - Show a single product
// ============================================

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductDetail productId={productId} showActions={true} />
      </div>
    </ProtectedRoute>
  );
}
