import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilteredList from '@/components/FilteredList';
import SubscribeForm from '@/components/SubscribeForm';
import { getPosts } from '@/lib/wix';
import { TAG_INTELLIGENCE } from '@/lib/config';

export const revalidate = 300;
const description = 'Longer analysis from the Bps writers, with the charts and sources behind each argument.';
export const metadata: Metadata = { title: 'Bps Intelligence', description, alternates: { canonical: '/intelligence' } };

export default async function IntelligencePage() {
  const posts = await getPosts({ tag: TAG_INTELLIGENCE, limit: 50 });
  return (
    <>
      <Header current="intelligence" />
      <main id="main">
        <div className="cat-head">
          <div><h1>Bps Intelligence</h1><p>{description}</p></div>
          <SubscribeForm dark label="Get The 5 Bps by email" />
        </div>
        <div className="cat-body" style={{ gridTemplateColumns: '1fr' }}>
          <FilteredList posts={posts} title="All analysis" />
        </div>
      </main>
      <Footer />
    </>
  );
}
