'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

type GlyphProps = { className?: string; strokeWidth?: number };

function Glyph({ name, className = 'h-5 w-5', strokeWidth = 1.75 }: GlyphProps & { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    'arrow-left': <path d="M19 12H5m6-6-6 6 6 6" />,
    'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
    chart: (
      <>
        <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7m-9 4v10" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.6 2.6 0 1 1 4.7 1.5c-1.3 1.4-2.2 1.7-2.2 3.2m0 3h.01" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    gem: <path d="m12 3 8 6-8 12L4 9l8-6Zm-8 6h16M8 3l4 6 4-6" />,
    home: (
      <>
        <path d="m3 11 9-8 9 8v9H3v-9Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    package: (
      <>
        <path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7m-9 4v10" />
      </>
    ),
    pencil: (
      <>
        <path d="m4 20 4-1 10-10-3-3L5 16l-1 4Zm9-13 3 3" />
        <path d="M4 4h6m-6 4h3" />
      </>
    ),
    rocket: (
      <>
        <path d="M14 4c4-2 6 0 6 0s2 2 0 6l-7 7-6-6 7-7Z" />
        <path d="m7 11-4 1 3 3m5 1-1 4 3-3" />
        <circle cx="15" cy="9" r="1.3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2 11h10l2-8H7" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v10h16V10" />
        <path d="M3 5h18l1 5c-2 2-4 2-6 0-2 2-4 2-6 0-2 2-4 2-6 0L3 5Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="m16 8 5-5m-1 0h-4m4 0v4" />
      </>
    ),
    trending: (
      <>
        <path d="M4 18 10 12l4 4 7-8" />
        <path d="M16 8h5v5" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.box}
    </svg>
  );
}

const makeIcon = (name: string) => {
  const Icon = (props: GlyphProps) => <Glyph name={name} {...props} />;
  Icon.displayName = `${name}Icon`;
  return Icon;
};
const ArrowLeft = makeIcon('arrow-left');
const ArrowRight = makeIcon('arrow-right');
const BarChart3 = makeIcon('chart');
const Check = makeIcon('check');
const ChevronDown = makeIcon('chevron');
const CircleHelp = makeIcon('help');
const LockKeyhole = makeIcon('lock');
const Search = makeIcon('search');
const Sparkles = makeIcon('sparkles');
const Store = makeIcon('store');

type ReferenceIconName =
  | 'starting'
  | 'selling'
  | 'dropshipper'
  | 'scaling'
  | 'products'
  | 'ads'
  | 'sales'
  | 'rocket'
  | 'performance'
  | 'business'
  | 'world'
  | 'dropshipping'
  | 'dtc'
  | 'marketplace'
  | 'other'
  | 'fashion'
  | 'beauty'
  | 'home'
  | 'electronics'
  | 'fitness'
  | 'pets'
  | 'experience';

const profileIconSources = {
  starting: '/logos/onboarding/profile-store.svg',
  selling: '/logos/onboarding/profile-cart.svg',
  dropshipper: '/logos/onboarding/profile-shipping-box.svg',
  scaling: '/logos/onboarding/profile-growth.svg',
} as const;

function SvgAssetIcon({ src, className = 'h-8 w-8' }: { src: string; className?: string }) {
  const mask = `url(${src})`;

  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className} bg-current`}
      style={{
        maskImage: mask,
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskImage: mask,
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

function ReferenceIcon({
  name,
  className = 'h-6 w-6',
}: {
  name: ReferenceIconName;
  className?: string;
}) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const icons: Record<ReferenceIconName, React.ReactNode> = {
    starting: (
      <>
        <path {...stroke} d="M13 9V5a3 3 0 0 0-6 0v4M3 9h14l-1 10H4L3 9Z" />
        <path {...stroke} d="M2 5h16l1 4c-2 2-4 2-6 0-2 2-4 2-6 0-2 2-4 2-6 0l1-4Z" />
        <path {...stroke} d="M7 19v-5h4v5" />
      </>
    ),
    selling: (
      <>
        <path {...stroke} d="M2 4h3l2 11h9l2-7H7" />
        <path {...stroke} d="M8 9h10" />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="16" cy="20" r="1.4" fill="currentColor" />
      </>
    ),
    dropshipper: (
      <>
        <path {...stroke} d="m10 2 8 4v9l-8 5-8-5V6l8-4Z" />
        <path {...stroke} d="m2 6 8 5 8-5M10 11v9" />
        <path {...stroke} d="m7 3 8 5" />
      </>
    ),
    scaling: (
      <>
        <path {...stroke} d="M3 20v-5m5 5V11m5 9V7m5 13V3" />
        <path {...stroke} d="m13 7 3-3 3 3m-3-3v8" />
      </>
    ),
    products: (
      <>
        <path d="M5 7.5 10 5l5 2.5v5L10 15l-5-2.5v-5Z" fill="#f2b937" />
        <path d="m5 7.5 5 2.5 5-2.5M10 10v5" fill="none" stroke="#d48811" strokeWidth="1.4" />
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path {...stroke} d="m14.5 14.5 4 4" />
      </>
    ),
    ads: (
      <>
        <path
          d="m7 3 1.4 4.2L13 8.5 8.4 9.8 7 14l-1.4-4.2L1 8.5l4.6-1.3L7 3Z"
          fill="currentColor"
        />
        <path d="M10 10h10v9H10z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="14" cy="13" r="1.4" fill="currentColor" />
        <path
          d="m11 18 3.4-3 2.3 2 1.7-1.5L20 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </>
    ),
    sales: (
      <>
        <path {...stroke} d="M2 5h3l2 10h9l2-7H7" />
        <path
          d="m14.5 3 .9 2.5L18 6.4l-2.6.9-.9 2.5-.9-2.5-2.6-.9 2.6-.9.9-2.5Z"
          fill="currentColor"
        />
        <circle cx="9" cy="20" r="1.3" fill="currentColor" />
        <circle cx="16" cy="20" r="1.3" fill="currentColor" />
      </>
    ),
    rocket: (
      <>
        <path
          d="M12.5 3c4.7-2.5 6.8-.4 6.8-.4s2.1 2.1-.4 6.8l-6.8 6.8-6-6L12.5 3Z"
          fill="currentColor"
          opacity=".95"
        />
        <circle cx="14.7" cy="7.3" r="1.6" fill="#fff7df" />
        <path {...stroke} d="m6.1 10.2-3.4.8 3 3m6.5 1.3-.9 3.5-2.8-2.8" />
      </>
    ),
    performance: (
      <>
        <rect x="3" y="12" width="3.4" height="7" rx=".7" fill="currentColor" />
        <rect x="8.3" y="8" width="3.4" height="11" rx=".7" fill="currentColor" />
        <rect x="13.6" y="4" width="3.4" height="15" rx=".7" fill="currentColor" />
      </>
    ),
    business: (
      <>
        <rect x="5" y="4" width="11" height="15" rx="1.5" {...stroke} />
        <path {...stroke} d="M8 4V2h5v2M8 9h5m-5 3h5m-5 3h3" />
        <path
          d="m13 14 1.3 1.3L17 12.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    world: (
      <>
        <circle cx="10" cy="11" r="7" {...stroke} />
        <path {...stroke} d="M3 11h14M10 4c2 2 3 4.4 3 7s-1 5-3 7c-2-2-3-4.4-3-7s1-5 3-7Z" />
      </>
    ),
    dropshipping: (
      <>
        <path {...stroke} d="M5 7h8v9H5z" />
        <path {...stroke} d="m8 5 4 2m-8 2 5 3 5-3M9 12v4" />
        <path {...stroke} d="M16 5v8m-2-6 2-2 2 2" />
      </>
    ),
    dtc: <path {...stroke} d="m10 3 7 7-7 7-7-7 7-7Z" />,
    marketplace: (
      <>
        <path {...stroke} d="M4 9v9h12V9" />
        <path {...stroke} d="M3 5h14l1 4c-2 1.8-4 1.8-6 0-2 1.8-4 1.8-6 0-1 1-2 1.4-3 1.1L3 5Z" />
        <path {...stroke} d="M8 18v-5h4v5" />
      </>
    ),
    other: (
      <>
        <circle cx="5" cy="10" r="1.3" fill="currentColor" />
        <circle cx="10" cy="10" r="1.3" fill="currentColor" />
        <circle cx="15" cy="10" r="1.3" fill="currentColor" />
      </>
    ),
    fashion: <path {...stroke} d="m6 5 3 2h2l3-2 3 3-2.5 2V18H5.5v-8L3 8l3-3Z" />,
    beauty: (
      <>
        <path {...stroke} d="M8 6h4v2H8zM7 8h6v10H7z" />
        <path {...stroke} d="M10 3v3" />
      </>
    ),
    home: (
      <>
        <path {...stroke} d="m2.5 10 7.5-6 7.5 6v8H2.5v-8Z" />
        <path {...stroke} d="M8 18v-5h4v5" />
      </>
    ),
    electronics: (
      <>
        <rect x="6" y="3" width="8" height="16" rx="1.4" {...stroke} />
        <path {...stroke} d="M9 16h2" />
      </>
    ),
    fitness: (
      <>
        <path {...stroke} d="M4 8v8m3-10v12m6-12v12m3-10v8M7 12h10" />
      </>
    ),
    pets: (
      <>
        <circle cx="7" cy="7" r="2" fill="currentColor" />
        <circle cx="13" cy="5.5" r="2" fill="currentColor" />
        <circle cx="17" cy="9" r="2" fill="currentColor" />
        <path
          d="M7.5 17c0-3 2-5 4.5-5s4.5 2 4.5 5c0 1.6-1.3 2-2.3 1.4-.8-.5-1.6-.5-2.4 0-1 .6-2.3.2-2.3-1.4Z"
          fill="currentColor"
        />
      </>
    ),
    experience: (
      <>
        <path {...stroke} d="M4 18v-4m5 4V9m5 9V5" />
        <path {...stroke} d="M3 20h14" />
      </>
    ),
  };
  return (
    <svg className={className} viewBox="0 0 20 22" fill="none" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

type ConnectionMethod = 'shopify' | 'woocommerce' | 'manual' | null;
type BusinessType = 'Dropshipping' | 'DTC brand' | 'Marketplace seller' | 'Other';
type Category = 'Fashion' | 'Beauty' | 'Home' | 'Electronics' | 'Fitness' | 'Pets' | 'Other';
type Experience = 'Beginner' | 'Intermediate' | 'Advanced';
type IconType = typeof Store;

const goalOptions: { id: string; title: string; description: string; icon: ReferenceIconName }[] = [
  {
    id: 'products',
    title: 'Find winning products',
    description: 'Discover products with growth potential.',
    icon: 'products',
  },
  {
    id: 'ads',
    title: 'Create better ads',
    description: 'Generate high-performing creative concepts.',
    icon: 'ads',
  },
  {
    id: 'sales',
    title: 'Increase sales',
    description: 'Identify opportunities to improve conversion.',
    icon: 'sales',
  },
  {
    id: 'scale',
    title: 'Scale my store',
    description: 'Understand what is driving profitable growth.',
    icon: 'rocket',
  },
  {
    id: 'performance',
    title: 'Track performance',
    description: 'Monitor revenue, profit and advertising performance.',
    icon: 'performance',
  },
];

const connectionOptions = [
  {
    id: 'shopify' as const,
    name: 'Shopify',
    description: 'Import your products, orders, and customers in one click.',
    buttonLabel: 'Connect Shopify',
  },
  {
    id: 'woocommerce' as const,
    name: 'WooCommerce',
    description: 'Sync your store data and unlock powerful insights.',
    buttonLabel: 'Connect WooCommerce',
  },
  {
    id: 'manual' as const,
    name: 'Manual setup',
    description: 'Add your store details manually. You can connect it later.',
    buttonLabel: 'Set up later',
  },
];

function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`select-none ${className}`}>
      <div className="flex items-center gap-2">
        <svg
          className="h-[37px] w-[42px] shrink-0"
          viewBox="0 0 54 43"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m3 35 15.7-10.8 8.6 5.4L42.8 9.2H37V3h14v14h-5.1v-3.2L28 35.1 18.2 29 6.3 38.6 3 35Z"
            fill="#d94808"
          />
          <path
            d="m5.7 30.8 13-9 8.6 5.4 14.5-16.7H37V5h14v14h-5.1v-3.6L28 36.7 18.2 30.6 7.1 38.1 5.7 30.8Z"
            fill="#f59e0b"
            opacity=".72"
          />
        </svg>
        <span className="-translate-y-px text-[39px] font-extrabold leading-none tracking-[-.055em] text-[#0b0b0b]">
          Trend<span className="text-[#d94808]">ED</span>
        </span>
      </div>
      <p className="ml-[4px] mt-1 text-[12px] font-medium leading-none text-[#303030]">
        E-commerce . Dropshipping . Growth
      </p>
    </div>
  );
}

function SelectionDot({ selected, compact = false }: { selected: boolean; compact?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full border ${compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} ${selected ? 'border-[#f1a400] bg-[#f1a400]' : 'border-[#d7d7d7] bg-white'}`}
      aria-hidden="true"
    >
      {selected && (
        <Check className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} stroke-[3] text-white`} />
      )}
    </span>
  );
}

function StepTracker({ active }: { active: number }) {
  return (
    <ol className="flex items-center" aria-label="Onboarding progress">
      {[1, 2, 3, 4].map((item, index) => (
        <li key={item} className="flex items-center">
          <span
            className={`flex h-[27px] w-[27px] items-center justify-center rounded-full border text-[13px] font-medium ${item === active ? 'border-[#dd530f] bg-[#dd530f] text-white shadow-[0_2px_5px_rgba(215,77,12,.28)]' : 'border-[#d0d0d0] bg-white text-[#555]'}`}
          >
            {item}
          </span>
          {index < 3 && <span className="h-px w-[85px] bg-[#d8d8d8]" />}
        </li>
      ))}
    </ol>
  );
}

function FooterButton({
  children,
  primary = false,
  wide = false,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  wide?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[46px] items-center justify-center gap-2 rounded-[6px] px-7 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d94808] ${primary ? `${wide ? 'min-w-[246px]' : 'min-w-[225px]'} bg-[#d94808] text-white shadow-[0_4px_10px_rgba(217,72,8,.18)] hover:bg-[#bd3e05]` : 'min-w-[184px] border border-[#dedede] bg-white text-[#3d3d3d] hover:bg-[#fafafa]'}`}
    >
      {children}
    </button>
  );
}

function DashboardDecoration() {
  return (
    <div
      className="pointer-events-none absolute right-[-18px] top-0 hidden h-[145px] w-[330px] origin-top-right scale-[1.35] lg:block"
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-0 h-[121px] rounded-[54px] bg-[#fff8ed]" />
      <svg
        className="absolute right-[-1px] top-0 h-[42px] w-[67px]"
        viewBox="0 0 67 42"
        fill="none"
        aria-hidden="true"
      >
        {[7, 19, 31, 43, 55].map((cx) => (
          <circle key={`first-${cx}`} cx={cx} cy="7" r="1.15" fill="#dfbd58" opacity=".72" />
        ))}
        {[7, 19, 31, 43, 55].map((cx) => (
          <circle key={`second-${cx}`} cx={cx} cy="18" r="1.15" fill="#dfbd58" opacity=".72" />
        ))}
        {[7, 19, 31, 43, 55].map((cx) => (
          <circle key={`third-${cx}`} cx={cx} cy="29" r="1.15" fill="#dfbd58" opacity=".72" />
        ))}
      </svg>
      <div className="absolute left-0 top-[8px] h-[104px] w-[156px] rounded-[5px] border border-[#f4f0e8] bg-white px-3 py-3 shadow-[0_6px_16px_rgba(94,68,37,.07)]">
        <p className="text-[7px] font-medium text-[#6a6a6a]">Total Revenue</p>
        <p className="mt-0.5 text-[12px] font-bold leading-none text-[#363636]">
          $24,680 <span className="ml-0.5 text-[7px] font-medium text-[#64996d]">▲ 18.6%</span>
        </p>
        <svg className="mt-3 h-[49px] w-full" viewBox="0 0 132 49" fill="none">
          <path d="M0 8h132M0 24h132M0 40h132" stroke="#f4f0e9" strokeWidth=".8" />
          <path
            d="m2 40 13-11 11 6 14-19 12 12 15-5 12 7 15-17 13 15 10-4"
            stroke="#d6b15b"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute left-[151px] top-[29px] h-[116px] w-[157px] rotate-[2deg] rounded-[6px] border border-[#f4f0e8] bg-white px-4 py-4 shadow-[0_7px_18px_rgba(94,68,37,.08)]">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-full border-[8px] border-[#d98715] border-r-[#faedce]" />
          <div>
            <p className="text-[7px] font-semibold leading-none text-[#505050]">Products</p>
            <p className="mt-1 text-[6px] text-[#9b9b9b]">Top sellers</p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-[7px] font-medium text-[#c9962a]">$24.6k</span>
          <Image
            src="/headphones-product.png"
            alt=""
            width={43}
            height={43}
            className="h-[43px] w-[43px] rounded-sm object-cover opacity-55"
          />
        </div>
      </div>
    </div>
  );
}

function AsideBenefit({
  icon: Icon,
  iconSrc,
  title,
  text,
}: {
  icon: IconType;
  iconSrc?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff5e8] text-[#d47a29]">
        {iconSrc ? (
          <SvgAssetIcon src={iconSrc} className="h-[17px] w-[17px]" />
        ) : (
          <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
        )}
      </span>
      <div>
        <p className="text-[12px] font-bold leading-4 text-[#2a2522]">{title}</p>
        <p className="text-[12px] leading-4 text-[#77706c]">{text}</p>
      </div>
    </div>
  );
}

function BusinessIllustration() {
  return (
    <div className="-mx-[32px] mt-2 h-[180px] w-[300px] overflow-hidden" aria-hidden="true">
      <Image
        src="/onboarding/business-growth-illustration.png"
        alt=""
        width={1550}
        height={1024}
        className="-mt-5 h-auto w-[300px] max-w-none"
      />
    </div>
  );
}

function WelcomeAside() {
  return (
    <aside className="hidden w-[365px] shrink-0 overflow-hidden border-r border-[#f0ede7] bg-[#fffdf8] px-[51px] py-[66px] lg:block">
      <Brand />
      <div className="mt-[69px] max-w-[243px]">
        <h2 className="font-editorial text-[31px] leading-[1.16] text-[#16120f]">
          All-in-one platform <em className="font-normal text-[#bf561d]">to build, grow</em> and
          scale your e-commerce business.
        </h2>
        <span className="mt-5 block h-px w-7 bg-[#c75b25]" />
        <div className="mt-5 space-y-5">
          <AsideBenefit
            icon={Search}
            iconSrc="/logos/onboarding/boxicons--search-big.svg"
            title="Discover winning products"
            text="Find trending products with data-backed demand."
          />
          <AsideBenefit
            icon={Sparkles}
            iconSrc="/logos/onboarding/akar-icons--sparkles.svg"
            title="Create high-converting ads"
            text="Generate AI ad creatives that convert and scale."
          />
          <AsideBenefit
            icon={BarChart3}
            iconSrc="/logos/onboarding/bi--bar-chart-line.svg"
            title="Track & grow your business"
            text="Monitor performance and make smarter growth decisions."
          />
        </div>
      </div>
      <BusinessIllustration />
    </aside>
  );
}

function IntroArt() {
  return (
    <div className="relative mx-auto h-[206px] w-[238px]" aria-hidden="true">
      <div className="absolute left-3 top-0 h-[177px] w-[182px] rotate-[-6deg] rounded-[6px] border border-[#f2e6d2] bg-white/80 p-3 shadow-[0_13px_25px_rgba(120,93,55,.11)]">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#df8054]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#e7bb5f]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c7d28d]" />
        </div>
        <div className="mt-5 flex gap-3">
          <div className="h-16 w-[65px] overflow-hidden rounded bg-[#f6f3ed]">
            <Image
              src="/headphones-product.png"
              alt=""
              width={65}
              height={64}
              className="h-16 w-[65px] object-cover"
            />
          </div>
          <div className="h-16 flex-1 rounded bg-[#faf8f4]" />
        </div>
        <p className="mt-2 text-[11px] text-[#96908a]">$28.45</p>
        <svg className="mt-1 h-12 w-full" viewBox="0 0 150 48" fill="none">
          <path d="m2 37 21-7 15 4 22-23 19 14 28-6 15-15 24 6" stroke="#e5ad43" strokeWidth="2" />
        </svg>
      </div>
      <div className="absolute right-0 top-[77px] w-[105px] rounded-[5px] bg-white px-3 py-2 shadow-[0_7px_18px_rgba(121,82,33,.13)]">
        <p className="text-[7px] text-[#7e766f]">Winning Product!</p>
        <p className="mt-1 text-[13px] font-semibold text-[#5d9b67]">High</p>
      </div>
      <div className="absolute bottom-0 right-0 h-[102px] w-[101px] rotate-[3deg] rounded-[5px] bg-white p-3 shadow-[0_7px_18px_rgba(121,82,33,.12)]">
        <div className="flex h-full items-end justify-between gap-1">
          <span className="h-[31%] w-4 bg-[#f6ca72]" />
          <span className="h-[51%] w-4 bg-[#e8a737]" />
          <span className="h-[72%] w-4 bg-[#f6c45e]" />
          <span className="h-full w-4 bg-[#e29a1e]" />
        </div>
      </div>
    </div>
  );
}

function GoalsAside() {
  return (
    <aside className="hidden w-[323px] shrink-0 bg-[#fffdf9] px-[54px] py-[66px] lg:block">
      <Brand />
      <div className="mt-[139px]">
        <IntroArt />
      </div>
      <div className="-ml-[22px] mt-[72px] w-[250px] rounded-[7px] bg-white p-4 shadow-[0_8px_20px_rgba(107,76,36,.09)]">
        <div className="flex items-center gap-2">
          <Image
            src="/login-profile.jpg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-[15px] tracking-[2px] text-[#e7ab21]">*****</span>
        </div>
        <p className="mt-2 text-[11px] leading-[17px] text-[#26211e]">
          &quot;TrendED helped me go from zero to six figures. The product insights and ad creator
          are absolute game changers.&quot;
        </p>
        <p className="mt-3 text-[11px] font-bold text-[#2f2924]">- Alex R.</p>
        <p className="text-[10px] text-[#78716c]">7-Figure Dropshipper</p>
      </div>
    </aside>
  );
}

function ConnectionMark({ id }: { id: Exclude<ConnectionMethod, null> }) {
  if (id === 'shopify')
    return (
      <Image
        src="/logos/shopify.jpeg"
        alt=""
        width={49}
        height={56}
        className="h-14 w-[49px] object-contain"
        aria-hidden="true"
      />
    );
  if (id === 'woocommerce')
    return (
      <Image
        src="/logos/woocommerce-transparent.png"
        alt=""
        width={64}
        height={64}
        className="-mt-1 h-16 w-16 object-contain"
        aria-hidden="true"
      />
    );
  return <Store className="h-14 w-14 text-[#f5b82e]" strokeWidth={1.9} aria-hidden="true" />;
}

function ConnectionSidebar({ active }: { active: number }) {
  const items = [
    ['Welcome', "Let's get started"],
    ['Business details', 'Tell us about your business'],
    ['Connect your store', 'Bring in your data'],
    ['Your goals', 'Help us personalize your experience'],
  ];
  return (
    <aside className="hidden border-r border-[#e8e8e8] bg-[#fffefd] px-7 pb-[49px] pt-[42px] lg:flex lg:w-[285px] lg:shrink-0 lg:flex-col">
      <Brand />
      <ol className="ml-1.5 mt-[68px] space-y-9" aria-label="Onboarding progress">
        {items.map(([title, description], index) => {
          const number = index + 1;
          const completed = number < active;
          const current = number === active;
          return (
            <li key={title} className="flex items-start gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${current ? 'border-[#eab308] bg-[#fffdf8] text-[#b7791f]' : completed ? 'border-[#9b9b9b] text-[#595959]' : 'border-[#d3d3d3] text-[#999999]'}`}
              >
                {completed ? <Check className="h-4 w-4" /> : number}
              </span>
              <span className="pt-0.5">
                <span
                  className={`block text-[15px] font-medium ${current ? 'text-[#b64a17]' : 'text-[#5d5d5d]'}`}
                >
                  {title}
                </span>
                <span className="mt-1 block max-w-[180px] text-[13px] leading-5 text-[#848484]">
                  {description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto h-[130px] rounded-sm bg-[#fff8e9] px-5 py-4">
        <div className="flex items-start gap-2">
          <LockKeyhole className="mt-0.5 h-6 w-6 shrink-0 text-[#eab308]" />
          <div>
            <p className="text-[13px] font-semibold text-[#333]">Your data is safe with us</p>
            <p className="mt-2 text-[13px] leading-[23px] text-[#6f6f6f]">
              We use enterprise-grade security to protect your store information.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  icons,
  assetIcons,
  columns,
  compact = false,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  icons: ReferenceIconName[];
  assetIcons?: string[];
  columns: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-[15px] font-semibold">{label}</p>
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option, index) => {
          const selected = value === option;
          const icon = icons[index];
          return (
            <button
              type="button"
              key={option}
              onClick={() => onChange(option)}
              className={`flex h-[54px] min-w-0 items-center rounded-[6px] border text-left transition ${compact ? 'gap-1.5 px-2 text-[12px]' : 'gap-3 px-3 text-[14px]'} ${selected ? 'border-[#cf9a70] bg-[#fffcf8] shadow-[inset_0_0_0_1px_#f5e3d7]' : 'border-[#e4e4e4] bg-white hover:border-[#cf9a70]'}`}
            >
              {assetIcons ? (
                <span className="shrink-0 text-[#c58452]">
                  <SvgAssetIcon
                    src={assetIcons[index]}
                    className={compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'}
                  />
                </span>
              ) : (
                <ReferenceIcon
                  name={icon}
                  className={`${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'} shrink-0 text-[#c58452]`}
                />
              )}
              <span className={`min-w-0 font-medium ${compact ? 'whitespace-nowrap' : 'truncate'}`}>
                {option}
              </span>
              <span className="ml-auto shrink-0">
                <SelectionDot selected={selected} compact={compact} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ReferenceIconName>('scaling');
  const [businessType, setBusinessType] = useState<BusinessType>('Dropshipping');
  const [category, setCategory] = useState<Category>('Fashion');
  const [experience, setExperience] = useState<Experience>('Beginner');
  const [connection, setConnection] = useState<ConnectionMethod>(null);
  const [goals, setGoals] = useState<string[]>(goalOptions.map((goal) => goal.id));
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'John Doe';
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : 'JD';
  const back = () => (step === 1 ? router.back() : setStep((current) => current - 1));
  const next = () => (step === 4 ? router.push('/dashboard') : setStep((current) => current + 1));

  if (step === 1)
    return (
      <div className="min-h-[100dvh] overflow-hidden bg-[#fffefd] text-[#121212]">
        <div className="relative mx-auto min-h-[100dvh] max-w-[1440px] px-8 pb-10 pt-[57px] lg:px-[84px]">
          <Brand />
          <DashboardDecoration />
          <section className="mx-auto mt-[34px] flex w-full max-w-[1028px] flex-col items-center lg:mt-[28px]">
            <StepTracker active={1} />
            <p className="mt-8 text-[13px] font-semibold text-[#bf5d29]">STEP 1 OF 4</p>
            <h1 className="mt-4 text-center text-[34px] font-bold leading-[1.14] sm:text-[41px]">
              Let&apos;s build your
              <br />
              <em className="font-editorial font-normal text-[#c75219]">
                e-commerce growth system.
              </em>
            </h1>
            <p className="mt-4 text-center text-[16px] text-[#6d6d6d]">
              Tell us a little about your business so TrendED can personalize your experience.
            </p>
            <h2 className="mt-7 text-center text-[20px] font-bold">What best describes you?</h2>
            <div className="mt-6 grid w-full max-w-[996px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['starting', "I'm starting", 'my first store'],
                ['selling', 'I already', 'sell online'],
                ['dropshipper', "I'm a", 'dropshipper'],
                ['scaling', "I'm scaling", 'an existing brand'],
              ].map(([id, title, description]) => {
                const selected = profile === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setProfile(id as ReferenceIconName)}
                    className={`relative flex h-[188px] flex-col items-center justify-center rounded-[7px] border text-center transition ${selected ? 'border-[#d5b15c] bg-[#fffaf0] shadow-[inset_0_0_0_1px_#f1e3bb]' : 'border-[#e7e7e7] bg-white hover:border-[#d5b15c]'}`}
                  >
                    <span
                      className={`mb-4 flex h-[67px] w-[67px] items-center justify-center rounded-full ${selected ? 'bg-[#fff4d9] text-[#e0a400]' : 'bg-[#fff3ef] text-[#c76a3a]'}`}
                    >
                      <SvgAssetIcon
                        src={profileIconSources[id as keyof typeof profileIconSources]}
                      />
                    </span>
                    <span className="text-[17px] font-bold leading-5">{title as string}</span>
                    <span className="mt-1 text-[16px] leading-5 text-[#6d6d6d]">
                      {description as string}
                    </span>
                    {selected && (
                      <span className="absolute right-[10px] top-[10px] flex h-[26px] w-[26px] items-center justify-center rounded-[5px] bg-[#efaa00] text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
          <footer className="mx-auto mt-10 flex w-full max-w-[1028px] items-center justify-between lg:mt-[40px]">
            <FooterButton onClick={back}>Back</FooterButton>
            <FooterButton primary onClick={next}>
              Continue <ArrowRight className="h-5 w-5" />
            </FooterButton>
          </footer>
        </div>
      </div>
    );

  if (step === 2)
    return (
      <div className="min-h-[100dvh] bg-[#fffdf9] text-[#161616]">
        <div className="flex min-h-[100dvh] flex-col lg:flex-row">
          <WelcomeAside />
          <main className="flex flex-1 items-center justify-center px-5 py-8 lg:items-start lg:justify-start lg:py-6 lg:pl-0 lg:pr-0">
            <section className="flex min-h-[720px] w-full max-w-[956px] flex-col rounded-[8px] border border-[#f0ece7] bg-white shadow-[0_7px_20px_rgba(65,48,24,.04)] lg:max-w-none lg:rounded-r-none">
              <div className="px-7 pt-[46px] sm:px-10 lg:px-[54px]">
                <span className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-[#fff5ed] text-[#d77c46]">
                  <SvgAssetIcon
                    src="/logos/onboarding/fluent--clipboard-text-edit-32-regular.svg"
                    className="h-7 w-7"
                  />
                </span>
                <h1 className="mt-4 text-[34px] font-bold leading-none sm:text-[39px]">
                  Tell us about your business.
                </h1>
                <p className="mt-4 text-[16px] text-[#686868]">
                  This helps TrendED surface more relevant products, insights and recommendations.
                </p>
                <div className="mt-8 space-y-6">
                  <OptionGroup
                    label="Business type"
                    options={
                      ['Dropshipping', 'DTC brand', 'Marketplace seller', 'Other'] as BusinessType[]
                    }
                    value={businessType}
                    onChange={setBusinessType}
                    icons={['dropshipping', 'dtc', 'marketplace', 'other']}
                    assetIcons={[
                      '/logos/onboarding/la--parachute-box.svg',
                      '/logos/onboarding/streamline-ultimate--delivery-package-person.svg',
                      '/logos/onboarding/fluent--building-shop-24-regular.svg',
                      '/logos/onboarding/fluent--more-circle-16-regular.svg',
                    ]}
                    columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                  />
                  <OptionGroup
                    label="Main category"
                    options={
                      [
                        'Fashion',
                        'Beauty',
                        'Home',
                        'Electronics',
                        'Fitness',
                        'Pets',
                        'Other',
                      ] as Category[]
                    }
                    value={category}
                    onChange={setCategory}
                    icons={['fashion', 'beauty', 'home', 'electronics', 'fitness', 'pets', 'other']}
                    assetIcons={[
                      '/logos/onboarding/keyline-icons--shirt.svg',
                      '/logos/onboarding/streamline-pixel--beauty-cosmatic-brush-set.svg',
                      '/logos/onboarding/ant-design--home-outlined.svg',
                      '/logos/onboarding/gravity-ui--smartphone.svg',
                      '/logos/onboarding/circum--dumbbell.svg',
                      '/logos/onboarding/ph--paw-print-light.svg',
                      '/logos/onboarding/fluent--more-circle-16-regular.svg',
                    ]}
                    columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-7"
                    compact
                  />
                  <div>
                    <p className="mb-3 text-[15px] font-semibold">Target market</p>
                    <button
                      type="button"
                      className="flex h-[52px] w-full items-center justify-between rounded-[5px] border border-[#e4e4e4] px-4 text-[15px] text-[#8a8a8a]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[#6b6b6b]">
                          <SvgAssetIcon
                            src="/logos/onboarding/fluent-mdl2--globe.svg"
                            className="h-5 w-5"
                          />
                        </span>
                        Select country / region
                      </span>
                      <ChevronDown className="h-5 w-5 text-[#222]" />
                    </button>
                  </div>
                  <OptionGroup
                    label="Experience level"
                    options={['Beginner', 'Intermediate', 'Advanced'] as Experience[]}
                    value={experience}
                    onChange={setExperience}
                    icons={['experience', 'experience', 'experience']}
                    assetIcons={[
                      '/logos/onboarding/bi--bar-chart.svg',
                      '/logos/onboarding/bi--bar-chart.svg',
                      '/logos/onboarding/bi--bar-chart.svg',
                    ]}
                    columns="grid-cols-1 sm:grid-cols-3"
                  />
                </div>
              </div>
              <footer className="mt-auto flex items-center justify-between border-t border-[#f3f2ef] px-7 py-5 sm:px-10 lg:px-[54px]">
                <FooterButton onClick={back}>Back</FooterButton>
                <div className="hidden items-center gap-4 lg:flex">
                  <span className="h-3 w-3 rounded-full bg-[#efefef]" />
                  <span className="h-3 w-3 rounded-full bg-[#e36920]" />
                  <span className="h-3 w-3 rounded-full bg-[#ededed]" />
                  <span className="h-3 w-3 rounded-full bg-[#ededed]" />
                </div>
                <FooterButton primary onClick={next}>
                  Continue <ArrowRight className="h-5 w-5" />
                </FooterButton>
              </footer>
            </section>
          </main>
        </div>
      </div>
    );

  if (step === 3)
    return (
      <div className="min-h-[100dvh] bg-[#fffefd] text-[#171717]">
        <div className="flex min-h-[100dvh]">
          <ConnectionSidebar active={3} />
          <main className="flex min-w-0 flex-1 flex-col px-6 py-7 sm:px-10 lg:pl-[61px] lg:pr-[48px]">
            <header className="flex items-center justify-between lg:justify-end">
              <div className="lg:hidden">
                <Brand />
              </div>
              <div className="flex items-center gap-6 text-[#383838]">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#747474] text-[13px] font-semibold"
                  aria-label="Get help"
                >
                  ?
                </button>
                <button type="button" className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fff0c4] text-[13px] font-bold text-[#51441b]">
                    {initials}
                  </span>
                  <span className="hidden sm:inline">{displayName}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </header>
            <section className="flex w-full max-w-[916px] flex-1 flex-col justify-center pb-7 pt-8 lg:translate-y-[13px] lg:pb-0 lg:pt-0">
              <div className="mb-4 inline-flex w-fit rounded-[4px] bg-[#fff8e8] px-2 py-0 text-[12px] font-medium leading-[18px] text-[#bd8420]">
                3 of 4
              </div>
              <h1 className="font-editorial text-[42px] leading-[1.12] sm:text-[56px]">
                Connect <em className="font-normal text-[#c2410c]">your store.</em>
              </h1>
              <p className="mt-3 text-[16px] text-[#5c5c5c]">
                Bring your products and sales data into TrendED.
              </p>
              <div className="mt-[34px] grid grid-cols-1 gap-[18px] md:grid-cols-3">
                {connectionOptions.map((option) => {
                  const selected = connection === option.id;
                  const manual = option.id === 'manual';
                  return (
                    <article
                      key={option.id}
                      className={`flex h-[304px] flex-col rounded-[8px] border bg-white px-[22px] pb-[23px] pt-5 ${selected ? 'border-[#c2410c] ring-1 ring-[#c2410c]' : 'border-[#ddd]'}`}
                    >
                      <ConnectionMark id={option.id} />
                      <h2 className="mt-[17px] text-[19px] font-bold">{option.name}</h2>
                      <p className="mt-[10px] text-[14px] leading-5 text-[#676767]">
                        {option.description}
                      </p>
                      <div
                        className={`mt-[23px] inline-flex w-fit items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[12px] font-medium ${manual ? 'bg-[#fff9e9] text-[#b98822]' : 'bg-[#f1faef] text-[#42814a]'}`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] text-white ${manual ? 'border border-[#d8bb70] text-[#c99f38]' : 'bg-[#55a153]'}`}
                        >
                          {manual ? 'o' : <Check className="h-3 w-3" />}
                        </span>
                        {selected
                          ? manual
                            ? 'Will set up later'
                            : 'Selected'
                          : manual
                            ? 'Not set up'
                            : 'Not connected'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setConnection(option.id)}
                        className="mt-auto h-10 w-full rounded-[4px] bg-[#c2410c] px-3 text-sm font-semibold text-white transition hover:bg-[#a83a0a]"
                      >
                        {selected ? 'Selected' : option.buttonLabel}
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="relative mt-[21px] min-h-[79px] overflow-hidden rounded-[5px] border border-[#fff0c6] bg-[#fffaf0] px-6 py-4">
                <div className="flex items-start gap-[18px]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1c8] text-[#eab308]">
                    <LockKeyhole className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#2c2c2c]">
                      Your credentials are securely handled.
                    </p>
                    <p className="mt-1 text-[13px] text-[#777]">
                      We use industry-standard encryption and never store your password.
                    </p>
                  </div>
                </div>
                <LockKeyhole
                  className="absolute right-12 top-5 h-14 w-14 text-[#e5d8b8]"
                  strokeWidth={1.2}
                />
              </div>
              <div className="mt-[31px] flex items-center justify-between">
                <FooterButton onClick={back}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </FooterButton>
                <FooterButton primary onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </FooterButton>
              </div>
            </section>
          </main>
        </div>
      </div>
    );

  return (
    <div className="min-h-[100dvh] bg-[#fffefd] text-[#131313]">
      <div className="flex min-h-[100dvh]">
        <GoalsAside />
        <main className="flex min-w-0 flex-1 flex-col px-6 py-8 sm:px-12 lg:pl-[71px] lg:pr-[70px]">
          <header className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <Brand />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-[13px] font-medium text-[#3f3f3f]"
            >
              <CircleHelp className="h-5 w-5" />
              Need help?
            </button>
          </header>
          <section className="flex w-full max-w-[902px] flex-1 flex-col justify-center pb-7 lg:translate-y-[35px]">
            <h1 className="font-editorial text-[51px] leading-[1.05] sm:text-[59px]">
              What do you want to <em className="font-normal text-[#c75219]">achieve?</em>
            </h1>
            <p className="mt-4 text-[16px] text-[#626262]">
              Choose your main goals so TrendED can prioritize what matters.
            </p>
            <div className="mt-9 grid max-w-[890px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goalOptions.map((goal) => {
                const selected = goals.includes(goal.id);
                return (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() =>
                      setGoals((current) =>
                        selected ? current.filter((id) => id !== goal.id) : [...current, goal.id],
                      )
                    }
                    className={`relative h-[188px] rounded-[8px] border p-7 text-left transition ${selected ? 'border-[#cb9665] bg-[#fffdf9] shadow-[inset_0_0_0_1px_#f3e5d7]' : 'border-[#e2e2e2] bg-white hover:border-[#cb9665]'}`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5e6] text-[#db8a15]">
                      <ReferenceIcon name={goal.icon} className="h-7 w-7" />
                    </span>
                    <h2 className="mt-4 text-[17px] font-bold">{goal.title}</h2>
                    <p className="mt-2 max-w-[200px] text-[14px] leading-5 text-[#686868]">
                      {goal.description}
                    </p>
                    {selected && (
                      <span className="absolute right-[16px] top-[16px] flex h-[25px] w-[25px] items-center justify-center rounded-[5px] bg-[#e74912] text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <footer className="mt-[66px] flex items-end justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#7a633c]">4 of 4</p>
                <div className="mt-2 flex gap-1.5">
                  <span className="h-[7px] w-[103px] rounded-full bg-[#d94808]" />
                  <span className="h-[7px] w-[103px] rounded-full bg-[#d94808]" />
                  <span className="h-[7px] w-[103px] rounded-full bg-[#d94808]" />
                </div>
              </div>
              <FooterButton primary wide onClick={next}>
                Enter TrendED <ArrowRight className="h-5 w-5" />
              </FooterButton>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
