import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import AudioMount from '@/components/audio/AudioMount';

/* Three roles, no more (Section 2). */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-display-loaded',
  display: 'swap',
});
const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-loaded',
  display: 'swap',
});
const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MoneyOrbit',
  description:
    'Learn how money actually works. Eleven short experiences on budgeting, borrowing, saving and scams — built for 12 to 18 year olds in India.',
};

export const viewport: Viewport = {
  themeColor: '#EFF0EA',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <AudioMount />
      </body>
    </html>
  );
}
