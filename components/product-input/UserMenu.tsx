'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  const initials =
    (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '') || user?.email?.[0] || '?';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-trend-orange"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold uppercase text-white"
        >
          {initials}
        </span>
        <span className="hidden font-medium text-ink md:inline">{name || 'Mon compte'}</span>
        <span className="sr-only md:hidden">Mon compte</span>
        <ChevronDown
          aria-hidden
          className={`size-4 text-ink-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          className="animate-rise absolute right-0 z-50 mt-2 w-60 rounded-xl border border-line bg-white p-1.5 shadow-lg motion-reduce:animate-none"
        >
          <div className="border-b border-line px-3 py-2">
            {name && <p className="text-sm font-semibold text-ink">{name}</p>}
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-1 flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm text-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <LayoutDashboard className="size-4 text-ink-muted" aria-hidden />
            Tableau de bord
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-danger hover:bg-cream focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <LogOut className="size-4" aria-hidden />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
