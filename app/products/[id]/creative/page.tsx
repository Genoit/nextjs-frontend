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
          className="studio-chip absolute top-7 left-4 !size-9 justify-center !p-0 md:left-6"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="mb-6 flex flex-col items-center px-12 text-center">
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-studio-text">Ad studio</h1>
          <p className="mt-[9px] max-w-[52ch] text-[13px] text-studio-meta">
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
