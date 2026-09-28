export const SITE = {
  name: 'Bps',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.readbps.com',
  description:
    'Bps keeps credit professionals informed on fixed income, private credit, lending, and the broader financial landscape.',
  // Public identifier of the Wix headless client (not a secret).
  wixClientId: process.env.WIX_CLIENT_ID || 'a1454998-0675-4103-85f7-e98550530ac6',
};

export type Section = { slug: string; name: string; description: string };

// Order matches the navigation. Slugs match the Wix Blog category slugs.
export const SECTIONS: Section[] = [
  { slug: 'markets-macro', name: 'Markets & Macro', description: 'Rates, central bank policy, and macro developments that move credit markets.' },
  { slug: 'private-credit', name: 'Private Credit', description: 'Direct lending, asset-based finance, fund activity, and developments across private credit.' },
  { slug: 'fixed-income', name: 'Fixed Income', description: 'Treasuries, corporate bonds, securitized products, and new issuance.' },
  { slug: 'real-estate-credit', name: 'Real Estate Credit', description: 'Commercial and residential real estate lending, CRE debt, and mortgage credit markets.' },
];

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

// Content types are Wix Blog tags with exactly these names.
export const CONTENT_TYPES = ['News', 'Analysis', 'Explainer', 'Opinion'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

// Special tags that drive homepage modules.
export const TAG_FIVE_BPS = 'The 5 Bps';
export const TAG_INTELLIGENCE = 'Bps Intelligence';

export const DISCLAIMER =
  'Bps content is for informational and educational purposes only and does not constitute investment, financial, legal, or tax advice. Contributors may hold professional positions in the markets they cover.';
