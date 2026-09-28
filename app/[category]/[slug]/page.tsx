import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import Media from '@/components/Media';
import ShareBar from '@/components/ShareBar';
import ReadingProgress from '@/components/ReadingProgress';
import RichText, { chartIds } from '@/components/RichText';
import { getPost, getPosts, getCharts } from '@/lib/wix';
import { SITE, TAG_FIVE_BPS } from '@/lib/config';
import { formatDate, postHref } from '@/lib/format';

export const revalidate = 300;

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.image ?? '/og-default.png';
  return {
    title,
    description,
    alternates: { canonical: postHref(post) },
    openGraph: { type: 'article', title, description, images: [image], publishedTime: post.date, modifiedTime: post.updated, section: post.section?.name, authors: [post.author] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { category, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const canonical = postHref(post);
  if (canonical !== `/${category}/${slug}`) redirect(canonical);

  const [charts, related] = await Promise.all([
    getCharts(chartIds(post.content)),
    post.section ? getPosts({ section: post.section.slug, limit: 6 }) : Promise.resolve([]),
  ]);
  const more = related.filter((p) => p.id !== post.id && !p.tags.includes(TAG_FIVE_BPS)).slice(0, 3);
  const url = `${SITE.url}${canonical}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.type === 'News' ? 'NewsArticle' : 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated,
    author: [{ '@type': 'Person', name: post.author }],
    publisher: { '@type': 'Organization', name: 'Bps', logo: { '@type': 'ImageObject', url: `${SITE.url}/bps-logo.png` } },
    image: post.image ? [post.image] : [`${SITE.url}/og-default.png`],
    articleSection: post.section?.name,
    mainEntityOfPage: url,
  };

  return (
    <>
      <ReadingProgress />
      <Header current={post.section?.slug} />
      <main id="main">
        <article className="article">
          <header className="article__head">
            <div className="kicker" style={{ fontSize: 15 }}>
              {post.section && <Link className="kicker__section" href={`/${post.section.slug}`}>{post.section.name}</Link>}
              {post.type && <span className="tag">{post.type}</span>}
            </div>
            <h1 className="headline">{post.title}</h1>
            {post.excerpt && <p className="dek">{post.excerpt}</p>}
            <div className="byline">
              <div className="meta" style={{ fontSize: 15 }}>
                <span>By <strong style={{ fontWeight: 700 }}>{post.author}</strong></span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>{post.minutes} min read</span>
              </div>
              <ShareBar url={url} title={post.title} />
            </div>
            {post.image && (
              <figure className="hero">
                <Media src={post.image} className="media--wide" priority />
              </figure>
            )}
          </header>
          <div className="prose">
            <RichText nodes={post.content} charts={charts} />
          </div>
          <p className="article__disclaimer">This article is for informational and educational purposes only and does not constitute investment, financial, legal, or tax advice.</p>
        </article>

        <section className="band-five" aria-labelledby="art-five">
          <div>
            <h2 id="art-five">The 5 Bps</h2>
            <p>Five developments credit professionals should know this week, in your inbox.</p>
          </div>
          <div><SubscribeForm /></div>
        </section>

        {more.length > 0 && post.section && (
          <section className="related" aria-labelledby="related-title">
            <h2 id="related-title" className="section-title" style={{ fontSize: 26 }}>More on {post.section.name.toLowerCase()}</h2>
            <div className="related__grid">
              {more.map((p) => (
                <article key={p.id}>
                  <Media src={p.image} />
                  {p.type && <span className="kicker__section" style={{ fontSize: 14 }}>{p.type}</span>}
                  <h3><Link href={postHref(p)}>{p.title}</Link></h3>
                  <div className="meta"><span>{p.author}</span><span>{p.minutes} min read</span></div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
