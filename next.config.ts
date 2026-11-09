import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    '10.0.0.123',
    'localhost',
    '127.0.0.1',
    ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : []),
  ],
  transpilePackages: ['firebase'],
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },
  // The Shopify install callback lands on /settings with a one-time ticket in the URL:
  // no request made from that page may send it on as a Referer.
  async headers() {
    return [{ source: '/settings', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] }];
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trended-9c0ff'}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
