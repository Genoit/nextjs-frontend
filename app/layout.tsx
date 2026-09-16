import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';
import { inter, playfair, instrumentSerif, caveat } from './fonts';

export const metadata: Metadata = {
  title: 'TrendED - Turn Products into Scroll-Stopping UGC with AI',
  description:
    'AI-powered E-commerce and Dropshipping video generation platform. Create high-converting UGC advertising videos in minutes.',
  icons: {
    icon: '/symbol.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.className} ${playfair.variable} ${instrumentSerif.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
