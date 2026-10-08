'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Search,
  Tag,
  Wand2,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  PlusCircle,
  Compass,
  Menu,
  X,
  Store,
  Info,
  Target,
  ImageIcon,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 flex font-sans antialiased">
        {/* ========================================================= */}
        {/* MOBILE SIDEBAR DRAWER */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/dashboard/trended-logo.png"
                      alt="TrendED"
                      width={140}
                      height={48}
                      unoptimized
                      priority
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* REDIRECT BUTTON TO PRODUCT INPUT */}
                <Link
                  href="/product-input"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Product Input</span>
                </Link>

                <nav className="space-y-1 text-sm font-medium">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#FFF5ED] text-[#BA3807] font-semibold"
                  >
                    <Home className="w-4 h-4 text-[#BA3807] fill-[#BA3807]" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="#discovery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <Search className="w-4 h-4 text-zinc-500" />
                    <span>Product Discovery</span>
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <Tag className="w-4 h-4 text-zinc-500" />
                    <span>My Products</span>
                  </Link>
                  <Link
                    href="#studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <Wand2 className="w-4 h-4 text-zinc-500" />
                    <span>Creative Studio</span>
                  </Link>
                  <Link
                    href="#creatives"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <span>My Creatives</span>
                  </Link>
                  <Link
                    href="#analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <BarChart3 className="w-4 h-4 text-zinc-500" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="#settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-50"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* ========================================================= */}
        {/* DESKTOP SIDEBAR (EXACT FIGMA SPECIFICATION) */}
        {/* ========================================================= */}
        <aside className="hidden md:flex w-56 lg:w-60 bg-white border-r border-zinc-200/70 p-5 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-30">
          <div className="space-y-6">
            {/* TrendED Logo */}
            <Link href="/dashboard" className="block px-1 pt-1">
              <Image
                src="/dashboard/trended-logo.png"
                alt="TrendED"
                width={155}
                height={55}
                unoptimized
                priority
                className="object-contain"
              />
            </Link>

            {/* Sidebar Navigation */}
            <nav className="space-y-1.5 text-sm font-medium">
              {/* Dashboard Item (Active Pill) */}
              <Link
                href="/dashboard"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl bg-[#FFF5ED] text-[#BA3807] font-semibold transition"
              >
                <Home className="w-4 h-4 text-[#BA3807] fill-[#BA3807]" />
                <span className="text-zinc-900 font-semibold">Dashboard</span>
              </Link>

              {/* Product Discovery */}
              <Link
                href="#discovery"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <Search className="w-4 h-4 text-zinc-500" />
                <span>Product Discovery</span>
              </Link>

              {/* My Products */}
              <Link
                href="/products"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <Tag className="w-4 h-4 text-zinc-500" />
                <span>My Products</span>
              </Link>

              {/* Creative Studio */}
              <Link
                href="#studio"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <Wand2 className="w-4 h-4 text-zinc-500" />
                <span>Creative Studio</span>
              </Link>

              {/* My Creatives */}
              <Link
                href="#creatives"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                <span>My Creatives</span>
              </Link>

              {/* Analytics */}
              <Link
                href="#analytics"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                <span>Analytics</span>
              </Link>

              {/* Settings */}
              <Link
                href="#settings"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Settings</span>
              </Link>
            </nav>

            {/* ACTION BUTTON TO PRODUCT INPUT */}
            <div className="pt-2">
              <Link
                href="/product-input"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] py-2.5 px-3 text-xs font-semibold text-white shadow-2xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Product Input</span>
              </Link>
            </div>
          </div>

          {/* Bottom Store Card (Figma Exact) */}
          <div className="pt-4 border-t border-zinc-100">
            <span className="block text-[11px] font-medium text-zinc-400 mb-1.5 px-1">Store</span>
            <div className="flex items-center justify-between p-2.5 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50 transition cursor-pointer shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] border border-[#FED7AA]/60 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-[#BA3807]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {user?.first_name ? `${user.first_name}'s Store` : "Alex's Store"}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">alex-store.myshopify.com</p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN DASHBOARD CONTENT */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header (Seamless with page canvas, matching Figma) */}
          <header className="px-5 sm:px-8 pt-5 pb-3 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Clean Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 shrink-0"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, creatives, orders..."
                  className="w-full rounded-2xl border border-zinc-200/90 bg-white py-2 pl-9 pr-12 text-xs text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-[#BA3807] focus:ring-1 focus:ring-[#BA3807] transition"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5 bg-zinc-50">
                  ⌘ K
                </span>
              </div>
            </div>

            {/* Right Header items: Notifications, Help, User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Notification Bell with Badge */}
              <button
                type="button"
                className="relative p-2 text-zinc-700 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#BA3807] text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  3
                </span>
              </button>

              {/* Help Circle */}
              <button
                type="button"
                className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition"
                aria-label="Help"
              >
                <div className="w-5 h-5 rounded-full border border-zinc-400 flex items-center justify-center text-[11px] font-medium text-zinc-700">
                  ?
                </div>
              </button>

              {/* User Dropdown */}
              <div className="relative pl-1">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 transition cursor-pointer"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                    <Image
                      src="/dashboard/alex-avatar.png"
                      alt="Alex Johnson"
                      width={32}
                      height={32}
                      unoptimized
                      priority
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 hidden sm:inline">
                    {user ? `${user.first_name} ${user.last_name}` : 'Alex Johnson'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl border border-zinc-200/80 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                      <p className="text-xs font-semibold text-zinc-900">
                        {user ? `${user.first_name} ${user.last_name}` : 'User Account'}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 p-5 sm:p-8 pt-2 sm:pt-3 space-y-6 overflow-y-auto">
            {/* Top Greeting */}
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-zinc-900">
                Good morning, {user?.first_name || 'Alex'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Here&apos;s what&apos;s happening with your store today.
              </p>
            </div>

            {/* ========================================================= */}
            {/* 4 KPI CARDS (WITH SPARKLINE CHARTS) */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Revenue Card */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#FFF5ED] text-[#BA3807] flex items-center justify-center font-bold text-xs shrink-0">
                      $
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span>Revenue</span>
                      <Info className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-[26px] font-bold text-zinc-900 mt-2 tracking-tight">
                    $25, 480
                  </p>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span>↑ 18.6%</span>
                    <span className="text-zinc-400 font-normal">vs last 30 days</span>
                  </p>
                  <svg className="w-20 h-8" viewBox="0 0 80 32" fill="none">
                    <path
                      d="M 2 24 Q 20 28, 35 18 T 60 14 T 78 4"
                      stroke="#BA3807"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 2. Orders Card */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span>Orders</span>
                      <Info className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-[26px] font-bold text-zinc-900 mt-2 tracking-tight">
                    1, 543
                  </p>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span>↑ 12.4%</span>
                    <span className="text-zinc-400 font-normal">vs last 30 days</span>
                  </p>
                  <svg className="w-20 h-8" viewBox="0 0 80 32" fill="none">
                    <path
                      d="M 2 22 Q 22 26, 40 18 T 62 16 T 78 6"
                      stroke="#BA3807"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 3. Profit Card */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-50 text-[#BA3807] flex items-center justify-center font-bold text-xs shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-[#BA3807]" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span>Profit</span>
                      <Info className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-[26px] font-bold text-zinc-900 mt-2 tracking-tight">
                    $8, 920
                  </p>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span>↑ 21.8%</span>
                    <span className="text-zinc-400 font-normal">vs last 30 days</span>
                  </p>
                  <svg className="w-20 h-8" viewBox="0 0 80 32" fill="none">
                    <path
                      d="M 2 26 Q 20 22, 38 20 T 58 12 T 78 5"
                      stroke="#BA3807"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 4. ROAS Card */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-50 text-[#BA3807] flex items-center justify-center font-bold text-xs shrink-0">
                      <Target className="w-3.5 h-3.5 text-[#BA3807]" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span>ROAS</span>
                      <Info className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-[26px] font-bold text-zinc-900 mt-2 tracking-tight">
                    4.8x
                  </p>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span>↑ 0.6</span>
                    <span className="text-zinc-400 font-normal">vs last 30 days</span>
                  </p>
                  <svg className="w-20 h-8" viewBox="0 0 80 32" fill="none">
                    <path
                      d="M 2 24 Q 22 26, 36 16 T 60 14 T 78 6"
                      stroke="#BA3807"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MIDDLE ROW: REVENUE OVERVIEW & TOP PERFORMING PRODUCTS */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Revenue Overview Chart (7 Cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <h2 className="text-sm font-bold text-zinc-900">Revenue Overview</h2>
                  <div className="flex items-center gap-1 bg-zinc-100/70 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setTimeRange('7d')}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        timeRange === '7d'
                          ? 'bg-[#FFF5ED] text-[#BA3807] border border-[#FED7AA] font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      7 days
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('30d')}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        timeRange === '30d'
                          ? 'bg-[#FFF5ED] text-[#BA3807] border border-[#FED7AA] font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      30 days
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('90d')}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        timeRange === '90d'
                          ? 'bg-[#FFF5ED] text-[#BA3807] border border-[#FED7AA] font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      90 days
                    </button>
                  </div>
                </div>

                {/* SVG Revenue Chart */}
                <div className="pt-6 relative">
                  <div className="flex">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[11px] text-zinc-400 font-mono pr-4 h-48 select-none">
                      <span>$30K</span>
                      <span>$25K</span>
                      <span>$15K</span>
                      <span>$10K</span>
                      <span>$5K</span>
                      <span>$0</span>
                    </div>

                    {/* Chart Canvas */}
                    <div className="relative flex-1 h-48">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="border-b border-zinc-100 w-full" />
                        <div className="border-b border-zinc-100 w-full" />
                        <div className="border-b border-zinc-100 w-full" />
                        <div className="border-b border-zinc-100 w-full" />
                        <div className="border-b border-zinc-100 w-full" />
                        <div className="border-b border-zinc-100 w-full" />
                      </div>

                      {/* SVG Line & Area */}
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 500 190"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BA3807" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#BA3807" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Fill area */}
                        <path
                          d="M 0 160 Q 50 155, 90 135 T 180 140 T 260 70 T 340 100 T 420 85 T 500 45 L 500 190 L 0 190 Z"
                          fill="url(#chartGradient)"
                        />

                        {/* Spline curve stroke */}
                        <path
                          d="M 0 160 Q 50 155, 90 135 T 180 140 T 260 70 T 340 100 T 420 85 T 500 45"
                          fill="none"
                          stroke="#BA3807"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Dashed vertical marker at May 15 (x ~ 285) */}
                        <line
                          x1="285"
                          y1="35"
                          x2="285"
                          y2="190"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <circle cx="285" cy="80" r="4" fill="#F59E0B" />
                      </svg>

                      {/* Milestone Annotation Tooltip (May 15) */}
                      <div className="absolute left-[54%] top-[45%] -translate-x-1/2 bg-white rounded-xl shadow-md border border-zinc-200/90 p-2 text-left z-10 pointer-events-none">
                        <p className="text-[10px] font-bold text-zinc-900">May 15</p>
                        <p className="text-[10px] text-amber-700 flex items-center gap-1 font-medium whitespace-nowrap">
                          <span>★ Influencer campaign launched</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Dates */}
                  <div className="flex justify-between pl-12 pt-3 text-[11px] text-zinc-400 font-mono">
                    <span>Apr 23</span>
                    <span>Apr 30</span>
                    <span>May 7</span>
                    <span>May 14</span>
                    <span>May 21</span>
                    <span>May 28</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Top Performing Products (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <h2 className="text-sm font-bold text-zinc-900">Top Performing Products</h2>
                    <Link
                      href="/products"
                      className="text-xs text-zinc-400 hover:text-zinc-600 transition"
                    >
                      View all
                    </Link>
                  </div>

                  {/* Products Table Header */}
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider py-2 border-b border-zinc-100">
                    <span className="col-span-6">Product</span>
                    <span className="col-span-2 text-right">Revenue</span>
                    <span className="col-span-2 text-right">Orders</span>
                    <span className="col-span-2 text-right flex items-center justify-end gap-0.5">
                      Trend
                    </span>
                  </div>

                  {/* Products Rows */}
                  <div className="divide-y divide-zinc-100">
                    {/* Row 1: Portable Blender */}
                    <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          <Image
                            src="/dashboard/prod-blender.png"
                            alt="Portable Blender"
                            width={32}
                            height={32}
                            unoptimized
                            priority
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">Portable Blender</p>
                          <p className="text-[10px] text-zinc-400 truncate">Kitchen</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-medium text-zinc-900">
                        $6,240
                      </span>
                      <span className="col-span-2 text-right text-zinc-600">412</span>
                      <div className="col-span-2 flex justify-end">
                        <span className="w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[11px] flex items-center justify-center bg-emerald-50/50">
                          92
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Smart Watch X1 */}
                    <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          <Image
                            src="/dashboard/prod-watch.png"
                            alt="Smart Watch X1"
                            width={32}
                            height={32}
                            unoptimized
                            priority
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">Smart Watch X1</p>
                          <p className="text-[10px] text-zinc-400 truncate">Electronics</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-medium text-zinc-900">
                        $4,890
                      </span>
                      <span className="col-span-2 text-right text-zinc-600">298</span>
                      <div className="col-span-2 flex justify-end">
                        <span className="w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[11px] flex items-center justify-center bg-emerald-50/50">
                          88
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Neck Massager Pro */}
                    <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          <Image
                            src="/dashboard/prod-massager.png"
                            alt="Neck Massager Pro"
                            width={32}
                            height={32}
                            unoptimized
                            priority
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">Neck Massager Pro</p>
                          <p className="text-[10px] text-zinc-400 truncate">Health & Beauty</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-medium text-zinc-900">
                        $3,450
                      </span>
                      <span className="col-span-2 text-right text-zinc-600">215</span>
                      <div className="col-span-2 flex justify-end">
                        <span className="w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[11px] flex items-center justify-center bg-emerald-50/50">
                          85
                        </span>
                      </div>
                    </div>

                    {/* Row 4: Pet Water Fountain */}
                    <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          <Image
                            src="/dashboard/prod-fountain.png"
                            alt="Pet Water Fountain"
                            width={32}
                            height={32}
                            unoptimized
                            priority
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">Pet Water Fountain</p>
                          <p className="text-[10px] text-zinc-400 truncate">Pet Supplies</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-medium text-zinc-900">
                        $2,980
                      </span>
                      <span className="col-span-2 text-right text-zinc-600">187</span>
                      <div className="col-span-2 flex justify-end">
                        <span className="w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[11px] flex items-center justify-center bg-emerald-50/50">
                          82
                        </span>
                      </div>
                    </div>

                    {/* Row 5: LED Room Lights */}
                    <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          <Image
                            src="/dashboard/prod-lights.png"
                            alt="LED Room Lights"
                            width={32}
                            height={32}
                            unoptimized
                            priority
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">LED Room Lights</p>
                          <p className="text-[10px] text-zinc-400 truncate">Home & Garden</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-medium text-zinc-900">
                        $2,420
                      </span>
                      <span className="col-span-2 text-right text-zinc-600">146</span>
                      <div className="col-span-2 flex justify-end">
                        <span className="w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[11px] flex items-center justify-center bg-emerald-50/50">
                          78
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* BOTTOM ROW: CREATIVE PERFORMANCE / AI INSIGHTS / WINNING PRODUCTS */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 1. Creative Performance (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <h2 className="text-sm font-bold text-zinc-900">Creative Performance</h2>
                  <Link
                    href="#creatives"
                    className="text-xs font-semibold text-[#BA3807] hover:underline"
                  >
                    View all creatives
                  </Link>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider py-2 border-b border-zinc-100">
                  <span className="col-span-6">Creative</span>
                  <span className="col-span-2 text-right">CTR</span>
                  <span className="col-span-2 text-right">Conv.</span>
                  <span className="col-span-2 text-right">ROAS</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-100">
                  {/* Creative #18 */}
                  <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-7 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                        <Image
                          src="/dashboard/creative-18.png"
                          alt="Creative #18"
                          fill
                          unoptimized
                          priority
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">Creative #18</p>
                        <p className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                          <span>Facebook</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">2.81%</p>
                      <p className="text-[10px] text-emerald-600">↑ 32%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">3.45%</p>
                      <p className="text-[10px] text-emerald-600">↑ 18%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">5.6x</p>
                      <p className="text-[10px] text-emerald-600">↑ 0.9</p>
                    </div>
                  </div>

                  {/* Creative #14 */}
                  <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-7 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                        <Image
                          src="/dashboard/creative-14.png"
                          alt="Creative #14"
                          fill
                          unoptimized
                          priority
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">Creative #14</p>
                        <p className="text-[10px] text-zinc-800 flex items-center gap-1 font-medium">
                          <span>TikTok</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">2.34%</p>
                      <p className="text-[10px] text-emerald-600">↑ 12%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">2.91%</p>
                      <p className="text-[10px] text-emerald-600">↑ 9%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">4.2x</p>
                      <p className="text-[10px] text-emerald-600">↑ 0.6</p>
                    </div>
                  </div>

                  {/* Creative #09 */}
                  <div className="grid grid-cols-12 items-center py-2.5 text-xs hover:bg-zinc-50/60 rounded-lg px-1 transition">
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-7 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                        <Image
                          src="/dashboard/creative-09.png"
                          alt="Creative #09"
                          fill
                          unoptimized
                          priority
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">Creative #09</p>
                        <p className="text-[10px] text-pink-600 flex items-center gap-1 font-medium">
                          <span>Instagram</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">1.98%</p>
                      <p className="text-[10px] text-rose-500">↓ 8%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">2.45%</p>
                      <p className="text-[10px] text-emerald-600">↑ 5%</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-900">3.1x</p>
                      <p className="text-[10px] text-rose-500">↓ 0.3</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. AI Insights (4 Cols) */}
              <div className="lg:col-span-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-1.5 text-[#BA3807]">
                      <Sparkles className="w-3.5 h-3.5 fill-[#BA3807]" />
                      <span className="text-xs font-bold text-zinc-900">AI Insights</span>
                    </div>
                    <Link
                      href="#insights"
                      className="text-xs font-semibold text-[#BA3807] hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <p className="text-xs font-semibold text-zinc-800 mt-2">
                    3 opportunities detected
                  </p>

                  <div className="mt-3 space-y-2.5">
                    {/* Insight 1 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition cursor-pointer">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            Portable Blender demand is increasing
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            +42% search interest in the last 7 days.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                    </div>

                    {/* Insight 2 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition cursor-pointer">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#BA3807] flex items-center justify-center shrink-0">
                          <Wand2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            Creative #18 has 32% higher CTR
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            Consider scaling budget on Facebook.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                    </div>

                    {/* Insight 3 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition cursor-pointer">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            Product X may need a price adjustment
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            Conversion rate is 18% below category avg.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Find Winning Products Faster (3 Cols) */}
              <div className="lg:col-span-3 rounded-2xl border border-[#FCE7D6] bg-[#FFF6EF] p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <h3 className="font-serif italic text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                    Find winning products faster
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed pr-16">
                    Discover trending products with high potential and low competition.
                  </p>
                </div>

                {/* Trophy illustration */}
                <div className="absolute right-2 bottom-12 w-20 h-24 pointer-events-none opacity-90">
                  <Image
                    src="/dashboard/trophy.png"
                    alt="Winning Trophy"
                    fill
                    unoptimized
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="pt-6 relative z-10">
                  <Link
                    href="/product-input"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition"
                  >
                    <span>Discover products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
