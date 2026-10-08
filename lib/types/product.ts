// Product types for TrendED
// Follows snake_case convention to match backend API

// ============================================
// Product Image Type
// ============================================
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

// ============================================
// Product Variant Type
// ============================================
// Attributes are flexible key-value pairs for variant options
export type ProductVariantAttributes = Record<string, string>;

export interface ProductVariant {
  id: string;
  product_id: string;
  external_id: string | null;
  sku: string | null;
  title: string;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  availability: string | null;
  attributes: ProductVariantAttributes;
  created_at: string;
  updated_at: string;
}

// ============================================
// Extraction Status Types
// ============================================
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

export type ExtractionMethod =
  'manual' | 'url_scraping' | 'api_import' | 'csv_upload' | 'ai_detection';

export type SourcePlatform =
  | 'amazon'
  | 'shopify'
  | 'woocommerce'
  | 'ebay'
  | 'etsy'
  | 'walmart'
  | 'aliexpress'
  | 'custom'
  | 'other';

export type AvailabilityStatus =
  'in_stock' | 'out_of_stock' | 'backorder' | 'preorder' | 'discontinued' | 'limited' | 'unknown';

// ============================================
// Main Product Type
// ============================================
export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  source_url: string;
  canonical_url: string | null;
  source_platform: SourcePlatform | null;
  external_id: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  availability: AvailabilityStatus | null;
  main_image_url: string | null;
  seller_name: string | null;
  seller_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  extraction_status: ExtractionStatus;
  extraction_method: ExtractionMethod | null;
  extracted_at: string | null;
  raw_metadata: Record<string, unknown> | null;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductCreatePayload {
  title: string;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  source_url: string;
  canonical_url?: string | null;
  source_platform?: SourcePlatform | null;
  external_id?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  currency?: string;
  availability?: AvailabilityStatus | null;
  main_image_url?: string | null;
  seller_name?: string | null;
  seller_url?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  images?: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[];
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

export interface ProductUpdatePayload {
  title?: string;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  source_url?: string;
  canonical_url?: string | null;
  source_platform?: SourcePlatform | null;
  external_id?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  currency?: string;
  availability?: AvailabilityStatus | null;
  main_image_url?: string | null;
  seller_name?: string | null;
  seller_url?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  images?: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[];
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  brand?: string;
  source_platform?: SourcePlatform | null;
  availability?: AvailabilityStatus | null;
  min_price?: number | null;
  max_price?: number | null;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'price' | 'rating';
  sort_order?: 'asc' | 'desc';
}

// ============================================
// Filter and Sort Types
// ============================================

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  source_platform?: SourcePlatform | null;
  availability?: AvailabilityStatus | null;
  price_range?: [number | null, number | null];
}

export interface ProductSort {
  field: 'created_at' | 'updated_at' | 'title' | 'price' | 'rating';
  order: 'asc' | 'desc';
}

// ============================================
// UI State Types
// ============================================

export type ProductListStateType = 'loading' | 'empty' | 'error' | 'success';

export interface ProductState {
  data: Product | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProductListStateData {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductListState {
  data: ProductListStateData | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  sort: ProductSort;
}
