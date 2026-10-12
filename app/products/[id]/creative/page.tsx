'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Video } from 'lucide-react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { CreativeAdWorkflow } from '../../../../components/creative/CreativeAdWorkflow';

export default function ProductCreativePage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 flex flex-col font-sans">
        {/* Header */}
        <header className="sticky top-0 z-40 h-[70px] bg-white border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-4">
            <Link
              href={`/products/${productId}`}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-[#BA3807]" />
                <span>Générateur de Publicités Vidéo UGC</span>
              </h1>
              <p className="text-xs text-zinc-500">
                Pipeline complet de création publicitaire assistée par IA & Montage FFmpeg
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
          <CreativeAdWorkflow productId={productId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
