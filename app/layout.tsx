import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';
import { inter, tempting } from './fonts';

export const metadata: Metadata = {
  title: 'TrendED - AI UGC Video Generation',
  description: 'AI UGC video generation platform for e-commerce',
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
    <html lang="en" className={`h-full antialiased ${inter.className} ${tempting.variable}`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
