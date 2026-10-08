'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ProductList } from '../../components/products/ProductList';

// ============================================
// Products Page - List all products
// ============================================

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductList showPagination={true} itemsPerPage={12} />
      </div>
    </ProtectedRoute>
  );
}
