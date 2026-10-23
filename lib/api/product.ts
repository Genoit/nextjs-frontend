import { fetchWithAuth, getApiBaseUrl, ApiRequestError } from './core';
import {
  Product,
  ProductPreview,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductListResponse,
  ProductListParams,
} from '../types/product';
import { ProductAnalysis } from '../types/product-analysis';

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
    const response = await fetchWithAuth<ProductListResponse & { items?: Product[] }>(url, {
      method: 'GET',
    });
    const rawProducts = response?.products ?? response?.items ?? [];
    return {
      ...response,
      products: Array.isArray(rawProducts) ? rawProducts : [],
      total: response?.total ?? 0,
      page: response?.page ?? 1,
      page_size: response?.page_size ?? 20,
      total_pages: response?.total_pages ?? 0,
    };
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
   * Upload a product image (JPEG/PNG/WebP, max 10 MB); returns its stored public URL
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    const body = new FormData();
    body.append('file', file);
    return fetchWithAuth<{ url: string }>(`${PRODUCTS_BASE_PATH}/images/upload`, {
      method: 'POST',
      body,
    });
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

  /**
   * Run Product Intelligence on a product. Identical successful runs are reused
   * server-side (no new paid call) unless force is true.
   */
  async analyzeProduct(productId: string, force = false): Promise<ProductAnalysis> {
    return fetchWithAuth<ProductAnalysis>(`${PRODUCTS_BASE_PATH}/${productId}/analyses`, {
      method: 'POST',
      body: JSON.stringify({ force }),
    });
  },

  /**
   * Latest product analysis, or null when the product was never analyzed
   */
  async getLatestAnalysis(productId: string): Promise<ProductAnalysis | null> {
    try {
      return await fetchWithAuth<ProductAnalysis>(
        `${PRODUCTS_BASE_PATH}/${productId}/analyses/latest`,
        { method: 'GET' },
      );
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default productApi;
