'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  SourcePlatform,
  AvailabilityStatus,
} from '../../lib/types/product';
import { useProductMutations } from '../../hooks/use-products';
import { getAuthErrorMessage } from '../../lib/auth-errors';

// ============================================
// ProductForm Component
// Reusable form for creating and editing products
// ============================================

export interface ProductFormProps {
  product?: Product | null;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export interface ProductFormData {
  title: string;
  description: string;
  brand: string;
  category: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourcePlatform: SourcePlatform | '';
  externalId: string;
  price: string;
  compareAtPrice: string;
  currency: string;
  availability: AvailabilityStatus | '';
  mainImageUrl: string;
  sellerName: string;
  sellerUrl: string;
  rating: string;
  reviewsCount: string;
}

// Available source platforms
const SOURCE_PLATFORMS: { value: SourcePlatform | ''; label: string }[] = [
  { value: '', label: 'Select platform' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'ebay', label: 'eBay' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'walmart', label: 'Walmart' },
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
];

// Available availability statuses
const AVAILABILITY_OPTIONS: { value: AvailabilityStatus | ''; label: string }[] = [
  { value: '', label: 'Select availability' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'backorder', label: 'Backorder' },
  { value: 'preorder', label: 'Pre-order' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'limited', label: 'Limited' },
  { value: 'unknown', label: 'Unknown' },
];

// Available currencies
const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'INR', label: 'INR (₹)' },
];

// URL validation pattern
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

// Price validation
const isValidPrice = (value: string): boolean => {
  if (!value) return true; // Optional field
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

// Rating validation
const isValidRating = (value: string): boolean => {
  if (!value) return true; // Optional field
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 5;
};

// Integer validation for reviews count
const isValidInteger = (value: string): boolean => {
  if (!value) return true; // Optional field
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0;
};

export function ProductForm({ product, onSuccess, onCancel, onError }: ProductFormProps) {
  const router = useRouter();
  const { createProduct, updateProduct, isCreating, isUpdating, createError, updateError } =
    useProductMutations();

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    brand: '',
    category: '',
    sourceUrl: '',
    canonicalUrl: '',
    sourcePlatform: '',
    externalId: '',
    price: '',
    compareAtPrice: '',
    currency: 'USD',
    availability: '',
    mainImageUrl: '',
    sellerName: '',
    sellerUrl: '',
    rating: '',
    reviewsCount: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Track previous product ID to avoid unnecessary updates
  const prevProductIdRef = React.useRef<string | null>(null);

  // Initialize form with existing product data
  useEffect(() => {
    const currentProductId = product?.id || null;
    if (currentProductId && currentProductId !== prevProductIdRef.current && product) {
      prevProductIdRef.current = currentProductId;
      setFormData({
        title: product.title || '',
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || '',
        sourceUrl: product.source_url || '',
        canonicalUrl: product.canonical_url || '',
        sourcePlatform: product.source_platform || '',
        externalId: product.external_id || '',
        price: product.price !== null ? product.price.toString() : '',
        compareAtPrice:
          product.compare_at_price !== null ? product.compare_at_price.toString() : '',
        currency: product.currency || 'USD',
        availability: product.availability || '',
        mainImageUrl: product.main_image_url || '',
        sellerName: product.seller_name || '',
        sellerUrl: product.seller_url || '',
        rating: product.rating !== null ? product.rating.toString() : '',
        reviewsCount: product.reviews_count !== null ? product.reviews_count.toString() : '',
      });
    } else if (!product && prevProductIdRef.current) {
      // Reset form if product is cleared
      prevProductIdRef.current = null;
      setFormData({
        title: '',
        description: '',
        brand: '',
        category: '',
        sourceUrl: '',
        canonicalUrl: '',
        sourcePlatform: '',
        externalId: '',
        price: '',
        compareAtPrice: '',
        currency: 'USD',
        availability: '',
        mainImageUrl: '',
        sellerName: '',
        sellerUrl: '',
        rating: '',
        reviewsCount: '',
      });
    }
  }, [product]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user types
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [formErrors],
  );

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      errors.title = 'Product name is required';
    }

    if (!formData.sourceUrl.trim()) {
      errors.sourceUrl = 'Source URL is required';
    } else if (!URL_PATTERN.test(formData.sourceUrl)) {
      errors.sourceUrl = 'Please enter a valid URL (e.g., https://example.com)';
    }

    // Validate URLs if provided
    if (formData.canonicalUrl && !URL_PATTERN.test(formData.canonicalUrl)) {
      errors.canonicalUrl = 'Please enter a valid URL';
    }

    if (formData.mainImageUrl && !URL_PATTERN.test(formData.mainImageUrl)) {
      errors.mainImageUrl = 'Please enter a valid URL';
    }

    if (formData.sellerUrl && !URL_PATTERN.test(formData.sellerUrl)) {
      errors.sellerUrl = 'Please enter a valid URL';
    }

    // Validate price fields
    if (formData.price && !isValidPrice(formData.price)) {
      errors.price = 'Please enter a valid price (number >= 0)';
    }

    if (formData.compareAtPrice && !isValidPrice(formData.compareAtPrice)) {
      errors.compareAtPrice = 'Please enter a valid price (number >= 0)';
    }

    // Validate rating
    if (formData.rating && !isValidRating(formData.rating)) {
      errors.rating = 'Please enter a valid rating (0-5)';
    }

    // Validate reviews count
    if (formData.reviewsCount && !isValidInteger(formData.reviewsCount)) {
      errors.reviewsCount = 'Please enter a valid number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload
      const payload: ProductCreatePayload | ProductUpdatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        brand: formData.brand.trim() || null,
        category: formData.category.trim() || null,
        source_url: formData.sourceUrl.trim(),
        canonical_url: formData.canonicalUrl.trim() || null,
        source_platform: formData.sourcePlatform || null,
        external_id: formData.externalId.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        compare_at_price: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        currency: formData.currency,
        availability: formData.availability || null,
        main_image_url: formData.mainImageUrl.trim() || null,
        seller_name: formData.sellerName.trim() || null,
        seller_url: formData.sellerUrl.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews_count: formData.reviewsCount ? parseInt(formData.reviewsCount, 10) : null,
      };

      let result: Product | null = null;

      if (product) {
        // Update existing product
        result = await updateProduct(product.id, payload as ProductUpdatePayload);
      } else {
        // Create new product
        result = await createProduct(payload as ProductCreatePayload);
      }

      if (result) {
        setSubmitSuccess(true);

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        // Redirect to product detail or list
        setTimeout(() => {
          router.push(`/products/${result.id}`);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(
        err as Error,
        product ? 'Failed to update product' : 'Failed to create product',
      );
      setSubmitError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form has any errors
  const hasErrors = Object.keys(formErrors).length > 0;
  const isLoading = isCreating || isUpdating || isSubmitting;
  const isEditMode = !!product;

  // Display success message
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft">
          <svg
            className="h-6 w-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">
          {isEditMode ? 'Product updated successfully!' : 'Product created successfully!'}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">Redirecting you to the product page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error display */}
      {(hasErrors || submitError || createError || updateError) && (
        <div className="rounded-lg bg-danger-soft border border-danger/30 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-danger flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-danger">There were some issues</h4>
              <p className="mt-1 text-sm text-danger">
                {submitError ||
                  createError ||
                  updateError ||
                  'Please fix the errors below and try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-ink-soft">
            Product Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter product name"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.title
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.title ? 'title-error' : undefined}
          />
          {formErrors.title && (
            <p id="title-error" className="mt-1 text-xs text-danger">
              {formErrors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-ink-soft">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          />
        </div>

        {/* Brand and Category */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-ink-soft">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand name"
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink-soft">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Product category"
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          />
        </div>

        {/* Source URL */}
        <div className="sm:col-span-2">
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-ink-soft">
            Source URL <span className="text-danger">*</span>
          </label>
          <input
            type="url"
            id="sourceUrl"
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            placeholder="https://example.com/product"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.sourceUrl
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.sourceUrl ? 'sourceUrl-error' : undefined}
          />
          {formErrors.sourceUrl && (
            <p id="sourceUrl-error" className="mt-1 text-xs text-danger">
              {formErrors.sourceUrl}
            </p>
          )}
        </div>

        {/* Canonical URL */}
        <div className="sm:col-span-2">
          <label htmlFor="canonicalUrl" className="block text-sm font-medium text-ink-soft">
            Canonical URL
          </label>
          <input
            type="url"
            id="canonicalUrl"
            name="canonicalUrl"
            value={formData.canonicalUrl}
            onChange={handleChange}
            placeholder="https://example.com/canonical-product"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.canonicalUrl
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.canonicalUrl ? 'canonicalUrl-error' : undefined}
          />
          {formErrors.canonicalUrl && (
            <p id="canonicalUrl-error" className="mt-1 text-xs text-danger">
              {formErrors.canonicalUrl}
            </p>
          )}
        </div>

        {/* Source Platform */}
        <div>
          <label htmlFor="sourcePlatform" className="block text-sm font-medium text-ink-soft">
            Source Platform
          </label>
          <select
            id="sourcePlatform"
            name="sourcePlatform"
            value={formData.sourcePlatform}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          >
            {SOURCE_PLATFORMS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* External ID */}
        <div>
          <label htmlFor="externalId" className="block text-sm font-medium text-ink-soft">
            External ID
          </label>
          <input
            type="text"
            id="externalId"
            name="externalId"
            value={formData.externalId}
            onChange={handleChange}
            placeholder="External ID from source"
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          />
        </div>

        {/* Price and Compare At Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-ink-soft">
            Price
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-sm text-ink-muted">{formData.currency}</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`block w-full rounded-lg border bg-studio-ground px-3 py-2 pl-8 text-sm shadow-sm transition ${
                formErrors.price
                  ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                  : 'border-line focus:border-trend-orange focus:ring-trend-orange'
              }`}
              disabled={isLoading}
              aria-describedby={formErrors.price ? 'price-error' : undefined}
            />
          </div>
          {formErrors.price && (
            <p id="price-error" className="mt-1 text-xs text-danger">
              {formErrors.price}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="compareAtPrice" className="block text-sm font-medium text-ink-soft">
            Compare At Price
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-sm text-ink-muted">{formData.currency}</span>
            </div>
            <input
              type="number"
              id="compareAtPrice"
              name="compareAtPrice"
              value={formData.compareAtPrice}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`block w-full rounded-lg border bg-studio-ground px-3 py-2 pl-8 text-sm shadow-sm transition ${
                formErrors.compareAtPrice
                  ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                  : 'border-line focus:border-trend-orange focus:ring-trend-orange'
              }`}
              disabled={isLoading}
              aria-describedby={formErrors.compareAtPrice ? 'compareAtPrice-error' : undefined}
            />
          </div>
          {formErrors.compareAtPrice && (
            <p id="compareAtPrice-error" className="mt-1 text-xs text-danger">
              {formErrors.compareAtPrice}
            </p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-ink-soft">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-ink-soft">
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Main Image URL */}
        <div className="sm:col-span-2">
          <label htmlFor="mainImageUrl" className="block text-sm font-medium text-ink-soft">
            Main Image URL
          </label>
          <input
            type="url"
            id="mainImageUrl"
            name="mainImageUrl"
            value={formData.mainImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.mainImageUrl
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.mainImageUrl ? 'mainImageUrl-error' : undefined}
          />
          {formErrors.mainImageUrl && (
            <p id="mainImageUrl-error" className="mt-1 text-xs text-danger">
              {formErrors.mainImageUrl}
            </p>
          )}
        </div>

        {/* Seller Information */}
        <div>
          <label htmlFor="sellerName" className="block text-sm font-medium text-ink-soft">
            Seller Name
          </label>
          <input
            type="text"
            id="sellerName"
            name="sellerName"
            value={formData.sellerName}
            onChange={handleChange}
            placeholder="Seller name"
            className="mt-1 block w-full rounded-lg border border-line bg-studio-ground px-3 py-2 text-sm shadow-sm transition focus:border-trend-orange focus:ring-trend-orange"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="sellerUrl" className="block text-sm font-medium text-ink-soft">
            Seller URL
          </label>
          <input
            type="url"
            id="sellerUrl"
            name="sellerUrl"
            value={formData.sellerUrl}
            onChange={handleChange}
            placeholder="https://example.com/seller"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.sellerUrl
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.sellerUrl ? 'sellerUrl-error' : undefined}
          />
          {formErrors.sellerUrl && (
            <p id="sellerUrl-error" className="mt-1 text-xs text-danger">
              {formErrors.sellerUrl}
            </p>
          )}
        </div>

        {/* Rating and Reviews Count */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-ink-soft">
            Rating (0-5)
          </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="0-5"
            step="0.1"
            min="0"
            max="5"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.rating
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.rating ? 'rating-error' : undefined}
          />
          {formErrors.rating && (
            <p id="rating-error" className="mt-1 text-xs text-danger">
              {formErrors.rating}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reviewsCount" className="block text-sm font-medium text-ink-soft">
            Reviews Count
          </label>
          <input
            type="number"
            id="reviewsCount"
            name="reviewsCount"
            value={formData.reviewsCount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className={`mt-1 block w-full rounded-lg border bg-studio-ground px-3 py-2 text-sm shadow-sm transition ${
              formErrors.reviewsCount
                ? 'border-danger/30 focus:border-red-500 focus:ring-red-500'
                : 'border-line focus:border-trend-orange focus:ring-trend-orange'
            }`}
            disabled={isLoading}
            aria-describedby={formErrors.reviewsCount ? 'reviewsCount-error' : undefined}
          />
          {formErrors.reviewsCount && (
            <p id="reviewsCount-error" className="mt-1 text-xs text-danger">
              {formErrors.reviewsCount}
            </p>
          )}
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line bg-studio-ground px-6 py-2 text-sm font-medium text-ink-soft shadow-sm hover:bg-studio-surface transition"
          disabled={isLoading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-trend-orange px-6 py-2 text-sm font-semibold text-on-accent shadow-sm hover:bg-trend-orange-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
