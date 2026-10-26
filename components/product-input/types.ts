export type ImportMode = 'upload' | 'url' | 'manual';

export interface ProductImageItem {
  id: string;
  url: string;
  alt: string;
  origin: 'upload' | 'import';
  uploading?: boolean;
}

/** Form fields that URL extraction can prefill; they stay marked until the merchant edits them. */
export type ImportedField =
  'title' | 'description' | 'price' | 'currency' | 'brand' | 'category' | 'benefits';

export interface CustomerReviewItem {
  author?: string;
  rating?: number;
  title?: string;
  comment?: string;
  date?: string;
}

export const AUDIENCES = [
  'Jeunes actifs',
  'Sportifs et adeptes de la salle',
  'Parents occupés',
  'Étudiants',
  'Voyageurs et nomades digitaux',
  'Passionnés de bien-être',
];

export const CURRENCIES: { code: string; label: string }[] = [
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'XOF', label: 'XOF (FCFA)' },
  { code: 'XAF', label: 'XAF (FCFA)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'CAD', label: 'CAD ($)' },
  { code: 'CHF', label: 'CHF' },
  { code: 'AUD', label: 'AUD ($)' },
  { code: 'JPY', label: 'JPY (¥)' },
  { code: 'CNY', label: 'CNY (¥)' },
];
