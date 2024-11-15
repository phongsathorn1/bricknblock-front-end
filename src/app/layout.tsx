import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Layout } from '@/components/layout/layout'; // Add this import
import './globals.css';
import { Space_Grotesk } from 'next/font/google';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const druk = localFont({
  src: [
    {
      path: './fonts/DrukWide-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/DrukWide-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-druk',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "Brick'NBlock",
  description: 'Premium Real World Asset Investment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${druk.variable} ${spaceGrotesk.variable} font-body bg-prime-black text-text-primary`}
      >
        {/* <Providers>w */}
        <Layout>{children}</Layout>
        {/* </Providers> */}
      </body>
    </html>
  );
}
