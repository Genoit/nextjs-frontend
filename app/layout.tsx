import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { ThemeSync } from '../components/ThemeToggle';
import { InlineScript } from '../components/InlineScript';
import { inter, playfair, instrumentSerif, caveat } from './fonts';

export const metadata: Metadata = {
  title: 'TrendED - Turn Products into Scroll-Stopping UGC with AI',
  description:
    'AI-powered E-commerce and Dropshipping video generation platform. Create high-converting UGC advertising videos in minutes.',
  icons: {
    icon: '/brand/favicon.png',
  },
};

// Runs before paint so a light-theme visitor never sees a dark flash. Same rules as resolveTheme in lib/theme.ts.
const THEME_BOOT = `try{var p=localStorage.getItem('trended_theme');var d=p==='light'?0:p==='system'?matchMedia('(prefers-color-scheme: dark)').matches:1;document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`h-full antialiased ${inter.className} ${inter.variable} ${playfair.variable} ${instrumentSerif.variable} ${caveat.variable}`}
    >
      <head>
        <InlineScript html={THEME_BOOT} />
      </head>
      <body className="min-h-full flex flex-col bg-studio-ground text-ink font-sans">
        <AuthProvider>
          <ThemeSync />
          <div className="flex flex-1 flex-col min-w-0">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
