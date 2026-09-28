import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'About', description: 'What Bps is and how we work.', alternates: { canonical: '/about' } };

export default function AboutPage() {
  return (
    <>
      <Header current="about" />
      <main id="main" className="page">
        <h1>About Bps</h1>
        <div className="prose" style={{ width: '100%' }}>
          <p>Bps is a financial blog focused on keeping professionals across the credit markets informed on the latest developments in fixed income, private credit, lending, and the broader financial landscape.</p>
          <p>Our goal is simple: provide clear, relevant insights that help credit professionals stay current on the trends, market movements, and developments shaping the industry.</p>
          <h2>How we label our work</h2>
          <p>Every piece carries one of four labels so you know what you are reading. <strong>News</strong> reports what happened. <strong>Analysis</strong> explains why it matters, with the data behind it. <strong>Explainer</strong> covers how something works. <strong>Opinion</strong> is the author’s own argument.</p>
          <h2>Data and sources</h2>
          <p>Market data on Bps comes from official public sources, currently the U.S. Department of the Treasury and the Federal Reserve Bank of New York, and is shown as end-of-day figures with the date of the latest close. Charts cite their source. We do not publish figures we cannot source.</p>
          <h2>Disclosures</h2>
          <p>Bps contributors work in the credit markets they write about. Content is for informational and educational purposes only and does not constitute investment, financial, legal, or tax advice.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
