'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { tempting } from '../fonts';
import { useAuth } from '../../lib/auth';
import { ApiRequestError } from '../../lib/api';
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  SparkleIcon,
  TrendedBrandLogo,
  TrendingUpIcon,
  UsersGroupIcon,
  VideoCameraIcon,
} from '../../components/Icons';

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
          setError('Google sign-in was cancelled.');
        } else if (code === 'auth/network-request-failed') {
          setError('Network error connecting to Google. Please check your connection.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] space-y-6">
      {/* Mobile logo when left panel is hidden */}
      <div className="lg:hidden mb-4 flex justify-center">
        <TrendedBrandLogo />
      </div>

      <div className="text-left space-y-1">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
        <p className="text-[15px] text-zinc-500">Sign in to continue to TrendED.</p>
      </div>

      {justRegistered && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-200"
        >
          Account created successfully! You can now log in.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200"
        >
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-zinc-800 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <MailIcon className="h-5 w-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="block w-full rounded-xl border border-zinc-200 pl-11 pr-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-zinc-800 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <LockIcon className="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="block w-full rounded-xl border border-zinc-200 pl-11 pr-12 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-[#E0492A] focus:outline-none focus:ring-2 focus:ring-[#E0492A]/15 disabled:opacity-50 transition"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-[#E0492A] focus:ring-[#E0492A]"
            />
            <span className="text-zinc-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="font-medium text-[#E0492A] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#E0492A] px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm hover:bg-[#CF3E20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0492A] disabled:opacity-50 transition"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-zinc-400 font-medium tracking-wider">OR</span>
        </div>
      </div>

      {/* Google login button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition"
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
      <div className="text-center text-sm text-zinc-600 pt-2">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-[#E0492A] hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left visual showcase panel - faithfully matching Figma login_TrendED.jpg */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between bg-[#FAF7F0] p-8 xl:p-12 relative overflow-hidden border-r border-amber-950/5 min-h-screen">
        {/* Subtle background warm radial glow */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />

        {/* Brand logo at top */}
        <div className="z-10">
          <TrendedBrandLogo />
        </div>

        {/* Centerpiece with Typography & UGC phone preview */}
        <div className="z-10 my-auto grid grid-cols-12 gap-6 items-center">
          {/* Typography & AI Badge */}
          <div className="col-span-6 space-y-4 pr-2">
            <div>
              <h1
                className={`${tempting.className} font-tempting text-4xl sm:text-5xl xl:text-6xl font-normal text-zinc-900 leading-[1.3] tracking-wide select-none space-y-2.5`}
              >
                <span className="block">
                  Create<span className="text-[#E0492A]">.</span>
                </span>
                <span className="block pl-6 sm:pl-8 xl:pl-10">
                  Convert<span className="text-[#E0492A]">.</span>
                </span>
                <span className="block pl-12 sm:pl-16 xl:pl-20">
                  Grow<span className="text-[#E0492A]">.</span>
                </span>
              </h1>
            </div>

            <p className="text-sm xl:text-base text-zinc-700 font-normal leading-relaxed max-w-sm">
              Turn your products into
              <br />
              scroll-stopping UGC videos with AI.
            </p>

            <div className="pt-2">
              <div className="w-10 h-0.5 bg-amber-300 rounded-full mb-4" />
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/70 text-amber-500 shadow-sm">
                  <SparkleIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800 tracking-wide uppercase">
                    AI-Powered UGC
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Real people. Real results. Made for conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smartphone mockup with orbit badges & avatars */}
          <div className="col-span-6 relative flex justify-center items-center py-6">
            {/* Ambient circular orbit rings */}
            <div className="absolute h-[320px] w-[320px] xl:h-[350px] xl:w-[350px] rounded-full border-[1.5px] border-amber-300/60 bg-amber-100/10 shadow-[0_0_30px_rgba(251,191,36,0.12)] pointer-events-none" />
            <div className="absolute h-[420px] w-[420px] xl:h-[460px] xl:w-[460px] rounded-full border-[1.2px] border-amber-200/40 bg-amber-50/10 pointer-events-none" />

            {/* Orbit Item 1: Top audio wave badge */}
            <div className="absolute top-0 right-10 xl:right-14 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-amber-950/10 border border-amber-100/80">
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-2 bg-[#F59E0B] rounded-full" />
                <div className="w-0.5 h-3.5 bg-[#F59E0B] rounded-full" />
                <div className="w-0.5 h-5 bg-[#F59E0B] rounded-full" />
                <div className="w-0.5 h-3 bg-[#F59E0B] rounded-full" />
                <div className="w-0.5 h-1.5 bg-[#F59E0B] rounded-full" />
              </div>
            </div>

            {/* Orbit Item 2: Right avatar (man grey tee thumbs up) */}
            <div className="absolute top-1/2 -right-3 xl:-right-5 -translate-y-1/2 z-20">
              <div className="h-12 w-12 xl:h-14 xl:w-14 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-amber-950/15">
                <Image
                  src="/login-profile.jpg"
                  alt="Creator avatar"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Orbit Item 3: Bottom-right avatar (man grey hoodie) */}
            <div className="absolute bottom-2 right-6 xl:right-8 z-20">
              <div className="h-12 w-12 xl:h-14 xl:w-14 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-amber-950/15">
                <Image
                  src="/login-profile-2.jpg"
                  alt="Creator avatar"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Orbit Item 4: Bottom-left avatar (smiling woman) */}
            <div className="absolute bottom-4 left-0 xl:left-2 z-20">
              <div className="h-12 w-12 xl:h-14 xl:w-14 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-amber-950/15">
                <Image
                  src="/profile1-login.jpg"
                  alt="Creator avatar"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Smartphone preview - slightly larger and framed with a darker outline for a lifted overlay effect */}
            <div className="relative max-w-[210px] xl:max-w-[235px] w-full z-10 rounded-[2rem] overflow-hidden border-[3px] border-[#1F2937] shadow-[0_35px_70px_-22px_rgba(15,23,42,0.55)] translate-y-1">
              <Image
                src="/login-phone-exact.jpg"
                alt="AI UGC Video Preview"
                width={260}
                height={520}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
          <div className="absolute h-[320px] w-[320px] xl:h-[350px] xl:w-[350px] rounded-full border border-amber-300/35 pointer-events-none" />
          <div className="absolute h-[420px] w-[420px] xl:h-[460px] xl:w-[460px] rounded-full border border-amber-200/20 pointer-events-none" />
        </div>

        {/* Bottom stats banner */}
        <div className="z-10 grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 sm:p-5 border border-amber-950/5 shadow-md shadow-amber-950/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100/60 text-[#E0492A]">
              <VideoCameraIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base xl:text-lg font-bold text-zinc-900 leading-none">50K+</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-tight">AI Videos Created</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100/60 text-amber-500">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base xl:text-lg font-bold text-zinc-900 leading-none">3.2X</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-tight">Higher ROAS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-100/60 text-orange-500">
              <UsersGroupIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base xl:text-lg font-bold text-zinc-900 leading-none">10K+</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                Entrepreneurs Trust TrendED
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-12 xl:p-16 min-h-screen">
        <Suspense fallback={<div className="text-sm text-zinc-500">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
