'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caveat, tempting } from '../fonts';
import { getPostAuthenticationPath, useAuth } from '../../lib/auth';
import { api } from '../../lib/api/core';
import { completeGoogleRedirectSignIn } from '../../lib/firebase/auth';
import { getAuthErrorMessage } from '../../lib/auth-errors';
import {
  CaptionsIcon,
  ChatScriptIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  MusicIcon,
  TrendedBrandLogo,
  UserIcon,
  VoiceoverIcon,
} from '../../components/Icons';
import ThemeToggle from '../../components/ThemeToggle';

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithGoogleRedirect } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const finalizeGoogleRedirect = async () => {
      try {
        const redirectResult = await completeGoogleRedirectSignIn();
        if (!redirectResult || isCancelled) {
          return;
        }

        const data = await api.loginWithGoogle(redirectResult.idToken);
        localStorage.setItem('trended_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('trended_refresh_token', data.refresh_token);
        }
        if (!isCancelled) {
          router.push(getPostAuthenticationPath(data.user));
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Google redirect login failed on register page:', err);
          setError(
            getAuthErrorMessage(err, 'Google sign-in could not be completed. Please try again.'),
          );
        }
      } finally {
        if (!isCancelled) {
          setIsGoogleLoading(false);
        }
      }
    };

    finalizeGoogleRedirect();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogle();
      router.push(getPostAuthenticationPath(result.user));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Google sign-in failed. Please try again.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogleRedirect();
    } catch {
      setIsGoogleLoading(false);
      setError('Could not redirect to Google. Please check your browser settings.');
    }
  };

  // Compute password strength indicator matching Figma
  const passwordStrength = useMemo(() => {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    const validCount = checks.filter(Boolean).length;

    if (!password) {
      return { score: 2, label: 'Medium strength' };
    }
    if (validCount <= 1) return { score: 1, label: 'Weak' };
    if (validCount === 2 || validCount === 3) return { score: 2, label: 'Medium strength' };
    return { score: 4, label: 'Strong' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });

      router.push('/login?registered=true');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Registration failed. Please check your inputs.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-studio-ground overflow-y-auto lg:overflow-hidden">
      {/* Left visual showcase panel - faithfully matching Figma Register_TrendED.jpg */}
      <div className="hidden lg:flex flex-col justify-between bg-cream p-6 xl:p-10 relative overflow-hidden border-r border-line h-full">
        {/* Ambient subtle background decorative arcs */}
        <div className="absolute top-1/4 -right-16 h-[500px] w-[500px] rounded-full border border-amber-300/15 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 h-[700px] w-[700px] rounded-full border border-amber-300/15 pointer-events-none" />

        {/* Brand logo at top */}
        <div className="z-10">
          <TrendedBrandLogo />
        </div>

        {/* Centerpiece typography & UGC pipeline visual */}
        <div className="z-10 my-auto space-y-4 xl:space-y-5">
          {/* Typography */}
          <div className="space-y-1.5">
            <h1 className="select-none tracking-normal">
              <span
                className={`${tempting.className} block text-3xl sm:text-4xl xl:text-5xl text-ink leading-[1.15]`}
              >
                Your next
              </span>
              <span
                className={`${caveat.className} block text-4xl sm:text-5xl xl:text-6xl text-trend-orange font-bold italic leading-[1.05] pl-6 sm:pl-10 xl:pl-12`}
              >
                winning creative
              </span>
              <span
                className={`${tempting.className} block text-3xl sm:text-4xl xl:text-5xl text-ink leading-[1.15] pl-14 sm:pl-20 xl:pl-24`}
              >
                starts here.
              </span>
            </h1>

            <div className="pt-1 pl-14 sm:pl-20 xl:pl-24">
              <Image
                src="/register-arrow.png"
                alt="arrow decoration"
                width={90}
                height={10}
                className="w-16 sm:w-20 h-auto object-contain select-none opacity-85"
              />
            </div>

            <p className="text-xs sm:text-sm text-ink-soft font-normal leading-relaxed pt-1 max-w-sm">
              Create professional UGC advertising videos faster with AI.
            </p>
          </div>

          {/* Pipeline visual diagram: Product -> AI+ & Features -> Creator Phone */}
          <div className="relative flex items-center justify-start gap-2.5 sm:gap-3.5 xl:gap-4 py-2">
            {/* Step 1: Product card */}
            <div className="flex flex-col items-center justify-between rounded-2xl bg-studio-surface p-2.5 sm:p-3 shadow-sm border border-line w-24 sm:w-28 xl:w-32 h-44 sm:h-48 shrink-0">
              <span className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
                Product
              </span>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-auto flex items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-line/60 p-1">
                <Image
                  src="/headphones-clean.jpg"
                  alt="Product Headphones"
                  width={140}
                  height={140}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-ink-muted/30" />
                <div className="w-4 h-1.5 rounded-full bg-trend-orange" />
                <div className="w-1.5 h-1.5 rounded-full bg-ink-muted/30" />
              </div>
            </div>

            {/* Dotted line with arrow to AI Badge */}
            <div className="flex items-center shrink-0">
              <div className="w-3 sm:w-5 border-t-2 border-dashed border-amber-400/50" />
              <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-trend-orange" />
            </div>

            {/* Step 2: Middle column with AI+ badge & feature list */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {/* AI+ badge */}
              <div className="flex items-center justify-center rounded-2xl bg-studio-surface px-3.5 py-1.5 shadow-sm border border-line">
                <span className="text-lg sm:text-xl font-black text-trend-orange tracking-tight flex items-baseline">
                  AI<span className="text-sm font-bold text-trend-orange ml-0.5">+</span>
                </span>
              </div>

              {/* Vertical dotted line */}
              <div className="h-3 border-l-2 border-dashed border-amber-400/50" />

              {/* Feature list card */}
              <div className="rounded-2xl bg-studio-surface p-2.5 sm:p-3 shadow-sm border border-line space-y-1.5 min-w-[135px] sm:min-w-[150px]">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-ink">
                  <span className="text-trend-orange shrink-0">
                    <ChatScriptIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>AI Script</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-ink">
                  <span className="text-trend-orange shrink-0">
                    <CaptionsIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>Auto Captions</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-ink">
                  <span className="text-trend-orange shrink-0">
                    <VoiceoverIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>Voiceover</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-ink">
                  <span className="text-trend-orange shrink-0">
                    <MusicIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>Music & SFX</span>
                </div>
              </div>
            </div>

            {/* Dotted line with arrow to Phone */}
            <div className="flex items-center shrink-0">
              <div className="w-3 sm:w-5 border-t-2 border-dashed border-amber-400/50" />
              <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-trend-orange" />
            </div>

            {/* Step 3: Creator phone preview */}
            <div className="rounded-[1.4rem] sm:rounded-[1.8rem] border-[3px] border-zinc-900/80 dark:border-zinc-700/80 shadow-xl overflow-hidden w-32 sm:w-38 xl:w-42 shrink-0">
              <Image
                src="/register-phone-exact.jpg"
                alt="Creator UGC Video"
                width={240}
                height={480}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Bottom badge */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-studio-surface/90 px-3 py-2 shadow-sm border border-line">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-ink-soft">
              Generate scroll-stopping UGC videos in minutes.
            </span>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="z-10 h-0" />
      </div>

      {/* Right side form */}
      <div className="relative flex flex-col justify-center items-center px-6 py-6 sm:px-10 lg:px-8 xl:px-12 h-full overflow-y-auto lg:overflow-hidden">
        <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20" />
        <div className="w-full max-w-[420px] space-y-3.5 my-auto">
          {/* Mobile logo when left panel is hidden */}
          <div className="lg:hidden mb-2 flex justify-center">
            <TrendedBrandLogo />
          </div>

          <div className="text-left space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">Start creating with TrendED.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-danger-soft p-2.5 text-xs sm:text-sm text-danger border border-danger/30 space-y-1.5"
            >
              <p>{error}</p>
              {(error.includes('popup') ||
                error.includes('redirect') ||
                error.includes('storage') ||
                error.includes('cookies')) && (
                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="text-xs font-semibold text-trend-orange hover:underline block"
                >
                  Retry with page redirect →
                </button>
              )}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-line bg-studio-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/15 disabled:opacity-50 transition shadow-sm"
                  placeholder="First name"
                />
              </div>

              <div className="relative">
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-line bg-studio-surface pl-3 pr-9 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/15 disabled:opacity-50 transition shadow-sm"
                  placeholder="Last name"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted">
                  <UserIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="block w-full rounded-xl border border-line bg-studio-surface pl-3 pr-9 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/15 disabled:opacity-50 transition shadow-sm"
                placeholder="Email address"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted">
                <MailIcon className="h-4 w-4" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-line bg-studio-surface pl-3 pr-14 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/15 disabled:opacity-50 transition shadow-sm"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2 text-ink-muted">
                  <LockIcon className="h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-ink-soft focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator bars matching Figma */}
              <div className="mt-1.5 flex items-center justify-between px-0.5">
                <div className="flex gap-1.5 w-28 sm:w-32">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        (password ? passwordStrength.score : 2) >= step
                          ? 'bg-amber-400'
                          : 'bg-studio-rule-strong'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-normal text-ink-muted">
                  {password ? passwordStrength.label : 'Medium strength'}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="block w-full rounded-xl border border-line bg-studio-surface pl-3 pr-14 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-trend-orange focus:outline-none focus:ring-2 focus:ring-trend-orange/15 disabled:opacity-50 transition shadow-sm"
                placeholder="Confirm password"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2 text-ink-muted">
                <LockIcon className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-ink-soft focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] sm:text-xs text-ink-soft leading-tight">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-line text-trend-orange focus:ring-trend-orange"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-trend-orange hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-trend-orange hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-trend-orange px-4 py-2.5 text-sm font-semibold text-on-accent shadow-sm hover:bg-trend-orange-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange disabled:opacity-50 transition mt-1"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-studio-ground px-3 text-ink-muted font-medium tracking-wider text-[11px]">
                OR
              </span>
            </div>
          </div>

          {/* Google signup button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-studio-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-studio-hover disabled:opacity-50 transition"
          >
            {isGoogleLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-muted/50 border-t-transparent" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Bottom link */}
          <div className="text-center text-xs sm:text-sm text-ink-soft pt-1">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-trend-orange hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
