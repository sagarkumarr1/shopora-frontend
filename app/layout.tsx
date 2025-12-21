import type { Metadata } from 'next';
import { Inter, Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://shopora-frontend.vercel.app'),
  title: {
    default: 'ApniShop | Sab Kuch, Ek Jagah',
    template: '%s | ApniShop',
  },
  description: 'ApniShop - Sab Kuch, Ek Jagah. Your one-stop destination for premium products. Shop electronics, fashion, home essentials, and more.',
  keywords: ['shopping', 'ecommerce', 'premium', 'electronics', 'fashion', 'ApniShop', 'Apni Shop', 'shopora'],
  authors: [{ name: 'ApniShop Team' }],
  creator: 'ApniShop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shopora.com', // Replace with actual domain
    siteName: 'ApniShop',
    title: 'ApniShop | Sab Kuch, Ek Jagah',
    description: 'The best place to buy everything. Shop premium products with ease.',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in public folder or remove
        width: 1200,
        height: 630,
        alt: 'Shopora Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApniShop | Sab Kuch, Ek Jagah',
    description: 'The best place to buy everything. Shop premium products with ease.',
    images: ['/og-image.jpg'], // Ensure this image exists in public folder or remove
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: '#C08C6C', // Clay color
  width: 'device-width',
  initialScale: 1,
};

import BottomNav from '@/components/BottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} font-sans bg-[var(--background)] text-[var(--foreground)] pb-16 md:pb-0 antialiased`}>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
