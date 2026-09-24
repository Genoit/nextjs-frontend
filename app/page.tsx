'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Ban,
  Check,
  Clock3,
  FileText,
  Heart,
  Lightbulb,
  MessageSquareText,
  Package,
  PenTool,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Upload,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { SparkleIcon, TrendedBrandLogo } from '../components/Icons';

function AnimatedStat({
  target,
  suffix,
  decimals = 0,
  duration = 1600,
  className,
}: {
  target: number;
  suffix: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration, target]);

  return (
    <span className={className}>
      {Number(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeCreatorIndex, setActiveCreatorIndex] = useState<number>(0);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');

  // Multi-platform items data
  const platformList = [
    {
      id: 'tiktok',
      name: 'TikTok',
      ratio: '9:16',
      tagline: 'Blend anywhere. Fuel everywhere. Game changer.',
      views: '12.4K',
      badge: 'Hook optimized',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.41a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 9.07 5.67c2.97-1.55 3.93-4.63 3.93-7.66V8.22a8.28 8.28 0 0 0 3.45 1.54V6.69z" />
        </svg>
      ),
    },
    {
      id: 'reels',
      name: 'Instagram Reels',
      ratio: '9:16',
      tagline: 'Your daily boost, blended to go.',
      views: '2.4K',
      badge: 'Captions included',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      ratio: '1:1',
      tagline: 'Small size. Big impact.',
      views: '2.1K',
      badge: 'CTA adapted',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube Shorts',
      ratio: '9:16',
      tagline: 'Quick blend. Real results.',
      views: '3.8K',
      badge: 'Hook optimized',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  // AI UGC creators data
  const creators = [
    {
      id: '01',
      name: 'Sarah',
      handle: '@sarah.daily',
      avatar: '/login-profile.jpg',
      hookText: 'This bottle changed my daily routine.',
      caption: 'Finally a bottle that keeps up with my lifestyle.',
      stats: { likes: '12.4K', comments: '231', shares: '862' },
      time: '00:12 / 00:30',
      tone: 'Warm & Natural',
    },
    {
      id: '02',
      name: 'Matt',
      handle: '@matt.moves',
      avatar: '/login-profile-2.jpg',
      hookText: "Here's why I'll never go back.",
      caption: 'Insulated. Durable. Stylish. Built different.',
      stats: { likes: '8.7K', comments: '156', shares: '532' },
      time: '00:18 / 00:30',
      tone: 'Energetic & Confident',
    },
    {
      id: '03',
      name: 'Leanne',
      handle: '@leanne.fitlife',
      avatar: '/profile1-login.jpg',
      hookText: 'If you want better hydration, start here.',
      caption: 'My go-to bottle for gym, work and everything in between.',
      stats: { likes: '18.2K', comments: '312', shares: '1.1K' },
      time: '00:14 / 00:30',
      tone: 'Friendly & Casual',
    },
  ];

  // Pricing monthly vs yearly calculations
  const starterPrice = billingCycle === 'yearly' ? 23 : 29;
  const growthPrice = billingCycle === 'yearly' ? 63 : 79;
  const scalePrice = billingCycle === 'yearly' ? 159 : 199;

  const platformBrands = [
    { name: 'TikTok', src: 'https://cdn.simpleicons.org/tiktok/000000', alt: 'TikTok logo' },
    {
      name: 'Instagram',
      src: 'https://cdn.simpleicons.org/instagram/E1306C',
      alt: 'Instagram logo',
    },
    { name: 'Meta', src: 'https://cdn.simpleicons.org/meta/0866FF', alt: 'Meta logo' },
    { name: 'Shopify', src: 'https://cdn.simpleicons.org/shopify/95BF47', alt: 'Shopify logo' },
    { name: 'YouTube', src: 'https://cdn.simpleicons.org/youtube/FF0000', alt: 'YouTube logo' },
    {
      name: 'Pinterest',
      src: 'https://cdn.simpleicons.org/pinterest/BD081C',
      alt: 'Pinterest logo',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#C2410C]/15 selection:text-[#C2410C]">
      {/* ============================================================ */}
      {/* 01 — HERO SECTION                                             */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF7E6]/30 to-white">
        {/* Subtle decorative background light */}
        <div className="absolute top-10 right-1/4 w-[650px] h-[650px] rounded-full bg-[#EAB308]/10 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-0 right-10 w-[500px] h-[500px] rounded-full bg-[#C2410C]/10 blur-3xl pointer-events-none -z-10" />

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-center">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/70 px-3.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm mx-auto">
                <SparkleIcon className="h-3.5 w-3.5 text-[#EAB308]" />
                <span>AI-powered creative platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl xl:text-[5rem] font-extrabold tracking-[-0.06em] text-zinc-950 leading-[0.92] mx-auto max-w-[680px]">
                Turn your products into scroll-stopping{' '}
                <span className="font-editorial italic text-[#C2410C] font-normal tracking-normal">
                  UGC.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-zinc-800 font-bold leading-relaxed max-w-2xl mx-auto">
                Create authentic product videos for TikTok, Instagram and Facebook in minutes —
                without a camera, creator or production team.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="rounded-xl bg-[#C2410C] px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-[#C2410C]/25 hover:bg-[#9A3412] hover:shadow-[#9A3412]/30 transition duration-200 flex items-center gap-2"
                  >
                    <SparkleIcon className="h-4 w-4 text-white" />
                    <span>Go to Dashboard</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {user?.first_name}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="rounded-xl bg-[#C2410C] px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-[#C2410C]/25 hover:bg-[#9A3412] hover:shadow-[#9A3412]/30 transition duration-200 flex items-center gap-2 group"
                  >
                    <SparkleIcon className="h-4 w-4 text-amber-300" />
                    <span>Create your first video</span>
                  </Link>
                )}

                <Link
                  href="#how-it-works"
                  className="rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-base font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition duration-200 flex items-center gap-2 group"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[#C2410C] group-hover:scale-110 transition">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                  <span>See how it works</span>
                </Link>
              </div>

              {/* Reassurance text */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-800 font-bold text-center">
                <svg
                  className="h-4 w-4 text-amber-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>No camera. No studio. No editing skills required.</span>
              </div>
            </div>

            {/* Right Column: Hero Visual from Mockup Cutout */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="relative w-full max-w-[620px] lg:w-[128%] lg:max-w-[790px] lg:-translate-x-4 xl:w-[136%] xl:max-w-[880px] xl:-translate-x-6 drop-shadow-2xl">
                {/* Visual cutout containing central portable blender + UGC video cards + floating tags */}
                <Image
                  src="/landing_page/landing_1_image_a_droite.png"
                  alt="TrendED AI UGC Creative Generator Visual"
                  width={1310}
                  height={1200}
                  priority
                  sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 64vw, 58vw"
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 — SOCIAL PROOF / TRUST SECTION                             */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-white border-y border-zinc-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Headings */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h2 className="font-editorial text-5xl sm:text-6xl lg:text-[4.25rem] leading-[0.95] text-zinc-950 font-normal">
              Built for modern <span className="italic text-[#C2410C]">e-commerce creators.</span>
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg lg:text-xl">
              From your first product idea to your next winning creative.
            </p>
          </div>

          {/* Partner & Platform Row */}
          <div className="relative overflow-hidden bg-transparent py-4">
            <div className="marquee-track flex min-w-max items-center gap-8 sm:gap-10 lg:gap-12 px-4 sm:px-6">
              {[...platformBrands, ...platformBrands].map((platform, index) => (
                <div
                  key={`${platform.name}-${index}`}
                  className="flex min-w-[150px] items-center justify-center gap-3 px-2 py-2 text-zinc-700"
                >
                  <Image
                    src={platform.src}
                    alt={platform.alt}
                    width={36}
                    height={36}
                    unoptimized
                    className="h-8 w-8 object-contain sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                  />
                  <span className="text-sm font-semibold tracking-tight text-zinc-700 sm:text-base lg:text-lg">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .marquee-track {
              animation: marquee 22s linear infinite;
              will-change: transform;
            }
          `}</style>

          {/* 3 Credibility Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-zinc-100 max-w-5xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/80 text-[#EAB308]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <AnimatedStat
                  target={10}
                  suffix="K+"
                  className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-[#C2410C] leading-none"
                />
              </div>
              <p className="text-base lg:text-lg font-medium text-zinc-600">Creatives generated</p>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-x border-zinc-100 pt-6 md:pt-0">
              <div className="flex items-center justify-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/80 text-[#EAB308]">
                  <Clock3 className="h-4 w-4" />
                </span>
                <AnimatedStat
                  target={2.4}
                  suffix="M+"
                  decimals={1}
                  className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-[#C2410C] leading-none"
                />
              </div>
              <p className="text-base lg:text-lg font-medium text-zinc-600">Minutes saved</p>
            </div>

            <div className="space-y-3 border-t md:border-t-0 border-zinc-100 pt-6 md:pt-0">
              <div className="flex items-center justify-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/80 text-[#EAB308]">
                  <BarChart3 className="h-4 w-4" />
                </span>
                <AnimatedStat
                  target={87}
                  suffix="%"
                  className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-[#C2410C] leading-none"
                />
              </div>
              <p className="text-base lg:text-lg font-medium text-zinc-600">
                Faster creative production
              </p>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="max-w-xl mx-auto rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-6 shadow-sm flex items-center gap-5 text-left">
            <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden ring-2 ring-amber-200">
              <Image
                src="/login-profile-2.jpg"
                alt="Alex Morgan"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="text-amber-500 text-lg leading-none font-serif">““</div>
              <p className="text-sm sm:text-base text-zinc-800 font-medium leading-snug">
                TrendED completely changed how quickly we can test new products.
              </p>
              <p className="text-xs text-zinc-500 font-normal">— Alex Morgan, E-commerce Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 — PROBLÈME → SOLUTION                                      */}
      {/* ============================================================ */}
      <section id="problem-solution" className="py-20 bg-gradient-to-b from-white to-[#FFFDF9]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="space-y-10 text-center">
            <div className="flex justify-center">
              <TrendedBrandLogo className="items-center" />
            </div>

            <div className="space-y-3 max-w-5xl mx-auto">
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-[5rem] leading-[0.9] text-zinc-950 font-normal">
                Great products{' '}
                <span className="italic text-[#C2410C]">deserve better creative.</span>
              </h2>
              <p className="text-zinc-600 text-base sm:text-lg lg:text-[1.05rem] italic">
                Traditional product advertising takes too much time, money and coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(140px,0.7fr)_minmax(48px,0.22fr)_minmax(572px,2.7fr)_minmax(140px,0.7fr)] lg:items-end lg:gap-2 xl:grid-cols-[minmax(200px,0.75fr)_minmax(72px,0.28fr)_minmax(692px,2.3fr)_minmax(200px,0.75fr)] xl:gap-3">
              <div className="relative rounded-[1.8rem] border border-zinc-200/80 bg-[#F4F2EE] p-5 lg:p-6 text-left shadow-sm">
                <h3 className="mb-5 text-[1.05rem] sm:text-[1.2rem] font-medium text-zinc-900">
                  Traditional UGC production
                </h3>

                <div className="space-y-4 text-sm sm:text-[0.95rem] font-medium text-zinc-800">
                  {[
                    'Find creator',
                    'Send product',
                    'Wait for filming (weeks)',
                    'Review footage',
                    'Edit',
                    'Publish',
                  ].map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200 shadow-sm">
                        <span className="text-[0.62rem] font-bold">{index + 1}</span>
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-zinc-200 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  High friction · Costly · Weeks per test
                </div>
              </div>

              <div className="mb-[104px] hidden h-7 self-end lg:flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="h-full w-full"
                  viewBox="0 0 100 28"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path d="M3 14H87" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M77 4L88 14L77 24"
                    stroke="#A1A1AA"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex items-end justify-center pt-2 lg:pt-5 xl:translate-x-6">
                <div className="relative h-[248px] w-[160px] shrink-0 overflow-hidden rounded-[1.7rem] border border-zinc-200 bg-[#E9E2D9] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <Image
                    src="/landing_page/landing_3_product.png"
                    alt="Product bottle"
                    width={180}
                    height={248}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <svg
                  aria-hidden="true"
                  className="relative z-30 mx-2 mb-[104px] hidden h-7 w-8 shrink-0 lg:block xl:mx-5 xl:w-11"
                  viewBox="0 0 48 28"
                  fill="none"
                >
                  <path d="M2 14H37" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
                  <path
                    d="M28 5L38 14L28 23"
                    stroke="#EA580C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="relative flex h-[236px] items-end justify-center ml-4 sm:h-[270px] sm:ml-5 lg:ml-0 xl:h-[310px]">
                  {[1, 2, 3, 4].map((card, idx) => (
                    <div
                      key={card}
                      tabIndex={0}
                      aria-label={`Preview UGC concept ${card}`}
                      className={`group relative shrink-0 cursor-pointer outline-none hover:z-50 focus-visible:z-50 ${
                        idx === 0
                          ? 'z-40 h-[236px] w-[122px] sm:h-[270px] sm:w-[140px] lg:w-[130px] xl:h-[310px] xl:w-[160px]'
                          : ''
                      } ${
                        idx === 1
                          ? 'z-30 -ml-7 h-[218px] w-[111px] -translate-y-2 sm:-ml-8 sm:h-[250px] sm:w-[128px] sm:-translate-y-3 lg:h-[250px] lg:w-[120px] lg:-translate-y-3 xl:-ml-10 xl:h-[288px] xl:w-[148px] xl:-translate-y-4'
                          : ''
                      } ${
                        idx === 2
                          ? 'z-20 -ml-7 h-[200px] w-[101px] -translate-y-4 sm:-ml-8 sm:h-[230px] sm:w-[117px] sm:-translate-y-6 lg:h-[230px] lg:w-[110px] lg:-translate-y-6 xl:-ml-10 xl:h-[265px] xl:w-[136px] xl:-translate-y-8'
                          : ''
                      } ${
                        idx === 3
                          ? 'z-10 -ml-7 h-[182px] w-[91px] -translate-y-6 sm:-ml-8 sm:h-[210px] sm:w-[107px] sm:-translate-y-9 lg:h-[210px] lg:w-[100px] lg:-translate-y-9 xl:-ml-10 xl:h-[242px] xl:w-[124px] xl:-translate-y-12'
                          : ''
                      }`}
                    >
                      <div className="relative h-full w-full origin-bottom transition-transform duration-[250ms] ease-out group-hover:-translate-y-2 group-hover:scale-[1.1] group-focus-visible:-translate-y-2 group-focus-visible:scale-[1.1] motion-reduce:transition-none">
                        <div className="absolute inset-0 overflow-hidden rounded-[1.2rem] border border-white/80 bg-[#FAF5F0] shadow-[0_16px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition-shadow duration-[250ms] ease-out group-hover:shadow-[0_24px_42px_rgba(0,0,0,0.24)] group-hover:ring-2 group-hover:ring-[#EA580C]/35 group-focus-visible:shadow-[0_24px_42px_rgba(0,0,0,0.24)] group-focus-visible:ring-2 group-focus-visible:ring-[#EA580C]/45 motion-reduce:transition-none">
                          <Image
                            src={`/landing_page/landing_3_image_${card}.png`}
                            alt={`UGC concept ${card}`}
                            fill
                            sizes="(max-width: 639px) 122px, (max-width: 1023px) 140px, 160px"
                            className="object-cover"
                          />
                          <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/45 px-2 py-1 text-[0.58rem] font-semibold text-white backdrop-blur-sm">
                            {idx === 0 ? '128K' : idx === 1 ? '86K' : idx === 2 ? '112K' : '82K'}
                          </div>
                        </div>

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-[calc(100%+6px)] hidden h-[34%] overflow-hidden opacity-[0.18] sm:block [mask-image:linear-gradient(to_bottom,black,transparent)]"
                        >
                          <div className="relative h-[295%] w-full -scale-y-100">
                            <Image
                              src={`/landing_page/landing_3_image_${card}.png`}
                              alt=""
                              fill
                              sizes="(max-width: 639px) 122px, (max-width: 1023px) 140px, 160px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-[#F0C79D] bg-[#FDF6F0] p-5 lg:p-6 text-left shadow-[0_10px_24px_rgba(194,65,12,0.08)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-[1.1rem] sm:text-[1.2rem] font-medium text-zinc-900">
                    With TrendED
                  </h3>
                  <SparkleIcon className="h-5 w-5 text-[#C2410C]" />
                </div>

                <div className="space-y-4 text-sm sm:text-[0.95rem] font-medium text-zinc-800">
                  {['Product', 'AI Script', 'AI Creator', 'Generate', 'Publish'].map(
                    (step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#F9E3CE] text-[#C2410C] ring-1 ring-[#F0C79D] shadow-sm">
                          <span className="text-[0.62rem] font-bold">{index + 1}</span>
                        </div>
                        <span>{step}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-sm font-semibold text-zinc-700">
              {[
                { icon: Package, label: '1 product' },
                { icon: FileText, label: '4 concepts' },
                { icon: Users, label: 'Multiple creators' },
                { icon: Zap, label: 'Minutes, not weeks' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                      item.label === 'Minutes, not weeks'
                        ? 'border-[#F0C79D] bg-[#FFF7F0] text-[#C2410C]'
                        : 'border-zinc-200 bg-white text-zinc-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 — COMMENT TRENDed FONCTIONNE (How it works — 01 → 02 → 03) */}
      {/* ============================================================ */}
      <section id="how-it-works" className="border-t border-[#eee8e1] bg-[#FFFEFC] py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <header className="mx-auto max-w-5xl text-center">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">
              HOW IT WORKS
            </div>

            <h2 className="font-editorial text-[2.8rem] leading-[0.95] text-zinc-950 sm:text-[3.2rem] lg:text-[4.7rem]">
              From product to <span className="italic text-[#C2410C]">UGC</span> in minutes.
            </h2>

            <p className="mt-5 text-base text-zinc-600 sm:text-lg lg:text-[1.05rem]">
              Three simple steps. One powerful creative workflow.
            </p>
          </header>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)_48px_minmax(0,1fr)] lg:items-center xl:gap-7 xl:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)_56px_minmax(0,1fr)]">
            <article className="min-w-0 rounded-[1.35rem] border border-[#e8e3dd] bg-white p-5 text-left shadow-[0_12px_30px_rgba(62,47,34,0.045)] sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="font-editorial text-[3.25rem] leading-none text-[#ea580c]">
                  01
                </span>
                <h3 className="text-xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-2xl">
                  Add your product
                </h3>
              </div>
              <div className="grid grid-cols-[minmax(105px,1fr)_minmax(145px,1fr)] gap-4 sm:gap-5">
                <div className="relative min-h-[270px] overflow-hidden rounded-lg bg-[#f6f2ee]">
                  <Image
                    src="/landing_page/landing_4_01_produit_necktek.png"
                    alt="Nekteck neck massager"
                    fill
                    sizes="(max-width: 639px) 42vw, (max-width: 1023px) 30vw, 13vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="min-w-0 space-y-3">
                  <label className="block text-xs font-semibold text-zinc-800">
                    Product name
                    <div className="mt-1.5 rounded-lg border border-zinc-200 px-2.5 py-2 text-[0.66rem] font-normal leading-snug text-zinc-700">
                      Nekteck Shiatsu Neck &amp; Shoulder Massager
                    </div>
                  </label>
                  <label className="block text-xs font-semibold text-zinc-800">
                    Product URL
                    <div className="mt-1.5 rounded-lg border border-zinc-200 px-2.5 py-2 text-[0.58rem] font-normal leading-snug text-zinc-500 break-all">
                      https://nekteck.com/products/shiatsu-neck-shoulder-massager
                    </div>
                  </label>
                  <div>
                    <span className="text-xs font-semibold text-zinc-800">Upload images</span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-lg border border-zinc-200 p-1.5">
                      <div className="relative aspect-square overflow-hidden rounded bg-[#f8f4f0]">
                        <Image
                          src="/landing_page/landing_4_03_photo_produit.png"
                          alt="Product detail"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative aspect-square overflow-hidden rounded bg-[#f8f4f0]">
                        <Image
                          src="/landing_page/landing_4_04_sac_transport.png"
                          alt="Product bag"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex aspect-square items-center justify-center rounded border border-dashed border-zinc-300 text-lg text-zinc-400">
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fff9ee] px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-[#fff1d8]"
              >
                <Upload className="h-5 w-5 text-[#ea580c]" />
                Import from URL or upload
              </button>
            </article>

            <div
              aria-hidden="true"
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-[#f2c49c] bg-white text-[#ea580c] shadow-[0_4px_12px_rgba(234,88,12,0.1)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M5 12h13m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <article className="min-w-0 rounded-[1.35rem] border border-[#e8e3dd] bg-white p-5 text-left shadow-[0_12px_30px_rgba(62,47,34,0.045)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-[3.25rem] leading-none text-[#ea580c]">
                    02
                  </span>
                  <h3 className="text-xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-2xl">
                    Build your creative
                  </h3>
                </div>
                <span className="shrink-0 rounded-md bg-[#fff0bf] px-2 py-1 text-[0.58rem] font-semibold text-[#8c5a00] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#eaa500]" />
                  AI optimized
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  [
                    'Creator Style',
                    'Authentic UGC',
                    'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0',
                  ],
                  ['Hook', 'Problem-Agitate-Solve', 'M13 2L4 14h7l-1 8 9-12h-7l1-8z'],
                  [
                    'Voice',
                    'Friendly & Relatable',
                    'M4 10v4h4l5 4V6L8 10H4zm12.5.5a3 3 0 010 3M19 8a6 6 0 010 8',
                  ],
                  [
                    'Platform',
                    'TikTok (9:16)',
                    'M14 4v10.2A3.7 3.7 0 1111.5 11v2.5a1.2 1.2 0 10.5.7V4h2a4 4 0 004 4v2a6 6 0 01-4-1.5',
                  ],
                  ['CTA', 'Shop Now', 'M12 4a8 8 0 108 8m-8-4v4l3 2'],
                ].map(([label, value, path]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[34px_minmax(75px,0.85fr)_minmax(116px,1.4fr)] items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#faf8f6] text-zinc-800">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-4 w-4"
                      >
                        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-800">{label}</span>
                    <div className="flex min-w-0 items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[0.66rem] text-zinc-700">
                      <span className="truncate">{value}</span>
                      <svg
                        className="ml-1 h-3.5 w-3.5 shrink-0 text-zinc-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2.5 rounded-lg bg-[#fff9ee] p-3 text-[0.67rem] leading-relaxed text-zinc-600">
                <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e6a400]" />
                <p>
                  <strong className="block text-zinc-800">
                    AI optimized for maximum engagement
                  </strong>
                  Our AI analyzes top performing UGC to optimize your script, pacing, and CTA.
                </p>
              </div>
            </article>

            <div
              aria-hidden="true"
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-[#f2c49c] bg-white text-[#ea580c] shadow-[0_4px_12px_rgba(234,88,12,0.1)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M5 12h13m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <article className="min-w-0 rounded-[1.35rem] border border-[#e8e3dd] bg-white p-5 text-left shadow-[0_12px_30px_rgba(62,47,34,0.045)] sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="font-editorial text-[3.25rem] leading-none text-[#ea580c]">
                  03
                </span>
                <h3 className="text-xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-2xl">
                  Generate &amp; publish
                </h3>
              </div>
              <div className="relative mx-auto aspect-[9/13] w-full max-w-[230px] overflow-hidden rounded-xl border-[3px] border-[#5a3d24] bg-[#6e4f34] shadow-[0_12px_24px_rgba(62,42,24,0.22)]">
                <Image
                  src="/landing_page/landing_4_05_apercu_video_ugc.png"
                  alt="Preview of a generated UGC video"
                  fill
                  sizes="230px"
                  className="object-cover"
                />
                <div className="absolute inset-x-3 top-4 text-center text-base font-black leading-[0.95] tracking-[-0.05em] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  Finally, relief after
                  <br />
                  long workdays
                </div>
                <span className="absolute right-2 top-2 rounded bg-black/65 px-1.5 py-0.5 text-[0.58rem] font-bold text-white">
                  27s
                </span>
                <div className="absolute right-2 top-20 flex flex-col items-center gap-2 text-white drop-shadow">
                  <div className="h-7 w-7 rounded-full border border-white/80 bg-white/20" />
                  <span className="flex flex-col items-center text-[0.55rem] gap-1">
                    <Heart className="h-3 w-3 fill-current text-pink-400" />
                    <span>12.4K</span>
                  </span>
                  <span className="flex flex-col items-center text-[0.55rem] gap-1">
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    </span>
                    <span>258</span>
                  </span>
                  <span className="flex flex-col items-center text-[0.55rem] gap-1">
                    <TrendingUp className="h-3 w-3 text-white" />
                    <span>1,239</span>
                  </span>
                </div>
                <div className="absolute inset-x-2 bottom-2 rounded bg-black/60 p-2 text-[0.6rem] leading-tight text-white">
                  This shiatsu massager hits all the right spots.
                  <div className="mt-2 flex items-center gap-2 border-t border-white/40 pt-1.5 text-[0.52rem]">
                    <Play className="h-3 w-3 fill-current" />
                    <span>00:00 / 00:27</span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ed5109] px-5 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(194,65,12,0.22)] transition hover:bg-[#c94109]"
              >
                <ArrowRight className="h-5 w-5" />
                Export video
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 — FEATURE : PRODUCT → VIDEO                                */}
      {/* ============================================================ */}
      <section
        id="product-to-video"
        className="border-t border-zinc-100 bg-[#FFFDF9] py-20 lg:py-24"
      >
        <div className="w-full px-3 sm:px-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.72fr_1.88fr]">
              <div className="max-w-[580px] lg:max-w-none">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F1C79F] bg-[#FFF5ED] shadow-sm">
                    <TrendedBrandLogo className="items-center" />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <h2 className="font-editorial text-[2.8rem] leading-[0.92] text-zinc-950 sm:text-[3.3rem] lg:text-[4.6rem]">
                    <span className="italic text-[#C2410C]">One product.</span>
                    <br />
                    Endless creative
                    <br />
                    possibilities.
                  </h2>

                  <p className="max-w-[440px] text-base leading-relaxed text-zinc-700 sm:text-lg">
                    Give TrendED your product and let AI turn it into advertising concepts built for
                    social.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-start gap-5">
                  <div className="flex h-[96px] w-[96px] items-center justify-center rounded-[1.5rem] border border-zinc-200 bg-[#F8F6F4] shadow-sm">
                    <svg
                      viewBox="0 0 64 64"
                      className="h-9 w-9 fill-current text-[#C2410C]"
                      aria-hidden="true"
                    >
                      <path d="M17 18.5c0-2.2 1.8-4 4-4h22c2.2 0 4 1.8 4 4v27c0 2.2-1.8 4-4 4H21c-2.2 0-4-1.8-4-4v-27zm8 4h16v-2H25v2zm0 7h16v-2H25v2zm0 7h12v-2H25v2z" />
                    </svg>
                  </div>

                  <div className="flex h-[96px] w-[96px] items-center justify-center rounded-[1.5rem] border border-zinc-200 bg-[#F8F6F4] shadow-sm">
                    <svg
                      viewBox="0 0 64 64"
                      className="h-9 w-9 fill-current text-[#C2410C]"
                      aria-hidden="true"
                    >
                      <path d="M32 10c-3.5 0-6.2 2.7-6.2 6.2v6.8h12.4v-6.8C38.2 12.7 35.5 10 32 10zm-8.6 15.6v18.8h17.2V25.6H23.4zm-5.2 0a5.2 5.2 0 00-5.2 5.2v13.4a5.2 5.2 0 005.2 5.2h27.6a5.2 5.2 0 005.2-5.2V30.8a5.2 5.2 0 00-5.2-5.2H18.2z" />
                    </svg>
                  </div>

                  <div className="flex h-[96px] w-[96px] items-center justify-center rounded-[1.5rem] border border-zinc-200 bg-[#F8F6F4] shadow-sm">
                    <svg
                      viewBox="0 0 64 64"
                      className="h-9 w-9 fill-current text-[#C2410C]"
                      aria-hidden="true"
                    >
                      <path d="M29.9 10.9c-6.5 0-11.8 5.3-11.8 11.8v8.5c.1 5.6 4.5 10 10 10.3h4.9c5.5-.3 9.9-4.7 10-10.3v-8.5c0-6.5-5.3-11.8-11.8-11.8zm8.2 22.5h-16c-1.3 0-2.4 1.1-2.4 2.4v5.2c0 2.2 1.7 4 4 4h12.8c2.3 0 4-1.8 4-4v-5.2c0-1.3-1.1-2.4-2.4-2.4zm-8.2-4.5c4.1 0 7.4-3.3 7.4-7.4s-3.3-7.4-7.4-7.4-7.4 3.3-7.4 7.4c0 4.1 3.3 7.4 7.4 7.4z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-7 text-left">
                  <div className="flex items-center gap-2 text-[0.9rem] font-medium text-zinc-700">
                    <div className="h-3 w-3 rounded-full border-2 border-[#C2410C] bg-white" />
                    <span>Product</span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.9rem] font-medium text-zinc-700">
                    <div className="h-3 w-3 rounded-full border-2 border-[#C2410C] bg-[#C2410C]" />
                    <span>AI engine</span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.9rem] font-medium text-zinc-700">
                    <div className="h-3 w-3 rounded-full border-2 border-[#C2410C] bg-transparent" />
                    <span>Creative concepts</span>
                  </div>
                </div>
              </div>

              <div className="relative w-full rounded-[2rem] border border-zinc-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.08)] lg:p-3">
                <Image
                  src="/landing_page/landing_5_image_a_droite.png"
                  alt="TrendED product-to-video dashboard mockup"
                  width={1800}
                  height={1100}
                  priority
                  sizes="(max-width: 1023px) 100vw, 1500px"
                  className="h-auto w-full rounded-[1.5rem] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 — FEATURE : AI UGC GENERATOR (BLANC CRÈME SECTION)         */}
      {/* ============================================================ */}
      <section
        id="ugc-generator"
        className="py-24 bg-gradient-to-b from-[#FFFDF9] via-[#FFF7E6]/40 to-white text-zinc-900 relative overflow-hidden border-t border-zinc-100"
      >
        {/* Subtle warm radial lighting */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          {/* Header */}
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-bold text-[#C2410C]">
              <SparkleIcon className="h-3.5 w-3.5 text-[#EAB308]" />
              <span>AI UGC VIDEO GENERATOR</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-zinc-950 leading-tight">
              <span className="italic text-[#C2410C]">Create UGC</span> without booking a creator.
            </h2>
            <p className="text-zinc-800 text-base sm:text-lg font-bold max-w-2xl">
              Choose your creator, voice, style and message. TrendED handles the production.
            </p>
          </div>

          {/* Interactive Generator Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Floating Controls Panel */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-5 text-left shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                  Generation Controls
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  PRO ENGINE
                </span>
              </div>

              {/* Creator Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900">Creator Selection</label>
                <div className="grid grid-cols-3 gap-2">
                  {creators.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCreatorIndex(idx)}
                      className={`rounded-xl py-2 px-3 text-xs font-bold border transition ${
                        activeCreatorIndex === idx
                          ? 'border-[#C2410C] bg-orange-50 text-[#C2410C] shadow-sm'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls attributes */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="font-bold text-zinc-900">Voice Tone</span>
                  <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                    {creators[activeCreatorIndex].tone}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="font-bold text-zinc-900">Hook Strategy</span>
                  <span className="font-bold text-[#C2410C] bg-orange-50 px-2 py-1 rounded border border-orange-200">
                    Problem-Solution
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="font-bold text-zinc-900">Duration</span>
                  <span className="font-bold text-zinc-900">30 Seconds</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-zinc-900">Platform Preset</span>
                  <span className="font-bold text-zinc-900">TikTok (9:16)</span>
                </div>
              </div>

              {/* Prominent CTA */}
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C2410C] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#C2410C]/25 hover:bg-[#9A3412] transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate UGC Video</span>
              </Link>
            </div>

            {/* Right Column: 3 Vertical Creator Previews */}
            <div className="lg:col-span-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-2.5 lg:gap-2.5">
              {creators.map((creator, i) => (
                <div
                  key={creator.id}
                  onClick={() => setActiveCreatorIndex(i)}
                  className={`cursor-pointer overflow-hidden border transition-all duration-300 relative group aspect-[9/16] max-h-[460px] shadow-md rounded-[1.15rem] ${
                    activeCreatorIndex === i
                      ? 'border-[#C2410C] shadow-xl shadow-[#C2410C]/20 ring-2 ring-[#C2410C]/40 scale-[1.01]'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {/* Mock video background using real profile images and realistic overlays */}
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover brightness-95 group-hover:scale-105 transition duration-500"
                  />

                  {/* Gradient shadow for text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

                  {/* Header badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                      Creator {creator.id}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>AI</span>
                    </span>
                  </div>

                  {/* Center Hook Text */}
                  <div className="absolute inset-x-4 top-1/3 text-center">
                    <span className="inline-block bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg">
                      “{creator.hookText}”
                    </span>
                  </div>

                  {/* Bottom TikTok-style UI overlay */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full ring-1 ring-white overflow-hidden relative">
                        <Image
                          src={creator.avatar}
                          alt=""
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-white">{creator.handle}</span>
                      <span className="text-blue-400 flex items-center">
                        <Check className="h-3 w-3" />
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-200 line-clamp-2 leading-tight">
                      {creator.caption}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/10">
                      <span>{creator.time}</span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-current" /> {creator.stats.likes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquareText className="h-3 w-3" /> {creator.stats.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Feature Highlights Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-zinc-200 text-left">
            <div className="space-y-1">
              <div className="text-[#C2410C] font-bold text-sm flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>AI Creators</span>
              </div>
              <p className="text-xs text-zinc-700 font-semibold">
                Realistic & diverse creator options
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[#C2410C] font-bold text-sm flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                <span>Smart Scripts</span>
              </div>
              <p className="text-xs text-zinc-700 font-semibold">
                Hook-driven captions that convert
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[#C2410C] font-bold text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Product Focused</span>
              </div>
              <p className="text-xs text-zinc-700 font-semibold">Natural placement that sells</p>
            </div>

            <div className="space-y-1">
              <div className="text-[#C2410C] font-bold text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Multi-Platform Ready</span>
              </div>
              <p className="text-xs text-zinc-700 font-semibold">
                Optimized for TikTok, Reels, Shorts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 07 — MULTI-PLATFORM                                           */}
      {/* ============================================================ */}
      <section id="multi-platform" className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          {/* Headings */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-zinc-950 font-normal">
              One creative. <span className="italic text-[#C2410C]">Every channel.</span>
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg">
              Generate content adapted to the platforms where your customers scroll.
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-amber-800 border border-amber-200">
              <Lightbulb className="h-3.5 w-3.5" /> Hook optimized
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-[#C2410C] border border-orange-200">
              <MessageSquareText className="h-3.5 w-3.5" /> Captions included
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-1 text-zinc-800 border border-zinc-200">
              <Target className="h-3.5 w-3.5" /> CTA adapted
            </span>
          </div>

          {/* Central Visual Showcase Cutout */}
          <div className="relative max-w-5xl mx-auto drop-shadow-xl rounded-2xl overflow-hidden border border-zinc-100 p-2 sm:p-4 bg-zinc-50/50">
            <Image
              src="/landing_page/landing_7_image_des_reseaux_sociaux_en_bas_.png"
              alt="Multi-platform creative distribution graphic"
              width={2146}
              height={733}
              className="w-full h-auto object-contain select-none"
            />
          </div>

          {/* Platform Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            {platformList.map((p) => {
              const isSelected = activePlatformFilter === p.id || activePlatformFilter === 'all';
              return (
                <div
                  key={p.id}
                  onClick={() =>
                    setActivePlatformFilter(activePlatformFilter === p.id ? 'all' : p.id)
                  }
                  className={`cursor-pointer rounded-xl border p-4 bg-white transition ${
                    activePlatformFilter === p.id
                      ? 'border-[#C2410C] shadow-md ring-2 ring-[#C2410C]/20'
                      : 'border-zinc-200 hover:border-[#C2410C]/40 hover:shadow-sm'
                  } ${!isSelected ? 'opacity-60' : 'opacity-100'}`}
                >
                  <div className="flex items-center justify-between text-zinc-900 font-bold text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className={activePlatformFilter === p.id ? 'text-[#C2410C]' : ''}>
                        {p.icon}
                      </span>
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 font-medium">
                      {p.ratio}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{p.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 08 — CREATIVE LIBRARY                                         */}
      {/* ============================================================ */}
      <section id="creative-library" className="py-20 bg-[#FFFDF9] border-t border-zinc-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="space-y-3">
                <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-zinc-950 font-normal leading-tight">
                  Every creative. <span className="italic text-[#C2410C]">One workspace.</span>
                </h2>
                <p className="text-zinc-800 font-bold text-base sm:text-lg">
                  Keep your generated videos, concepts and campaigns organized in one place.
                </p>
              </div>

              <div className="space-y-3 text-sm text-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-bold text-zinc-900">
                    Categorize by product, concept and channel
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-bold text-zinc-900">
                    Track real-time CTR & ROAS performance metrics
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-bold text-zinc-900">
                    Instant 1-click export in 9:16 and 1:1 formats
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#C2410C]/20 hover:bg-[#9A3412] transition"
                >
                  <span>Explore your creatives</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Mockup Cutout */}
            <div className="lg:col-span-8 drop-shadow-2xl">
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white p-2">
                <Image
                  src="/landing_page/landing_8_image_a_droite.png"
                  alt="TrendED Creative Library Showcase"
                  width={1394}
                  height={1128}
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 09 — AI INTELLIGENCE / GROWTH (BLANC CRÈME SECTION)           */}
      {/* ============================================================ */}
      <section
        id="ai-intelligence"
        className="py-24 bg-gradient-to-b from-[#FFFDF9] via-[#FFF7E6]/40 to-white text-zinc-900 relative overflow-hidden border-t border-zinc-100"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-14 relative z-10 text-center">
          {/* Header */}
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900">
              <SparkleIcon className="h-3.5 w-3.5 text-[#EAB308]" />
              <span>AI INTELLIGENCE</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-zinc-950">
              Don’t just create. Create <span className="italic text-[#C2410C]">smarter.</span>
            </h2>
            <p className="text-zinc-800 text-base sm:text-lg font-bold">
              TrendED analyzes your creative inputs and helps you make better advertising decisions.
            </p>
          </div>

          {/* AI Creative Insight UI Dashboard Card */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-8 text-left">
            {/* Top Insight Alert & Score Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-zinc-100">
              <div className="md:col-span-6 space-y-2">
                <div className="text-xs font-bold text-[#C2410C] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Creative Insight</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-zinc-950">
                  “Your current hook may lose attention in the first 2 seconds.”
                </p>
                <p className="text-xs text-zinc-600">
                  <strong className="text-zinc-900 font-bold">Recommendation:</strong> Try a
                  stronger problem-first opening.
                </p>
              </div>

              {/* 4 Score Badges */}
              <div className="md:col-span-6 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                  <div className="text-xs text-zinc-500 font-medium">Hook</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-600">92</div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                  <div className="text-xs text-zinc-500 font-medium">Authentic</div>
                  <div className="text-lg sm:text-xl font-bold text-zinc-900">88</div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                  <div className="text-xs text-zinc-500 font-medium">CTA</div>
                  <div className="text-lg sm:text-xl font-bold text-zinc-900">91</div>
                </div>
                <div className="rounded-xl bg-orange-50 p-2.5 border border-orange-200">
                  <div className="text-xs text-[#C2410C] font-semibold">Overall</div>
                  <div className="text-lg sm:text-xl font-bold text-[#C2410C]">90</div>
                </div>
              </div>
            </div>

            {/* Before / After Hook Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CURRENT HOOK (Weaker) */}
              <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-800">Current Hook</span>
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                    Weaker
                  </span>
                </div>
                <div className="text-sm font-bold text-zinc-900 bg-white p-3 rounded-xl border border-red-200 shadow-sm">
                  “Check out this amazing portable blender!”
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  While this hook introduces the product, it does not immediately create a strong
                  reason to keep watching.
                </p>
                <div className="text-[11px] text-red-600 font-bold flex items-center gap-1.5">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  <span>Generic opening · Low urgency</span>
                </div>
              </div>

              {/* AI SUGGESTED HOOK (Stronger) */}
              <div className="rounded-2xl border-2 border-orange-300 bg-orange-50/40 p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">AI Suggested Hook</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Stronger
                  </span>
                </div>
                <div className="text-sm font-bold text-[#C2410C] bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                  “Still using bulky blenders that are hard to clean?”
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  This problem-first approach creates immediate relevance and curiosity, drastically
                  increasing viewer retention.
                </p>
                <div className="text-[11px] text-[#C2410C] font-bold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>High impact opening · +43% watch time</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-700">
                <span className="flex items-center gap-1.5 font-bold">
                  <Check className="h-3.5 w-3.5 text-[#C2410C]" /> Grabs attention with a relatable
                  problem
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <Check className="h-3.5 w-3.5 text-[#C2410C]" /> Creates curiosity and tension
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#C2410C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#9A3412] transition shadow-md shadow-[#C2410C]/25 flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apply Suggested Hook</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10 — TESTIMONIALS                                             */}
      {/* ============================================================ */}
      <section className="border-y border-amber-100 bg-[#F8F4F0] py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1240px] text-center">
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1E8DE] shadow-sm ring-1 ring-[#E7D4BD]">
                  <TrendedBrandLogo className="items-center" />
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-[1100px] space-y-4">
              <h2 className="font-editorial text-[2.8rem] leading-[0.92] text-zinc-950 sm:text-[3.25rem] lg:text-[6rem]">
                Built for <span className="italic text-[#C2410C]">people who move fast.</span>
              </h2>
              <p className="text-[1.05rem] text-zinc-700 sm:text-[1.4rem] lg:text-[2rem]">
                Less production. More testing. More opportunities to grow.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  quote: 'TrendED lets us test five creative angles before lunch.',
                  name: 'Sarah Bennett',
                  role: 'DTC Founder',
                  company: 'Velora.co',
                  stat: '5x faster creative testing',
                  statClass: 'bg-[#FCEFE3] text-[#C2410C] border-[#F3C89C]',
                  avatar: '/login-profile.jpg',
                  icon: BarChart3,
                },
                {
                  quote: 'We stopped waiting weeks for UGC creators.',
                  name: 'Michael Carter',
                  role: 'E-commerce Entrepreneur',
                  company: 'Northline Basics',
                  stat: '70% less production time',
                  statClass: 'bg-[#F5E8D4] text-[#B85B1B] border-[#E7C89C]',
                  avatar: '/login-profile-2.jpg',
                  icon: Clock3,
                },
                {
                  quote: 'The ability to generate multiple hooks is a game changer.',
                  name: 'Jordan Williams',
                  role: 'Performance Marketer',
                  company: 'Peak Scale Media',
                  stat: '3.8x average ROAS',
                  statClass: 'bg-[#EAF7F0] text-[#1D7B5C] border-[#B9DDC7]',
                  avatar: '/profile1-login.jpg',
                  icon: TrendingUp,
                },
              ].map((card) => (
                <article
                  key={card.name}
                  className="flex min-h-[440px] flex-col justify-between rounded-[1.5rem] border border-[#E7DDD4] bg-[#F5F1ED] p-6 text-left shadow-[0_10px_24px_rgba(0,0,0,0.02)]"
                >
                  <div className="space-y-6">
                    <div className="text-[4.25rem] font-bold leading-none text-[#C2410C]">“</div>

                    <p className="max-w-[310px] text-[2rem] leading-[1.1] tracking-[-0.05em] text-zinc-900">
                      {card.quote}
                    </p>
                  </div>

                  <div className="mt-8 space-y-5 border-t border-zinc-200/80 pt-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-[74px] w-[74px] overflow-hidden rounded-full ring-2 ring-[#E7DDD4] bg-white">
                        <Image
                          src={card.avatar}
                          alt={card.name}
                          fill
                          sizes="74px"
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[1.1rem] font-semibold text-zinc-900">{card.name}</div>
                        <div className="text-[0.8rem] text-zinc-500">{card.role}</div>
                        <div className="flex items-center gap-2 text-[0.8rem] text-zinc-600">
                          <span className="h-2 w-2 rounded-full bg-[#C2410C]" />
                          <span>{card.company}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-[0.9rem] border px-3 py-2 text-[0.88rem] font-semibold ${card.statClass}`}
                    >
                      {React.createElement(card.icon, { className: 'h-4 w-4' })}
                      <span>{card.stat}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11 — PRICING                                                  */}
      {/* ============================================================ */}
      <section id="pricing" className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          {/* Headings */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-zinc-950 font-normal">
              <span className="italic text-[#C2410C]">Start creating.</span> Scale when you’re
              ready.
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg">
              Simple plans designed for e-commerce creators.
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#C2410C] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <span>Yearly</span>
                <span className="bg-amber-400 text-zinc-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left items-stretch">
            {/* STARTER */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">STARTER</h3>
                  <p className="text-xs text-zinc-500 mt-1">For creators testing AI UGC.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950">
                    ${starterPrice}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">/month</span>
                </div>

                {/* Features */}
                <div className="space-y-3.5 text-xs text-zinc-700">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">AI video generations</span>
                    <span className="font-bold text-zinc-900">20 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Creative exports</span>
                    <span className="font-bold text-zinc-900">50 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">AI scripts</span>
                    <span className="font-bold text-zinc-900">10 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Creative library</span>
                    <span className="font-bold text-zinc-900">2,000+ assets</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-500">Support</span>
                    <span className="font-bold text-zinc-900">Email support</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full block text-center rounded-xl bg-[#C2410C] py-3 text-sm font-semibold text-white hover:bg-[#9A3412] transition shadow-sm"
              >
                Start creating
              </Link>
            </div>

            {/* GROWTH (Most Popular) */}
            <div className="rounded-3xl border-2 border-[#C2410C] bg-gradient-to-b from-orange-50/40 via-white to-amber-50/20 p-8 shadow-xl relative flex flex-col justify-between space-y-8 ring-4 ring-[#C2410C]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C2410C] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                <span>Most popular</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#C2410C]">GROWTH</h3>
                  <p className="text-xs text-zinc-500 mt-1">For growing e-commerce businesses.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#C2410C]">
                    ${growthPrice}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">/month</span>
                </div>

                {/* Features */}
                <div className="space-y-3.5 text-xs text-zinc-800">
                  <div className="flex items-center justify-between py-1 border-b border-orange-100">
                    <span className="text-zinc-600">AI video generations</span>
                    <span className="font-bold text-zinc-950">100 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-orange-100">
                    <span className="text-zinc-600">Creative exports</span>
                    <span className="font-bold text-zinc-950">250 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-orange-100">
                    <span className="text-zinc-600">AI scripts</span>
                    <span className="font-bold text-zinc-950">50 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-orange-100">
                    <span className="text-zinc-600">Creative library</span>
                    <span className="font-bold text-zinc-950">10,000+ assets</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-600">Support</span>
                    <span className="font-bold text-zinc-950">Priority support</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full block text-center rounded-xl bg-[#C2410C] py-3 text-sm font-semibold text-white shadow-md shadow-[#C2410C]/30 hover:bg-[#9A3412] transition"
              >
                Start creating
              </Link>
            </div>

            {/* SCALE */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">SCALE</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    For teams producing creatives at volume.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950">
                    ${scalePrice}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">/month</span>
                </div>

                {/* Features */}
                <div className="space-y-3.5 text-xs text-zinc-700">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">AI video generations</span>
                    <span className="font-bold text-zinc-900">300 / month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Creative exports</span>
                    <span className="font-bold text-zinc-900">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">AI scripts</span>
                    <span className="font-bold text-zinc-900">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Creative library</span>
                    <span className="font-bold text-zinc-900">25,000+ assets</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-500">Support</span>
                    <span className="font-bold text-zinc-900">Priority + Live chat</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full block text-center rounded-xl bg-[#C2410C] py-3 text-sm font-semibold text-white hover:bg-[#9A3412] transition shadow-sm"
              >
                Start creating
              </Link>
            </div>
          </div>

          <div className="text-xs text-zinc-500 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C2410C]" />
            <span>Cancel anytime. No long-term contracts. 7-day money-back guarantee.</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12 — FINAL CTA                                                */}
      {/* ============================================================ */}
      <section className="py-20 bg-gradient-to-b from-[#FFFDF9] via-[#FFF7E6]/50 to-white relative overflow-hidden border-t border-zinc-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Conversion Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-zinc-950 font-normal leading-[1.12]">
                Your next <span className="italic text-[#C2410C]">winning creative</span> starts
                here.
              </h2>

              <p className="text-base sm:text-lg text-zinc-800 font-bold max-w-lg">
                Turn your products into scroll-stopping UGC videos with AI.
              </p>

              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#C2410C]/25 hover:bg-[#9A3412] hover:shadow-[#9A3412]/35 transition duration-200"
                >
                  <span>Create your first video</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-900 font-bold pt-2">
                <div className="flex items-center gap-1.5">
                  <Ban className="h-3.5 w-3.5 text-amber-600" />
                  <span>No camera.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ban className="h-3.5 w-3.5 text-amber-600" />
                  <span>No creator.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ban className="h-3.5 w-3.5 text-amber-600" />
                  <span>No production team.</span>
                </div>
              </div>
            </div>

            {/* Right Side Visual from Cutout Mockup */}
            <div className="lg:col-span-6 flex justify-center items-center relative">
              <div className="relative w-full max-w-[620px] drop-shadow-2xl">
                <Image
                  src="/landing_page/landing_12_image_a_droite.png"
                  alt="TrendED Final CTA Visual"
                  width={1394}
                  height={1128}
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13 — FOOTER                                                   */}
      {/* ============================================================ */}
      <footer className="bg-[#FAF6ED] text-zinc-900 pt-16 pb-12 border-t border-amber-200/60">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-amber-200/60">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-4 text-left">
              <Link href="/" className="inline-flex flex-col items-start">
                <Image
                  src="/logo.png"
                  alt="TrendED Logo"
                  width={260}
                  height={72}
                  className="h-14 w-auto sm:h-20 object-contain"
                  priority
                />
                <span className="mt-2 block text-sm font-bold uppercase tracking-wider text-zinc-600">
                  E-commerce · Dropshipping · Growth
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-zinc-600 font-medium">
                AI-powered tools for creating better e-commerce advertising. From product to
                high-converting UGC in minutes.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left text-sm">
              {/* Product */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-950 uppercase tracking-wider text-sm">
                  Product
                </h4>
                <ul className="space-y-2 text-zinc-600 font-medium text-sm">
                  <li>
                    <Link href="#ugc-generator" className="hover:text-[#C2410C] transition">
                      UGC Video Generator
                    </Link>
                  </li>
                  <li>
                    <Link href="#product-to-video" className="hover:text-[#C2410C] transition">
                      Creative Studio
                    </Link>
                  </li>
                  <li>
                    <Link href="#creative-library" className="hover:text-[#C2410C] transition">
                      Creative Library
                    </Link>
                  </li>
                  <li>
                    <Link href="#ai-intelligence" className="hover:text-[#C2410C] transition">
                      AI Intelligence
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Solutions */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-950 uppercase tracking-wider text-sm">
                  Solutions
                </h4>
                <ul className="space-y-2 text-zinc-600 font-medium text-sm">
                  <li>
                    <Link href="#problem-solution" className="hover:text-[#C2410C] transition">
                      E-commerce Brands
                    </Link>
                  </li>
                  <li>
                    <Link href="#problem-solution" className="hover:text-[#C2410C] transition">
                      Dropshipping
                    </Link>
                  </li>
                  <li>
                    <Link href="#multi-platform" className="hover:text-[#C2410C] transition">
                      DTC Brands
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-[#C2410C] transition">
                      Agencies
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-950 uppercase tracking-wider text-sm">
                  Resources
                </h4>
                <ul className="space-y-2 text-zinc-600 font-medium text-sm">
                  <li>
                    <Link href="#how-it-works" className="hover:text-[#C2410C] transition">
                      Workflow Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="#multi-platform" className="hover:text-[#C2410C] transition">
                      Video Ad Formats
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-[#C2410C] transition">
                      Pricing Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#C2410C] transition">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-950 uppercase tracking-wider text-sm">
                  Company
                </h4>
                <ul className="space-y-2 text-zinc-600 font-medium text-sm">
                  <li>
                    <Link href="/login" className="hover:text-[#C2410C] transition">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#C2410C] transition">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#C2410C] transition">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#C2410C] transition">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600 font-medium">
            <div>© 2026 TrendED. All rights reserved.</div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-[#C2410C] transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#C2410C] transition">
                Terms of Service
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-zinc-600 font-semibold text-sm">
              <span className="hover:text-[#C2410C] cursor-pointer transition">TikTok</span>
              <span className="hover:text-[#C2410C] cursor-pointer transition">Instagram</span>
              <span className="hover:text-[#C2410C] cursor-pointer transition">LinkedIn</span>
              <span className="hover:text-[#C2410C] cursor-pointer transition">X</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
