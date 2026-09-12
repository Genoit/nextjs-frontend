'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { ApiRequestError } from '../../lib/api';
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  TrendedBrandLogo,
  UserIcon,
} from '../../components/Icons';

export default function RegisterPage() {
  const { register } = useAuth();
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

  // Compute password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak' };
    if (score === 2) return { score: 2, label: 'Fair' };
    if (score === 3) return { score: 3, label: 'Medium strength' };
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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left visual showcase panel - matching Figma Register_TrendED.jpg */}
      <div className="hidden lg:flex flex-col justify-between bg-[#FAF7F0] p-8 xl:p-12 relative overflow-hidden border-r border-amber-950/5">
        {/* Brand logo at top */}
        <div className="z-10">
          <TrendedBrandLogo />
        </div>

        {/* Centerpiece typography & UGC pipeline visual */}
        <div className="z-10 my-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl xl:text-5xl font-serif font-bold text-zinc-900 leading-tight">
              Your next
              <br />
              <span className="italic font-normal text-[#E85022] font-serif text-4xl xl:text-5xl">
                winning creative
              </span>
              <br />
              starts here.
            </h1>

            <p className="text-sm xl:text-base text-zinc-600 font-medium">
              Create professional UGC advertising videos faster with AI.
            </p>
          </div>

          {/* Pipeline visual diagram with Product + AI badge + features + Phone */}
          <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm p-5 border border-amber-950/10 shadow-sm flex items-center justify-between gap-3">
            {/* Product card */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-zinc-100 shadow-sm w-28 shrink-0">
              <span className="text-[11px] font-semibold text-zinc-500 mb-1">Product</span>
              <Image
                src="/register-product.png"
                alt="Product"
                width={80}
                height={80}
                className="h-16 w-16 object-contain"
              />
            </div>

            {/* Arrow with AI+ badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#E85022] text-white font-bold text-sm shadow-sm">
                AI<span className="text-xs -mt-1">+</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium mt-1">Pipeline</span>
            </div>

            {/* AI Capabilities checklist */}
            <div className="space-y-1.5 text-xs text-zinc-700">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-[#E85022]">💬</span>
                <span>AI Script</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-[#E85022]">🔤</span>
                <span>Auto Captions</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-[#E85022]">🎙️</span>
                <span>Voiceover</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-[#E85022]">🎵</span>
                <span>Music & SFX</span>
              </div>
            </div>

            {/* Creator phone preview */}
            <div className="rounded-[1.4rem] p-1 bg-zinc-900 shadow-xl w-28 shrink-0">
              <Image
                src="/register-phone-exact.png"
                alt="Creator UGC"
                width={120}
                height={220}
                className="w-full h-auto rounded-[1.2rem] object-cover"
              />
            </div>
          </div>

          {/* Bottom badge */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 border border-amber-200/70">
            <span className="text-amber-500 text-sm">⚡</span>
            Generate scroll-stopping UGC videos in minutes.
          </div>
        </div>

        {/* Bottom subtle copyright / tagline */}
        <div className="z-10 text-xs text-zinc-400">
          © {new Date().getFullYear()} TrendED Inc. Built for e-commerce growth.
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-5">
          {/* Mobile logo when left panel is hidden */}
          <div className="lg:hidden mb-4 flex justify-center">
            <TrendedBrandLogo />
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Create your account</h2>
            <p className="mt-1 text-sm text-zinc-500">Start creating with TrendED.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-200"
            >
              {error}
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-xs font-medium text-zinc-700 mb-1"
                >
                  First name
                </label>
                <div className="relative">
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="last-name" className="block text-xs font-medium text-zinc-700 mb-1">
                  Last name
                </label>
                <div className="relative">
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-lg border border-zinc-300 pl-3 pr-9 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
                    placeholder="Last name"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-lg border border-zinc-300 pl-3 pr-9 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
                  placeholder="Email address"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
                  <MailIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-lg border border-zinc-300 pl-3 pr-16 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1.5 text-zinc-400">
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

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1.5 w-32">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.score >= step
                            ? passwordStrength.score >= 3
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                            : 'bg-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-lg border border-zinc-300 pl-3 pr-16 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#E85022] focus:outline-none focus:ring-1 focus:ring-[#E85022] disabled:opacity-50"
                  placeholder="Confirm password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1.5 text-zinc-400">
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
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-zinc-600">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#E85022] focus:ring-[#E85022] mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#E85022] hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#E85022] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#E85022] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#D44317] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85022] disabled:opacity-50 transition mt-2"
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
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-zinc-400 font-medium">OR</span>
            </div>
          </div>

          {/* Google signup button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          {/* Bottom link */}
          <div className="text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#E85022] hover:text-[#D44317] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
