import Link from 'next/link';
import { SECTIONS, DISCLAIMER } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <img src="/bps-logo.png" alt="Bps" width={54} height={32} />
        <nav aria-label="Footer">
          {SECTIONS.map((s) => <Link key={s.slug} href={`/${s.slug}`}>{s.name}</Link>)}
          <Link href="/about">About</Link>
          <Link href="/#subscribe">Subscribe</Link>
        </nav>
      </div>
      <p>{DISCLAIMER}</p>
      <span>© {new Date().getFullYear()} Bps</span>
    </footer>
  );
}
