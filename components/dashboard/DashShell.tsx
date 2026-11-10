'use client';

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Clapperboard,
  Crown,
  Folder,
  House,
  Image as ImageIcon,
  Library,
  LogOut,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../ProtectedRoute';
import { rememberReturnTo, useAuth } from '../../lib/auth';
import { useStudioTheme } from '../../lib/theme';
import { BrandSymbol } from '../Icons';
import { NotificationBell } from '../notifications/NotificationBell';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import { billingApi, type BillingPlan, type BillingSummary } from '../../lib/api/billing';
import { isSubscribed, PLAN_LABEL } from '../../lib/billing-rules.mjs';
import { fromPrice } from '../../lib/dashboard-rules.mjs';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';

// ---------------------------------------------------------------- data

export type Entry = { product: Product; jobs: VideoGenerationJob[] | null };
export type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; entries: Entry[]; total: number };

/**
 * The user's newest products with their video jobs (jobs: null when that call failed).
 * shortcut: the products API has no search/sort/filter and no user-wide jobs list, so pages load
 * up to 100 products and one jobs call each (N+1); add those endpoints when libraries grow.
 */
export async function loadEntries(limit: number): Promise<Load> {
  try {
    const { products, total } = await productApi.getProducts({
      page_size: limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    const jobs = await Promise.allSettled(products.map((p) => creativeApi.listVideoJobs(p.id)));
    return {
      state: 'ready',
      total: total ?? products.length,
      entries: products.map((product, i) => {
        const r = jobs[i];
        return {
          product,
          jobs: r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : null,
        };
      }),
    };
  } catch (err) {
    return { state: 'error', message: err instanceof Error ? err.message : 'Unknown error.' };
  }
}

export const productImage = (p: Product) =>
  p.images?.find((i) => i.is_primary)?.url || p.main_image_url;

// ---------------------------------------------------------------- small parts

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-text';

export const menuItem =
  'flex h-9 w-full items-center gap-2 rounded-lg px-3 text-[13px] text-studio-muted transition hover:bg-white/5 hover:text-white';

export function Thumb({
  src,
  className,
  iconSize = 'size-6',
}: {
  src?: string | null;
  className: string;
  iconSize?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative shrink-0 overflow-hidden bg-dash-raised ${className}`}>
      {src && !broken ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="320px"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-studio-meta">
          <Package className={iconSize} strokeWidth={1.25} aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Small popover anchored to its button; closes on outside click and Escape. */
export function Popover({
  label,
  button,
  className,
  buttonClassName = '',
  fixed = false,
  children,
}: {
  label: string;
  button: ReactNode;
  className: string;
  buttonClassName?: string;
  /** Viewport-positioned, so a scrolling ancestor (the rail) cannot clip it. */
  fixed?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-center rounded-md transition hover:text-white ${focusRing} ${buttonClassName}`}
      >
        {button}
      </button>
      {open && (
        <div
          className={`${fixed ? 'fixed' : 'absolute'} z-50 rounded-xl border border-dash-line bg-dash-raised p-1.5 shadow-menu ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function RowMenu({ product, up = false }: { product: Product; up?: boolean }) {
  return (
    <Popover
      label={`Actions for ${product.title}`}
      button={<MoreVertical className="size-4" aria-hidden />}
      className={`right-0 w-44 ${up ? 'bottom-7' : 'top-7'}`}
    >
      {(close) => (
        <>
          <Link href={`/products/${product.id}`} onClick={close} className={menuItem}>
            Open product
          </Link>
          <Link href={`/products/${product.id}/creative`} onClick={close} className={menuItem}>
            Open ad studio
          </Link>
          <Link href={`/products/${product.id}/edit`} onClick={close} className={menuItem}>
            Edit product
          </Link>
        </>
      )}
    </Popover>
  );
}

// ---------------------------------------------------------------- rail

// Mockup labels (2026-11-04) over the existing pages: Studio picks an ad structure, Generate starts
// from a product, Library holds the ad projects, Assets the product library.
const NAV: { label: string; Icon: typeof House; href: string }[] = [
  { label: 'New ad', Icon: Plus, href: '/product-input' },
  { label: 'Home', Icon: House, href: '/dashboard' },
  { label: 'Generate', Icon: Clapperboard, href: '/generate' },
  { label: 'Ad library', Icon: Library, href: '/ads' },
  { label: 'Studio', Icon: Sparkles, href: '/studio' },
  { label: 'Library', Icon: Folder, href: '/projects' },
  { label: 'Assets', Icon: ImageIcon, href: '/products' },
];

const isActive = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

// The rail shrinks on short windows so the plan card stays on screen (1440x900, 1366x768).
function RailItem({ item, onNavigate }: { item: (typeof NAV)[number]; onNavigate?: () => void }) {
  const { label, Icon, href } = item;
  const active = isActive(href, usePathname() ?? '');
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex h-[86px] w-[82px] flex-col items-center justify-center gap-2 rounded-[14px] text-[14px] transition [@media(max-height:1000px)]:h-[74px] [@media(max-height:820px)]:h-[58px] [@media(max-height:820px)]:gap-1 [@media(max-height:820px)]:text-[12.5px] ${
        active
          ? 'bg-ember-deep/25 text-ember-text shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]'
          : 'text-dash-nav hover:bg-white/[0.05] hover:text-white'
      } ${focusRing}`}
    >
      <Icon
        className="size-[25px] [@media(max-height:820px)]:size-[21px]"
        strokeWidth={1.6}
        aria-hidden
      />
      {label}
    </Link>
  );
}

/** Free accounts see the cheapest plan; subscribers see their plan and balance. */
function PlanCard({
  billing,
  onNavigate,
}: {
  billing: Billing & { from: string | null };
  onNavigate?: () => void;
}) {
  const { summary, from } = billing;
  const subscribed = summary ? isSubscribed(summary) : false;
  return (
    <Link
      href="/billing"
      onClick={onNavigate}
      className={`block w-[124px] rounded-[12px] border border-dash-line bg-dash-panel px-4 py-3.5 text-[14.5px] leading-[1.45] text-white transition hover:border-dash-edge-strong ${focusRing}`}
    >
      <Crown
        className="mb-1.5 size-5 text-coin"
        fill="currentColor"
        strokeWidth={1.5}
        aria-hidden
      />
      {subscribed && summary ? (
        <>
          {PLAN_LABEL[summary.plan]} plan
          <br />
          <span className="tabular-nums">{summary.credits.toLocaleString('en-US')} credits</span>
        </>
      ) : from ? (
        <>
          Plan from
          <br />
          <span className="tabular-nums">{from}/month</span>
        </>
      ) : (
        'See plans'
      )}
    </Link>
  );
}

function MoreMenu() {
  const { logout, isAuthenticated } = useAuth();
  return (
    <Popover
      label="More"
      fixed
      className="bottom-4 left-[88px] w-52"
      buttonClassName="h-8 w-12 text-studio-muted"
      button={<MoreHorizontal className="size-6" aria-hidden />}
    >
      {(close) => (
        <>
          <Link href="/settings" onClick={close} className={menuItem}>
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
          <Link href="/billing" onClick={close} className={menuItem}>
            <Zap className="size-4" aria-hidden />
            Plan and credits
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                close();
                logout();
              }}
              className={menuItem}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          )}
        </>
      )}
    </Popover>
  );
}

function Rail({
  billing,
  onNavigate,
}: {
  billing: Billing & { from: string | null };
  onNavigate?: () => void;
}) {
  return (
    <div className="pointer-events-auto flex min-h-full w-[93px] flex-col items-center pt-6 pb-4 pl-[5px] [@media(max-height:820px)]:pt-4">
      <Link href="/dashboard" aria-label="TrendED home" className={`rounded-lg ${focusRing}`}>
        <BrandSymbol priority className="h-[55px] w-[56px]" />
      </Link>
      <nav
        aria-label="Main"
        className="mt-[90px] flex flex-col items-center gap-[7px] [@media(max-height:1000px)]:mt-6 [@media(max-height:820px)]:mt-4 [@media(max-height:820px)]:gap-1"
      >
        {NAV.map((item) => (
          <RailItem key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      {/* The plan card is wider than the rail column and spills toward the content, as in the mockup. */}
      <div className="mt-auto flex w-full flex-col gap-3 pt-8 [@media(max-height:820px)]:gap-2 [@media(max-height:820px)]:pt-4">
        <div className="ml-[5px]">
          <PlanCard billing={billing} onNavigate={onNavigate} />
        </div>
        <div className="flex w-[83px] justify-center">
          <MoreMenu />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- header

function AccountMenu() {
  const { user, logout } = useAuth();
  if (!user) {
    return (
      <Link
        href="/login"
        onClick={() => rememberReturnTo(window.location.pathname)}
        className={`inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-[15px] font-medium text-white transition hover:bg-white/[0.07] ${focusRing}`}
      >
        Sign in
      </Link>
    );
  }
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  return (
    <Popover
      label="Account"
      className="top-14 right-0 w-60"
      button={
        <span className="flex items-center gap-3 text-white">
          <span className="flex size-[44px] items-center justify-center rounded-full bg-gradient-to-br from-dash-edge-strong to-dash-raised text-[15px] font-semibold ring-1 ring-white/10">
            {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </span>
          <span className="hidden max-w-[160px] truncate text-[15px] sm:block">
            {name || user?.email}
          </span>
          <ChevronDown className="size-[18px] text-dash-soft" aria-hidden />
        </span>
      }
    >
      {(close) => (
        <>
          <div className="px-3 py-2">
            <p className="truncate text-[13px] font-semibold text-white">
              {name || 'Your account'}
            </p>
            <p className="truncate text-xs text-studio-meta">{user?.email}</p>
          </div>
          <Link href="/settings" onClick={close} className={menuItem}>
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
          <Link href="/billing" onClick={close} className={menuItem}>
            <Zap className="size-4" aria-hidden />
            Plan and credits
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className={menuItem}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </>
      )}
    </Popover>
  );
}

function Header({
  onMenu,
  railHidden,
  onToggleRail,
}: {
  onMenu: () => void;
  railHidden: boolean;
  onToggleRail: () => void;
}) {
  const RailIcon = railHidden ? PanelLeftOpen : PanelLeftClose;
  return (
    <header className="relative z-30 flex h-[100px] items-center gap-4 px-5 md:pl-3 lg:pr-9">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className={`-ml-2 flex size-10 items-center justify-center rounded-lg text-studio-muted hover:text-white md:hidden ${focusRing}`}
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleRail}
        aria-label={railHidden ? 'Show sidebar' : 'Hide sidebar'}
        title={railHidden ? 'Show sidebar' : 'Hide sidebar'}
        className={`hidden size-10 shrink-0 items-center justify-center rounded-lg text-studio-muted transition hover:bg-white/[0.05] hover:text-white md:flex ${focusRing}`}
      >
        <RailIcon className="size-5" strokeWidth={1.6} aria-hidden />
      </button>
      <Link href="/dashboard" className={`flex items-center gap-3 rounded-md ${focusRing}`}>
        <BrandSymbol priority className="h-[34px] w-[35px] md:hidden" />
        <span>
          <span className="block text-[24px] leading-none font-semibold tracking-[-0.01em] text-white">
            TrendED
          </span>
          <span className="mt-1.5 hidden text-[12.5px] whitespace-nowrap text-dash-soft sm:block">
            E-commerce · Dropshipping · Growth
          </span>
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-6 lg:gap-9">
        <NotificationBell />
        <AccountMenu />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- shell

export type Billing = { summary: BillingSummary | null; total: number | null };

// Desktop rail hidden or shown; the choice follows the user across studio pages.
const RAIL_KEY = 'trended:rail';
const RAIL_EVENT = 'trended-rail';
let railOverride: boolean | null = null; // storage blocked: the choice lasts until reload

function readRailHidden(): boolean {
  try {
    return localStorage.getItem(RAIL_KEY) === 'hidden';
  } catch {
    return false;
  }
}

function subscribeRail(onChange: () => void): () => void {
  window.addEventListener(RAIL_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(RAIL_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function useRailHidden(): [boolean, () => void] {
  const hidden = useSyncExternalStore(
    subscribeRail,
    () => railOverride ?? readRailHidden(),
    () => false,
  );
  const toggle = () => {
    railOverride = !hidden;
    try {
      localStorage.setItem(RAIL_KEY, railOverride ? 'hidden' : 'shown');
    } catch {
      /* kept in railOverride */
    }
    window.dispatchEvent(new Event(RAIL_EVENT));
  };
  return [hidden, toggle];
}

/**
 * Icon rail + header of the studio pages. `children` may read the billing summary it loads.
 * `backdrop` paints behind the header too (the dashboard's orange glow).
 */
export function DashShell({
  backdrop,
  guest = false,
  children,
}: {
  backdrop?: ReactNode;
  /** Signed-out visitors may see the page (the dashboard); paid actions send them to login. */
  guest?: boolean;
  children: ReactNode | ((billing: Billing) => ReactNode);
}) {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [railHidden, toggleRail] = useRailHidden();

  useEffect(() => {
    let alive = true;
    if (isAuthenticated) {
      billingApi
        .getSummary()
        .then((s) => alive && setSummary(s))
        .catch(() => undefined); // the plan card falls back to "See plans"; the page still works
    }
    billingApi
      .getPlans()
      .then((p) => alive && setPlans(p))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const total = (summary && plans.find((p) => p.id === summary.plan)?.monthly_credits) || null;
  const billing = { summary, total, from: fromPrice(plans) };
  const theme = useStudioTheme();

  const Guard = guest ? Fragment : ProtectedRoute;
  return (
    <Guard>
      <div
        data-theme={theme}
        className="relative flex min-h-dvh overflow-x-clip bg-dash-ground font-sans text-white antialiased"
      >
        {backdrop}
        {/* Scrolls when the window is short (100 % zoom). 140px wide with -36px margin so the
            plan card that spills past the rail is not clipped; the extra strip lets clicks through. */}
        <aside
          className={`pointer-events-none sticky top-0 z-20 -mr-[36px] hidden h-dvh w-[140px] shrink-0 overflow-y-auto overscroll-contain [scrollbar-width:none] ${railHidden ? '' : 'md:block'}`}
        >
          <Rail billing={billing} />
        </aside>

        {menuOpen && (
          <div
            className="fixed inset-0 z-[60] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/70"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative h-full w-[150px] overflow-y-auto border-r border-dash-rail-line bg-dash-sidebar">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-2 right-1 flex size-9 items-center justify-center rounded-lg text-studio-muted hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
              <Rail billing={billing} onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Without the rail, pages keep the same breathing room as on the right. */}
        <div
          className={`relative z-10 flex min-w-0 flex-1 flex-col ${railHidden ? 'md:pl-6' : ''}`}
        >
          <Header
            onMenu={() => setMenuOpen(true)}
            railHidden={railHidden}
            onToggleRail={toggleRail}
          />
          {typeof children === 'function' ? children({ summary, total }) : children}
        </div>
      </div>
    </Guard>
  );
}
