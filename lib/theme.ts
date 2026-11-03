'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { settingsApi, type ThemePref } from './api/settings';

// The server keeps the preference; localStorage is only a per-browser cache so pages open in the
// right theme without waiting for a request.
const KEY = 'trended_theme';
const EVENT = 'trended-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readPref(): ThemePref | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

export function storeThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    // Private mode: the theme still applies for this page through the event.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: pref }));
}

export function resolveTheme(pref: ThemePref | null, systemDark: boolean): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref;
  if (pref === 'system') return systemDark ? 'dark' : 'light';
  return 'dark';
}

let override: ThemePref | null = null;

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const onEvent = (e: Event) => {
    override = (e as CustomEvent<ThemePref>).detail;
    onChange();
  };
  window.addEventListener(EVENT, onEvent);
  window.addEventListener('storage', onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener(EVENT, onEvent);
    window.removeEventListener('storage', onChange);
    media.removeEventListener('change', onChange);
  };
}

const snapshot = () => resolveTheme(override ?? readPref(), window.matchMedia(DARK_QUERY).matches);

let fetched = false;

/** 'light' | 'dark' for the studio shells' data-theme. Dark on the server and before any choice. */
export function useStudioTheme(): 'light' | 'dark' {
  const theme = useSyncExternalStore(subscribe, snapshot, () => 'dark' as const);
  useEffect(() => {
    // No cached choice in this browser yet: fetch the account's preference once.
    if (fetched || readPref()) return;
    fetched = true;
    settingsApi
      .getPreferences()
      .then((p) => storeThemePref(p.theme))
      .catch(() => undefined);
  }, []);
  return theme;
}

/** On sign-out: the next account must not inherit this one's theme. */
export function resetThemeCache(): void {
  fetched = false;
  override = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing cached.
  }
}
