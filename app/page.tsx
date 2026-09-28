import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketBand from '@/components/MarketBand';
import SubscribeForm from '@/components/SubscribeForm';
import Media from '@/components/Media';
import Kicker from '@/components/Kicker';
import { getPosts, type Post } from '@/lib/wix';
import { getFiveBps } from '@/lib/five';
import { SECTIONS, TAG_FIVE_BPS, TAG_INTELLIGENCE } from '@/lib/config';
import { formatDate, postHref } from '@/lib/format';

export const revalidate = 300;

function Meta({ p }: { p: Post }) {
  return <div className="meta"><strong>{p.author}</strong><span>{formatDate(p.date, 'short')}</span><span>{p.minutes} min read</span></div>;
}

export default async function Home() {
  const [all, featured, five, intel] = await Promise.all([
    getPosts({ limit: 40 }),
    getPosts({ featured: true, limit: 1 }),
    getFiveBps(),
    getPosts({ tag: TAG_INTELLIGENCE, limit: 1 }),
  ]);
  const stories = all.filter((p) => !p.tags.includes(TAG_FIVE_BPS));
  const lead = featured.find((p) => !p.tags.includes(TAG_FIVE_BPS)) ?? stories[0];
  const also = stories.filter((p) => p.id !== lead?.id).slice(0, 4);
  const intelPost = intel[0];

  return (
    <>
      <Header current="home" />
      <main id="main">
        {lead ? (
          <div className="lead wrap">
            <article className="lead__main">
              {lead.image && <Link href={postHref(lead)} tabIndex={-1} aria-hidden="true"><Media src={lead.image} className="media--wide" priority /></Link>}
              <Kicker post={lead} />
              <h1 className="headline"><Link href={postHref(lead)}>{lead.title}</Link></h1>
              {lead.excerpt && <p className="dek">{lead.excerpt}</p>}
              <Meta p={lead} />
            </article>
            {also.length > 0 && (
              <div className="also">
                <h2 className="label" style={{ marginBottom: 8 }}>Also leading</h2>
                {also.map((p) => (
                  <article key={p.id}>
                    <div>
                      <Kicker post={p} showType={false} />
                      <h3><Link href={postHref(p)}>{p.title}</Link></h3>
                      <div className="meta"><span>{p.author}</span><span>{p.minutes} min read</span></div>
                    </div>
                    <Media src={p.image} />
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="launch">
            <div>
              <h1>Credit markets, measured in basis points.</h1>
              <p>Bps is a financial blog keeping credit professionals informed on fixed income, private credit, lending, and the broader financial landscape. Our first stories publish soon.</p>
            </div>
            <SubscribeForm dark label="Get The 5 Bps by email" />
          </div>
        )}

        <MarketBand />

        <section id="subscribe" className="five" aria-labelledby="five-title">
          <div className="five__cta">
            <h2 id="five-title">The 5 Bps</h2>
            <p>Five developments credit professionals should know this week, each in a sentence or two.</p>
            <div style={{ marginTop: 'auto' }}><SubscribeForm /></div>
          </div>
          {five ? (
            <div style={{ background: 'var(--panel)' }}>
              <ol className="five__list">{five.items.map((t, i) => <li key={i}>{t}</li>)}</ol>
              <Link className="five__more" href={five.href}>Read the {formatDate(five.date)} edition</Link>
            </div>
          ) : (
            <div className="five__empty">
              <strong>The first edition is on its way.</strong>
              <span>Subscribe and it lands in your inbox the day it publishes.</span>
            </div>
          )}
        </section>

        {stories.length > 0 && (
          <div className="section-grid">
            {SECTIONS.map((s) => {
              const [first, ...rest] = stories.filter((p) => p.section?.slug === s.slug);
              return (
                <section key={s.slug} className="section-col" aria-labelledby={`sec-${s.slug}`}>
                  <h2 id={`sec-${s.slug}`} className="section-title"><Link href={`/${s.slug}`}>{s.name}</Link></h2>
                  {first ? (
                    <>
                      <Media src={first.image} />
                      <h3><Link href={postHref(first)}>{first.title}</Link></h3>
                      {rest.slice(0, 2).map((p) => <Link key={p.id} className="more" href={postHref(p)}>{p.title}</Link>)}
                    </>
                  ) : (
                    <p className="empty">Coverage starting soon.</p>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {intelPost && (
          <section className="intel" aria-labelledby="intel-title">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 id="intel-title" className="label"><Link href="/intelligence">Bps Intelligence</Link></h2>
              <h3><Link href={postHref(intelPost)}>{intelPost.title}</Link></h3>
              {intelPost.excerpt && <p className="dek">{intelPost.excerpt}</p>}
              <Meta p={intelPost} />
            </div>
            <Media src={intelPost.image} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
