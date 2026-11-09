import { fetchWithAuth } from './core';
import type { User } from '../types';

export type ThemePref = 'light' | 'dark' | 'system';
export type LanguagePref = 'fr' | 'en';
export type CurrencyPref = 'EUR' | 'USD' | 'XOF';

export interface Preferences {
  theme: ThemePref;
  language: LanguagePref;
  currency: CurrencyPref;
  notify_creative_ready: boolean;
  notify_low_credits: boolean;
  notify_product_news: boolean;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const settingsApi = {
  updateMe(data: { first_name?: string; last_name?: string }): Promise<User> {
    return fetchWithAuth<User>('/auth/me', json('PATCH', data));
  },

  /** 204 on success; every refresh token of the user is revoked server side. */
  changePassword(current_password: string, new_password: string): Promise<void> {
    return fetchWithAuth<void>(
      '/auth/me/password',
      json('POST', { current_password, new_password }),
    );
  },

  getPreferences(): Promise<Preferences> {
    return fetchWithAuth<Preferences>('/auth/me/preferences', { method: 'GET' });
  },

  updatePreferences(data: Partial<Preferences>): Promise<Preferences> {
    return fetchWithAuth<Preferences>('/auth/me/preferences', json('PATCH', data));
  },
};
