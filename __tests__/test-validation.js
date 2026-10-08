// JavaScript versions of Product validation functions for testing

// Validation constants
export const PRODUCT_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 10000,
  PRICE_MIN: 0,
  PRICE_MAX: 1000000,
  RATING_MIN: 0,
  RATING_MAX: 5,
  REVIEWS_COUNT_MIN: 0,
  REVIEWS_COUNT_MAX: 1000000,
  BRAND_MAX_LENGTH: 200,
  CATEGORY_MAX_LENGTH: 200,
  SELLER_NAME_MAX_LENGTH: 200,
  EXTERNAL_ID_MAX_LENGTH: 200,
  SKU_MAX_LENGTH: 200,
};

// URL validation
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// E-commerce URL validation - less restrictive
export function isValidEcommerceUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  // Basic check - must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Price validation
export function isValidPrice(value) {
  if (value === null || value === undefined || value === '') return true; // Optional
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return (
      !isNaN(num) && num >= PRODUCT_VALIDATION.PRICE_MIN && num <= PRODUCT_VALIDATION.PRICE_MAX
    );
  }
  if (typeof value === 'number') {
    return value >= PRODUCT_VALIDATION.PRICE_MIN && value <= PRODUCT_VALIDATION.PRICE_MAX;
  }
  return false;
}

// Price string validation
export function isValidPriceString(value) {
  if (value === null || value === undefined || value === '') return true; // Optional
  if (typeof value !== 'string') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= PRODUCT_VALIDATION.PRICE_MIN && num <= PRODUCT_VALIDATION.PRICE_MAX;
}

// Compare-at price validation
export function isValidCompareAtPrice(price, compareAtPrice) {
  if (price === null || price === undefined || price === '') price = 0;
  if (compareAtPrice === null || compareAtPrice === undefined || compareAtPrice === '') return true;

  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  const compareNum =
    typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice;

  return compareNum >= priceNum;
}

// Rating validation
export function isValidRating(value) {
  if (value === null || value === undefined || value === '') return true; // Optional
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return (
      !isNaN(num) && num >= PRODUCT_VALIDATION.RATING_MIN && num <= PRODUCT_VALIDATION.RATING_MAX
    );
  }
  if (typeof value === 'number') {
    return value >= PRODUCT_VALIDATION.RATING_MIN && value <= PRODUCT_VALIDATION.RATING_MAX;
  }
  return false;
}

// Integer validation
export function isValidInteger(value) {
  if (value === null || value === undefined || value === '') return true; // Optional
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return !isNaN(num) && value === num.toString() && num >= 0;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0;
  }
  return false;
}

// Product form validation
export function validateProductForm(formData) {
  const errors = {};

  // Title validation
  if (!formData.title || formData.title.trim().length < PRODUCT_VALIDATION.TITLE_MIN_LENGTH) {
    errors.title = `Title must be at least ${PRODUCT_VALIDATION.TITLE_MIN_LENGTH} character`;
  } else if (formData.title.length > PRODUCT_VALIDATION.TITLE_MAX_LENGTH) {
    errors.title = `Title must be less than ${PRODUCT_VALIDATION.TITLE_MAX_LENGTH} characters`;
  }

  // Source URL validation
  if (!formData.source_url || !isValidEcommerceUrl(formData.source_url)) {
    errors.sourceUrl = 'Please enter a valid e-commerce URL (must start with http:// or https://)';
  }

  // Price validation
  if (formData.price !== null && formData.price !== undefined && formData.price !== '') {
    if (!isValidPrice(formData.price)) {
      errors.price = `Price must be between ${PRODUCT_VALIDATION.PRICE_MIN} and ${PRODUCT_VALIDATION.PRICE_MAX}`;
    }
  }

  // Compare-at price validation
  if (
    formData.compare_at_price !== null &&
    formData.compare_at_price !== undefined &&
    formData.compare_at_price !== ''
  ) {
    if (!isValidPrice(formData.compare_at_price)) {
      errors.compareAtPrice = `Compare-at price must be a valid number between ${PRODUCT_VALIDATION.PRICE_MIN} and ${PRODUCT_VALIDATION.PRICE_MAX}`;
    } else if (formData.price !== null && formData.price !== undefined && formData.price !== '') {
      if (!isValidCompareAtPrice(formData.price, formData.compare_at_price)) {
        errors.compareAtPrice = 'Compare-at price must be greater than or equal to regular price';
      }
    }
  }

  // Currency validation
  if (
    formData.currency &&
    !['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'].includes(formData.currency)
  ) {
    errors.currency = 'Please select a valid currency';
  }

  // Rating validation
  if (formData.rating !== null && formData.rating !== undefined && formData.rating !== '') {
    if (!isValidRating(formData.rating)) {
      errors.rating = `Rating must be between ${PRODUCT_VALIDATION.RATING_MIN} and ${PRODUCT_VALIDATION.RATING_MAX}`;
    }
  }

  // Description length validation
  if (
    formData.description &&
    formData.description.length > PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH
  ) {
    errors.description = `Description must be less than ${PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`;
  }

  // Brand length validation
  if (formData.brand && formData.brand.length > PRODUCT_VALIDATION.BRAND_MAX_LENGTH) {
    errors.brand = `Brand must be less than ${PRODUCT_VALIDATION.BRAND_MAX_LENGTH} characters`;
  }

  // Category length validation
  if (formData.category && formData.category.length > PRODUCT_VALIDATION.CATEGORY_MAX_LENGTH) {
    errors.category = `Category must be less than ${PRODUCT_VALIDATION.CATEGORY_MAX_LENGTH} characters`;
  }

  return errors;
}

// Product object validation
export function validateProductObject(product) {
  const errors = [];

  // Required fields
  if (!product.title || product.title.trim().length < PRODUCT_VALIDATION.TITLE_MIN_LENGTH) {
    errors.push('Product title is required and must be at least 1 character');
  }

  if (!product.source_url || !isValidEcommerceUrl(product.source_url)) {
    errors.push('Valid source URL is required');
  }

  if (product.price !== null && product.price !== undefined && !isValidPrice(product.price)) {
    errors.push('Price must be a valid positive number');
  }

  if (product.rating !== null && product.rating !== undefined && !isValidRating(product.rating)) {
    errors.push('Rating must be between 0 and 5');
  }

  return errors;
}

// Required fields check
export function hasValidRequiredFields(product) {
  return !!(
    product.title &&
    product.title.trim() &&
    product.source_url &&
    isValidEcommerceUrl(product.source_url)
  );
}

// Can save product check
export function canSaveProduct(product) {
  return (
    hasValidRequiredFields(product) &&
    (product.price === null || product.price === undefined || isValidPrice(product.price))
  );
}
