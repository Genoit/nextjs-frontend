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

  // Do not render navbar on auth pages or workspace pages (Figma spec has integrated workspace layout with header and sidebar)
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/onboarding' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/dashboard/') ||
    pathname === '/product-input' ||
    pathname?.startsWith('/product-input/')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md transition-all">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="hover:opacity-95 transition">
          <TrendedBrandLogo />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[20px] lg:text-[18px] font-medium text-ink-soft">
          {/* Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('product')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-ink transition py-2"
            >
              <span>Product</span>
              <svg
                className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ${
                  activeDropdown === 'product' ? 'rotate-180 text-ink' : ''
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
              <div className="absolute top-full -left-4 w-72 rounded-2xl bg-white p-3 shadow-xl border border-line z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#ugc-generator"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-cream/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-cream/80 text-trend-orange flex items-center justify-center shrink-0">
                    <SparkleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">AI UGC Generator</p>
                    <p className="text-xs text-ink-muted">Create videos without booking creators</p>
                  </div>
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-cream/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-cream/80 text-trend-orange flex items-center justify-center shrink-0">
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
                    <p className="text-sm font-semibold text-ink">How It Works</p>
                    <p className="text-xs text-ink-muted">3 simple steps: product to UGC</p>
                  </div>
                </Link>
                <Link
                  href="#product-to-video"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-cream/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-cream/80 text-trend-orange flex items-center justify-center shrink-0">
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
                    <p className="text-sm font-semibold text-ink">Product → Video</p>
                    <p className="text-xs text-ink-muted">1 product into infinite viral concepts</p>
                  </div>
                </Link>
                <Link
                  href="#creative-library"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-cream/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-cream/80 text-trend-orange flex items-center justify-center shrink-0">
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
                    <p className="text-sm font-semibold text-ink">Creative Library</p>
                    <p className="text-xs text-ink-muted">Manage, preview & analyze winning ads</p>
                  </div>
                </Link>
                <Link
                  href="#ai-intelligence"
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-cream/50 transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="h-8 w-8 rounded-lg bg-cream/80 text-trend-orange flex items-center justify-center shrink-0">
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
                    <p className="text-sm font-semibold text-ink">AI Intelligence</p>
                    <p className="text-xs text-ink-muted">Hook score & retention optimization</p>
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
              className="flex items-center gap-1.5 hover:text-ink transition py-2"
            >
              <span>Solutions</span>
              <svg
                className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ${
                  activeDropdown === 'solutions' ? 'rotate-180 text-ink' : ''
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
              <div className="absolute top-full -left-4 w-64 rounded-2xl bg-white p-3 shadow-xl border border-line z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-studio-surface transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-ink">Dropshipping Acceleration</p>
                  <p className="text-xs text-ink-muted">Test 10x faster with AI validation</p>
                </Link>
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-studio-surface transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-ink">E-commerce Brands</p>
                  <p className="text-xs text-ink-muted">Scale ROAS and reduce creative costs</p>
                </Link>
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-studio-surface transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-ink">TikTok & Meta Growth</p>
                  <p className="text-xs text-ink-muted">Organic & paid scroll-stopping creatives</p>
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
              className="flex items-center gap-1.5 hover:text-ink transition py-2"
            >
              <span>Resources</span>
              <svg
                className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ${
                  activeDropdown === 'resources' ? 'rotate-180 text-ink' : ''
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
              <div className="absolute top-full -left-4 w-60 rounded-2xl bg-white p-3 shadow-xl border border-line z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="#workflow"
                  className="block rounded-xl p-2.5 hover:bg-studio-surface transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-ink">Workflow Guide</p>
                  <p className="text-xs text-ink-muted">How to scale in 6 proven steps</p>
                </Link>
                <Link
                  href="#pricing"
                  className="block rounded-xl p-2.5 hover:bg-studio-surface transition"
                  onClick={() => setActiveDropdown(null)}
                >
                  <p className="text-sm font-semibold text-ink">Free Trial FAQ</p>
                  <p className="text-xs text-ink-muted">Details on 7-day risk-free plan</p>
                </Link>
              </div>
            )}
          </div>

          {/* Pricing Link */}
          <Link href="#pricing" className="hover:text-ink transition py-2">
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-5">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-studio-raised" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-[17px] font-semibold text-ink hover:text-ink transition"
              >
                Dashboard
              </Link>
              <span className="text-[11px] bg-cream text-trend-orange border border-trend-orange/20 font-medium px-2.5 py-1 rounded-full">
                {user?.first_name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-studio-surface transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-[17px] font-medium text-ink-soft hover:text-ink transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-trend-orange px-5 py-2.5 text-[17px] font-semibold text-white shadow-sm hover:bg-trend-orange-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange transition"
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
            className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-studio-raised focus:outline-none"
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
        <div className="md:hidden border-t border-line bg-white px-4 py-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3 font-medium text-ink-soft">
            <Link
              href="#ugc-generator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-studio-surface"
            >
              AI UGC Generator
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-studio-surface"
            >
              How It Works
            </Link>
            <Link
              href="#product-to-video"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-studio-surface"
            >
              Product to Video
            </Link>
            <Link
              href="#creative-library"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-studio-surface"
            >
              Creative Library
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-studio-surface"
            >
              Pricing
            </Link>
          </nav>

          <div className="pt-4 border-t border-line flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-trend-orange px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Go to Dashboard ({user?.first_name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-trend-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
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
