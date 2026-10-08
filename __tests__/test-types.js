// JavaScript versions of Product types for testing
// This avoids TypeScript import issues in Node.js tests

// Product Image type
export function createProductImage(data) {
  return {
    id: data?.id || null,
    product_id: data?.product_id || null,
    url: data?.url || null,
    alt_text: data?.alt_text || null,
    position: data?.position || 0,
    is_primary: data?.is_primary || false,
    created_at: data?.created_at || null,
  };
}

// Product Variant type
export function createProductVariant(data) {
  return {
    id: data?.id || null,
    product_id: data?.product_id || null,
    external_id: data?.external_id || null,
    sku: data?.sku || null,
    title: data?.title || null,
    price: data?.price || null,
    compare_at_price: data?.compare_at_price || null,
    currency: data?.currency || 'USD',
    availability: data?.availability || null,
    attributes: data?.attributes || {},
    created_at: data?.created_at || null,
    updated_at: data?.updated_at || null,
  };
}

// Product type
export function createProduct(data) {
  return {
    id: data?.id || null,
    user_id: data?.user_id || null,
    title: data?.title || null,
    description: data?.description || null,
    brand: data?.brand || null,
    category: data?.category || null,
    source_url: data?.source_url || null,
    canonical_url: data?.canonical_url || null,
    source_platform: data?.source_platform || null,
    external_id: data?.external_id || null,
    price: data?.price || null,
    compare_at_price: data?.compare_at_price || null,
    currency: data?.currency || 'USD',
    availability: data?.availability || null,
    main_image_url: data?.main_image_url || null,
    seller_name: data?.seller_name || null,
    seller_url: data?.seller_url || null,
    rating: data?.rating || null,
    reviews_count: data?.reviews_count || null,
    extraction_status: data?.extraction_status || 'pending',
    extraction_method: data?.extraction_method || null,
    extracted_at: data?.extracted_at || null,
    raw_metadata: data?.raw_metadata || null,
    images: (data?.images || []).map(createProductImage),
    variants: (data?.variants || []).map(createProductVariant),
    created_at: data?.created_at || null,
    updated_at: data?.updated_at || null,
  };
}

// Enums
export const SourcePlatform = [
  'amazon',
  'shopify',
  'woocommerce',
  'ebay',
  'etsy',
  'walmart',
  'aliexpress',
  'custom',
  'other',
];

export const AvailabilityStatus = [
  'in_stock',
  'out_of_stock',
  'backorder',
  'preorder',
  'discontinued',
  'limited',
  'unknown',
];

export const ExtractionStatus = ['pending', 'processing', 'completed', 'failed', 'partial'];

export const ExtractionMethod = [
  'manual',
  'url_scraping',
  'api_import',
  'csv_upload',
  'ai_detection',
];

export const Currency = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
