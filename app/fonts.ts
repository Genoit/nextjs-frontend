import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const tempting = localFont({
  src: './fonts/Tempting.otf',
  display: 'swap',
  variable: '--font-tempting',
});
