'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '../../lib/types/product';

// ============================================
// ProductImages Component
// Displays product images with gallery and primary image handling
// ============================================

export interface ProductImagesProps {
  images: ProductImage[];
  mainImageUrl?: string | null;
  className?: string;
  showGallery?: boolean;
  onImageSelect?: (image: ProductImage) => void;
}

const PLACEHOLDER_IMAGE = '/landing_page/landing_4_03_photo_produit.png';

export function ProductImages({
  images,
  mainImageUrl,
  className = '',
  showGallery = true,
  onImageSelect,
}: ProductImagesProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Get the main image (first primary image, or first image, or mainImageUrl)
  const getMainImage = (): ProductImage | null => {
    // First, check if we have a mainImageUrl that matches one of our images
    if (mainImageUrl) {
      const matchingImage = images.find((img) => img.url === mainImageUrl);
      if (matchingImage) return matchingImage;
    }

    // Then, find the first primary image
    const primaryImage = images.find((img) => img.is_primary);
    if (primaryImage) return primaryImage;

    // Otherwise, return the first image
    if (images.length > 0) return images[0];

    return null;
  };

  // Handle image loading errors
  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  };

  // Handle image selection
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    const image = images[index];
    if (onImageSelect && image) {
      onImageSelect(image);
    }
  };

  // Get the currently selected image
  const selectedImage = images[selectedImageIndex] || getMainImage();

  // Get display URL for an image
  const getImageDisplayUrl = (image: ProductImage | null): string => {
    if (!image) return PLACEHOLDER_IMAGE;

    // Check if this image has failed to load
    if (imageErrors[image.id]) {
      return PLACEHOLDER_IMAGE;
    }

    return image.url;
  };

  // Check if we have images
  const hasImages = images.length > 0 || !!mainImageUrl;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main image display */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        {hasImages ? (
          <Image
            src={getImageDisplayUrl(selectedImage)}
            alt={selectedImage?.alt_text || 'Product image'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => selectedImage && handleImageError(selectedImage.id)}
            priority={selectedImageIndex === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt="No image available"
              width={200}
              height={200}
              className="object-contain opacity-50"
            />
          </div>
        )}

        {/* Image count indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Gallery thumbnails */}
      {showGallery && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => {
            const isSelected = index === selectedImageIndex;
            const hasError = imageErrors[image.id];

            return (
              <button
                key={image.id || index}
                type="button"
                onClick={() => handleSelectImage(index)}
                className={`relative aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#C2410C] ring-2 ring-[#C2410C]/20'
                    : 'border-transparent hover:border-zinc-300'
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <Image
                  src={hasError ? PLACEHOLDER_IMAGE : image.url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={() => handleImageError(image.id)}
                />

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#C2410C]/10 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full border-2 border-white bg-[#C2410C]" />
                  </div>
                )}

                {/* Primary image indicator */}
                {image.is_primary && (
                  <div className="absolute top-1 right-1 z-10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                      *
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Single image indicator (no gallery) */}
      {!showGallery && hasImages && (
        <p className="text-xs text-center text-zinc-500">
          {images.length} image{images.length > 1 ? 's' : ''}
        </p>
      )}

      {/* No images state */}
      {!hasImages && !showGallery && (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-zinc-500">No images available</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// ProductImageSingle Component
// Simplified version for single image display
// ============================================

export interface ProductImageSingleProps {
  image: ProductImage | null;
  mainImageUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

export function ProductImageSingle({
  image,
  mainImageUrl,
  className = '',
  size = 'md',
  priority = false,
}: ProductImageSingleProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  // Determine which image to display
  const displayImage =
    image ||
    (mainImageUrl ? ({ url: mainImageUrl, alt_text: 'Product image' } as ProductImage) : null);

  // Get image size classes
  const sizeClasses = {
    sm: 'h-20 w-20',
    md: 'h-32 w-32',
    lg: 'h-48 w-48',
    xl: 'h-64 w-64',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 ${sizeClasses[size]} ${className}`}
    >
      {displayImage && !hasError ? (
        <Image
          src={displayImage.url}
          alt={displayImage.alt_text || 'Product image'}
          fill
          sizes={sizeClasses[size]}
          className="object-cover"
          onError={() => setHasError(true)}
          priority={priority}
        />
      ) : (
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="No image available"
          fill
          sizes={sizeClasses[size]}
          className="object-contain opacity-50"
        />
      )}

      {/* Primary indicator */}
      {image?.is_primary && (
        <div className="absolute top-1 right-1 z-10">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
            *
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductImages;
