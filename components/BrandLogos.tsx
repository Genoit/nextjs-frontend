import React from 'react';

export function ShopifyLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-semibold text-zinc-800 ${className}`}>
      <svg className="h-6 w-6" viewBox="0 0 109 124" fill="none">
        <path
          d="M93.8 24.3c-.3-.8-1-1.3-1.8-1.3-.8 0-16.1-.2-16.1-.2s-10.7-10.6-11.8-11.7c-1.1-1.1-3.4-.8-4.3-.5-.2.1-5.7 1.8-14.7 4.6-2.5.8-3.7 1-4.8.3-.9-.6-2.2-2.1-3.6-4-3.2-4.3-6.9-6.4-11-6.4-1.1 0-2.2.2-3.3.6C18.6 11.7 15.3 17 14.5 24c-.6 5.6.8 11.8 4 17.5.3.6.8 1.1 1.4 1.3 1.2.6 1.4 1.5 1.4 2.8 0 12.1 4.7 66.8 6.7 75.8.5 2.1 2.3 3.6 4.5 3.6 0 0 31.8-2 31.8-2l28.9-6.9c2.3-.5 3.9-2.5 3.9-4.8.4-11.6 3.6-77.9 3.6-80.1 0-1.1-.3-2.1-.9-2.9-.6-.9-1.5-1.5-2.5-1.7l-3.6-.9z"
          fill="#95BF47"
        />
        <path
          d="M74.8 23.5L59.8 10.6c-1.1-1.1-3.4-.8-4.3-.5-.2.1-5.7 1.8-14.7 4.6l16.8 84.7 32.4-7.7-15.2-68.2z"
          fill="#5E8E3E"
        />
        <path
          d="M57.6 99.4L40.8 14.7c-2.5.8-3.7 1-4.8.3-.9-.6-2.2-2.1-3.6-4-3.2-4.3-6.9-6.4-11-6.4-1.1 0-2.2.2-3.3.6 5.8 4.7 9.8 16 10.7 24.3l11.2 70.2 17.6-.3z"
          fill="#355829"
        />
        <path
          d="M53.1 39.5c-4.4 0-8.8 3.5-8.8 9.5 0 8 11 11.2 11 16.7 0 3.3-2.4 5.3-5.6 5.3-4.2 0-7.3-2.4-8.8-5.9l-4.5 2.5c2.3 5.4 7 8.2 13.3 8.2 7.1 0 11.7-4.2 11.7-10.7 0-9.2-11.2-12-11.2-17.1 0-2.4 1.7-4 4.5-4 3.1 0 5.4 1.5 7.1 4.5l4.3-2.5c-2.7-4.3-6.7-6.5-13-6.5z"
          fill="#fff"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-zinc-900">shopify</span>
    </div>
  );
}

export function TikTokLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold text-zinc-900 ${className}`}>
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48 6.27 6.27 0 0 0 1.86-4.48V8.71a8.19 8.19 0 0 0 4.92 1.63V6.89a4.85 4.85 0 0 1-1-.2z" />
      </svg>
      <span className="text-xl tracking-tight">TikTok</span>
    </div>
  );
}

export function MetaFacebookLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold text-zinc-900 ${className}`}>
      <svg className="h-6 w-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      <span className="text-xl font-bold tracking-tight">facebook</span>
    </div>
  );
}

export function GoogleLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-semibold text-zinc-900 ${className}`}>
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span className="text-xl font-medium tracking-tight">Google</span>
    </div>
  );
}

export function PayPalLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold italic text-zinc-900 ${className}`}>
      <svg className="h-6 w-6 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.679 1.814 1.102 1.272 1.34 3.078.694 5.25-.972 3.255-3.325 5.093-6.974 5.093H9.805l-1.432 7.625a.64.64 0 0 1-.632.555h-.665z" />
      </svg>
      <span className="text-xl tracking-tight font-black not-italic text-[#003087]">
        Pay<span className="text-[#0079C1]">Pal</span>
      </span>
    </div>
  );
}

export function StripeLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 font-bold text-[#635BFF] ${className}`}>
      <span className="text-2xl font-black tracking-tighter">stripe</span>
    </div>
  );
}

export function KlaviyoLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold text-zinc-900 ${className}`}>
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 2 22 22 22" fill="#242424" />
      </svg>
      <span className="text-xl font-bold tracking-tight">klaviyo</span>
    </div>
  );
}
