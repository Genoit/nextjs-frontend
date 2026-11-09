'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Package,
  Wand2,
  Sparkles,
  Coins,
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

import ProtectedRoute from '../../components/ProtectedRoute';
import { BrandLogo } from '../../components/Icons';
import { useAuth } from '../../lib/auth';
import { fetchAdminAlerts } from '../../lib/api/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetchAdminAlerts()
      .then((res) => setAlertCount(res.alerts.length))
      .catch(() => setAlertCount(0)); // the badge just stays hidden
  }, [pathname]);

  const adminName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : 'Admin';
  const adminInitials =
    (user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}` : '').toUpperCase() || 'AD';

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
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      isActive: pathname.startsWith('/admin/analytics'),
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      isActive: pathname.startsWith('/admin/subscriptions'),
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      isActive: pathname.startsWith('/admin/products'),
    },
    {
      name: 'Creatives',
      href: '/admin/creatives',
      icon: Wand2,
      isActive: pathname.startsWith('/admin/creatives'),
    },
    {
      name: 'AI Generations',
      href: '/admin/ai-generations',
      icon: Sparkles,
      isActive: pathname.startsWith('/admin/ai-generations'),
    },
    {
      name: 'AI Costs',
      href: '/admin/ai-costs',
      icon: Coins,
      isActive: pathname.startsWith('/admin/ai-costs'),
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: Receipt,
      isActive: pathname.startsWith('/admin/transactions'),
    },
    {
      name: 'Integrations',
      href: '/admin/integrations',
      icon: Share2,
      isActive: pathname.startsWith('/admin/integrations'),
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
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-studio-surface text-ink flex font-sans antialiased">
        {/* ========================================================= */}
        {/* MOBILE DRAWER */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex">
            <div className="w-64 bg-studio-ground h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <Link
                    href="/admin/overview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <BrandLogo className="h-7" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-ink-muted hover:bg-studio-raised"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
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
                            ? 'bg-cream text-trend-orange font-semibold'
                            : 'text-ink-soft hover:text-ink hover:bg-studio-surface'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${item.isActive ? 'text-trend-orange' : 'text-ink-muted'}`}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-line">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-cream text-trend-orange flex items-center justify-center font-bold text-xs shrink-0">
                    {adminInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{adminName}</p>
                    <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
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
        <aside className="hidden md:flex w-60 bg-studio-ground border-r border-line/80 p-5 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-30">
          <div className="space-y-6">
            {/* Logo & Baseline */}
            <div className="px-1 pt-1">
              <Link href="/admin/overview" className="block">
                <BrandLogo className="h-8" />
              </Link>
              <p className="text-[10px] text-ink-muted mt-1 pl-1 tracking-tight">
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
                        ? 'bg-cream text-trend-orange font-semibold border-l-3 border-trend-orange'
                        : 'text-ink-soft hover:text-ink hover:bg-studio-surface'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        item.isActive ? 'text-trend-orange' : 'text-ink-muted'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile and Footer */}
          <div className="space-y-3 pt-4 border-t border-line">
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-studio-surface transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-cream border border-trend-orange/20 text-trend-orange flex items-center justify-center font-bold text-xs shrink-0">
                    {adminInitials}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{adminName}</p>
                    <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted shrink-0 ml-1" />
              </button>

              {userDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-studio-ground rounded-2xl shadow-xl border border-line/80 p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-2 border-b border-line text-xs text-ink-muted">
                    Logged in as <strong className="text-ink">{user?.email}</strong>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-ink-soft hover:bg-studio-surface rounded-lg transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-ink-muted" />
                    System Settings
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-ink-soft hover:bg-studio-surface rounded-lg transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-ink-muted" />
                    Merchant View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger-soft rounded-lg transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-ink-muted px-2 select-none">
              © {new Date().getFullYear()} TrendED. All rights reserved.
            </p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN CONTAINER */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="px-6 sm:px-8 pt-5 pb-3 flex items-center justify-between gap-4 border-b border-line/80 bg-studio-ground/50 backdrop-blur-xs sticky top-0 z-20">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-ink-soft hover:text-ink rounded-lg hover:bg-studio-raised shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Universal Search Bar matching Figma */}
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, orders, products..."
                  className="w-full rounded-2xl border border-line/90 bg-studio-ground py-2 pl-9 pr-12 text-xs text-ink placeholder-ink-muted shadow-2xs focus:border-trend-orange focus:ring-1 focus:ring-trend-orange transition"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-muted border border-line rounded px-1.5 py-0.5 bg-studio-surface">
                  ⌘ K
                </span>
              </div>
            </div>

            {/* Right Controls: Help, Notifications, Date */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Help Question mark */}
              <button
                type="button"
                className="p-1.5 text-ink-muted hover:text-ink rounded-full hover:bg-studio-raised transition"
                title="Help & documentation"
                aria-label="Help"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>

              {/* Notifications bell: count of current admin alerts */}
              <Link
                href="/admin/overview#alerts"
                className="relative p-2 text-ink-soft hover:text-ink rounded-full hover:bg-studio-raised transition"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-danger text-[9px] font-bold text-on-accent flex items-center justify-center leading-none">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
