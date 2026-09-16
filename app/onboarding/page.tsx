'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

type ConnectionMethod = 'shopify' | 'woocommerce' | 'manual' | null;

const steps = [
  { title: 'Welcome', description: "Let's get started" },
  { title: 'Business details', description: 'Tell us about your business' },
  { title: 'Connect your store', description: 'Bring in your data' },
  { title: 'Your goals', description: 'Help us personalize your experience' },
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

function OnboardingBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex flex-col select-none">
      <div className="flex h-8 items-center gap-2">
        <svg
          className="h-[29px] w-[45px] shrink-0"
          viewBox="0 0 54 33"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 27.5 18.5 17.2l8.4 5.2L42.5 6H37V1h16v16h-5.2v-5.7L28.2 30 18 23.7 5 31.8 2 27.5Z"
            fill="#c2410c"
          />
        </svg>
        <span
          className={`${compact ? 'text-[25px]' : 'translate-y-[-3px] text-[31px]'} leading-none font-extrabold text-[#171717]`}
        >
          Trend<span className="text-[#c2410c]">ED</span>
        </span>
      </div>
      {!compact && (
        <span className="ml-[53px] mt-2 text-[8px] font-semibold text-[#737373]">
          E-COMMERCE · DROPSHIPPING · GROWTH
        </span>
      )}
    </div>
  );
}

function ConnectionMark({ id }: { id: Exclude<ConnectionMethod, null> }) {
  if (id === 'shopify') {
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
  }

  if (id === 'woocommerce') {
    return (
      <div className="relative h-14 w-16" aria-hidden="true">
        <Image
          src="/logos/woocommerce-transparent.png"
          alt=""
          width={64}
          height={64}
          className="absolute -top-1 left-0 h-16 w-16 object-contain"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <svg className="h-14 w-14" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <path d="M10 23.5v25h40v-25" fill="white" stroke="#efb72e" strokeWidth="3" />
      <path
        d="M7 8h46l4 14.5c-3.1 3.4-7.8 3.4-10.9 0-3.1 3.4-7.8 3.4-10.9 0-3.1 3.4-7.8 3.4-10.9 0-3.1 3.4-7.8 3.4-10.9 0-2.1 2.3-5.1 3.1-7.4 2.2L7 8Z"
        fill="#ffc447"
        stroke="#efb72e"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path d="M26 48.5V37h8v11.5" stroke="#efb72e" strokeWidth="3" />
    </svg>
  );
}

function ShieldMark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-[#fff1c8] ${small ? 'h-7 w-7' : 'h-8 w-8'}`}
      aria-hidden="true"
    >
      <span
        className={`${small ? 'h-3.5 w-3.5' : 'h-4 w-4'} bg-[#eab308] [clip-path:polygon(50%_0,91%_18%,84%_72%,50%_100%,16%_72%,9%_18%)]`}
      />
    </span>
  );
}

function SecurityIllustration() {
  return (
    <div
      className="pointer-events-none absolute right-[50px] top-1/2 hidden h-20 w-36 -translate-y-1/2 lg:block"
      aria-hidden="true"
    >
      <span className="absolute left-1 top-[27px] h-3 w-3 rotate-45 bg-[#f3c665] opacity-65" />
      <span className="absolute left-[22px] top-[12px] h-2 w-2 rotate-45 bg-[#f6dc9d]" />
      <span className="absolute right-3 top-[7px] h-[39px] w-[30px] rounded-t-[17px] border-[5px] border-b-0 border-[#e7dfd2]" />
      <span className="absolute right-0 top-[38px] flex h-[37px] w-[55px] items-center justify-center rounded-[5px] bg-[#eec95c] shadow-[inset_0_0_0_4px_#f6e7b6]">
        <span className="h-3 w-2 rounded-t-full bg-[#fff7e3]" />
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selection, setSelection] = useState<ConnectionMethod>(null);

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'John Doe';
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : 'JD';

  return (
    <div className="min-h-[100dvh] bg-[#fffefd] text-[#171717]">
      <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[285px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#e8e8e8] bg-[#fffefd] px-7 pb-[49px] pt-[42px] lg:flex lg:flex-col">
          <OnboardingBrand />

          <ol className="ml-1.5 mt-[68px] space-y-9" aria-label="Onboarding progress">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const completed = stepNumber < 3;
              const current = stepNumber === 3;

              return (
                <li key={step.title} className="flex items-start gap-2.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                      current
                        ? 'border-[#eab308] bg-[#fffdf8] text-[#b7791f]'
                        : completed
                          ? 'border-[#9b9b9b] text-[#595959]'
                          : 'border-[#d3d3d3] text-[#999999]'
                    }`}
                    aria-current={current ? 'step' : undefined}
                  >
                    {completed ? '✓' : stepNumber}
                  </span>
                  <span className="pt-0.5">
                    <span
                      className={`block text-[15px] font-medium ${current ? 'text-[#b64a17]' : 'text-[#5d5d5d]'}`}
                    >
                      {step.title}
                    </span>
                    <span className="mt-1 block max-w-[180px] text-[13px] leading-5 text-[#848484]">
                      {step.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto h-[130px] rounded-sm bg-[#fff8e9] px-5 py-4">
            <div className="flex items-start gap-1">
              <ShieldMark small />
              <div className="pt-0.5">
                <p className="text-[13px] font-semibold text-[#333333]">
                  Your data is safe with us
                </p>
                <p className="mt-2 text-[13px] leading-[23px] text-[#6f6f6f]">
                  We use enterprise-grade security to protect your store information.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col px-6 py-7 sm:px-10 lg:pl-[61px] lg:pr-[48px] xl:pl-[61px] xl:pr-[48px]">
          <header className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <OnboardingBrand compact />
            </div>
            <div className="flex items-center gap-6 text-[#383838]">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#747474] text-[13px] font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
                aria-label="Get help"
              >
                ?
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-semibold"
                aria-label="Open account menu"
              >
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fff0c4] text-[13px] font-bold text-[#51441b]">
                  {initials}
                </span>
                <span className="hidden sm:inline">{displayName}</span>
                <span className="text-xs" aria-hidden="true">
                  ⌄
                </span>
              </button>
            </div>
          </header>

          <section className="mx-0 flex w-full max-w-[916px] flex-1 flex-col justify-center pb-7 pt-8 lg:translate-y-[13px] lg:pb-0 lg:pt-0">
            <div className="relative top-px mb-4 inline-flex w-fit rounded-[4px] bg-[#fff8e8] px-2 py-0 text-[12px] font-medium leading-[18px] text-[#bd8420]">
              3 of 4
            </div>
            <h1
              className="relative top-[7px] text-[42px] leading-[1.12] text-[#171717] sm:text-[56px]"
              style={{ fontFamily: "'Bodoni MT', Didot, 'Times New Roman', serif" }}
            >
              Connect <em className="font-normal text-[#c2410c]">your store.</em>
            </h1>
            <p className="relative top-[9px] mt-3 text-[16px] text-[#5c5c5c]">
              Bring your products and sales data into TrendED.
            </p>

            <div className="mt-[34px] grid grid-cols-1 gap-[18px] md:grid-cols-3">
              {connectionOptions.map((option) => {
                const selected = selection === option.id;
                const isManual = option.id === 'manual';

                return (
                  <article
                    key={option.id}
                    className={`flex h-[304px] flex-col rounded-[8px] border bg-white px-[22px] pb-[23px] pt-5 transition ${
                      selected ? 'border-[#c2410c] ring-1 ring-[#c2410c]' : 'border-[#dddddd]'
                    }`}
                  >
                    <ConnectionMark id={option.id} />
                    <h2 className="mt-[17px] text-[19px] font-bold text-[#171717]">
                      {option.name}
                    </h2>
                    <p className="mt-[10px] max-w-[230px] text-[14px] leading-5 text-[#676767]">
                      {option.description}
                    </p>
                    <div
                      className={`mt-[23px] inline-flex w-fit items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[12px] font-medium ${isManual ? 'bg-[#fff9e9] text-[#b98822]' : 'bg-[#f1faef] text-[#42814a]'}`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] text-white ${isManual ? 'border border-[#d8bb70] text-[#c99f38]' : 'bg-[#55a153]'}`}
                      >
                        {isManual ? '◷' : '✓'}
                      </span>
                      {selected
                        ? isManual
                          ? 'Will set up later'
                          : 'Selected'
                        : isManual
                          ? 'Not set up'
                          : 'Not connected'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelection(option.id)}
                      className="mt-auto h-10 w-full rounded-[4px] bg-[#c2410c] px-3 text-sm font-semibold text-white transition hover:bg-[#a83a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
                    >
                      {selected ? 'Selected' : option.buttonLabel}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="relative mt-[21px] min-h-[79px] overflow-hidden rounded-[5px] border border-[#fff0c6] bg-[#fffaf0] px-6 py-4">
              <div className="flex items-start gap-[18px]">
                <ShieldMark />
                <div>
                  <p className="text-[14px] font-semibold text-[#2c2c2c]">
                    Your credentials are securely handled.
                  </p>
                  <p className="mt-1 text-[13px] text-[#777777]">
                    We use industry-standard encryption and never store your password.
                  </p>
                </div>
              </div>
              <SecurityIllustration />
            </div>

            <div className="mt-[31px] flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-11 w-[115px] rounded-[5px] border border-[#dedede] bg-white text-sm font-medium text-[#4a4a4a] transition hover:border-[#b9b9b9] hover:bg-[#fafafa]"
              >
                <span className="flex items-center justify-center gap-2">
                  <span aria-hidden="true">←</span>
                  Back
                </span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="h-11 w-[170px] rounded-[5px] bg-[#c2410c] text-sm font-semibold text-white shadow-[0_5px_12px_rgba(194,65,12,0.16)] transition hover:bg-[#a83a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <span aria-hidden="true">→</span>
                </span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
