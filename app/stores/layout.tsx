'use client';

import type { ReactNode } from 'react';
import { DashShell } from '../../components/dashboard/DashShell';

export default function StoresLayout({ children }: { children: ReactNode }) {
  return (
    <DashShell>
      <main className="min-w-0 px-4 pb-14 sm:px-5 lg:pr-8 lg:pl-9">
        <h1 className="text-[20px] leading-tight font-semibold text-white">Stores</h1>
        <p className="mt-1 max-w-[62ch] text-[13.5px] text-studio-muted">
          Follow competitor Shopify stores. We read their public pages once a day and tell you what
          changed.
        </p>
        <div className="mt-7">{children}</div>
      </main>
    </DashShell>
  );
}
