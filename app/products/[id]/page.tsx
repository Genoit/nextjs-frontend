'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ProductDetail } from '../../../components/products/ProductDetail';
import { SendToShopify } from '../../../components/shopify/SendToShopify';

// ============================================
// Product Detail Page - Show a single product
// ============================================

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="w-full flex-1 px-4 py-8 md:px-10">
        <ProductDetail productId={productId} showActions={true} />
        <div className="mt-8">
          <SendToShopify productId={productId} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
