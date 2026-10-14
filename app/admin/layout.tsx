'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Wand2,
  Sparkles,
  Receipt,
  Share2,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  HelpCircle,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/overview',
      icon: LayoutDashboard,
      isActive: pathname === '/admin' || pathname === '/admin/overview',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      isActive: pathname.startsWith('/admin/users'),
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      isActive: pathname.startsWith('/admin/subscriptions'),
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      isActive: pathname.startsWith('/products'),
    },
    {
      name: 'Creatives',
      href: '#creatives',
      icon: Wand2,
      isActive: pathname === '#creatives',
    },
    {
      name: 'AI Generations',
      href: '#ai-generations',
      icon: Sparkles,
      isActive: pathname === '#ai-generations',
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: Receipt,
      isActive: pathname.startsWith('/admin/transactions'),
    },
    {
      name: 'Integrations',
      href: '#integrations',
      icon: Share2,
      isActive: pathname === '#integrations',
    },
    {
      name: 'System Logs',
      href: '/admin/system-logs',
      icon: FileText,
      isActive: pathname.startsWith('/admin/system-logs'),
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      isActive: pathname.startsWith('/admin/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 flex font-sans antialiased">
      {/* ========================================================= */}
      {/* MOBILE DRAWER */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <Link
                  href="/admin/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/dashboard/trended-logo.png"
                    alt="TrendED"
                    width={130}
                    height={44}
                    unoptimized
                    priority
                    className="object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Admin Console
              </div>

              <nav className="space-y-1 text-sm font-medium">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                        item.isActive
                          ? 'bg-[#FFF5ED] text-[#EA580C] font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${item.isActive ? 'text-[#EA580C]' : 'text-zinc-500'}`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">Admin</p>
                  <p className="text-[10px] text-zinc-400 truncate">Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Faithful to Figma) */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-60 bg-white border-r border-zinc-200/80 p-5 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-30">
        <div className="space-y-6">
          {/* Logo & Baseline */}
          <div className="px-1 pt-1">
            <Link href="/admin/overview" className="block">
              <Image
                src="/dashboard/trended-logo.png"
                alt="TrendED"
                width={145}
                height={50}
                unoptimized
                priority
                className="object-contain"
              />
            </Link>
            <p className="text-[10px] text-zinc-400 mt-1 pl-1 tracking-tight">
              E-commerce · Dropshipping · Growth
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                    item.isActive
                      ? 'bg-[#FFF7ED] text-[#EA580C] font-semibold border-l-3 border-[#EA580C]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.isActive ? 'text-[#EA580C]' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile and Footer */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
                  AD
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 truncate">Admin</p>
                  <p className="text-[10px] text-zinc-400 truncate">Super Administrator</p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-3 py-2 border-b border-zinc-100 text-xs text-zinc-500">
                  Logged in as <strong className="text-zinc-900">admin@trended.com</strong>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 rounded-lg transition"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  System Settings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 rounded-lg transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                  Merchant View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <p className="text-[10px] text-zinc-400 px-2 select-none">
            © 2025 TrendED. All rights reserved.
          </p>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="px-6 sm:px-8 pt-5 pb-3 flex items-center justify-between gap-4 border-b border-zinc-100/80 bg-white/50 backdrop-blur-xs sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Universal Search Bar matching Figma */}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, orders, products..."
                className="w-full rounded-2xl border border-zinc-200/90 bg-white py-2 pl-9 pr-12 text-xs text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5 bg-zinc-50">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right Controls: Help, Notifications, Date */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Help Question mark */}
            <button
              type="button"
              className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition"
              title="Help & documentation"
              aria-label="Help"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Notifications Bell with Badge 12 */}
            <Link
              href="/admin/overview#alerts"
              className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center leading-none">
                12
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
