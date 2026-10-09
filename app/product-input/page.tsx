'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  ExternalLink,
  FileEdit,
  ImageIcon,
  Link2,
  Maximize2,
  Plus,
  Sparkles,
  Star,
  Store,
  Tag,
  X,
  Check,
  LogOut,
  RefreshCw,
  AlertCircle,
  Play,
  Film,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { productApi } from '../../lib/api/product';
import { ProductCreatePayload, ProductPreview } from '../../lib/types/product';

interface ProductImageItem {
  id: string;
  url: string;
  alt: string;
  badge?: 'sparkle' | 'motion' | 'none';
}

interface CustomerReviewItem {
  author?: string;
  rating?: number;
  title?: string;
  comment?: string;
  date?: string;
}

/**
 * Upgrade thumbnail/downscaled image URLs from Amazon, Shopify, AliExpress, and eBay
 * into their full-resolution uncompressed master assets.
 */
function upgradeImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();

  // 1. Amazon CDN: strip dynamic crop/thumbnail tokens (e.g. ._AC_SR38,50_.jpg -> .jpg)
  if (url.toLowerCase().includes('amazon') || url.toLowerCase().includes('media-amazon')) {
    url = url.replace(/(\._[A-Za-z0-9_,+-]+_\.)(jpe?g|png|webp|gif)/gi, '.$2');
  }

  // 2. Shopify CDN: strip size suffixes (e.g. _small.jpg, _100x100.jpg -> .jpg)
  if (url.toLowerCase().includes('cdn.shopify.com')) {
    url = url.replace(
      /_(pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)(\.(?:jpe?g|png|webp))/gi,
      '$2',
    );
    url = url.replace(/([?&])width=\d+/gi, '$1width=2048');
  }

  // 3. AliExpress CDN: strip thumbnail downscaling
  if (url.toLowerCase().includes('alicdn.com')) {
    url = url.replace(/(\.(?:jpe?g|png|webp))_\d+x\d+.*/gi, '$1');
    url = url.replace(/_\d+x\d+\.(?:jpe?g|png|webp)/gi, '.jpg');
  }

  // 4. eBay CDN: upgrade s-l\d+ to s-l1600
  if (url.toLowerCase().includes('ebayimg.com')) {
    url = url.replace(/s-l\d+\.(jpe?g|png|webp)/gi, 's-l1600.$1');
  }

  // 5. Etsy CDN: upgrade thumbnail tokens to uncompressed master assets
  if (url.toLowerCase().includes('etsystatic.com')) {
    url = url.replace(/\/il_\d+x[A-Za-z0-9]+\./i, '/il_fullxfull.');
  }

  // 6. Walmart CDN: upgrade image dimension params
  if (url.toLowerCase().includes('walmartimages.com')) {
    url = url.replace(/\?odnHeight=\d+&odnWidth=\d+.*/i, '?odnHeight=2000&odnWidth=2000');
  }

  return url;
}

const TARGET_AUDIENCES = [
  'Young professionals',
  'Fitness & gym enthusiasts',
  'Busy parents & moms',
  'Students & campus commuters',
  'Travelers & digital nomads',
  'Health & wellness creators',
];

export default function ProductInputPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'upload' | 'url' | 'store'
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'store'>('upload');

  // Form states (clean initial state, no mock values)
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('Young professionals');

  // Images state (empty by default)
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // URL Import tab state
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [urlSuccess, setUrlSuccess] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<ProductPreview | null>(null);

  // Price, Currency, Category, Brand states
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store Connect tab / modal state
  const [storeConnected, setStoreConnected] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  // AI Suggestion feedback
  const [aiApplied, setAiApplied] = useState(false);

  // Guide modal state
  const [guideOpen, setGuideOpen] = useState(false);

  // User menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Notification indicator
  const [hasNotifications, setHasNotifications] = useState(true);

  // Submission / Next step state
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fullscreen Lightbox modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extracted Videos & Reviews state
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [videosExpanded, setVideosExpanded] = useState(true);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [descPreviewExpanded, setDescPreviewExpanded] = useState(false);

  // Lightbox keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + images.length) % images.length,
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  const handleSetCoverImage = (indexToCover: number) => {
    if (indexToCover <= 0 || indexToCover >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToCover, 1);
      return [item, ...copy];
    });
    setLightboxIndex(0);
    setSuccessToast('Image set as primary cover!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Benefits tags handling
  const handleRemoveBenefit = (tagToRemove: string) => {
    setBenefits((prev) => prev.filter((b) => b !== tagToRemove));
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefitInput.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !benefits.includes(trimmed)) {
      setBenefits((prev) => [...prev, trimmed]);
      setNewBenefitInput('');
    }
  };

  const handleBenefitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddBenefit();
    } else if (e.key === 'Backspace' && !newBenefitInput && benefits.length > 0) {
      setBenefits((prev) => prev.slice(0, -1));
    }
  };

  // AI Suggestion apply
  const handleApplyAiSuggestion = () => {
    const suggestionsToAdd = productName
      ? ['Premium Quality', 'Customer Favorite', 'Fast Delivery']
      : ['High Quality', 'Key Feature', 'Easy to Use'];
    setBenefits((prev) => {
      const combined = [...prev];
      suggestionsToAdd.forEach((s) => {
        if (!combined.some((item) => item.toLowerCase() === s.toLowerCase())) {
          combined.push(s);
        }
      });
      return combined;
    });
    setAiApplied(true);
    setTimeout(() => setAiApplied(false), 3000);
  };

  // Image Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ProductImageItem[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      badge: 'sparkle',
    }));

    setImages((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newItems: ProductImageItem[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      badge: 'sparkle',
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemoveImage = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  // Real URL Extraction handler
  const handleExtractFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = urlInput.trim();
    if (!targetUrl) return;

    setIsExtracting(true);
    setUrlError(null);
    setUrlSuccess(false);

    try {
      const preview = await productApi.extractFromUrl(targetUrl);
      setExtractedPreview(preview);
      setUrlSuccess(true);

      if (preview.title) {
        setProductName(preview.title);
      }
      if (preview.description) {
        setDescription(preview.description);
      }
      if (preview.price !== null && preview.price !== undefined) {
        setPrice(String(preview.price));
      }
      if (preview.currency) {
        setCurrency(preview.currency);
      }
      if (preview.brand) {
        setBrand(preview.brand);
        if (!benefits.includes(preview.brand)) {
          setBenefits((prev) => [...prev, preview.brand!]);
        }
      }
      if (preview.category) {
        setCategory(preview.category);
        if (!benefits.includes(preview.category)) {
          setBenefits((prev) => [...prev, preview.category!]);
        }
      }

      // Populate extracted images if available with upgraded high resolution
      const candidateList: string[] = [];
      if (preview.main_image_url && typeof preview.main_image_url === 'string') {
        candidateList.push(upgradeImageUrl(preview.main_image_url));
      }
      if (preview.images && Array.isArray(preview.images)) {
        preview.images.forEach((imgUrl) => {
          if (imgUrl && typeof imgUrl === 'string') {
            const upgraded = upgradeImageUrl(imgUrl);
            if (!candidateList.includes(upgraded)) {
              candidateList.push(upgraded);
            }
          }
        });
      }

      if (candidateList.length > 0) {
        const newImages: ProductImageItem[] = candidateList.map((imgUrl, idx) => ({
          id: `ext-${Date.now()}-${idx}`,
          url: imgUrl,
          alt: preview.title || 'Product Image',
          badge: idx === 0 ? 'sparkle' : 'none',
        }));
        setImages(newImages);
      }

      // Populate bullet points as benefits
      const rawMeta = preview.raw_metadata || {};
      const bulletPoints = (rawMeta.bullet_points as string[]) || [];
      if (bulletPoints.length > 0) {
        setBenefits((prev) => {
          const combined = [...prev];
          bulletPoints.slice(0, 5).forEach((b) => {
            const cleanB = b.length > 50 ? b.slice(0, 47) + '...' : b;
            if (!combined.includes(cleanB)) {
              combined.push(cleanB);
            }
          });
          return combined;
        });
      }

      // Populate videos if available
      const extractedVids = (rawMeta.videos as string[]) || [];
      if (extractedVids.length > 0) {
        setSelectedVideoUrl(extractedVids[0]);
        setVideosExpanded(true);
      }

      const vidCountText = extractedVids.length > 0 ? ` + ${extractedVids.length} videos` : '';
      const imgCountText =
        candidateList.length > 0
          ? ` (${candidateList.length} image${candidateList.length !== 1 ? 's' : ''}${vidCountText})`
          : '';
      setSuccessToast(`Extracted: ${(preview.title || 'Product').slice(0, 30)}...${imgCountText}`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to extract product details from URL.';
      setUrlError(msg);
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsExtracting(false);
    }
  };

  // Next step & Save Product
  const handleNextStep = async () => {
    const trimmedTitle = productName.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please provide a product name before proceeding.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const sourceUrl =
        extractedPreview?.source_url || (activeTab === 'url' ? urlInput.trim() : null);
      const sourcePlatform =
        extractedPreview?.source_platform || (activeTab === 'url' ? 'generic' : 'manual');
      const extractionMethod =
        extractedPreview?.extraction_method || (activeTab === 'url' ? 'generic' : 'manual');

      let finalPrice: number | null = null;
      if (price.trim() !== '') {
        const val = parseFloat(price);
        if (!isNaN(val)) {
          finalPrice = val;
        }
      } else if (extractedPreview?.price !== undefined) {
        finalPrice = extractedPreview.price;
      }

      const payload: ProductCreatePayload = {
        title: trimmedTitle,
        description: description.trim() || null,
        brand: brand.trim() || extractedPreview?.brand || null,
        category: category.trim() || extractedPreview?.category || null,
        source_url: sourceUrl || undefined,
        canonical_url: extractedPreview?.canonical_url || null,
        source_platform: sourcePlatform,
        external_id: extractedPreview?.external_id || null,
        price: finalPrice,
        compare_at_price: extractedPreview?.compare_at_price ?? null,
        currency: currency || extractedPreview?.currency || 'USD',
        availability: extractedPreview?.availability || 'in_stock',
        main_image_url:
          images.length > 0 ? images[0].url : extractedPreview?.main_image_url || null,
        seller_name: extractedPreview?.seller_name || null,
        seller_url: extractedPreview?.seller_url || null,
        rating: extractedPreview?.rating ?? null,
        reviews_count: extractedPreview?.reviews_count ?? null,
        extraction_status: 'completed',
        extraction_method: extractionMethod,
        images: images.map((img, idx) => ({
          url: img.url,
          alt_text: img.alt || trimmedTitle,
          position: idx,
          is_primary: idx === 0,
        })),
        raw_metadata: {
          ...(extractedPreview?.raw_metadata || {}),
          benefits,
          target_audience: targetAudience,
        },
      };

      const created = await productApi.createProduct(payload);
      setSuccessToast(`Product "${created.title}" saved successfully!`);

      // Navigate to product detail
      setTimeout(() => {
        router.push(`/products/${created.id}`);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product. Please try again.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 flex flex-col font-sans">
        {/* ========================================================= */}
        {/* 1. TOP APP HEADER BAR */}
        {/* ========================================================= */}
        <header className="sticky top-0 z-40 h-[70px] bg-white border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          {/* Left: Brand Logo & Tagline */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/symbol.png"
                alt="TrendED Symbol"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
                TrendED
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400 mt-1">
                E-commerce · Dropshipping · Growth
              </span>
            </div>
          </Link>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setHasNotifications(!hasNotifications)}
                className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-zinc-600" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E0492A] ring-2 ring-white" />
                )}
              </button>
            </div>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-zinc-100/80 transition cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 shrink-0">
                  <Image
                    src="/profile1-login.jpg"
                    alt="Sarah Johnson avatar"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>

                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-zinc-800">
                    {user ? `${user.first_name} ${user.last_name}` : 'Sarah Johnson'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-zinc-200/80 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-semibold text-zinc-900">
                      {user ? `${user.first_name} ${user.last_name}` : 'Sarah Johnson'}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {user?.email || 'sarah.johnson@example.com'}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition"
                  >
                    Dashboard Home
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col md:flex-row min-w-0 w-full">
          {/* ------------------------------------------------------- */}
          {/* LEFT SIDEBAR (STEPPER & HELP) */}
          {/* ------------------------------------------------------- */}
          <aside className="w-full md:w-64 lg:w-72 md:min-h-[calc(100vh-70px)] bg-white/70 backdrop-blur-xs border-b md:border-b-0 md:border-r border-zinc-200/80 p-5 sm:p-6 flex flex-col justify-between shrink-0">
            <div className="space-y-7">
              {/* Back to Dashboard */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition group"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Dashboard</span>
              </Link>

              {/* Stepper Navigation */}
              <div className="space-y-2.5">
                {/* Step 1: Product Input (Active) */}
                <div className="w-full rounded-2xl bg-[#FFF5ED] border border-[#FED7AA]/70 px-4 py-3 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#BA3807] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <span className="text-sm font-bold text-[#BA3807]">Product Input</span>
                </div>

                {/* Step 2: UGC Setup */}
                <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3.5 text-zinc-400 cursor-not-allowed">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <span className="text-sm font-medium text-zinc-500">UGC Setup</span>
                </div>

                {/* Step 3: Generate */}
                <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3.5 text-zinc-400 cursor-not-allowed">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <span className="text-sm font-medium text-zinc-500">Generate</span>
                </div>
              </div>
            </div>

            {/* Need help? card */}
            <div className="mt-8 rounded-2xl bg-[#FFF8F3] border border-[#FCE7D6] p-4.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[#E0492A]">
                <Sparkles className="w-4 h-4 fill-[#E0492A]" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Need help?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Check our guide to get the best results.
              </p>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="text-xs font-semibold text-[#BA3807] hover:text-[#9A2D04] inline-flex items-center gap-1 mt-1 transition group"
              >
                <span>View guide</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </aside>

          {/* ------------------------------------------------------- */}
          {/* MAIN CONTENT AREA */}
          {/* ------------------------------------------------------- */}
          <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header: Tag + Title + Subtitle */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 text-[#BA3807] mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  CREATE UGC VIDEO
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-zinc-900 tracking-tight">
                Add your product
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Import your product details and images, or add them manually.
              </p>
            </div>

            {/* ------------------------------------------------------- */}
            {/* TWO-COLUMN GRID OF CARDS */}
            {/* ------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full min-w-0">
              {/* ===================================================== */}
              {/* CARD 1: IMPORT PRODUCT */}
              {/* ===================================================== */}
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between w-full min-w-0 overflow-hidden">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] border border-[#FED7AA]/60 flex items-center justify-center text-[#BA3807] shrink-0">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Import product</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Upload product images, paste a URL, or import from your store.
                      </p>
                    </div>
                  </div>

                  {/* 3 Tabs Row */}
                  <div className="grid grid-cols-3 gap-1.5 bg-zinc-100/70 p-1 rounded-xl border border-zinc-200/60 mt-5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition ${
                        activeTab === 'upload'
                          ? 'bg-[#FFF5ED] border border-[#FDBA74] text-[#BA3807] shadow-2xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Upload Images</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('url')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition ${
                        activeTab === 'url'
                          ? 'bg-[#FFF5ED] border border-[#FDBA74] text-[#BA3807] shadow-2xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Product URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('store')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition ${
                        activeTab === 'store'
                          ? 'bg-[#FFF5ED] border border-[#FDBA74] text-[#BA3807] shadow-2xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Import from Store</span>
                    </button>
                  </div>

                  {/* TAB CONTENT */}
                  {activeTab === 'upload' && (
                    <div className="mt-5 space-y-4">
                      {/* Drag & Drop Box */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                          isDragging
                            ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
                            : 'border-zinc-200/90 bg-[#FAFAFA] hover:border-orange-300 hover:bg-orange-50/20'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-400 mb-2.5 shadow-2xs">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-800">
                          Drag and drop your images here
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">or click to browse</p>
                        <p className="text-[11px] text-zinc-400 mt-2">
                          Supports JPG, PNG (max 10MB each)
                        </p>
                      </div>

                      {/* Thumbnails Gallery */}
                      {images.length > 0 && (
                        <div className="product-thumbnail-grid grid grid-cols-5 gap-2.5 pt-1 w-full max-w-full">
                          {images.map((img, idx) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxIndex(idx)}
                              className="product-thumbnail-item group relative aspect-square w-full max-w-[110px] max-h-[110px] rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 shadow-2xs shrink-0 mx-auto cursor-pointer"
                              title="Click to view full screen"
                            >
                              <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 18vw, (max-width: 1024px) 12vw, 110px"
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              {idx === 0 && (
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-semibold text-white tracking-wider uppercase z-10">
                                  Cover
                                </div>
                              )}
                              {/* Action badge on top right */}
                              {img.badge === 'sparkle' && idx !== 0 && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#BA3807] shadow-xs z-10">
                                  <Sparkles className="w-3 h-3 fill-[#BA3807]" />
                                </div>
                              )}
                              {img.badge === 'motion' && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-zinc-600 shadow-xs text-[9px] font-bold z-10">
                                  🏃
                                </div>
                              )}

                              {/* Hover Actions Overlay */}
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity z-20">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(idx);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                                  title="View full screen"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(img.id, e);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                                  title="Remove image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add more images button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="product-thumbnail-item aspect-square w-full max-w-[110px] max-h-[110px] rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 flex flex-col items-center justify-center p-2 text-center transition group cursor-pointer mx-auto"
                          >
                            <Plus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-800 transition shrink-0" />
                            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-800 mt-1 leading-tight text-center">
                              Add more
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PRODUCT URL */}
                  {activeTab === 'url' && (
                    <div className="mt-5 space-y-4">
                      {/* Supported Platforms Showcase with High Efficiency Badges */}
                      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-zinc-900">
                            <Sparkles className="w-4 h-4 text-[#BA3807]" />
                            <span className="text-xs font-bold tracking-tight">
                              Plateformes prises en charge — Haute efficacité
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Moteurs Dédiés TrendED
                          </span>
                        </div>

                        {/* Grid of supported platforms */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {/* Amazon */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#FF9900]/15 flex items-center justify-center font-black text-[#D97706] text-xs shrink-0">
                              a
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">
                                Amazon
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Photos HD, vidéos, avis
                              </p>
                            </div>
                          </div>

                          {/* AliExpress */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#E62E04]/15 flex items-center justify-center font-black text-[#DC2626] text-xs shrink-0">
                              AE
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">
                                AliExpress
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Galerie 1000px, avis, prix
                              </p>
                            </div>
                          </div>

                          {/* Alibaba */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#FF6A00]/15 flex items-center justify-center font-black text-[#EA580C] text-xs shrink-0">
                              A
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">
                                Alibaba
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Grossistes B2B, HD, specs
                              </p>
                            </div>
                          </div>

                          {/* Shopify */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#95BF47]/20 flex items-center justify-center font-black text-[#15803D] text-xs shrink-0">
                              S
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">
                                Shopify
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Sync direct JSON 2048px
                              </p>
                            </div>
                          </div>

                          {/* eBay */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#E53238]/15 flex items-center justify-center font-black text-[#1D4ED8] text-xs shrink-0">
                              eb
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">eBay</p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Photos 1600px, specs
                              </p>
                            </div>
                          </div>

                          {/* Etsy */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#F1641E]/15 flex items-center justify-center font-black text-[#EA580C] text-xs shrink-0">
                              Et
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">Etsy</p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Photos artisan, détails
                              </p>
                            </div>
                          </div>

                          {/* Walmart */}
                          <div className="rounded-xl border border-zinc-200 bg-white p-2.5 flex items-center gap-2.5 shadow-2xs hover:border-[#BA3807]/40 transition">
                            <div className="w-7 h-7 rounded-lg bg-[#0071DC]/15 flex items-center justify-center font-black text-[#0284C7] text-xs shrink-0">
                              W
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 leading-tight">
                                Walmart
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                Médias HD & attributs
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          <span className="font-semibold text-zinc-700">
                            Garantie haute fidélité :
                          </span>{' '}
                          TrendED est optimisé pour ces plateformes afin d&apos;extraire toutes les
                          images sans compression, les vidéos, les avis vérifiés et les descriptions
                          complètes. Les autres sites e-commerce sont analysés via notre scraper
                          universel intelligent.
                        </p>
                      </div>

                      {/* URL Extraction Form */}
                      <form onSubmit={handleExtractFromUrl} className="space-y-3">
                        <label className="block text-xs font-semibold text-zinc-800">
                          Collez le lien URL du produit
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://www.alibaba.com/... ou https://fr.aliexpress.com/... ou https://amazon.com/..."
                            className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807]"
                          />
                          <button
                            type="submit"
                            disabled={isExtracting || !urlInput.trim()}
                            className="rounded-xl bg-[#BA3807] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9A2D04] disabled:opacity-50 transition shrink-0 flex items-center gap-1.5"
                          >
                            {isExtracting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Extraction en cours...</span>
                              </>
                            ) : (
                              <span>Extraire les données</span>
                            )}
                          </button>
                        </div>
                      </form>

                      {urlError && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-800">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">Échec de l&apos;extraction</p>
                            <p className="mt-0.5 text-red-700">{urlError}</p>
                          </div>
                        </div>
                      )}

                      {/* EXTRACTED PRODUCT OVERVIEW CARD */}
                      {urlSuccess && extractedPreview && (
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4 animate-in fade-in slide-in-from-top-1">
                          {/* Platform Header & Badges */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF5ED] text-[#BA3807] border border-[#FED7AA]">
                                <Sparkles className="w-3 h-3 fill-[#BA3807]" />
                                {(extractedPreview.source_platform || 'E-COMMERCE').toUpperCase()}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Données Extraites avec Succès
                              </span>
                            </div>
                            {extractedPreview.source_url && (
                              <a
                                href={extractedPreview.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
                              >
                                <span>Voir page source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Extracted Product Title */}
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                              {extractedPreview.title}
                            </h3>
                          </div>

                          {/* Metric badges: Price, Currency, Availability, Rating, Images count */}
                          <div className="flex flex-wrap items-center gap-2">
                            {extractedPreview.price !== null &&
                              extractedPreview.price !== undefined && (
                                <div className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200/80 text-xs font-bold text-zinc-900">
                                  {extractedPreview.currency || 'USD'}{' '}
                                  {Number(extractedPreview.price).toLocaleString()}
                                </div>
                              )}

                            {extractedPreview.availability && (
                              <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
                                ●{' '}
                                {extractedPreview.availability === 'in_stock'
                                  ? 'En stock'
                                  : extractedPreview.availability}
                              </div>
                            )}

                            {extractedPreview.rating && (
                              <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{Number(extractedPreview.rating).toFixed(1)}</span>
                                {extractedPreview.reviews_count && (
                                  <span className="font-normal text-amber-700">
                                    ({extractedPreview.reviews_count.toLocaleString()} avis)
                                  </span>
                                )}
                              </div>
                            )}

                            {images.length > 0 && (
                              <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-[11px] font-medium text-blue-800 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-blue-600" />
                                <span>
                                  {images.length} photo{images.length > 1 ? 's' : ''} HD
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Extracted Description Box (Expandable) */}
                          {extractedPreview.description && (
                            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                                  <FileEdit className="w-3.5 h-3.5 text-[#BA3807]" />
                                  Description complète extraite
                                </span>
                                {extractedPreview.description.length > 250 && (
                                  <button
                                    type="button"
                                    onClick={() => setDescPreviewExpanded(!descPreviewExpanded)}
                                    className="text-[11px] font-semibold text-[#BA3807] hover:underline cursor-pointer"
                                  >
                                    {descPreviewExpanded
                                      ? 'Réduire'
                                      : `Afficher tout (${extractedPreview.description.length} car.)`}
                                  </button>
                                )}
                              </div>

                              <div
                                className={`text-xs text-zinc-700 leading-relaxed whitespace-pre-line ${
                                  !descPreviewExpanded && extractedPreview.description.length > 250
                                    ? 'line-clamp-4'
                                    : ''
                                }`}
                              >
                                {extractedPreview.description}
                              </div>

                              <p className="text-[10px] text-zinc-400 italic">
                                ✓ Synchronisée avec le formulaire à droite pour vous permettre de la
                                modifier librement.
                              </p>
                            </div>
                          )}

                          {/* Extracted Benefits / Highlights Chips */}
                          {benefits.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-zinc-800">
                                Points forts &amp; caractéristiques détectés ({benefits.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {benefits.map((b, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-zinc-100 border border-zinc-200 text-zinc-700"
                                  >
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{b}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Extracted Images Preview */}
                      {images.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#BA3807]" />
                              Galerie photos HD ({images.length})
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              Première image = couverture · Cliquez pour agrandir
                            </span>
                          </div>

                          <div className="product-thumbnail-grid grid grid-cols-5 gap-2.5 pt-1 w-full max-w-full">
                            {images.map((img, idx) => (
                              <div
                                key={img.id}
                                onClick={() => setLightboxIndex(idx)}
                                className="product-thumbnail-item group relative aspect-square w-full max-w-[110px] max-h-[110px] rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 shadow-2xs shrink-0 mx-auto cursor-pointer"
                                title="Cliquer pour afficher en plein écran"
                              >
                                <Image
                                  src={img.url}
                                  alt={img.alt}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 640px) 18vw, (max-width: 1024px) 12vw, 110px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                {idx === 0 && (
                                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-semibold text-white tracking-wider uppercase z-10">
                                    Cover
                                  </div>
                                )}
                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity z-20">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxIndex(idx);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                                    title="Plein écran"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(img.id, e);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center hover:scale-110 transition shadow-xs cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <Maximize2 className="w-3 h-3 text-zinc-400" />
                              Cliquez sur n&apos;importe quelle photo pour zoomer en haute
                              résolution ou la choisir comme couverture.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Extracted Product Videos Preview */}
                      {Array.isArray(extractedPreview?.raw_metadata?.videos) &&
                        (extractedPreview.raw_metadata.videos as string[]).length > 0 && (
                          <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-[#BA3807]" />
                                Vidéos extraites du produit (
                                {(extractedPreview.raw_metadata.videos as string[]).length})
                              </span>
                              <button
                                type="button"
                                onClick={() => setVideosExpanded(!videosExpanded)}
                                className="text-[11px] text-[#BA3807] font-medium hover:underline cursor-pointer"
                              >
                                {videosExpanded ? 'Réduire' : 'Afficher lecteur'}
                              </button>
                            </div>

                            {videosExpanded && (
                              <div className="space-y-2.5 rounded-xl border border-zinc-200/80 bg-zinc-900/5 p-3">
                                {selectedVideoUrl && (
                                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                                    <video
                                      src={selectedVideoUrl}
                                      controls
                                      className="w-full h-full object-contain"
                                      poster={images[0]?.url}
                                    />
                                  </div>
                                )}
                                <div className="flex items-center gap-2 overflow-x-auto py-1">
                                  {(extractedPreview.raw_metadata.videos as string[])
                                    .slice(0, 8)
                                    .map((vidUrl, vIdx) => (
                                      <button
                                        key={vIdx}
                                        type="button"
                                        onClick={() => setSelectedVideoUrl(vidUrl)}
                                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                                          selectedVideoUrl === vidUrl
                                            ? 'bg-[#BA3807] text-white border-[#BA3807]'
                                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                                        }`}
                                      >
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        <span>Vidéo {vIdx + 1}</span>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Customer Reviews & Social Proof */}
                      {extractedPreview &&
                        (() => {
                          const reviews = (
                            Array.isArray(extractedPreview.raw_metadata?.customer_reviews)
                              ? extractedPreview.raw_metadata.customer_reviews
                              : []
                          ) as CustomerReviewItem[];
                          const hasReviews = reviews.length > 0;
                          const hasRating = extractedPreview.rating !== null;

                          if (!hasRating && !hasReviews) return null;

                          return (
                            <div className="space-y-2.5 pt-3 border-t border-zinc-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center text-amber-500">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-bold text-zinc-900 ml-1">
                                      {extractedPreview.rating
                                        ? Number(extractedPreview.rating).toFixed(1)
                                        : '4.8'}
                                    </span>
                                  </div>
                                  {extractedPreview.reviews_count && (
                                    <span className="text-[11px] text-zinc-500">
                                      ({extractedPreview.reviews_count.toLocaleString()} avis)
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Avis Acheteurs Vérifiés
                                  </span>
                                </div>
                                {hasReviews && (
                                  <button
                                    type="button"
                                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                                    className="text-[11px] text-[#BA3807] font-medium hover:underline cursor-pointer"
                                  >
                                    {reviewsExpanded
                                      ? 'Masquer les avis'
                                      : `Consulter les avis (${reviews.length})`}
                                  </button>
                                )}
                              </div>

                              {reviewsExpanded && hasReviews && (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {reviews.map((rev, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="p-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 text-xs space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-zinc-800">
                                          {rev.author || 'Acheteur vérifié'}
                                        </span>
                                        <div className="flex items-center text-amber-500 text-[11px]">
                                          {'★'.repeat(
                                            Math.min(5, Math.max(1, Math.round(rev.rating || 5))),
                                          )}
                                        </div>
                                      </div>
                                      {rev.title && (
                                        <p className="font-medium text-zinc-900">{rev.title}</p>
                                      )}
                                      {rev.comment && (
                                        <p className="text-zinc-600 text-[11px] leading-relaxed line-clamp-3">
                                          {rev.comment}
                                        </p>
                                      )}
                                      {rev.date && (
                                        <p className="text-[10px] text-zinc-400">{rev.date}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  )}

                  {/* TAB 3: IMPORT FROM STORE */}
                  {activeTab === 'store' && (
                    <div className="mt-5 space-y-4">
                      <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/70 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800 font-bold">
                          S
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-900">
                          {storeConnected ? "Sarah's Shopify Store" : 'Connect your store'}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          {storeConnected
                            ? 'Your store is connected with 42 active products synced.'
                            : 'Sync products automatically from Shopify or WooCommerce.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStoreConnected(!storeConnected)}
                          className="px-4 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition"
                        >
                          {storeConnected ? 'Disconnect Store' : 'Connect Shopify'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Store Callout */}
                <div className="mt-6 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#95BF47]/20 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0">
                      🛍️
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">
                        Or choose a product from your store
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Connect your store to import products directly.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStoreModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs shrink-0 transition"
                  >
                    Connect store
                  </button>
                </div>
              </div>

              {/* ===================================================== */}
              {/* CARD 2: PRODUCT INFORMATION */}
              {/* ===================================================== */}
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs w-full min-w-0 overflow-hidden">
                {/* Card Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] border border-[#FED7AA]/60 flex items-center justify-center text-[#BA3807] shrink-0">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Product information</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Tell us more about your product so we can create better UGC videos.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="mt-6 space-y-4">
                  {/* Field 1: Product Name */}
                  <div>
                    <label
                      htmlFor="product-name"
                      className="block text-xs font-semibold text-zinc-800"
                    >
                      Product name <span className="text-[#BA3807]">*</span>
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      maxLength={500}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Wireless Noise-Cancelling Headphones"
                      className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                    />
                    <p className="text-[11px] text-zinc-400 text-right mt-1 font-mono">
                      {productName.length}/500
                    </p>
                  </div>

                  {/* Field 2: Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="product-description"
                        className="block text-xs font-semibold text-zinc-800"
                      >
                        Description <span className="text-[#BA3807]">*</span>
                      </label>
                      {extractedPreview?.description && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          Extraite depuis l&apos;URL
                        </span>
                      )}
                    </div>
                    <textarea
                      id="product-description"
                      rows={6}
                      maxLength={5000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe key features, use cases, and benefits..."
                      className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition font-sans"
                    />
                    <p className="text-[11px] text-zinc-400 text-right mt-1 font-mono">
                      {description.length}/5000
                    </p>
                  </div>

                  {/* Field 3: Key Benefits (Separate with commas) */}
                  <div>
                    <label
                      htmlFor="product-benefits"
                      className="block text-xs font-semibold text-zinc-800"
                    >
                      Key benefits (separate with commas) <span className="text-[#BA3807]">*</span>
                    </label>

                    <div className="mt-1.5 rounded-xl border border-zinc-200 bg-white p-2 min-h-[46px] flex flex-wrap items-center gap-1.5 shadow-2xs focus-within:border-[#BA3807] focus-within:ring-1 focus-within:ring-[#BA3807] transition">
                      {/* Chips */}
                      {benefits.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 px-2.5 py-1 text-xs text-zinc-700"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(tag)}
                            className="hover:text-zinc-900 transition"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="w-3 h-3 text-zinc-400 hover:text-zinc-700" />
                          </button>
                        </span>
                      ))}

                      {/* Tag Input */}
                      <input
                        id="product-benefits"
                        type="text"
                        value={newBenefitInput}
                        onChange={(e) => setNewBenefitInput(e.target.value)}
                        onKeyDown={handleBenefitKeyDown}
                        placeholder={benefits.length === 0 ? 'Type benefit and press Enter...' : ''}
                        className="flex-1 min-w-[80px] border-none bg-transparent p-0 text-xs text-zinc-900 focus:outline-none focus:ring-0"
                      />

                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
                    </div>
                  </div>

                  {/* Field 4: Target Audience */}
                  <div>
                    <label
                      htmlFor="target-audience"
                      className="block text-xs font-semibold text-zinc-800"
                    >
                      Target audience <span className="text-[#BA3807]">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        id="target-audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="block w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition pr-10 cursor-pointer"
                      >
                        {TARGET_AUDIENCES.map((audience) => (
                          <option key={audience} value={audience}>
                            {audience}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Field 5: Pricing & Specifications (Compact / Collapsible to preserve card alignment) */}
                  <details className="group rounded-xl border border-zinc-200/90 bg-zinc-50/50 transition-all overflow-hidden">
                    <summary className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-zinc-700 cursor-pointer select-none hover:bg-zinc-100/70 transition">
                      <div className="flex items-center gap-2">
                        <span>Pricing & Specifications</span>
                        {price && (
                          <span className="text-[11px] font-medium text-[#BA3807] bg-[#FFF5ED] border border-[#FED7AA] rounded-md px-2 py-0.5">
                            {currency} {price}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="p-3.5 pt-2 space-y-3 border-t border-zinc-200/60 bg-white">
                      {/* Price & Currency */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="product-price"
                            className="block text-[11px] font-semibold text-zinc-700"
                          >
                            Price
                          </label>
                          <input
                            id="product-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="29.99"
                            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="product-currency"
                            className="block text-[11px] font-semibold text-zinc-700"
                          >
                            Currency
                          </label>
                          <div className="relative mt-1">
                            <select
                              id="product-currency"
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className="block w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition pr-8 cursor-pointer"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="XOF">XOF (FCFA)</option>
                              <option value="XAF">XAF (FCFA)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="CAD">CAD ($)</option>
                              <option value="AUD">AUD ($)</option>
                              <option value="JPY">JPY (¥)</option>
                              <option value="CNY">CNY (¥)</option>
                              <option value="CHF">CHF</option>
                              {![
                                'USD',
                                'EUR',
                                'XOF',
                                'XAF',
                                'GBP',
                                'CAD',
                                'AUD',
                                'JPY',
                                'CNY',
                                'CHF',
                              ].includes(currency) && <option value={currency}>{currency}</option>}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                          </div>
                        </div>
                      </div>

                      {/* Brand & Category */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="product-brand"
                            className="block text-[11px] font-semibold text-zinc-700"
                          >
                            Brand <span className="text-zinc-400 font-normal">(opt)</span>
                          </label>
                          <input
                            id="product-brand"
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="e.g. Sony, Nike"
                            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="product-category"
                            className="block text-[11px] font-semibold text-zinc-700"
                          >
                            Category <span className="text-zinc-400 font-normal">(opt)</span>
                          </label>
                          <input
                            id="product-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Electronics, Home"
                            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* AI Suggestion Box */}
                  <div className="rounded-2xl bg-[#FFF8EE] border border-[#FED7AA] p-4.5 space-y-2 mt-5">
                    <div className="flex items-center gap-1.5 text-[#BA3807]">
                      <Sparkles className="w-3.5 h-3.5 fill-[#BA3807]" />
                      <span className="text-xs font-bold text-zinc-900">AI Suggestion</span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Add specific selling points like &ldquo;All-day battery life&rdquo; or
                      &ldquo;Premium noise cancellation&rdquo; to get better video results.
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyAiSuggestion}
                      className="px-3.5 py-1.5 rounded-full border border-[#F97316] text-[#BA3807] bg-white text-xs font-semibold hover:bg-orange-50 shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer mt-1"
                    >
                      {aiApplied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Applied! ✓</span>
                        </>
                      ) : (
                        <span>Use suggestion</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* ========================================================= */}
        {/* 3. DOCKED BOTTOM FOOTER BAR */}
        {/* ========================================================= */}
        <footer className="sticky bottom-0 z-30 bg-white border-t border-zinc-200/80 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left info badge */}
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Product information will be used to generate personalized UGC videos.</span>
          </div>

          {/* Right Navigation buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </footer>

        {/* ========================================================= */}
        {/* TOAST NOTIFICATION */}
        {/* ========================================================= */}
        {successToast && (
          <div className="fixed bottom-16 right-8 z-50 rounded-2xl bg-zinc-900 text-white px-4 py-3 shadow-2xl flex items-center gap-3 text-xs border border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-16 right-8 z-50 rounded-2xl bg-red-950 text-white px-4 py-3 shadow-2xl flex items-center gap-3 text-xs border border-red-800 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: STORE CONNECT */}
        {/* ========================================================= */}
        {storeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900">Connect E-commerce Store</h3>
                <button
                  type="button"
                  onClick={() => setStoreModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-3">
                <p className="text-xs text-zinc-600">
                  Select your e-commerce platform to automatically synchronize products and photos.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStoreConnected(true);
                      setStoreModalOpen(false);
                      setSuccessToast('Shopify store connected successfully!');
                    }}
                    className="w-full p-3 rounded-xl border border-zinc-200 hover:border-orange-500 hover:bg-orange-50/20 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🛍️</span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">Shopify</p>
                        <p className="text-[11px] text-zinc-500">Fast 1-click catalog import</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#BA3807]">Connect →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStoreConnected(true);
                      setStoreModalOpen(false);
                      setSuccessToast('WooCommerce store connected successfully!');
                    }}
                    className="w-full p-3 rounded-xl border border-zinc-200 hover:border-orange-500 hover:bg-orange-50/20 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📦</span>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">WooCommerce</p>
                        <p className="text-[11px] text-zinc-500">Direct API integration</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#BA3807]">Connect →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: GUIDE */}
        {/* ========================================================= */}
        {guideOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#BA3807]" />
                  <h3 className="text-base font-bold text-zinc-900">
                    Product Input Best Practices
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-3.5 text-xs text-zinc-600 leading-relaxed">
                <div>
                  <h5 className="font-semibold text-zinc-900">
                    1. High-resolution lifestyle photos
                  </h5>
                  <p className="text-zinc-500 mt-0.5">
                    Upload images showing your product in action, held by a person, or in its ideal
                    environment.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-zinc-900">2. Emotional & concrete benefits</h5>
                  <p className="text-zinc-500 mt-0.5">
                    Instead of just technical specs, add benefit tags like &ldquo;All-day
                    comfort&rdquo; and &ldquo;Saves 2 hours daily&rdquo;.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-zinc-900">3. Specific target audience</h5>
                  <p className="text-zinc-500 mt-0.5">
                    The AI generator tailors the hook and creator tone specifically to your selected
                    audience profile.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuideOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#BA3807] text-white text-xs font-semibold hover:bg-[#9A2D04] transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ========================================================= */}
        {/* MODAL: FULLSCREEN IMAGE LIGHTBOX */}
        {/* ========================================================= */}
        {lightboxIndex !== null && images[lightboxIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div
              className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
                  Image {lightboxIndex + 1} of {images.length}
                </span>
                {lightboxIndex === 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#BA3807] text-white text-xs font-bold uppercase tracking-wider">
                    Primary Cover
                  </span>
                )}
                <span className="text-zinc-300 text-xs hidden md:inline truncate max-w-md">
                  {productName || images[lightboxIndex].alt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {lightboxIndex !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCoverImage(lightboxIndex)}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                    title="Set as product cover image"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Set as Cover</span>
                  </button>
                )}
                <a
                  href={images[lightboxIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Center Image View */}
            <div
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden w-full max-w-7xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null ? null : (prev - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition hover:scale-110 shadow-lg cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* High-res Image container */}
              <div className="relative w-full h-full max-h-[72vh] flex items-center justify-center p-2">
                <Image
                  src={images[lightboxIndex].url}
                  alt={images[lightboxIndex].alt || 'Product Image'}
                  fill
                  unoptimized
                  priority
                  className="object-contain"
                  sizes="90vw"
                />
              </div>

              {/* Next button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
                  }
                  className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition hover:scale-110 shadow-lg cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Carousel / Thumbnails Strip */}
            <div className="z-10 w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative aspect-square w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        idx === lightboxIndex
                          ? 'border-[#BA3807] scale-105 shadow-md ring-2 ring-[#BA3807]/50'
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
