'use client';

import { Suspense, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  Check,
  CreditCard,
  Loader2,
  Palette,
  Puzzle,
  ShoppingBag,
  Store,
  User as UserIcon,
  UserRound,
} from 'lucide-react';
import { DashShell, focusRing } from '../../components/dashboard/DashShell';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import {
  settingsApi,
  type CurrencyPref,
  type LanguagePref,
  type Preferences,
  type ThemePref,
} from '../../lib/api/settings';
import { storeThemePref, resolveTheme } from '../../lib/theme';
import { PLAN_LABEL } from '../../lib/billing-rules.mjs';
import { shopifyApi, shopifyErrorCode } from '../../lib/api/shopify';
import { readShopifyCallback, shopifyErrorText } from '../../lib/shopify-rules.mjs';
import { StoresSection, type StoresNotice } from '../../components/settings/StoresSection';
import type { BillingSummary } from '../../lib/api/billing';
import type {
  OnboardingBusinessType,
  OnboardingCategory,
  OnboardingExperience,
  OnboardingGoal,
  OnboardingProfile,
  OnboardingProgress,
  OnboardingStoreConnection,
} from '../../lib/types';

// ---------------------------------------------------------------- sections

const SECTIONS = [
  { id: 'account', label: 'Account', Icon: UserIcon },
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'store', label: 'Store profile', Icon: Store },
  { id: 'stores', label: 'Stores', Icon: ShoppingBag },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'integrations', label: 'Integrations', Icon: Puzzle },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const isSection = (v: string): v is SectionId => SECTIONS.some((s) => s.id === v);

// ---------------------------------------------------------------- small parts

const input =
  'h-10 w-full rounded-[8px] border border-dash-edge bg-dash-field px-3 text-[13.5px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60 disabled:text-studio-muted';
const labelCls = 'mb-2 block text-[13px] font-medium text-white';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-studio-muted">{hint}</span>}
    </label>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${input} cursor-pointer`}
    >
      {value === '' && <option value="">Choose…</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-dash-line bg-dash-panel p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-white">{title}</h2>
      <p className="mt-1 text-[13px] text-studio-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

type Status =
  | { state: 'idle' }
  | { state: 'saving' }
  | { state: 'saved' }
  | { state: 'error'; message: string };

const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.');

function SaveRow({
  status,
  label = 'Save changes',
  disabled = false,
}: {
  status: Status;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={disabled || status.state === 'saving'}
        className={`inline-flex h-10 items-center gap-2 rounded-[8px] bg-ember px-4 text-[13px] font-semibold text-on-ember transition hover:bg-ember-strong active:scale-[0.98] disabled:opacity-60 ${focusRing}`}
      >
        {status.state === 'saving' && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {label}
      </button>
      <span role="status" className="text-[12.5px]">
        {status.state === 'saved' && (
          <span className="inline-flex items-center gap-1.5 text-dash-green">
            <Check className="size-3.5" aria-hidden /> Saved
          </span>
        )}
        {status.state === 'error' && <span className="text-danger">{status.message}</span>}
      </span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-medium text-white">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-studio-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-[34px] shrink-0 rounded-full transition ${
          checked ? 'bg-trend-orange' : 'bg-dash-edge-strong'
        } ${focusRing}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-on-ember shadow-sm transition-transform ${
            checked ? 'translate-x-[14px]' : ''
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- account

function AccountView() {
  const { user, updateUser, login } = useAuth();
  const [first, setFirst] = useState(user?.first_name ?? '');
  const [last, setLast] = useState(user?.last_name ?? '');
  const [nameStatus, setNameStatus] = useState<Status>({ state: 'idle' });
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState<Status>({ state: 'idle' });
  const google = user?.auth_provider === 'google';

  const saveNames = async (e: FormEvent) => {
    e.preventDefault();
    setNameStatus({ state: 'saving' });
    try {
      updateUser(await settingsApi.updateMe({ first_name: first, last_name: last }));
      setNameStatus({ state: 'saved' });
    } catch (err) {
      setNameStatus({ state: 'error', message: errorText(err) });
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setPwStatus({ state: 'error', message: 'The two new passwords do not match.' });
      return;
    }
    setPwStatus({ state: 'saving' });
    try {
      await settingsApi.changePassword(current, next);
      // Every session was revoked server side: sign this one back in with the new password.
      if (user) await login({ email: user.email, password: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setPwStatus({ state: 'saved' });
    } catch (err) {
      setPwStatus({ state: 'error', message: errorText(err) });
    }
  };

  return (
    <div className="space-y-5">
      <Panel title="Account" description="Your name as it appears in TrendED.">
        <form onSubmit={saveNames}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input
                className={input}
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                required
                maxLength={100}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name">
              <input
                className={input}
                value={last}
                onChange={(e) => setLast(e.target.value)}
                required
                maxLength={100}
                autoComplete="family-name"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Email" hint="Your sign-in email cannot be changed here.">
              <input className={input} value={user?.email ?? ''} disabled readOnly />
            </Field>
          </div>
          <SaveRow status={nameStatus} />
        </form>
      </Panel>

      <Panel
        title="Password"
        description={
          google
            ? 'You sign in with Google, so your password is managed by your Google account.'
            : 'Changing it signs you out on every other device.'
        }
      >
        {google ? (
          <p className="text-[13px] text-dash-soft">No TrendED password to change.</p>
        ) : (
          <form onSubmit={savePassword}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Current password">
                <input
                  type="password"
                  className={input}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password" hint="8 characters or more.">
                <input
                  type="password"
                  className={input}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  className={input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <SaveRow status={pwStatus} label="Change password" />
          </form>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- profile + store (onboarding answers)

const PROFILES: { value: OnboardingProfile; label: string }[] = [
  { value: 'starting', label: 'Just getting started' },
  { value: 'selling', label: 'Already selling' },
  { value: 'dropshipper', label: 'Dropshipper' },
  { value: 'scaling', label: 'Scaling a store' },
];
const BUSINESS: { value: OnboardingBusinessType; label: string }[] = [
  { value: 'dropshipping', label: 'Dropshipping' },
  { value: 'dtc_brand', label: 'DTC brand' },
  { value: 'marketplace_seller', label: 'Marketplace seller' },
  { value: 'other', label: 'Other' },
];
const CATEGORIES: { value: OnboardingCategory; label: string }[] = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'home', label: 'Home' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'pets', label: 'Pets' },
  { value: 'other', label: 'Other' },
];
const EXPERIENCE: { value: OnboardingExperience; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
const GOALS: { value: OnboardingGoal; label: string }[] = [
  { value: 'products', label: 'Find winning products' },
  { value: 'ads', label: 'Create better ads' },
  { value: 'sales', label: 'Increase sales' },
  { value: 'scale', label: 'Scale my store' },
  { value: 'performance', label: 'Track performance' },
];
const PLATFORMS: { value: OnboardingStoreConnection; label: string }[] = [
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'manual', label: 'Another platform, or no store yet' },
];

function useOnboarding() {
  const { token } = useAuth();
  const [data, setData] = useState<OnboardingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!token) return;
    let alive = true;
    api
      .getOnboarding(token)
      .then((d) => alive && setData(d))
      .catch((err) => alive && setError(errorText(err)));
    return () => {
      alive = false;
    };
  }, [token]);
  return { token, data, error };
}

function Loading({ error }: { error: string | null }) {
  return error ? (
    <p className="text-[13px] text-danger">{error}</p>
  ) : (
    <p className="inline-flex items-center gap-2 text-[13px] text-studio-muted">
      <Loader2 className="size-4 animate-spin" aria-hidden /> Loading…
    </p>
  );
}

function ProfileForm({ token, data }: { token: string; data: OnboardingProgress }) {
  const [profile, setProfile] = useState<OnboardingProfile | ''>(data.profile ?? '');
  const [business, setBusiness] = useState<OnboardingBusinessType | ''>(data.business_type ?? '');
  const [category, setCategory] = useState<OnboardingCategory | ''>(data.main_category ?? '');
  const [market, setMarket] = useState(data.target_market ?? '');
  const [experience, setExperience] = useState<OnboardingExperience | ''>(
    data.experience_level ?? '',
  );
  const [goals, setGoals] = useState<OnboardingGoal[]>(data.goals ?? []);
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !profile ||
      !business ||
      !category ||
      !experience ||
      market.trim().length < 2 ||
      goals.length === 0
    ) {
      setStatus({ state: 'error', message: 'Fill in every field and pick at least one goal.' });
      return;
    }
    setStatus({ state: 'saving' });
    try {
      await api.saveOnboardingStep1(token, profile);
      await api.saveOnboardingStep2(token, {
        business_type: business,
        main_category: category,
        target_market: market.trim(),
        experience_level: experience,
      });
      await api.saveOnboardingStep4(token, goals);
      setStatus({ state: 'saved' });
    } catch (err) {
      setStatus({ state: 'error', message: errorText(err) });
    }
  };

  const toggleGoal = (g: OnboardingGoal) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  return (
    <form onSubmit={save}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Where you are">
          <Select value={profile} onChange={setProfile} options={PROFILES} />
        </Field>
        <Field label="Business type">
          <Select value={business} onChange={setBusiness} options={BUSINESS} />
        </Field>
        <Field label="Main category">
          <Select value={category} onChange={setCategory} options={CATEGORIES} />
        </Field>
        <Field label="Experience">
          <Select value={experience} onChange={setExperience} options={EXPERIENCE} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Target market" hint="Who you sell to, for example “Women 25-40 in France”.">
          <input
            className={input}
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            maxLength={120}
          />
        </Field>
      </div>
      <fieldset className="mt-5">
        <legend className={labelCls}>Goals</legend>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = goals.includes(g.value);
            return (
              <button
                key={g.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGoal(g.value)}
                className={`h-9 rounded-[8px] border px-3 text-[12.5px] transition ${
                  on
                    ? 'border-ember-text bg-ember/10 text-white'
                    : 'border-dash-edge text-dash-soft hover:text-white'
                } ${focusRing}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <SaveRow status={status} />
    </form>
  );
}

function ProfileView() {
  const { token, data, error } = useOnboarding();
  return (
    <Panel
      title="Profile"
      description="What you told us during onboarding. TrendED uses it to pick ad angles."
    >
      {token && data ? <ProfileForm token={token} data={data} /> : <Loading error={error} />}
    </Panel>
  );
}

function StoreForm({ token, data }: { token: string; data: OnboardingProgress }) {
  const [platform, setPlatform] = useState<OnboardingStoreConnection | ''>(
    data.store_connection ?? '',
  );
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!platform) return;
    setStatus({ state: 'saving' });
    try {
      await api.saveOnboardingStep3(token, platform);
      setStatus({ state: 'saved' });
    } catch (err) {
      setStatus({ state: 'error', message: errorText(err) });
    }
  };
  return (
    <form onSubmit={save}>
      <Field
        label="Where you sell"
        hint="TrendED does not connect to your store yet. Paste a product link when you create an ad."
      >
        <Select value={platform} onChange={setPlatform} options={PLATFORMS} />
      </Field>
      <SaveRow status={status} disabled={!platform} />
    </form>
  );
}

function StoreView() {
  const { token, data, error } = useOnboarding();
  return (
    <Panel title="Store" description="The platform your products live on.">
      {token && data ? <StoreForm token={token} data={data} /> : <Loading error={error} />}
    </Panel>
  );
}

// ---------------------------------------------------------------- preferences (notifications + appearance)

function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    settingsApi
      .getPreferences()
      .then((p) => alive && setPrefs(p))
      .catch((err) => alive && setError(errorText(err)));
    return () => {
      alive = false;
    };
  }, []);
  return { prefs, error };
}

function NotificationsForm({ initial }: { initial: Preferences }) {
  const [p, setP] = useState(initial);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const set = (k: keyof Preferences) => (v: boolean) => setP((cur) => ({ ...cur, [k]: v }));
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ state: 'saving' });
    try {
      setP(
        await settingsApi.updatePreferences({
          notify_creative_ready: p.notify_creative_ready,
          notify_low_credits: p.notify_low_credits,
          notify_product_news: p.notify_product_news,
        }),
      );
      setStatus({ state: 'saved' });
    } catch (err) {
      setStatus({ state: 'error', message: errorText(err) });
    }
  };
  return (
    <form onSubmit={save}>
      <div className="divide-y divide-dash-line">
        <Toggle
          label="Ad ready"
          description="When a video finishes rendering and passes the quality check."
          checked={p.notify_creative_ready}
          onChange={set('notify_creative_ready')}
        />
        <Toggle
          label="Low credits"
          description="When fewer than one ad’s worth of credits is left."
          checked={p.notify_low_credits}
          onChange={set('notify_low_credits')}
        />
        <Toggle
          label="Product news"
          description="New ad templates and features, at most once a month."
          checked={p.notify_product_news}
          onChange={set('notify_product_news')}
        />
      </div>
      <p className="mt-4 text-[12px] text-studio-muted">
        Saved to your account. TrendED does not send emails yet; these apply once it does.
      </p>
      <SaveRow status={status} />
    </form>
  );
}

function NotificationsView() {
  const { prefs, error } = usePreferences();
  return (
    <Panel title="Notifications" description="Choose which emails you want to receive.">
      {prefs ? <NotificationsForm initial={prefs} /> : <Loading error={error} />}
    </Panel>
  );
}

/** A miniature studio drawn with the real theme tokens: what the choice produces. */
function MiniStudio({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} aria-hidden className="flex h-full bg-dash-ground text-white">
      <div className="w-[30%] border-r border-dash-rail-line bg-dash-sidebar p-2">
        <p className="text-[9px] font-bold">
          Trend<span className="text-ember-text">ED</span>
        </p>
        <div className="mt-2 h-2.5 rounded-[3px] bg-gradient-to-r from-ember-deep/90 to-ember-nav-end" />
        <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-white/15" />
        <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-white/15" />
      </div>
      <div className="flex-1 p-2">
        <div className="h-1.5 w-1/2 rounded-full bg-white/70" />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="h-7 rounded-[4px] border border-dash-line bg-dash-panel" />
          <div className="h-7 rounded-[4px] border border-dash-line bg-dash-panel" />
        </div>
        <div className="mt-1.5 h-2.5 w-1/3 rounded-[3px] bg-ember" />
      </div>
    </div>
  );
}

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];
const LANGUAGES: { value: LanguagePref; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];
const CURRENCIES: { value: CurrencyPref; label: string }[] = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'XOF', label: 'XOF (FCFA)' },
];

function useSystemDark(): boolean {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setDark(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return dark;
}

function AppearanceForm({ initial }: { initial: Preferences }) {
  const [theme, setTheme] = useState<ThemePref>(initial.theme);
  const [language, setLanguage] = useState<LanguagePref>(initial.language);
  const [currency, setCurrency] = useState<CurrencyPref>(initial.currency);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const systemDark = useSystemDark();

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ state: 'saving' });
    try {
      const saved = await settingsApi.updatePreferences({ theme, language, currency });
      storeThemePref(saved.theme);
      setStatus({ state: 'saved' });
    } catch (err) {
      setStatus({ state: 'error', message: errorText(err) });
    }
  };

  return (
    <form onSubmit={save}>
      <fieldset>
        <legend className={labelCls}>Theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const on = theme === t.value;
            return (
              <label
                key={t.value}
                className={`cursor-pointer overflow-hidden rounded-[10px] border transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember-text ${
                  on ? 'border-ember-text' : 'border-dash-edge hover:border-dash-edge-strong'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={on}
                  onChange={() => setTheme(t.value)}
                  className="sr-only"
                />
                <div className="relative h-[92px]">
                  {t.value === 'system' ? (
                    <>
                      <div className="absolute inset-0">
                        <MiniStudio theme="light" />
                      </div>
                      <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                        <MiniStudio theme="dark" />
                      </div>
                    </>
                  ) : (
                    <MiniStudio theme={t.value} />
                  )}
                </div>
                <span className="flex items-center gap-2.5 border-t border-dash-line px-3 py-2.5 text-[13px] text-white">
                  <span
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      on ? 'border-trend-orange' : 'border-dash-edge-strong'
                    }`}
                  >
                    {on && <span className="size-2 rounded-full bg-trend-orange" />}
                  </span>
                  {t.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-studio-muted">
          {theme === 'system'
            ? `Follows your device, which is ${resolveTheme('system', systemDark)} right now.`
            : 'Applies to the studio once saved, on every device you sign in on.'}
        </p>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Language"
          hint="The studio is in English for now; this is kept for when French ships."
        >
          <Select value={language} onChange={setLanguage} options={LANGUAGES} />
        </Field>
        <Field
          label="Currency"
          hint="Plans are billed in USD; this is kept for showing local prices later."
        >
          <Select value={currency} onChange={setCurrency} options={CURRENCIES} />
        </Field>
      </div>
      <SaveRow status={status} />
    </form>
  );
}

function AppearanceView() {
  const { prefs, error } = usePreferences();
  return (
    <Panel title="Appearance" description="Choose how TrendED looks for you.">
      {prefs ? <AppearanceForm initial={prefs} /> : <Loading error={error} />}
    </Panel>
  );
}

// ---------------------------------------------------------------- billing + integrations

function BillingView({ summary }: { summary: BillingSummary | null }) {
  return (
    <Panel title="Billing" description="Your plan, credits and invoices.">
      {summary ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-studio-muted">Current plan</p>
            <p className="mt-1 text-[22px] font-semibold text-white">{PLAN_LABEL[summary.plan]}</p>
            <p className="mt-1 text-[13px] text-dash-soft">
              {summary.credits} credit{summary.credits === 1 ? '' : 's'} left · 1 credit ={' '}
              {summary.seconds_per_credit} s of video
            </p>
          </div>
          <Link
            href="/billing"
            className={`inline-flex h-10 items-center rounded-[8px] bg-ember px-4 text-[13px] font-semibold text-on-ember transition hover:bg-ember-strong ${focusRing}`}
          >
            Manage billing
          </Link>
        </div>
      ) : (
        <Loading error={null} />
      )}
    </Panel>
  );
}

const INTEGRATIONS = [
  { name: 'Shopify', what: 'Import products straight from your store.' },
  { name: 'WooCommerce', what: 'Import products straight from your store.' },
  { name: 'TikTok Ads', what: 'Publish finished ads to your ad account.' },
  { name: 'Meta Ads', what: 'Publish finished ads to Facebook and Instagram.' },
];

function IntegrationsView() {
  return (
    <Panel title="Integrations" description="Connect TrendED to the tools you already use.">
      <ul className="divide-y divide-dash-line">
        {INTEGRATIONS.map((i) => (
          <li key={i.name} className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-[13.5px] font-medium text-white">{i.name}</p>
              <p className="mt-0.5 text-[12.5px] text-studio-muted">{i.what}</p>
            </div>
            <span className="shrink-0 rounded-[6px] bg-white/[0.06] px-2 py-1 text-[11.5px] text-dash-soft">
              Not available yet
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// ---------------------------------------------------------------- page

// Install tickets already redeemed in this page load: React StrictMode runs effects twice.
const redeemed = new Set<string>();

function Settings() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [section, setSection] = useState<SectionId>('account');
  const [callback, setCallback] = useState<ReturnType<typeof readShopifyCallback>>(null);
  const [notice, setNotice] = useState<StoresNotice>(null);
  // The Shopify callback carries a one-time install ticket: take it into memory, strip it from
  // the URL, and render nothing (so nothing loads) until the URL is clean.
  const query = params.toString();
  const inUrl = readShopifyCallback(query) !== null;

  useEffect(() => {
    const cb = readShopifyCallback(query);
    if (!cb) return;
    router.replace('/settings#stores', { scroll: false });
    /* eslint-disable react-hooks/set-state-in-effect -- the URL is the source, read once */
    setCallback(cb);
    setSection('stores');
    if (cb.kind === 'error') setNotice({ tone: 'danger', text: shopifyErrorText(cb.reason) });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [query, router]);

  // Redeem the ticket once, only for a signed-in user (it is bound to the account that started it).
  const ticket = callback?.kind === 'confirm' ? callback.ticket : null;
  useEffect(() => {
    if (!ticket || !isAuthenticated || redeemed.has(ticket)) return;
    redeemed.add(ticket);
    shopifyApi.confirmInstall(ticket).then(
      (store) => setNotice({ tone: 'success', text: `Store connected: ${store.shop_domain}.` }),
      (err) => setNotice({ tone: 'danger', text: shopifyErrorText(shopifyErrorCode(err)) }),
    );
  }, [ticket, isAuthenticated]);

  // One view per area, addressable as /settings#appearance.
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1);
      if (isSection(h)) setSection(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  if (inUrl) return null;

  if (ticket && !isLoading && !isAuthenticated) {
    // Never through the login redirect: the user restarts the install once signed in.
    return (
      <main className="flex min-h-dvh items-center justify-center bg-studio-ground px-4">
        <div className="max-w-[420px] rounded-[12px] border border-studio-rule bg-studio-surface p-6">
          <h1 className="text-[18px] font-semibold text-studio-text">
            Log in, then connect the store again
          </h1>
          <p className="mt-2 text-[13px] text-studio-muted">
            The Shopify install could not be finished because you are signed out. Log in, open
            Settings, Stores, and connect the store again.
          </p>
          <Link
            href="/login"
            className={`mt-5 inline-flex h-[38px] items-center rounded-[10px] bg-trend-orange px-4 text-[13px] font-semibold text-on-accent transition hover:bg-trend-orange-strong ${focusRing}`}
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <DashShell>
      {({ summary }) => (
        <main className="px-5 pb-10 lg:pr-8 lg:pl-9">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">Settings</h1>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
            <nav
              aria-label="Settings sections"
              className="-mx-5 flex gap-1 overflow-x-auto px-5 lg:sticky lg:top-6 lg:mx-0 lg:w-[220px] lg:shrink-0 lg:flex-col lg:rounded-[12px] lg:border lg:border-dash-line lg:bg-dash-panel lg:p-2"
            >
              {SECTIONS.map(({ id, label, Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={section === id ? 'page' : undefined}
                  className={`flex h-10 shrink-0 items-center gap-3 rounded-[8px] px-3 text-[13px] whitespace-nowrap transition ${
                    section === id
                      ? 'bg-ember/10 text-ember-text'
                      : 'text-dash-soft hover:bg-white/[0.04] hover:text-white'
                  } ${focusRing}`}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.7} aria-hidden />
                  {label}
                </a>
              ))}
            </nav>
            <div className="min-w-0 flex-1 lg:max-w-[860px]">
              {section === 'account' && <AccountView />}
              {section === 'profile' && <ProfileView />}
              {section === 'store' && <StoreView />}
              {section === 'stores' && <StoresSection notice={notice} />}
              {section === 'notifications' && <NotificationsView />}
              {section === 'billing' && <BillingView summary={summary} />}
              {section === 'integrations' && <IntegrationsView />}
              {section === 'appearance' && <AppearanceView />}
            </div>
          </div>
        </main>
      )}
    </DashShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <Settings />
    </Suspense>
  );
}
