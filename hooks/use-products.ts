'use client';

import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { useAuth } from '../lib/auth';
import { productApi } from '../lib/api/product';
import { getAuthErrorMessage } from '../lib/auth-errors';
import {
  Product,
  ProductListParams,
  ProductFilters,
  ProductSort,
  ProductCreatePayload,
  ProductUpdatePayload,
} from '../lib/types/product';

// ============================================
// Default values
// ============================================

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT: ProductSort = {
  field: 'created_at',
  order: 'desc',
};

const DEFAULT_FILTERS: ProductFilters = {};

// ============================================
// useProducts - Hook for product list management
// ============================================

export interface UseProductsOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialFilters?: ProductFilters;
  initialSort?: ProductSort;
  fetchOnMount?: boolean;
}

export interface UseProductsReturn {
  // State
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  sort: ProductSort;

  // Actions
  fetchProducts: (params?: ProductListParams) => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  setSort: (sort: ProductSort) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  resetFilters: () => void;

  // Helper functions
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  hasProducts: boolean;
  isEmpty: boolean;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { token } = useAuth();

  const {
    initialPage = 1,
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialFilters = DEFAULT_FILTERS,
    initialSort = DEFAULT_SORT,
    fetchOnMount = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(initialSort);

  const fetchProducts = useCallback(
    async (additionalParams?: ProductListParams) => {
      if (!token) {
        setError('Authentication required. Please sign in to view products.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params: ProductListParams = {
          page,
          page_size: pageSize,
          ...filters,
          sort_by: sort.field,
          sort_order: sort.order,
          ...additionalParams,
        };

        // Remove undefined values
        const cleanParams: Record<string, unknown> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanParams[key] = value;
          }
        });

        const response = await productApi.getProducts(cleanParams as ProductListParams);

        setProducts(response.products);
        setTotal(response.total);
        setTotalPages(response.total_pages);

        // Update page if it exceeds total pages
        if (response.total_pages > 0 && page > response.total_pages) {
          setPageState(response.total_pages);
        }
      } catch (err) {
        const errorMessage = getAuthErrorMessage(
          err as Error,
          'Failed to load products. Please try again.',
        );
        setError(errorMessage);
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [token, page, pageSize, filters, sort],
  );

  const refresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const setPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPageState(newPage);
      }
    },
    [totalPages],
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1); // Reset to first page when changing page size
  }, []);

  const goToNextPage = useCallback(() => {
    if (page < totalPages) {
      setPageState(page + 1);
    }
  }, [page, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setPageState(page - 1);
    }
  }, [page]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPageState(1);
  }, []);

  const setFiltersCallback = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPageState(1); // Reset to first page when filters change
  }, []);

  const setSortCallback = useCallback((newSort: ProductSort) => {
    setSort(newSort);
    setPageState(1); // Reset to first page when sort changes
  }, []);

  // Auto-fetch on mount - only call once when component mounts
  const hasFetchedRef = React.useRef(false);
  useEffect(() => {
    if (fetchOnMount && token && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProducts();
    }
  }, [fetchOnMount, token, fetchProducts]);

  // Helper computed values
  const canGoToNextPage = page < totalPages;
  const canGoToPreviousPage = page > 1;
  const hasProducts = products.length > 0;
  const isEmpty = !isLoading && hasProducts === false && error === null;

  return {
    // State
    products,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    filters,
    sort,

    // Actions
    fetchProducts,
    refresh,
    setFilters: setFiltersCallback,
    setSort: setSortCallback,
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    resetFilters,

    // Helpers
    canGoToNextPage,
    canGoToPreviousPage,
    hasProducts,
    isEmpty,
  };
}

// ============================================
// useProduct - Hook for single product management
// ============================================

export interface UseProductOptions {
  productId?: string | null;
  fetchOnMount?: boolean;
}

export interface UseProductReturn {
  // State
  product: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProduct: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
}

export function useProduct(options: UseProductOptions = {}): UseProductReturn {
  const { token } = useAuth();
  const { productId: initialProductId, fetchOnMount = true } = options;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(initialProductId || null);

  const fetchProduct = useCallback(
    async (id: string) => {
      if (!token) {
        setError('Authentication required. Please sign in to view this product.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setProductId(id);

        const fetchedProduct = await productApi.getProduct(id);
        setProduct(fetchedProduct);
      } catch (err) {
        const errorMessage = getAuthErrorMessage(
          err as Error,
          'Failed to load product. Please try again.',
        );
        setError(errorMessage);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  const refresh = useCallback(async () => {
    if (productId) {
      await fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  const clear = useCallback(() => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
    setProductId(null);
  }, []);

  // Auto-fetch on mount if productId is provided
  const hasFetchedProductRef = React.useRef(false);
  useEffect(() => {
    if (fetchOnMount && initialProductId && !hasFetchedProductRef.current) {
      hasFetchedProductRef.current = true;
      fetchProduct(initialProductId);
    }
  }, [fetchOnMount, initialProductId, fetchProduct]);

  // Re-fetch when productId changes
  useEffect(() => {
    if (productId && token && fetchOnMount) {
      // Only fetch if this is not the initial mount (handled by the other effect)
      if (hasFetchedProductRef.current) {
        fetchProduct(productId);
      }
    }
  }, [productId, token, fetchOnMount, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    fetchProduct,
    refresh,
    clear,
  };
}

// ============================================
// useProductMutations - Hook for create/update/delete operations
// ============================================

export interface UseProductMutationsReturn {
  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // Actions
  createProduct: (payload: ProductCreatePayload) => Promise<Product | null>;
  updateProduct: (productId: string, payload: ProductUpdatePayload) => Promise<Product | null>;
  deleteProduct: (productId: string) => Promise<boolean>;

  // Helpers
  resetErrors: () => void;
}

export function useProductMutations(): UseProductMutationsReturn {
  const { token } = useAuth();

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetErrors = useCallback(() => {
    setCreateError(null);
    setUpdateError(null);
    setDeleteError(null);
  }, []);

  const createProduct = useCallback(
    async (payload: ProductCreatePayload): Promise<Product | null> => {
      if (!token) {
        setCreateError('Authentication required. Please sign in to create a product.');
        return null;
      }

      try {
        setIsCreating(true);
        setCreateError(null);

        const createdProduct = await productApi.createProduct(payload);
        return createdProduct;
      } catch (err) {
        const errorMessage = getAuthErrorMessage(
          err as Error,
          'Failed to create product. Please try again.',
        );
        setCreateError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [token],
  );

  const updateProduct = useCallback(
    async (productId: string, payload: ProductUpdatePayload): Promise<Product | null> => {
      if (!token) {
        setUpdateError('Authentication required. Please sign in to update this product.');
        return null;
      }

      try {
        setIsUpdating(true);
        setUpdateError(null);

        const updatedProduct = await productApi.updateProduct(productId, payload);
        return updatedProduct;
      } catch (err) {
        const errorMessage = getAuthErrorMessage(
          err as Error,
          'Failed to update product. Please try again.',
        );
        setUpdateError(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [token],
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!token) {
        setDeleteError('Authentication required. Please sign in to delete this product.');
        return false;
      }

      try {
        setIsDeleting(true);
        setDeleteError(null);

        await productApi.deleteProduct(productId);
        return true;
      } catch (err) {
        const errorMessage = getAuthErrorMessage(
          err as Error,
          'Failed to delete product. Please try again.',
        );
        setDeleteError(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [token],
  );

  return {
    // State
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,

    // Actions
    createProduct,
    updateProduct,
    deleteProduct,

    // Helpers
    resetErrors,
  };
}

// ============================================
// Combined hook for comprehensive product management
// ============================================

export interface UseProductManagementOptions extends UseProductsOptions {
  productId?: string | null;
}

export interface UseProductManagementReturn
  extends UseProductsReturn, UseProductReturn, UseProductMutationsReturn {
  // Combined state
  combinedIsLoading: boolean;
}

export function useProductManagement(
  options: UseProductManagementOptions = {},
): UseProductManagementReturn {
  const productsResult = useProducts(options);
  const productResult = useProduct({ ...options, fetchOnMount: false });
  const mutationsResult = useProductMutations();

  // Combined loading state
  const combinedIsLoading =
    productsResult.isLoading ||
    productResult.isLoading ||
    mutationsResult.isCreating ||
    mutationsResult.isUpdating ||
    mutationsResult.isDeleting;

  return {
    // From useProducts
    ...productsResult,

    // From useProduct
    ...productResult,

    // From useProductMutations
    ...mutationsResult,

    // Combined
    combinedIsLoading,
  };
}

const productHooks = {
  useProducts,
  useProduct,
  useProductMutations,
  useProductManagement,
};

export default productHooks;
