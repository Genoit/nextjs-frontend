'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileEdit,
  ImageIcon,
  Link2,
  Plus,
  Sparkles,
  Store,
  Tag,
  X,
  Check,
  LogOut,
  RefreshCw,
  AlertCircle,
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

const INITIAL_IMAGES: ProductImageItem[] = [
  {
    id: '1',
    url: '/product-input/blender-1.png',
    alt: 'Portable Blender with green smoothie',
    badge: 'none',
  },
  {
    id: '2',
    url: '/product-input/blender-2.png',
    alt: 'Portable Blender with fruits',
    badge: 'none',
  },
  {
    id: '3',
    url: '/product-input/blender-3.png',
    alt: 'Portable Blender handheld',
    badge: 'none',
  },
  {
    id: '4',
    url: '/product-input/blender-4.png',
    alt: 'Portable Blender with red smoothie',
    badge: 'none',
  },
];

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

  // Form states
  const [productName, setProductName] = useState('Portable Blender');
  const [description, setDescription] = useState(
    'Portable USB rechargeable blender for smoothies and everyday use.\nPerfect for travel, gym, office and home.',
  );
  const [benefits, setBenefits] = useState<string[]>([
    'Portable',
    'USB rechargeable',
    'Easy to clean',
    'BPA free',
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('Young professionals');

  // Images state
  const [images, setImages] = useState<ProductImageItem[]>(INITIAL_IMAGES);
  const [isDragging, setIsDragging] = useState(false);

  // URL Import tab state
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [urlSuccess, setUrlSuccess] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<ProductPreview | null>(null);

  // Price, Currency, Category, Brand states
  const [price, setPrice] = useState('29.99');
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
    const suggestionsToAdd = ['Great for smoothies', 'Perfect for travel'];
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

      // Populate extracted images if available
      if (preview.images && preview.images.length > 0) {
        const newImages: ProductImageItem[] = preview.images.map((imgUrl, idx) => ({
          id: `ext-${Date.now()}-${idx}`,
          url: imgUrl,
          alt: preview.title || 'Product Image',
          badge: idx === 0 ? 'sparkle' : 'none',
        }));
        setImages(newImages);
      }

      setSuccessToast(`Extracted: ${preview.title.slice(0, 35)}...`);
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
        <div className="flex-1 flex flex-col md:flex-row">
          {/* ------------------------------------------------------- */}
          {/* LEFT SIDEBAR (STEPPER & HELP) */}
          {/* ------------------------------------------------------- */}
          <aside className="w-full md:w-64 lg:w-72 bg-white/70 backdrop-blur-xs border-r border-zinc-200/80 p-5 sm:p-6 flex flex-col justify-between shrink-0">
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
          <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* ===================================================== */}
              {/* CARD 1: IMPORT PRODUCT */}
              {/* ===================================================== */}
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
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
                      <div className="grid grid-cols-5 gap-2.5 pt-1">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 shadow-2xs"
                          >
                            <Image
                              src={img.url}
                              alt={img.alt}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {/* Action badge on top right */}
                            {img.badge === 'sparkle' && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#BA3807] shadow-xs">
                                <Sparkles className="w-3 h-3 fill-[#BA3807]" />
                              </div>
                            )}
                            {img.badge === 'motion' && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-zinc-600 shadow-xs text-[9px] font-bold">
                                🏃
                              </div>
                            )}

                            {/* Remove button on hover */}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(img.id, e)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* 5th button: Add more images */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 flex flex-col items-center justify-center p-2 text-center transition group cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-800 transition" />
                          <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-800 mt-1 leading-tight">
                            Add more images
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRODUCT URL */}
                  {activeTab === 'url' && (
                    <div className="mt-5 space-y-4">
                      <form onSubmit={handleExtractFromUrl} className="space-y-3">
                        <label className="block text-xs font-semibold text-zinc-800">
                          Paste E-commerce Product URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://amazon.com/... or https://yourstore.com/products/..."
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
                                <span>Extracting...</span>
                              </>
                            ) : (
                              <span>Extract details</span>
                            )}
                          </button>
                        </div>
                      </form>

                      {urlError && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-800">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">Extraction failed</p>
                            <p className="mt-0.5 text-red-700">{urlError}</p>
                          </div>
                        </div>
                      )}

                      {urlSuccess && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-xs text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Product data extracted successfully! Details populated in the form.
                          </span>
                        </div>
                      )}

                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-500 space-y-1">
                        <p className="font-medium text-zinc-700">Supported Platforms:</p>
                        <p>• Shopify, Amazon, AliExpress, WooCommerce, Etsy, Walmart</p>
                      </div>
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
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs">
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
                      maxLength={100}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Portable Blender"
                      className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                    />
                    <p className="text-[11px] text-zinc-400 text-right mt-1 font-mono">
                      {productName.length}/100
                    </p>
                  </div>

                  {/* Field 2: Description */}
                  <div>
                    <label
                      htmlFor="product-description"
                      className="block text-xs font-semibold text-zinc-800"
                    >
                      Description <span className="text-[#BA3807]">*</span>
                    </label>
                    <textarea
                      id="product-description"
                      rows={3}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe key features, use cases, and benefits..."
                      className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                    />
                    <p className="text-[11px] text-zinc-400 text-right mt-1 font-mono">
                      {description.length}/500
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
                              <option value="GBP">GBP (£)</option>
                              <option value="CAD">CAD ($)</option>
                              <option value="AUD">AUD ($)</option>
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
                            placeholder="e.g. BlendJet"
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
                            placeholder="e.g. Kitchen"
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
                      Add more specific benefits like &ldquo;great for smoothies&rdquo; or
                      &ldquo;perfect for travel&rdquo; to get better video results.
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
                    Instead of just specs (&ldquo;300W motor&rdquo;), add benefit tags like
                    &ldquo;smoothies in 20s&rdquo; and &ldquo;fits in gym bag&rdquo;.
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
      </div>
    </ProtectedRoute>
  );
}
