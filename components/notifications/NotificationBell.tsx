'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { notificationsApi, type NotificationPage } from '../../lib/api/notifications';
import { Popover, focusRing } from '../dashboard/DashShell';

const POLL_MS = 60_000;
const SHOWN = 10;

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });
  if (s < 60) return 'just now';
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour');
  return rtf.format(-Math.floor(s / 86400), 'day');
}

/** Header bell: unread count, the latest 10, polled every 60 s while the tab is visible. */
export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState<NotificationPage | null>(null);

  const load = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    notificationsApi
      .list()
      .then(setPage)
      .catch(() => undefined); // the bell keeps its last state
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener('visibilitychange', load);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, [isAuthenticated, load]);

  const unread = page?.unread_count ?? 0;
  const items = page?.items.slice(0, SHOWN) ?? [];
  const now = new Date().toISOString();

  const markRead = (ids: string[] | null) => {
    setPage(
      (p) =>
        p && {
          ...p,
          unread_count: ids ? Math.max(0, p.unread_count - ids.length) : 0,
          items: p.items.map((n) =>
            !n.read_at && (!ids || ids.includes(n.id)) ? { ...n, read_at: now } : n,
          ),
        },
    );
    notificationsApi
      .markRead(ids)
      .then(({ unread_count }) => setPage((p) => p && { ...p, unread_count }))
      .catch(load);
  };

  return (
    <Popover
      label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="w-[360px] !p-0 max-sm:fixed max-sm:top-[84px] max-sm:right-4 max-sm:left-4 max-sm:w-auto sm:top-11 sm:right-0"
      buttonClassName="relative size-10 text-white"
      button={
        <>
          <Bell className="size-[22px]" strokeWidth={1.6} aria-hidden />
          {unread > 0 && (
            <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10.5px] font-semibold text-on-accent tabular-nums">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </>
      }
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-dash-line px-4 py-3">
            <p className="text-[13.5px] font-semibold text-white">Notifications</p>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => markRead(null)}
              className={`rounded text-[12.5px] text-studio-muted transition hover:text-white disabled:cursor-default disabled:opacity-50 disabled:hover:text-studio-muted ${focusRing}`}
            >
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-[13px] leading-[1.5] text-studio-muted">
              No notifications yet. Follow advertisers in the Ad library to hear when they launch
              new ads.
            </p>
          ) : (
            <ul className="max-h-[min(420px,calc(100dvh-140px))] overflow-y-auto p-1.5">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read_at) markRead([n.id]);
                      close();
                      if (n.link?.startsWith('/')) router.push(n.link);
                    }}
                    className={`flex w-full gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition hover:bg-white/5 ${focusRing}`}
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read_at ? 'bg-transparent' : 'bg-info'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13px] ${n.read_at ? 'text-dash-soft' : 'font-semibold text-white'}`}
                      >
                        {n.title}
                        {!n.read_at && <span className="sr-only"> (unread)</span>}
                      </span>
                      {n.body && n.body !== n.title && (
                        <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-[1.45] text-studio-muted">
                          {n.body}
                        </span>
                      )}
                      <span className="mt-1 block text-[11.5px] text-studio-meta">
                        {ago(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}
