# Bps — readbps.com

Custom front end for Bps. Content lives in the Wix site "TheBps" (Wix Blog + CMS); this Next.js app reads it through a read-only Wix headless client and is hosted on Vercel.

## How it fits together

| Piece | Where it lives | Who edits it |
|---|---|---|
| Articles, categories, tags, featured flag | Wix Blog (TheBps dashboard) | Authors |
| Chart data | Wix CMS collection **Charts** | Authors |
| Key terms on category pages | Wix CMS collection **Glossary** | Authors |
| Design, layout, code | This repository | Developer / Claude |
| Market data | U.S. Treasury + NY Fed public feeds, fetched automatically | Nobody |
| Newsletter list | Beehiiv | Beehiiv dashboard |

New or edited posts appear on the site within about 5 minutes. Market data refreshes every 6 hours (sources publish once per business day).

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Required | Notes |
|---|---|---|
| `BEEHIIV_API_KEY` | For signups | Secret. Never commit it. |
| `BEEHIIV_PUBLICATION_ID` | For signups | Starts with `pub_`. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Defaults to `https://www.readbps.com`. |
| `WIX_CLIENT_ID` | Optional | Defaults to the Bps headless client ID (public, not secret). |

Without the Beehiiv variables, signup forms reply "Subscriptions open soon."

## Local development

```bash
npm install
npm run dev   # http://localhost:3000
```

## Code map

- `app/` — pages: home, `[category]`, `[category]/[slug]` (article), `intelligence`, `about`, `api/subscribe`
- `components/` — header, footer, market band, chart, rich-text renderer, forms
- `lib/wix.ts` — all Wix reads · `lib/market.ts` — benchmark data · `lib/config.ts` — sections, tags, disclaimer
- `app/globals.css` — the whole design system (colors, type, layout)

See `AUTHORS.md` for the publishing conventions.
