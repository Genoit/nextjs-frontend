'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { CreativeAdWorkflow } from '../../../../components/creative/CreativeAdWorkflow';

export default function ProductCreativePage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ProtectedRoute>
      {/* Studio frame: centred title, step chips, work area; the video history rail sits on the right (md+). */}
      <main className="relative w-full flex-1 px-4 py-8 md:pr-28 md:pl-6">
        <Link
          href={`/products/${productId}`}
          aria-label="Back to the product"
          className="absolute top-8 left-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-trend-orange md:left-6"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="mb-8 flex flex-col items-center px-12 text-center">
          <h1 className="text-3xl font-black tracking-widest text-white uppercase md:text-5xl">
            Ad studio
          </h1>
          <p className="mt-3 text-sm font-medium text-ink-muted">
            Product sheet, strategy, storyboard, visuals, then each shot generated and checked.
          </p>
        </div>
        <div className="mx-auto w-full max-w-7xl">
          <CreativeAdWorkflow productId={productId} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
