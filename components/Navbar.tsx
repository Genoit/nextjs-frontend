'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { SparkleIcon, TrendedBrandLogo } from './Icons';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Do not render navbar on auth pages (Figma spec has full-screen layout with integrated logo)
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur-md transition-all">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="hover:opacity-95 transition">
          <TrendedBrandLogo />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[20px] lg:text-[18px] font-medium text-zinc-700">
          {/* Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('product')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-zinc-900 transition py-2"
            >
              <span>Product</span>
              <svg
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  activeDropdown === 'product' ? 'rotate-180 text-zinc-800' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'product' && (
              <div className="absolute top-full -left-4 w-72 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#ugc-generator"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-orange-50/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-100/80 text-[#C2410C] flex items-center justify-center shrink-0">
                    <SparkleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">AI UGC Generator</p>
                    <p className="text-xs text-zinc-500">Create videos without booking creators</p>
                  </div>
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-orange-50/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-100/80 text-[#C2410C] flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">How It Works</p>
                    <p className="text-xs text-zinc-500">3 simple steps: product to UGC</p>
                  </div>
                </Link>
                <Link
                  href="#product-to-video"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-orange-50/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-100/80 text-[#C2410C] flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Product → Video</p>
                    <p className="text-xs text-zinc-500">1 product into infinite viral concepts</p>
                  </div>
                </Link>
                <Link
                  href="#creative-library"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-orange-50/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-100/80 text-[#C2410C] flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Creative Library</p>
                    <p className="text-xs text-zinc-500">Manage, preview & analyze winning ads</p>
                  </div>
                </Link>
                <Link
                  href="#ai-intelligence"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-orange-50/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-100/80 text-[#C2410C] flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">AI Intelligence</p>
                    <p className="text-xs text-zinc-500">Hook score & retention optimization</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('solutions')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-zinc-900 transition py-2"
            >
              <span>Solutions</span>
              <svg
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  activeDropdown === 'solutions' ? 'rotate-180 text-zinc-800' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'solutions' && (
              <div className="absolute top-full -left-4 w-64 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-zinc-50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-zinc-900">Dropshipping Acceleration</p>
                  <p className="text-xs text-zinc-500">Test 10x faster with AI validation</p>
                </Link>
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-zinc-50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-zinc-900">E-commerce Brands</p>
                  <p className="text-xs text-zinc-500">Scale ROAS and reduce creative costs</p>
                </Link>
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-zinc-50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-zinc-900">TikTok & Meta Growth</p>
                  <p className="text-xs text-zinc-500">Organic & paid scroll-stopping creatives</p>
                </Link>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('resources')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-zinc-900 transition py-2"
            >
              <span>Resources</span>
              <svg
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  activeDropdown === 'resources' ? 'rotate-180 text-zinc-800' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'resources' && (
              <div className="absolute top-full -left-4 w-60 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-zinc-50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-zinc-900">Workflow Guide</p>
                  <p className="text-xs text-zinc-500">How to scale in 6 proven steps</p>
                </Link>
                <Link
                  href="#pricing"
                  className="block rounded-xl p-2.5 hover:bg-zinc-50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-zinc-900">Free Trial FAQ</p>
                  <p className="text-xs text-zinc-500">Details on 7-day risk-free plan</p>
                </Link>
              </div>
            )}
          </div>

          {/* Pricing Link */}
          <Link href="#pricing" className="hover:text-zinc-900 transition py-2">
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-5">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-[17px] font-semibold text-zinc-800 hover:text-zinc-900 transition"
              >
                Dashboard
              </Link>
              <span className="text-[11px] bg-orange-50 text-[#E0492A] border border-orange-200/60 font-medium px-2.5 py-1 rounded-full">
                {user?.first_name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-[17px] font-medium text-zinc-700 hover:text-zinc-900 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#C2410C] px-5 py-2.5 text-[17px] font-semibold text-white shadow-sm hover:bg-[#9A3412] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] transition"
              >
                Start creating
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3 font-medium text-zinc-700">
            <Link
              href="#ugc-generator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              AI UGC Generator
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              How It Works
            </Link>
            <Link
              href="#product-to-video"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Product to Video
            </Link>
            <Link
              href="#creative-library"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Creative Library
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Pricing
            </Link>
          </nav>

          <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Go to Dashboard ({user?.first_name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  Start creating
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
