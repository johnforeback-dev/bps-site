import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <h1>Page not found</h1>
        <p className="dek" style={{ fontSize: 20, marginTop: 20 }}>This page moved or never existed. <Link href="/" style={{ color: 'var(--blue-text)' }}>Go to the homepage</Link>.</p>
      </main>
      <Footer />
    </>
  );
}
