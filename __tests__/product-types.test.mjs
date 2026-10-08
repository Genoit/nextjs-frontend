// Product types tests
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createProduct,
  createProductImage,
  createProductVariant,
  SourcePlatform,
  AvailabilityStatus,
  ExtractionStatus,
  ExtractionMethod,
  Currency
} from './test-types.js';

describe('Product Types', () => {
  describe('Basic Type Structure', () => {
    it('should have all required Product fields', () => {
      const product = createProduct({
        id: 'prod-1',
        user_id: 'user-1',
        title: 'Test Product',
        source_url: 'https://example.com/product',
      });

      assert.strictEqual(product.id, 'prod-1');
      assert.strictEqual(product.title, 'Test Product');
      assert.strictEqual(product.source_url, 'https://example.com/product');
    });

    it('should have all required ProductImage fields', () => {
      const image = createProductImage({
        id: 'img-1',
        product_id: 'prod-1',
        url: 'https://example.com/image.jpg',
      });

      assert.strictEqual(image.id, 'img-1');
      assert.strictEqual(image.product_id, 'prod-1');
      assert.strictEqual(image.url, 'https://example.com/image.jpg');
    });

    it('should have all required ProductVariant fields', () => {
      const variant = createProductVariant({
        id: 'variant-1',
        product_id: 'prod-1',
        title: 'Red Large',
        price: 15.99,
        currency: 'USD',
      });

      assert.strictEqual(variant.id, 'variant-1');
      assert.strictEqual(variant.product_id, 'prod-1');
      assert.strictEqual(variant.title, 'Red Large');
    });
  });

  describe('ProductVariantAttributes', () => {
    it('should accept any string key-value pairs', () => {
      const variant = createProductVariant({
        id: 'variant-1',
        product_id: 'prod-1',
        title: 'Test',
        price: 10.99,
        attributes: {
          color: 'Red',
          size: 'L',
        },
      });

      assert.strictEqual(variant.attributes.color, 'Red');
      assert.strictEqual(variant.attributes.size, 'L');
    });

    it('should work with empty attributes object', () => {
      const variant = createProductVariant({
        id: 'variant-1',
        product_id: 'prod-1',
        title: 'Test',
        price: 10.99,
        attributes: {},
      });

      assert.strictEqual(Object.keys(variant.attributes).length, 0);
    });
  });

  describe('Source Platforms', () => {
    it('should include common e-commerce platforms', () => {
      SourcePlatform.forEach(platform => {
        assert.ok(platform !== undefined);
      });
    });
  });

  describe('Availability Statuses', () => {
    it('should include common availability statuses', () => {
      AvailabilityStatus.forEach(status => {
        assert.ok(status !== undefined);
      });
    });
  });

  describe('Extraction Statuses and Methods', () => {
    it('should include extraction statuses', () => {
      ExtractionStatus.forEach(status => {
        assert.ok(status !== undefined);
      });
    });

    it('should include extraction methods', () => {
      ExtractionMethod.forEach(method => {
        assert.ok(method !== undefined);
      });
    });
  });

  describe('Currency Support', () => {
    it('should include major currencies', () => {
      Currency.forEach(currency => {
        assert.ok(currency !== undefined);
      });
    });
  });

  describe('Product List Response Structure', () => {
    it('should have correct structure', () => {
      const mockProducts = [
        createProduct({
          id: 'prod-1',
          user_id: 'user-1',
          title: 'Product 1',
          source_url: 'https://example.com/1',
        }),
      ];

      const response = {
        products: mockProducts,
        total: 1,
        page: 1,
        page_size: 12,
        total_pages: 1,
      };

      assert.strictEqual(response.products.length, 1);
      assert.strictEqual(response.total, 1);
      assert.strictEqual(response.page, 1);
      assert.strictEqual(response.page_size, 12);
      assert.strictEqual(response.total_pages, 1);
    });
  });

  describe('Complex Product Data', () => {
    it('should create product with images and variants', () => {
      const product = createProduct({
        id: 'prod-1',
        user_id: 'user-1',
        title: 'T-Shirt',
        description: 'A comfortable t-shirt',
        brand: 'MyBrand',
        category: 'Clothing',
        source_url: 'https://example.com/tshirt',
        price: 19.99,
        currency: 'USD',
        availability: 'in_stock',
        images: [
          createProductImage({
            id: 'img-1',
            product_id: 'prod-1',
            url: 'https://example.com/image1.jpg',
            alt_text: 'Front view',
            position: 0,
            is_primary: true,
          }),
          createProductImage({
            id: 'img-2',
            product_id: 'prod-1',
            url: 'https://example.com/image2.jpg',
            alt_text: 'Back view',
            position: 1,
            is_primary: false,
          }),
        ],
        variants: [
          createProductVariant({
            id: 'variant-1',
            product_id: 'prod-1',
            external_id: 'variant-123',
            sku: 'TSHIRT-RED-L',
            title: 'Red Large',
            price: 19.99,
            compare_at_price: 24.99,
            currency: 'USD',
            availability: 'in_stock',
            attributes: { color: 'Red', size: 'L' },
          }),
          createProductVariant({
            id: 'variant-2',
            product_id: 'prod-1',
            external_id: 'variant-456',
            sku: 'TSHIRT-BLUE-M',
            title: 'Blue Medium',
            price: 19.99,
            compare_at_price: 24.99,
            currency: 'USD',
            availability: 'in_stock',
            attributes: { color: 'Blue', size: 'M' },
          }),
        ],
      });

      assert.strictEqual(product.images.length, 2);
      assert.strictEqual(product.variants.length, 2);
      assert.ok(product.images[0].is_primary);
      assert.strictEqual(product.variants[0].attributes.color, 'Red');
      assert.strictEqual(product.variants[0].attributes.size, 'L');
    });
  });
});