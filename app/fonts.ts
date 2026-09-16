import localFont from 'next/font/local';
import { Inter, Playfair_Display, Instrument_Serif, Caveat } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument',
});

export const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});

export const tempting = localFont({
  src: './fonts/Tempting.otf',
  display: 'swap',
  variable: '--font-tempting',
});
