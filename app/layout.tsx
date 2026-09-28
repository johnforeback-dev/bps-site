import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import { SITE } from '@/lib/config';
import './globals.css';

const sans = Schibsted_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-sans', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Bps | Credit markets, measured in basis points', template: '%s | Bps' },
  description: SITE.description,
  openGraph: { type: 'website', siteName: 'Bps', images: ['/og-default.png'] },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#000000', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
