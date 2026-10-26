import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { ProductImageItem } from './types';

export function ImageGallery({
  images,
  onOpen,
  onRemove,
  onAdd,
}: {
  images: ProductImageItem[];
  onOpen: (index: number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <section aria-labelledby="gallery-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 id="gallery-title" className="text-base font-semibold text-ink">
          Photos <span className="font-normal tabular-nums text-ink-muted">({images.length})</span>
        </h3>
        {images.length > 1 && (
          <p className="text-sm text-ink-muted">
            La première sert de couverture. Agrandissez une photo pour la changer.
          </p>
        )}
      </div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <li
            key={img.id}
            className="animate-rise relative aspect-square motion-reduce:animate-none"
          >
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Agrandir la photo ${i + 1}${i === 0 ? ' (couverture)' : ''}`}
              className="group relative block size-full overflow-hidden rounded-lg bg-cream outline-offset-2 focus-visible:outline-2 focus-visible:outline-trend-orange"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 30vw, 140px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  Couverture
                </span>
              )}
            </button>
            {img.uploading ? (
              <span
                role="status"
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70"
              >
                <span className="size-5 animate-spin rounded-full border-2 border-trend-orange border-t-transparent motion-reduce:animate-none" />
                <span className="sr-only">Envoi de {img.alt}…</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-0 top-0 flex size-11 items-start justify-end p-1.5 focus-visible:outline-none [&:focus-visible>span]:outline-2 [&:focus-visible>span]:outline-trend-orange"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-ink hover:bg-danger hover:text-white">
                  <X className="size-4" aria-hidden />
                </span>
              </button>
            )}
          </li>
        ))}
        <li className="aspect-square">
          <button
            type="button"
            onClick={onAdd}
            className="flex size-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-sm text-ink-muted hover:border-trend-orange hover:text-trend-orange focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <Plus className="size-5" aria-hidden />
            Ajouter
          </button>
        </li>
      </ul>
    </section>
  );
}
