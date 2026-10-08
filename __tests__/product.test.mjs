// Main Product tests
// Run with: npm test -- --test-path-pattern="product"

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Product Module', () => {
  describe('File Structure', () => {
    it('should have product types file', () => {
      const typesPath = path.join(process.cwd(), 'lib/types/product.ts');
      assert.ok(fs.existsSync(typesPath));
    });

    it('should have product API service file', () => {
      const apiPath = path.join(process.cwd(), 'lib/api/product.ts');
      assert.ok(fs.existsSync(apiPath));
    });

    it('should have product validation file', () => {
      const validationPath = path.join(process.cwd(), 'lib/validation/product.ts');
      assert.ok(fs.existsSync(validationPath));
    });

    it('should have product hooks file', () => {
      const hooksPath = path.join(process.cwd(), 'hooks/use-products.ts');
      assert.ok(fs.existsSync(hooksPath));
    });
  });

  describe('Product API Service Content', () => {
    it('should have CRUD operations', () => {
      const apiPath = path.join(process.cwd(), 'lib/api/product.ts');
      const content = fs.readFileSync(apiPath, 'utf8');
      
      const requiredMethods = [
        'getProducts',
        'getProduct',
        'createProduct',
        'updateProduct',
        'deleteProduct',
        'getMyProducts',
        'searchByUrl',
        'extractFromUrl',
      ];

      requiredMethods.forEach(method => {
        assert.ok(content.includes(method), `API should include ${method} method`);
      });
    });

    it('should have query parameter building function', () => {
      const apiPath = path.join(process.cwd(), 'lib/api/product.ts');
      const content = fs.readFileSync(apiPath, 'utf8');
      
      assert.ok(content.includes('buildProductListQuery'));
    });

    it('should use existing auth system', () => {
      const apiPath = path.join(process.cwd(), 'lib/api/product.ts');
      const content = fs.readFileSync(apiPath, 'utf8');
      
      assert.ok(content.includes('fetchWithAuth') || content.includes('getAuthHeaders'));
    });
  });

  describe('Product Types Content', () => {
    it('should have all required type definitions', () => {
      const typesPath = path.join(process.cwd(), 'lib/types/product.ts');
      const content = fs.readFileSync(typesPath, 'utf8');
      
      const requiredTypes = [
        'Product',
        'ProductImage',
        'ProductVariant',
        'ProductListResponse',
        'ProductCreatePayload',
        'ProductUpdatePayload',
      ];

      requiredTypes.forEach(type => {
        assert.ok(content.includes(type), `Types should include ${type}`);
      });
    });

    it('should have all required Product fields', () => {
      const typesPath = path.join(process.cwd(), 'lib/types/product.ts');
      const content = fs.readFileSync(typesPath, 'utf8');
      
      const requiredFields = [
        'id',
        'user_id',
        'title',
        'description',
        'brand',
        'category',
        'source_url',
        'canonical_url',
        'source_platform',
        'external_id',
        'price',
        'compare_at_price',
        'currency',
        'availability',
        'main_image_url',
        'seller_name',
        'seller_url',
        'rating',
        'reviews_count',
        'extraction_status',
        'extraction_method',
        'extracted_at',
        'raw_metadata',
        'images',
        'variants',
        'created_at',
        'updated_at',
      ];

      requiredFields.forEach(field => {
        assert.ok(content.includes(field), `Product type should include ${field}`);
      });
    });

    it('should have enum types', () => {
      const typesPath = path.join(process.cwd(), 'lib/types/product.ts');
      const content = fs.readFileSync(typesPath, 'utf8');
      
      const requiredEnums = [
        'SourcePlatform',
        'AvailabilityStatus',
        'ExtractionStatus',
        'ExtractionMethod',
      ];

      requiredEnums.forEach(enumType => {
        assert.ok(content.includes(enumType), `Types should include ${enumType}`);
      });
    });
  });

  describe('Product Validation Content', () => {
    it('should have validation functions', () => {
      const validationPath = path.join(process.cwd(), 'lib/validation/product.ts');
      const content = fs.readFileSync(validationPath, 'utf8');
      
      const requiredFunctions = [
        'isValidUrl',
        'isValidEcommerceUrl',
        'isValidPrice',
        'isValidPriceString',
        'isValidCompareAtPrice',
        'isValidRating',
        'isValidInteger',
        'validateProductForm',
        'validateProductObject',
        'hasValidRequiredFields',
        'canSaveProduct',
      ];

      requiredFunctions.forEach(func => {
        assert.ok(content.includes(func), `Validation should include ${func} function`);
      });
    });

    it('should have validation constants', () => {
      const validationPath = path.join(process.cwd(), 'lib/validation/product.ts');
      const content = fs.readFileSync(validationPath, 'utf8');
      
      assert.ok(content.includes('PRODUCT_VALIDATION'));
    });
  });

  describe('Product Hooks Content', () => {
    it('should have useProducts hook', () => {
      const hooksPath = path.join(process.cwd(), 'hooks/use-products.ts');
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      assert.ok(content.includes('useProducts'));
    });

    it('should have useProduct hook', () => {
      const hooksPath = path.join(process.cwd(), 'hooks/use-products.ts');
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      assert.ok(content.includes('useProduct'));
    });

    it('should have mutation hooks', () => {
      const hooksPath = path.join(process.cwd(), 'hooks/use-products.ts');
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      assert.ok(content.includes('useProductMutations') || content.includes('createProduct') || content.includes('updateProduct'));
    });
  });

  describe('Product Components', () => {
    it('should have ProductList component', () => {
      const componentPath = path.join(process.cwd(), 'components/products/ProductList.tsx');
      assert.ok(fs.existsSync(componentPath));
    });

    it('should have ProductDetail component', () => {
      const componentPath = path.join(process.cwd(), 'components/products/ProductDetail.tsx');
      assert.ok(fs.existsSync(componentPath));
    });

    it('should have ProductForm component', () => {
      const componentPath = path.join(process.cwd(), 'components/products/ProductForm.tsx');
      assert.ok(fs.existsSync(componentPath));
    });

    it('should have ProductImages component', () => {
      const componentPath = path.join(process.cwd(), 'components/products/ProductImages.tsx');
      assert.ok(fs.existsSync(componentPath));
    });

    it('should have ProductVariants component', () => {
      const componentPath = path.join(process.cwd(), 'components/products/ProductVariants.tsx');
      assert.ok(fs.existsSync(componentPath));
    });
  });

  describe('Product Pages', () => {
    it('should have products list page', () => {
      const pagePath = path.join(process.cwd(), 'app/products/page.tsx');
      assert.ok(fs.existsSync(pagePath));
    });

    it('should have product detail page', () => {
      const pagePath = path.join(process.cwd(), 'app/products/[id]/page.tsx');
      assert.ok(fs.existsSync(pagePath));
    });

    it('should have new product page', () => {
      const pagePath = path.join(process.cwd(), 'app/products/new/page.tsx');
      assert.ok(fs.existsSync(pagePath));
    });

    it('should have edit product page', () => {
      const pagePath = path.join(process.cwd(), 'app/products/[id]/edit/page.tsx');
      assert.ok(fs.existsSync(pagePath));
    });
  });
});