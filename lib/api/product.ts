import { fetchWithAuth, getApiBaseUrl, ApiRequestError } from './core';
import {
  Product,
  ProductPreview,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductListResponse,
  ProductListParams,
} from '../types/product';

// ============================================
// Product API Service
// ============================================

const PRODUCTS_BASE_PATH = '/products';

/**
 * Get the products endpoint URL
 */
function getProductsUrl(): string {
  return `${getApiBaseUrl()}${PRODUCTS_BASE_PATH}`;
}

/**
 * Build query string from params for product listing
 */
function buildProductListQuery(params: ProductListParams): string {
  const queryParams: string[] = [];

  if (params.page !== undefined) {
    queryParams.push(`page=${params.page}`);
  }
  if (params.page_size !== undefined) {
    queryParams.push(`page_size=${params.page_size}`);
  }
  if (params.search) {
    queryParams.push(`search=${encodeURIComponent(params.search)}`);
  }
  if (params.category) {
    queryParams.push(`category=${encodeURIComponent(params.category)}`);
  }
  if (params.brand) {
    queryParams.push(`brand=${encodeURIComponent(params.brand)}`);
  }
  if (params.source_platform) {
    queryParams.push(`source_platform=${params.source_platform}`);
  }
  if (params.availability) {
    queryParams.push(`availability=${params.availability}`);
  }
  if (params.min_price !== undefined) {
    queryParams.push(`min_price=${params.min_price}`);
  }
  if (params.max_price !== undefined) {
    queryParams.push(`max_price=${params.max_price}`);
  }
  if (params.sort_by) {
    queryParams.push(`sort_by=${params.sort_by}`);
  }
  if (params.sort_order) {
    queryParams.push(`sort_order=${params.sort_order}`);
  }

  return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
}

/**
 * Product API Service
 * All methods use the existing fetchWithAuth for authentication and error handling
 */
export const productApi = {
  /**
   * Get a paginated list of products for the authenticated user
   */
  async getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
    const query = buildProductListQuery(params);
    const url = `${PRODUCTS_BASE_PATH}${query}`;
    return fetchWithAuth<ProductListResponse>(url, { method: 'GET' });
  },

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    const url = `${PRODUCTS_BASE_PATH}/${productId}`;
    return fetchWithAuth<Product>(url, { method: 'GET' });
  },

  /**
   * Create a new product
   */
  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    const url = PRODUCTS_BASE_PATH;
    return fetchWithAuth<Product>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, payload: ProductUpdatePayload): Promise<Product> {
    const url = `${PRODUCTS_BASE_PATH}/${productId}`;
    return fetchWithAuth<Product>(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Patch a product (partial update)
   */
  async patchProduct(productId: string, payload: Partial<ProductUpdatePayload>): Promise<Product> {
    const url = `${PRODUCTS_BASE_PATH}/${productId}`;
    return fetchWithAuth<Product>(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<void> {
    const url = `${PRODUCTS_BASE_PATH}/${productId}`;
    await fetchWithAuth<void>(url, { method: 'DELETE' });
  },

  /**
   * Get products by user (alternative endpoint if needed)
   */
  async getMyProducts(
    params: Omit<ProductListParams, 'user_id'> = {},
  ): Promise<ProductListResponse> {
    const query = buildProductListQuery(params);
    const url = `${PRODUCTS_BASE_PATH}/me${query}`;
    return fetchWithAuth<ProductListResponse>(url, { method: 'GET' });
  },

  /**
   * Search products by URL (for extraction preview)
   * This is a placeholder for the future extraction feature
   */
  async searchByUrl(url: string): Promise<Product | null> {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = getProductsUrl();
    const searchUrl = `${apiUrl}/search?url=${encodedUrl}`;

    try {
      return await fetchWithAuth<Product>(searchUrl, { method: 'GET' });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Extract product preview from URL (US-08)
   */
  async extractFromUrl(url: string): Promise<ProductPreview> {
    return fetchWithAuth<ProductPreview>(`${PRODUCTS_BASE_PATH}/extract`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
};

export default productApi;
