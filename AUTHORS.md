# Publishing on Bps — author guide

Write and publish in the Wix dashboard for TheBps (Blog → Posts). The website picks up changes within about 5 minutes. Design and layout are automatic; you control words, images, labels, and charts.

## Every post needs

1. **One category**: Markets & Macro, Private Credit, Fixed Income, or Real Estate Credit. This sets the post's section and URL (`readbps.com/private-credit/your-post-slug`).
2. **One content-type tag**, spelled exactly: `News`, `Analysis`, `Explainer`, or `Opinion`. It shows as the label on the post and drives the filters on section pages.
3. **An excerpt** (post settings). It becomes the subheadline under the title and the description in search and social previews. One or two sentences.
4. **A cover image**, only if you have a relevant one. No stock photos. Posts without a cover lead with their first chart.

Your display name comes from your Wix member profile. If your posts show "Bps" as the author, set a display name on your profile.

## Special formatting (type these exactly)

**Key points box.** Add a heading that reads `Key points`, directly followed by a bulleted list. It renders as the highlighted box. Put it at the top of the post.

**Sources block.** Add a heading that reads `Sources`, directly followed by a list. Put it at the end. Every figure in the post should trace to a source listed here.

**Charts.** Charts are drawn by the site from your data so they all match.
1. In the Wix dashboard, open CMS → **Charts** → add an item:
   - **Chart title**: the takeaway as a sentence (e.g. "SOFR has held inside the Fed's target range all year")
   - **Chart ID**: short, lowercase, no spaces (e.g. `sofr-2026`)
   - **Subtitle**: what is measured, unit, period
   - **Chart type**: `line` or `bar`
   - **Unit**: `%`, `bps`, `$bn`, etc.
   - **Data**: CSV. First row = headers. First column = the x axis (dates or labels), then one column per series (max 3). Numbers only, no thousands commas.
     ```
     Date,SOFR,EFFR
     2026-07-01,3.90,3.88
     2026-08-01,3.89,3.88
     ```
   - **Source**: where the data comes from
2. In the post, put `[[chart:sofr-2026]]` on its own line where the chart should appear.

If the ID doesn't match, the chart is silently left out, so check the published post.

## Homepage modules

- **Lead story**: mark a post **Featured** in Wix. The newest featured post leads the homepage and its section page. With none featured, the newest post leads.
- **The 5 Bps**: publish a post tagged `The 5 Bps` (plus a category) containing one numbered list of five items, one or two sentences each. The homepage shows the latest edition's five items.
- **Bps Intelligence**: tag longer analysis pieces `Bps Intelligence` to feature them on the homepage and the Intelligence page.

## Key terms (Glossary)

CMS → **Glossary**: one item per term with a plain-English definition (one or two sentences), the section slug (`markets-macro`, `private-credit`, `fixed-income`, `real-estate-credit`), and a sort order. The panel appears on a section page once it has at least one term. Definitions are reference material; get them exactly right.

## Standards

- Never publish a yield, spread, deal size, or quote you can't source.
- Label opinion as `Opinion`.
- Headlines: say what happened or what the reader will learn. No clickbait.
