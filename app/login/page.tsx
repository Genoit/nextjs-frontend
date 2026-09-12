'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { ApiRequestError } from '../../lib/api';
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  TrendedBrandLogo,
} from '../../components/Icons';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="w-full max-w-[420px] space-y-6">
      {/* Mobile logo when left panel is hidden */}
      <div className="lg:hidden mb-4 flex justify-center">
        <TrendedBrandLogo />
      </div>

      <div className="text-left">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
        <p className="mt-1 text-sm text-zinc-500">Sign in to continue to TrendED.</p>
      </div>

      {justRegistered && (
        <div
          role="status"
          className="rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-200"
        >
          Account created successfully! You can now log in.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-200"
        >
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-800 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
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
              className="block w-full rounded-lg border border-zinc-300 pl-10 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-800 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
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
              className="block w-full rounded-lg border border-zinc-300 pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-[#E85022] focus:ring-[#E85022]"
            />
            <span className="text-zinc-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-[#E85022] hover:text-[#D44317] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#E85022] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#D44317] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85022] disabled:opacity-50 transition"
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
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-zinc-400 font-medium">OR</span>
        </div>
      </div>

      {/* Google login button */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
      >
        <GoogleIcon className="h-5 w-5" />
        <span>Continue with Google</span>
      </button>

      {/* Bottom link */}
      <div className="text-center text-sm text-zinc-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-[#E85022] hover:text-[#D44317] hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left visual showcase panel - faithfully matching Figma mockup */}
      <div className="hidden lg:flex flex-col justify-between bg-[#FAF7F0] p-8 xl:p-12 relative overflow-hidden border-r border-amber-950/5">
        {/* Brand logo at top */}
        <div className="z-10">
          <TrendedBrandLogo />
        </div>

        {/* Centerpiece with Typography & UGC phone preview */}
        <div className="z-10 my-auto grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6 space-y-4">
            <h1 className="text-4xl xl:text-5xl font-serif font-bold text-zinc-900 leading-tight">
              <span className="italic block font-normal text-5xl xl:text-6xl text-zinc-900 mb-1 font-serif">
                Create.
              </span>
              Convert. Grow<span className="text-[#E85022]">.</span>
            </h1>

            <p className="text-sm xl:text-base text-zinc-600 font-medium leading-relaxed">
              Turn your products into scroll-stopping UGC videos with AI.
            </p>

            <div className="pt-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600 text-xs">
                  ✨
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    AI-Powered UGC
                  </p>
                  <p className="text-xs text-zinc-500">
                    Real people. Real results. Made for conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smartphone mockup */}
          <div className="col-span-6 relative flex justify-center items-center">
            {/* Ambient circular orbit */}
            <div className="absolute h-80 w-80 rounded-full border border-dashed border-amber-300/40 pointer-events-none" />

            <div className="relative rounded-[2rem] p-1.5 bg-zinc-900 shadow-2xl shadow-amber-900/10 max-w-[210px] w-full">
              <Image
                src="/login-phone-exact.png"
                alt="AI UGC Video Preview"
                width={240}
                height={480}
                className="w-full h-auto rounded-[1.7rem] object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom stats banner */}
        <div className="z-10 grid grid-cols-3 gap-2 xl:gap-4 rounded-xl bg-white/95 backdrop-blur p-4 border border-amber-950/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#E85022]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900">50K+</p>
              <p className="text-[11px] text-zinc-500 leading-tight">AI Videos Created</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900">3.2X</p>
              <p className="text-[11px] text-zinc-500 leading-tight">Higher ROAS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900">10K+</p>
              <p className="text-[11px] text-zinc-500 leading-tight">Entrepreneurs Trust</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <Suspense fallback={<div className="text-sm text-zinc-500">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
