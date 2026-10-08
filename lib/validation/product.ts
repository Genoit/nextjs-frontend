// Product validation utilities
// Follows the existing patterns and conventions from the project

import { ProductCreatePayload, ProductUpdatePayload, Product } from '../types/product';

// ============================================
// Validation Constants
// ============================================

export const PRODUCT_VALIDATION = {
  // Title validation
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 500,

  // Description validation
  DESCRIPTION_MAX_LENGTH: 5000,

  // Brand and category validation
  BRAND_MAX_LENGTH: 200,
  CATEGORY_MAX_LENGTH: 200,

  // URL validation
  URL_MIN_LENGTH: 10,
  URL_MAX_LENGTH: 2000,

  // Price validation
  PRICE_MIN: 0,
  PRICE_MAX: 1000000,
  PRICE_DECIMAL_PLACES: 2,

  // Rating validation
  RATING_MIN: 0,
  RATING_MAX: 5,
  RATING_DECIMAL_PLACES: 1,

  // Reviews count validation
  REVIEWS_COUNT_MIN: 0,
  REVIEWS_COUNT_MAX: 1000000,

  // External ID validation
  EXTERNAL_ID_MAX_LENGTH: 200,

  // SKU validation
  SKU_MAX_LENGTH: 200,
} as const;

// ============================================
// Error Messages
// ============================================

export const PRODUCT_ERRORS = {
  TITLE_REQUIRED: 'Product name is required',
  TITLE_TOO_SHORT: (min: number) => `Product name must be at least ${min} character`,
  TITLE_TOO_LONG: (max: number) => `Product name must be less than ${max} characters`,

  DESCRIPTION_TOO_LONG: (max: number) => `Description must be less than ${max} characters`,

  BRAND_TOO_LONG: (max: number) => `Brand must be less than ${max} characters`,
  CATEGORY_TOO_LONG: (max: number) => `Category must be less than ${max} characters`,

  SOURCE_URL_REQUIRED: 'Source URL is required',
  SOURCE_URL_INVALID: 'Please enter a valid URL (e.g., https://example.com)',
  SOURCE_URL_TOO_LONG: (max: number) => `URL must be less than ${max} characters`,

  CANONICAL_URL_INVALID: 'Please enter a valid URL',
  MAIN_IMAGE_URL_INVALID: 'Please enter a valid image URL',
  SELLER_URL_INVALID: 'Please enter a valid URL',

  PRICE_INVALID: 'Please enter a valid price (number >= 0)',
  PRICE_TOO_LOW: (min: number) => `Price must be at least ${min}`,
  PRICE_TOO_HIGH: (max: number) => `Price must be less than ${max}`,

  COMPARE_AT_PRICE_INVALID: 'Please enter a valid compare-at price (number >= 0)',
  COMPARE_AT_PRICE_LOWER: 'Compare-at price must be greater than or equal to price',

  RATING_INVALID: 'Please enter a valid rating (0-5)',
  RATING_TOO_LOW: (min: number) => `Rating must be at least ${min}`,
  RATING_TOO_HIGH: (max: number) => `Rating must be less than or equal to ${max}`,

  REVIEWS_COUNT_INVALID: 'Please enter a valid number of reviews',
  REVIEWS_COUNT_TOO_LOW: (min: number) => `Reviews count must be at least ${min}`,
  REVIEWS_COUNT_TOO_HIGH: (max: number) => `Reviews count must be less than ${max}`,

  EXTERNAL_ID_TOO_LONG: (max: number) => `External ID must be less than ${max} characters`,
  SKU_TOO_LONG: (max: number) => `SKU must be less than ${max} characters`,

  CURRENCY_REQUIRED: 'Currency is required',
  PLATFORM_INVALID: 'Please select a valid platform',
  AVAILABILITY_INVALID: 'Please select a valid availability status',
} as const;

// ============================================
// URL Validation
// ============================================

// URL pattern that allows most e-commerce URLs
const URL_PATTERN = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?$/i;

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return URL_PATTERN.test(url.trim());
}

// More lenient URL validation for e-commerce sites
export function isValidEcommerceUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Basic URL structure check
  const trimmed = url.trim();

  // Must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Price Validation
// ============================================

export function isValidPrice(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return true; // Optional field

  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= PRODUCT_VALIDATION.PRICE_MIN && num <= PRODUCT_VALIDATION.PRICE_MAX;
}

export function isValidPriceString(value: string): boolean {
  if (!value || value === '') return true; // Optional field

  const num = parseFloat(value);
  return !isNaN(num) && num >= PRODUCT_VALIDATION.PRICE_MIN && num <= PRODUCT_VALIDATION.PRICE_MAX;
}

// Check if compare-at price is valid relative to price
export function isValidCompareAtPrice(
  price: number | null,
  compareAtPrice: number | null,
): boolean {
  if (compareAtPrice === null || compareAtPrice === undefined) return true; // Optional field
  if (price === null || price === undefined) return false;

  return compareAtPrice >= price;
}

// ============================================
// Rating Validation
// ============================================

export function isValidRating(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return true; // Optional field

  const num = typeof value === 'string' ? parseFloat(value) : value;
  return (
    !isNaN(num) && num >= PRODUCT_VALIDATION.RATING_MIN && num <= PRODUCT_VALIDATION.RATING_MAX
  );
}

// ============================================
// Integer Validation (for reviews count, etc.)
// ============================================

export function isValidInteger(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return true; // Optional field

  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return !isNaN(num) && num >= 0;
}

// ============================================
// String Length Validation
// ============================================

export function validateStringLength(
  value: string | null | undefined,
  minLength: number,
  maxLength: number,
  fieldName: string,
  optional: boolean = false,
): string | null {
  if (!value || value === '') {
    return optional ? null : `${fieldName} is required`;
  }

  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} ${minLength === 1 ? 'character' : 'characters'}`;
  }

  if (value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }

  return null;
}

// ============================================
// Form Validation
// ============================================

export interface ProductFormErrors {
  title?: string;
  sourceUrl?: string;
  canonicalUrl?: string;
  mainImageUrl?: string;
  sellerUrl?: string;
  price?: string;
  compareAtPrice?: string;
  rating?: string;
  reviewsCount?: string;
  currency?: string;
  // Add other fields as needed
}

export function validateProductForm(
  data: ProductCreatePayload | ProductUpdatePayload,
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  // Validate title (required)
  const title = data.title;
  if (!title || title.trim() === '') {
    errors.title = PRODUCT_ERRORS.TITLE_REQUIRED;
  } else if (title.length > PRODUCT_VALIDATION.TITLE_MAX_LENGTH) {
    errors.title = PRODUCT_ERRORS.TITLE_TOO_LONG(PRODUCT_VALIDATION.TITLE_MAX_LENGTH);
  }

  // Validate source URL (required)
  const sourceUrl = data.source_url;
  if (!sourceUrl || sourceUrl.trim() === '') {
    errors.sourceUrl = PRODUCT_ERRORS.SOURCE_URL_REQUIRED;
  } else if (!isValidEcommerceUrl(sourceUrl)) {
    errors.sourceUrl = PRODUCT_ERRORS.SOURCE_URL_INVALID;
  } else if (sourceUrl.length > PRODUCT_VALIDATION.URL_MAX_LENGTH) {
    errors.sourceUrl = PRODUCT_ERRORS.SOURCE_URL_TOO_LONG(PRODUCT_VALIDATION.URL_MAX_LENGTH);
  }

  // Validate canonical URL (optional)
  if (data.canonical_url && !isValidEcommerceUrl(data.canonical_url)) {
    errors.canonicalUrl = PRODUCT_ERRORS.CANONICAL_URL_INVALID;
  }

  // Validate main image URL (optional)
  if (data.main_image_url && !isValidEcommerceUrl(data.main_image_url)) {
    errors.mainImageUrl = PRODUCT_ERRORS.MAIN_IMAGE_URL_INVALID;
  }

  // Validate seller URL (optional)
  if (data.seller_url && !isValidEcommerceUrl(data.seller_url)) {
    errors.sellerUrl = PRODUCT_ERRORS.SELLER_URL_INVALID;
  }

  // Validate price (optional)
  if (data.price !== null && data.price !== undefined) {
    if (typeof data.price === 'number') {
      if (data.price < PRODUCT_VALIDATION.PRICE_MIN) {
        errors.price = PRODUCT_ERRORS.PRICE_TOO_LOW(PRODUCT_VALIDATION.PRICE_MIN);
      } else if (data.price > PRODUCT_VALIDATION.PRICE_MAX) {
        errors.price = PRODUCT_ERRORS.PRICE_TOO_HIGH(PRODUCT_VALIDATION.PRICE_MAX);
      }
    } else if (typeof data.price === 'string') {
      const num = parseFloat(data.price);
      if (isNaN(num)) {
        errors.price = PRODUCT_ERRORS.PRICE_INVALID;
      } else if (num < PRODUCT_VALIDATION.PRICE_MIN) {
        errors.price = PRODUCT_ERRORS.PRICE_TOO_LOW(PRODUCT_VALIDATION.PRICE_MIN);
      } else if (num > PRODUCT_VALIDATION.PRICE_MAX) {
        errors.price = PRODUCT_ERRORS.PRICE_TOO_HIGH(PRODUCT_VALIDATION.PRICE_MAX);
      }
    }
  }

  // Validate compare-at price (optional)
  if (data.compare_at_price !== null && data.compare_at_price !== undefined) {
    if (typeof data.compare_at_price === 'number') {
      if (data.compare_at_price < PRODUCT_VALIDATION.PRICE_MIN) {
        errors.compareAtPrice = PRODUCT_ERRORS.PRICE_INVALID;
      }
    } else if (typeof data.compare_at_price === 'string') {
      const num = parseFloat(data.compare_at_price);
      if (isNaN(num)) {
        errors.compareAtPrice = PRODUCT_ERRORS.COMPARE_AT_PRICE_INVALID;
      }
    }
  }

  // Validate rating (optional)
  if (data.rating !== null && data.rating !== undefined) {
    if (typeof data.rating === 'number') {
      if (data.rating < PRODUCT_VALIDATION.RATING_MIN) {
        errors.rating = PRODUCT_ERRORS.RATING_TOO_LOW(PRODUCT_VALIDATION.RATING_MIN);
      } else if (data.rating > PRODUCT_VALIDATION.RATING_MAX) {
        errors.rating = PRODUCT_ERRORS.RATING_TOO_HIGH(PRODUCT_VALIDATION.RATING_MAX);
      }
    } else if (typeof data.rating === 'string') {
      const num = parseFloat(data.rating);
      if (
        isNaN(num) ||
        num < PRODUCT_VALIDATION.RATING_MIN ||
        num > PRODUCT_VALIDATION.RATING_MAX
      ) {
        errors.rating = PRODUCT_ERRORS.RATING_INVALID;
      }
    }
  }

  // Validate reviews count (optional)
  if (data.reviews_count !== null && data.reviews_count !== undefined) {
    if (typeof data.reviews_count === 'number') {
      if (data.reviews_count < PRODUCT_VALIDATION.REVIEWS_COUNT_MIN) {
        errors.reviewsCount = PRODUCT_ERRORS.REVIEWS_COUNT_TOO_LOW(
          PRODUCT_VALIDATION.REVIEWS_COUNT_MIN,
        );
      } else if (data.reviews_count > PRODUCT_VALIDATION.REVIEWS_COUNT_MAX) {
        errors.reviewsCount = PRODUCT_ERRORS.REVIEWS_COUNT_TOO_HIGH(
          PRODUCT_VALIDATION.REVIEWS_COUNT_MAX,
        );
      }
    } else if (typeof data.reviews_count === 'string') {
      const num = parseInt(data.reviews_count, 10);
      if (
        isNaN(num) ||
        num < PRODUCT_VALIDATION.REVIEWS_COUNT_MIN ||
        num > PRODUCT_VALIDATION.REVIEWS_COUNT_MAX
      ) {
        errors.reviewsCount = PRODUCT_ERRORS.REVIEWS_COUNT_INVALID;
      }
    }
  }

  return errors;
}

// ============================================
// Validate Product Object
// ============================================

export function validateProductObject(product: Partial<Product>): string[] {
  const errors: string[] = [];

  // Validate required fields
  if (!product.title || product.title.trim() === '') {
    errors.push('Product title is required');
  }

  if (!product.source_url || !isValidEcommerceUrl(product.source_url)) {
    errors.push('Valid source URL is required');
  }

  // Validate optional fields if present
  if (product.canonical_url && !isValidEcommerceUrl(product.canonical_url)) {
    errors.push('Invalid canonical URL');
  }

  if (product.main_image_url && !isValidEcommerceUrl(product.main_image_url)) {
    errors.push('Invalid main image URL');
  }

  if (product.price !== null && product.price !== undefined && product.price < 0) {
    errors.push('Price cannot be negative');
  }

  if (
    product.compare_at_price !== null &&
    product.compare_at_price !== undefined &&
    product.compare_at_price < 0
  ) {
    errors.push('Compare-at price cannot be negative');
  }

  if (
    product.rating !== null &&
    product.rating !== undefined &&
    (product.rating < 0 || product.rating > 5)
  ) {
    errors.push('Rating must be between 0 and 5');
  }

  return errors;
}

// ============================================
// Validation Helpers
// ============================================

// Check if a product has valid required fields
export function hasValidRequiredFields(product: Partial<Product>): boolean {
  return (
    !!product.title &&
    product.title.trim() !== '' &&
    !!product.source_url &&
    isValidEcommerceUrl(product.source_url)
  );
}

// Check if a product can be saved
export function canSaveProduct(product: Partial<Product>): boolean {
  return hasValidRequiredFields(product);
}

const productValidation = {
  // Constants
  PRODUCT_VALIDATION,
  PRODUCT_ERRORS,

  // Validation functions
  isValidUrl,
  isValidEcommerceUrl,
  isValidPrice,
  isValidPriceString,
  isValidCompareAtPrice,
  isValidRating,
  isValidInteger,
  validateStringLength,
  validateProductForm,
  validateProductObject,
  hasValidRequiredFields,
  canSaveProduct,
};

export default productValidation;
