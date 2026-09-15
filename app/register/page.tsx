'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tempting } from '../fonts';
import { useAuth } from '../../lib/auth';
import { ApiRequestError } from '../../lib/api';
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

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setError(
            'An account already exists with this email. Please sign in using your existing authentication method.',
          );
        } else {
          setError(err.message || 'Google sign-in failed. Please try again.');
        }
      } else if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/popup-closed-by-user') {
          setError(
            'Google sign-in was cancelled or the popup was closed before completing. If you did not close it, check if your browser or an extension blocked the window or cross-site cookies.',
          );
        } else if (code === 'auth/network-request-failed') {
          setError('Network error connecting to Google. Please check your connection.');
        } else if (
          code === 'auth/configuration-not-found' ||
          code === 'auth/operation-not-allowed' ||
          code === 'auth/unauthorized-domain'
        ) {
          setError(
            'Google sign-in is not configured correctly in Firebase. Please check the project settings and authorized domains.',
          );
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      } else {
        setError('Google sign-in failed. Please try again later.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Compute password strength
  const passwordStrength = useMemo(() => {
    const checks = [
      { label: 'At least 8 characters', ok: password.length >= 8 },
      { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
      { label: 'One number', ok: /[0-9]/.test(password) },
      { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
    ];

    const validCount = checks.filter((check) => check.ok).length;

    if (!password) {
      return {
        score: 0,
        label: 'Medium strength',
        checks,
      };
    }

    if (validCount <= 1) return { score: 1, label: 'Weak', checks };
    if (validCount === 2) return { score: 2, label: 'Medium strength', checks };
    if (validCount === 3) return { score: 3, label: 'Medium strength', checks };
    return { score: 4, label: 'Strong', checks };
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
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setError('An account with this email already exists.');
        } else {
          setError(err.message || 'Registration failed. Please check your inputs.');
        }
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left visual showcase panel - faithfully matching Figma Register_TrendED.jpg */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-start gap-8 bg-[#FAF7F0] p-8 xl:p-10 relative overflow-hidden border-r border-amber-950/5 min-h-screen">
        {/* Ambient subtle background decorative arcs */}
        <div className="absolute top-1/4 -right-16 h-[500px] w-[500px] rounded-full border border-amber-300/20 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 h-[700px] w-[700px] rounded-full border border-amber-200/15 pointer-events-none" />

        {/* Brand logo at top */}
        <div className="z-10">
          <TrendedBrandLogo />
        </div>

        {/* Centerpiece typography & UGC pipeline visual */}
        <div className="z-10 mt-2 space-y-5 xl:space-y-6">
          <div className="space-y-2">
            <h1
              className={`${tempting.className} font-tempting text-4xl sm:text-5xl xl:text-6xl font-normal text-zinc-900 leading-[1.3] tracking-wide select-none space-y-2.5`}
            >
              <span className="block">Your next</span>
              <span className="block pl-8 sm:pl-12 xl:pl-16 text-[#DE4D18]">winning creative</span>
              <span className="block pl-16 sm:pl-24 xl:pl-32">starts here.</span>
            </h1>

            <div className="pt-1">
              <Image
                src="/register-arrow.png"
                alt="arrow decoration"
                width={111}
                height={11}
                className="w-24 h-auto object-contain select-none"
              />
            </div>

            <p className="text-sm xl:text-base text-zinc-600 font-normal leading-relaxed pt-2 max-w-sm">
              Create professional UGC advertising videos faster with AI.
            </p>
          </div>

          {/* Pipeline visual diagram with Product + AI badge + features + Phone */}
          <div className="relative flex items-center justify-start gap-5 xl:gap-7 py-5 scale-[1.18] origin-left">
            {/* Step 1: Product card */}
            <div className="flex flex-col items-center justify-between rounded-[1.7rem] bg-white p-4 xl:p-5 shadow-sm border border-zinc-100/90 w-40 sm:w-44 h-60 shrink-0">
              <span className="text-[12px] font-semibold text-zinc-400">Product</span>
              <div className="relative w-28 h-36 my-auto flex items-center justify-center">
                <Image
                  src="/register-product-card.png"
                  alt="Product Headphones"
                  width={180}
                  height={200}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Dotted line with arrow to Logo Symbol */}
            <div className="flex items-center shrink-0">
              <div className="w-8 xl:w-12 border-t-[3px] border-dashed border-amber-300" />
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-amber-400" />
            </div>

            {/* Step 2: Middle column with Logo Symbol badge & feature list */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              {/* Logo symbol badge */}
              <div className="flex items-center justify-center rounded-[1.6rem] bg-white p-3.5 shadow-sm border border-zinc-100/90">
                <Image
                  src="/symbol.png"
                  alt="TrendED Logo Symbol"
                  width={56}
                  height={56}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                  priority
                />
              </div>

              {/* Vertical dotted line */}
              <div className="h-5 border-l-[3px] border-dashed border-amber-300" />

              {/* Feature list card */}
              <div className="rounded-[1.6rem] bg-white p-4 xl:p-5 shadow-sm border border-zinc-100/90 space-y-3 min-w-[190px] xl:min-w-[210px]">
                <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-800">
                  <span className="text-[#E0492A]">
                    <ChatScriptIcon className="h-5 w-5" />
                  </span>
                  <span>AI Script</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-800">
                  <span className="text-[#E0492A]">
                    <CaptionsIcon className="h-5 w-5" />
                  </span>
                  <span>Auto Captions</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-800">
                  <span className="text-[#E0492A]">
                    <VoiceoverIcon className="h-5 w-5" />
                  </span>
                  <span>Voiceover</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-800">
                  <span className="text-[#E0492A]">
                    <MusicIcon className="h-5 w-5" />
                  </span>
                  <span>Music & SFX</span>
                </div>
              </div>
            </div>

            {/* Dotted line with arrow to Phone */}
            <div className="flex items-center shrink-0">
              <div className="w-8 xl:w-12 border-t-[3px] border-dashed border-amber-300" />
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-amber-400" />
            </div>

            {/* Step 3: Creator phone preview */}
            <div className="rounded-[2.1rem] border-[3px] border-[#1F2937] shadow-[0_35px_70px_-22px_rgba(15,23,42,0.55)] overflow-hidden w-48 sm:w-56 xl:w-64 shrink-0 translate-y-1">
              <Image
                src="/register-phone-exact.jpg"
                alt="Creator UGC Video"
                width={260}
                height={520}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Bottom badge */}
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white p-3 pr-5 shadow-sm border border-amber-950/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/70 text-amber-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-700">
              Generate scroll-stopping UGC videos in minutes.
            </span>
          </div>
        </div>

        {/* Clean bottom spacer (mockup has no copyright footer) */}
        <div className="z-10 h-0" />
      </div>

      {/* Right side form */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-12 xl:p-16 min-h-screen">
        <div className="w-full max-w-[430px] space-y-5">
          {/* Mobile logo when left panel is hidden */}
          <div className="lg:hidden mb-4 flex justify-center">
            <TrendedBrandLogo />
          </div>

          <div className="text-left space-y-1">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Create your account</h2>
            <p className="text-base text-zinc-500">Start creating with TrendED.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-3.5 text-base text-red-700 border border-red-200"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name & Last Name (Side by side, Last Name has user icon on right) */}
            <div className="grid grid-cols-2 gap-3">
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
                  className="block w-full rounded-xl border border-zinc-200 px-3.5 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
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
                  className="block w-full rounded-xl border border-zinc-200 pl-3.5 pr-10 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
                  placeholder="Last name"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400">
                  <UserIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Email Address (Mail icon on right) */}
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
                className="block w-full rounded-xl border border-zinc-200 pl-3.5 pr-10 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
                placeholder="Email address"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400">
                <MailIcon className="h-4 w-4" />
              </div>
            </div>

            {/* Password (Lock + Eye icon on right) */}
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
                  className="block w-full rounded-xl border border-zinc-200 pl-3.5 pr-16 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 gap-2 text-zinc-400">
                  <LockIcon className="h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator bars matching mockup */}
              <div className="mt-2.5 flex items-center justify-between px-0.5">
                <div className="flex gap-1.5 w-32">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        (password ? passwordStrength.score : 2) >= step
                          ? 'bg-amber-400'
                          : 'bg-zinc-200'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs font-normal ${
                    passwordStrength.label === 'Strong' ? 'text-emerald-600' : 'text-zinc-400'
                  }`}
                >
                  {password ? passwordStrength.label : 'Medium strength'}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {passwordStrength.checks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        check.ok
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}
                    >
                      {check.ok ? '✓' : '•'}
                    </span>
                    <span className={check.ok ? 'text-emerald-600' : 'text-zinc-500'}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password (Lock + Eye icon on right) */}
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
                className="block w-full rounded-xl border border-zinc-200 pl-3.5 pr-16 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
                placeholder="Confirm password"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 gap-2 text-zinc-400">
                <LockIcon className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-zinc-600 focus:outline-none"
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
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-zinc-600">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#E0492A] focus:ring-[#E0492A]"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#E0492A] hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#E0492A] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#E0492A] px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#CF3E20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0492A] disabled:opacity-50 transition mt-2"
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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-zinc-400 font-medium tracking-wider">OR</span>
            </div>
          </div>

          {/* Google signup button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition"
          >
            {isGoogleLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
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
          <div className="text-center text-base text-zinc-600 pt-1">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#E0492A] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
