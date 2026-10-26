'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '../../lib/api/product';
import { ProductCreatePayload, ProductPreview } from '../../lib/types/product';
import { isValidEcommerceUrl } from '../../lib/validation/product';
import {
  bulletsToBenefits,
  imageFileError,
  LIMITS,
  previewImageUrls,
  validateDraft,
} from '../../lib/product-input-rules.mjs';
import { ImportedField, ImportMode, ProductImageItem } from './types';

type Status<E = string> =
  { state: 'idle' } | { state: 'busy' } | { state: 'done' } | { state: 'error'; error: E };

export type TextField = 'title' | 'description' | 'price' | 'currency' | 'brand' | 'category';

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useProductDraft() {
  const [mode, setMode] = useState<ImportMode>('upload');
  const [fields, setFields] = useState<Record<TextField, string>>({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    brand: '',
    category: '',
  });
  const [benefits, setBenefits] = useState<string[]>([]);
  const [audience, setAudience] = useState('');
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [imported, setImported] = useState<Set<ImportedField>>(new Set());
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [extract, setExtract] = useState<Status>({ state: 'idle' });
  const [preview, setPreview] = useState<ProductPreview | null>(null);
  const [save, setSave] = useState<Status>({ state: 'idle' });

  // Object URLs of uploads still in flight; revoked on unmount so nothing leaks.
  const pendingPreviews = useRef(new Set<string>());
  useEffect(() => {
    const set = pendingPreviews.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const unmark = (f: ImportedField) =>
    setImported((prev) => {
      if (!prev.has(f)) return prev;
      const next = new Set(prev);
      next.delete(f);
      return next;
    });

  const setField = (name: TextField, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    unmark(name);
  };

  const touch = (name: string) =>
    setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));

  const changeBenefits = (next: string[]) => {
    setBenefits(next.slice(0, LIMITS.benefits));
    unmark('benefits');
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const errors: string[] = [];
    Array.from(files).forEach((file, idx) => {
      const err = imageFileError(file);
      if (err) {
        errors.push(err);
        return;
      }
      const id = `up-${Date.now()}-${idx}`;
      const previewUrl = URL.createObjectURL(file);
      pendingPreviews.current.add(previewUrl);
      setImages((prev) => [
        ...prev,
        { id, url: previewUrl, alt: file.name, origin: 'upload', uploading: true },
      ]);
      productApi
        .uploadImage(file)
        .then(({ url: stored }) => {
          setImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, url: stored, uploading: false } : img)),
          );
        })
        .catch((e: unknown) => {
          setImages((prev) => prev.filter((img) => img.id !== id));
          setUploadErrors((prev) => [
            ...prev,
            messageOf(e, `${file.name} : échec du téléversement.`),
          ]);
        })
        .finally(() => {
          URL.revokeObjectURL(previewUrl);
          pendingPreviews.current.delete(previewUrl);
        });
    });
    setUploadErrors(errors);
  }, []);

  const removeImage = (id: string) => setImages((prev) => prev.filter((img) => img.id !== id));

  const makeCover = (index: number) =>
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });

  const runExtract = async () => {
    const target = url.trim();
    if (!isValidEcommerceUrl(target)) {
      setUrlError('Collez un lien complet qui commence par https://');
      return;
    }
    setUrlError(null);
    setExtract({ state: 'busy' });
    try {
      const p = await productApi.extractFromUrl(target);
      setPreview(p);
      const next: Partial<Record<TextField, string>> = {
        title: p.title || undefined,
        description: p.description || undefined,
        price: p.price !== null && p.price !== undefined ? String(p.price) : undefined,
        currency: p.currency ? p.currency.toUpperCase() : undefined,
        brand: p.brand || undefined,
        category: p.category || undefined,
      };
      const marks = new Set<ImportedField>();
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined) delete next[k as TextField];
        else marks.add(k as ImportedField);
      }
      setFields((prev) => ({ ...prev, ...next }));

      const chips = bulletsToBenefits(p.raw_metadata?.bullet_points);
      if (chips.length) {
        setBenefits((prev) =>
          [...prev, ...chips.filter((c) => !prev.includes(c))].slice(0, LIMITS.benefits),
        );
        marks.add('benefits');
      }
      setImported(marks);

      // A new import replaces the previous import's photos; the merchant's uploads stay.
      const urls = previewImageUrls(p);
      setImages((prev) => [
        ...prev.filter((img) => img.origin === 'upload'),
        ...urls.map((u, i) => ({
          id: `imp-${Date.now()}-${i}`,
          url: u,
          alt: p.title || 'Photo du produit',
          origin: 'import' as const,
        })),
      ]);
      setExtract({ state: 'done' });
    } catch (e: unknown) {
      setExtract({ state: 'error', error: messageOf(e, 'Impossible de lire cette page produit.') });
    }
  };

  const check = validateDraft({
    title: fields.title,
    description: fields.description,
    price: fields.price,
    imageCount: images.filter((i) => !i.uploading).length,
    uploadingCount: images.filter((i) => i.uploading).length,
    benefitCount: benefits.length,
    audience,
  });

  /** Visible error for a field: after blur or after a submit attempt. */
  const errorFor = (name: 'title' | 'description' | 'price') =>
    touched.has(name) || submitAttempted ? check.errors[name] : undefined;

  /** Creates the product; returns its id, or null when blocked or failed. */
  const submit = async (): Promise<string | null> => {
    setSubmitAttempted(true);
    if (check.blocking.length > 0 || save.state === 'busy') return null;
    setSave({ state: 'busy' });
    const title = fields.title.trim();
    const priceNum =
      fields.price.trim() === '' ? null : Math.round(Number(fields.price) * 100) / 100;
    const sourceUrl = preview?.source_url || (mode === 'url' && url.trim() ? url.trim() : null);
    const method = preview?.extraction_method || 'manual';
    const payload: ProductCreatePayload = {
      title,
      description: fields.description.trim() || null,
      brand: fields.brand.trim() || null,
      category: fields.category.trim() || null,
      source_url: sourceUrl,
      canonical_url: preview?.canonical_url || null,
      source_platform: preview?.source_platform || 'manual',
      external_id: preview?.external_id || null,
      price: priceNum,
      compare_at_price: preview?.compare_at_price ?? null,
      currency: fields.currency || null,
      availability: preview?.availability || 'unknown',
      main_image_url: images[0]?.url ?? null,
      seller_name: preview?.seller_name || null,
      seller_url: preview?.seller_url || null,
      rating: preview?.rating ?? null,
      reviews_count: preview?.reviews_count ?? null,
      extraction_status: 'completed',
      extraction_method: method,
      images: images.map((img, idx) => ({
        url: img.url,
        alt_text: img.alt || title,
        position: idx,
        is_primary: idx === 0,
      })),
      raw_metadata: {
        ...(preview?.raw_metadata || {}),
        benefits,
        target_audience: audience || null,
      },
    };
    try {
      const created = await productApi.createProduct(payload);
      setSave({ state: 'done' });
      return created.id;
    } catch (e: unknown) {
      setSave({ state: 'error', error: messageOf(e, "L'enregistrement a échoué. Réessayez.") });
      return null;
    }
  };

  return {
    mode,
    setMode,
    fields,
    setField,
    touch,
    benefits,
    changeBenefits,
    audience,
    setAudience,
    images,
    addFiles,
    removeImage,
    makeCover,
    uploadErrors,
    imported,
    url,
    setUrl: (v: string) => {
      setUrl(v);
      setUrlError(null);
    },
    urlError,
    extract,
    runExtract,
    preview,
    check,
    errorFor,
    submitAttempted,
    save,
    submit,
  };
}

export type ProductDraft = ReturnType<typeof useProductDraft>;
