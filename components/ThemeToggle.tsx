'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { settingsApi } from '../lib/api/settings';
import { storeThemePref, useStudioTheme } from '../lib/theme';

/** Mirrors the theme onto <html> so landing, auth and onboarding follow it too. */
export function ThemeSync() {
  const theme = useStudioTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}

/** Sun/moon switch between the dark studio and the cream light theme. Saved on the account when signed in. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useStudioTheme();
  const { isAuthenticated } = useAuth();
  const next = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    storeThemePref(next);
    if (isAuthenticated) settingsApi.updatePreferences({ theme: next }).catch(() => undefined);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === 'light' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={next === 'light' ? 'Light theme' : 'Dark theme'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-studio-surface text-ink-soft transition hover:bg-studio-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
