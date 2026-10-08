// Product validation tests
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidUrl,
  isValidEcommerceUrl,
  isValidPrice,
  isValidPriceString,
  isValidCompareAtPrice,
  isValidRating,
  isValidInteger,
  validateProductForm,
  validateProductObject,
  hasValidRequiredFields,
  canSaveProduct,
  PRODUCT_VALIDATION,
} from './test-validation.js';

describe('Product Validation', () => {
  describe('URL Validation', () => {
    it('should validate valid URLs', () => {
      assert.ok(isValidUrl('https://example.com'));
      assert.ok(isValidUrl('https://www.example.com/product'));
      assert.ok(isValidUrl('http://shopify.com/products/item'));
      assert.ok(isValidUrl('https://amazon.com/dp/ABC123'));
    });

    it('should invalidate invalid URLs', () => {
      assert.ok(!isValidUrl('hello'));
      assert.ok(!isValidUrl('test'));
      assert.ok(!isValidUrl('abc'));
      assert.ok(!isValidUrl('example.com')); // Missing protocol
      assert.ok(!isValidUrl(''));
      assert.ok(!isValidUrl(null));
      assert.ok(!isValidUrl(undefined));
    });

    it('should validate e-commerce URLs with isValidEcommerceUrl', () => {
      assert.ok(isValidEcommerceUrl('https://example.com'));
      assert.ok(isValidEcommerceUrl('https://www.amazon.com/product'));
      assert.ok(isValidEcommerceUrl('https://shopify.com/products/item'));
      assert.ok(isValidEcommerceUrl('http://ebay.com/item/123'));
      assert.ok(!isValidEcommerceUrl('example.com')); // Missing protocol
    });
  });

  describe('Price Validation', () => {
    it('should validate valid prices', () => {
      assert.ok(isValidPrice(10.99));
      assert.ok(isValidPrice(0));
      assert.ok(isValidPrice(1000));
      assert.ok(isValidPrice(null)); // Optional
      assert.ok(isValidPrice(undefined)); // Optional
      assert.ok(isValidPrice('')); // Optional
      assert.ok(isValidPrice('10.99'));
      assert.ok(isValidPrice('0'));
    });

    it('should invalidate negative prices', () => {
      assert.ok(!isValidPrice(-1));
      assert.ok(!isValidPrice(-10.99));
      assert.ok(!isValidPrice('-10.99'));
    });

    it('should validate prices above max', () => {
      const maxPrice = PRODUCT_VALIDATION.PRICE_MAX;
      assert.ok(!isValidPrice(maxPrice + 1));
      assert.ok(!isValidPriceString((maxPrice + 1).toString()));
    });

    it('should validate price strings', () => {
      assert.ok(isValidPriceString('10.99'));
      assert.ok(isValidPriceString('0'));
      assert.ok(isValidPriceString('1000'));
      assert.ok(!isValidPriceString('invalid'));
      assert.ok(!isValidPriceString('-10'));
    });

    it('should validate compare-at price', () => {
      assert.ok(isValidCompareAtPrice(10, 20));
      assert.ok(isValidCompareAtPrice(10, 10));
      assert.ok(!isValidCompareAtPrice(10, 5)); // Compare-at lower than price
      assert.ok(isValidCompareAtPrice(null, 20)); // Price is optional
      assert.ok(isValidCompareAtPrice(10, null)); // Compare-at is optional
    });
  });

  describe('Rating Validation', () => {
    it('should validate valid ratings', () => {
      assert.ok(isValidRating(0));
      assert.ok(isValidRating(2.5));
      assert.ok(isValidRating(5));
      assert.ok(isValidRating(null)); // Optional
      assert.ok(isValidRating(undefined)); // Optional
      assert.ok(isValidRating('')); // Optional
      assert.ok(isValidRating('4.5'));
      assert.ok(isValidRating('0'));
    });

    it('should invalidate ratings outside range', () => {
      assert.ok(!isValidRating(-1));
      assert.ok(!isValidRating(6));
      assert.ok(!isValidRating(10));
      assert.ok(!isValidRating('-1'));
      assert.ok(!isValidRating('6'));
    });
  });

  describe('Integer Validation', () => {
    it('should validate valid integers', () => {
      assert.ok(isValidInteger(0));
      assert.ok(isValidInteger(100));
      assert.ok(isValidInteger(null)); // Optional
      assert.ok(isValidInteger(undefined)); // Optional
      assert.ok(isValidInteger('')); // Optional
      assert.ok(isValidInteger('100'));
    });

    it('should invalidate negative integers', () => {
      assert.ok(!isValidInteger(-1));
      assert.ok(!isValidInteger('-1'));
    });

    it('should invalidate non-integers', () => {
      assert.ok(!isValidInteger(3.14));
      assert.ok(!isValidInteger('3.14'));
      assert.ok(!isValidInteger('abc'));
    });
  });

  describe('Product Form Validation', () => {
    it('should validate a valid product form', () => {
      const validForm = {
        title: 'Test Product',
        source_url: 'https://example.com/product',
        price: 10.99,
        currency: 'USD',
      };

      const errors = validateProductForm(validForm);
      assert.ok(Object.keys(errors).length === 0);
    });

    it('should catch missing required fields', () => {
      const invalidForm = {
        title: '',
        source_url: '',
      };

      const errors = validateProductForm(invalidForm);
      assert.ok('title' in errors);
      assert.ok('sourceUrl' in errors);
    });

    it('should catch invalid URLs', () => {
      const invalidForm = {
        title: 'Test Product',
        source_url: 'invalid-url',
      };

      const errors = validateProductForm(invalidForm);
      assert.ok('sourceUrl' in errors);
    });

    it('should catch invalid prices', () => {
      const invalidForm = {
        title: 'Test Product',
        source_url: 'https://example.com',
        price: -10,
      };

      const errors = validateProductForm(invalidForm);
      assert.ok('price' in errors);
    });

    it('should catch invalid ratings', () => {
      const invalidForm = {
        title: 'Test Product',
        source_url: 'https://example.com',
        rating: 6,
      };

      const errors = validateProductForm(invalidForm);
      assert.ok('rating' in errors);
    });
  });

  describe('Product Object Validation', () => {
    it('should validate a valid product object', () => {
      const validProduct = {
        id: '1',
        user_id: 'user-1',
        title: 'Test Product',
        description: null,
        brand: null,
        category: null,
        source_url: 'https://example.com',
        price: 10.99,
        currency: 'USD',
        images: [],
        variants: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        extraction_status: 'completed',
      };

      const errors = validateProductObject(validProduct);
      assert.ok(errors.length === 0);
    });

    it('should catch validation errors in product object', () => {
      const invalidProduct = {
        id: '1',
        user_id: 'user-1',
        title: '',
        source_url: 'invalid',
        price: -10,
        currency: 'USD',
        images: [],
        variants: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        extraction_status: 'completed',
      };

      const errors = validateProductObject(invalidProduct);
      assert.ok(errors.length > 0);
    });
  });

  describe('Required Fields Check', () => {
    it('should confirm valid required fields', () => {
      const product = {
        title: 'Test Product',
        source_url: 'https://example.com',
      };

      assert.ok(hasValidRequiredFields(product));
      assert.ok(canSaveProduct(product));
    });

    it('should reject missing required fields', () => {
      const product = {
        title: '',
        source_url: '',
      };

      assert.ok(!hasValidRequiredFields(product));
      assert.ok(!canSaveProduct(product));
    });

    it('should reject invalid source URL', () => {
      const product = {
        title: 'Test Product',
        source_url: 'invalid',
      };

      assert.ok(!hasValidRequiredFields(product));
      assert.ok(!canSaveProduct(product));
    });
  });
});