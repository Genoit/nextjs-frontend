import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['firebase'],
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
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
