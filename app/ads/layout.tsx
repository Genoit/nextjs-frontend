'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Search, Star, Store } from 'lucide-react';
import { DashShell, focusRing } from '../../components/dashboard/DashShell';

const TABS = [
  { href: '/ads', label: 'Search', Icon: Search },
  { href: '/ads/advertisers', label: 'Advertisers', Icon: Store },
  { href: '/ads/following', label: 'Following', Icon: Star },
  { href: '/ads/captures', label: 'My captures', Icon: Bookmark },
];

const current = (path: string) =>
  TABS.find((t) => (t.href === '/ads' ? path === t.href : path.startsWith(t.href)));

export default function AdsLayout({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '';
  const tab = current(path);
  return (
    <DashShell>
      {/* /ads/<runId> (autopilot runs) keeps its own page; only the library gets the header. */}
      {tab ? (
        <main className="min-w-0 px-4 pb-14 sm:px-5 lg:pr-8 lg:pl-9">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="text-[20px] leading-tight font-semibold text-white">Ad library</h1>
              <p className="mt-1 max-w-[60ch] text-[13.5px] text-studio-muted">
                Ads running in the EU, from Meta&apos;s official Ad Library.
              </p>
            </div>
            <nav
              aria-label="Ad library"
              className="-mx-4 flex max-w-[100vw] gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:rounded-[12px] sm:border sm:border-studio-rule sm:bg-studio-surface sm:p-1"
            >
              {TABS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={tab.href === href ? 'page' : undefined}
                  className={`studio-tab shrink-0 ${focusRing}`}
                >
                  <Icon className="size-4 max-sm:hidden" strokeWidth={1.75} aria-hidden />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-7">{children}</div>
        </main>
      ) : (
        children
      )}
    </DashShell>
  );
}
