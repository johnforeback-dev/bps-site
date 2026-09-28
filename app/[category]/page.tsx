import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import Media from '@/components/Media';
import FilteredList from '@/components/FilteredList';
import Glossary from '@/components/Glossary';
import { SECTIONS, sectionBySlug, TAG_FIVE_BPS } from '@/lib/config';
import { getPosts, getGlossary } from '@/lib/wix';
import { formatDate, postHref } from '@/lib/format';

export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() {
  return SECTIONS.map((s) => ({ category: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const s = sectionBySlug((await params).category);
  if (!s) return {};
  return { title: s.name, description: s.description, alternates: { canonical: `/${s.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const section = sectionBySlug((await params).category);
  if (!section) notFound();
  const [posts, terms] = await Promise.all([getPosts({ section: section.slug, limit: 50 }), getGlossary(section.slug)]);
  const stories = posts.filter((p) => !p.tags.includes(TAG_FIVE_BPS));
  const feature = stories.find((p) => p.featured) ?? stories[0];
  const rest = stories.filter((p) => p.id !== feature?.id);

  return (
    <>
      <Header current={section.slug} />
      <main id="main">
        <div className="cat-head">
          <div>
            <h1>{section.name}</h1>
            <p>{section.description}</p>
          </div>
          <SubscribeForm dark label="Get The 5 Bps by email" />
        </div>

        {feature && (
          <div className="cat-feature">
            <Media src={feature.image} className="media--wide" priority />
            <article>
              <span className="label" style={{ fontSize: 14 }}>Featured</span>
              <h2><Link href={postHref(feature)}>{feature.title}</Link></h2>
              {feature.excerpt && <p className="dek" style={{ fontSize: 19 }}>{feature.excerpt}</p>}
              <div className="meta"><strong>{feature.author}</strong><span>{formatDate(feature.date, 'short')}</span><span>{feature.minutes} min read</span></div>
            </article>
          </div>
        )}

        <div className="cat-body" style={terms.length ? undefined : { gridTemplateColumns: '1fr' }}>
          <FilteredList posts={rest} title={`Latest in ${section.name}`} />
          <Glossary terms={terms} />
        </div>
      </main>
      <Footer />
    </>
  );
}
