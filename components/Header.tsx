import Link from 'next/link';
import { SECTIONS } from '@/lib/config';
import { todayLine } from '@/lib/format';
import MobileMenu from './MobileMenu';

export default function Header({ current }: { current?: string }) {
  return (
    <header>
      <a className="skip" href="#main">Skip to content</a>
      <div className="masthead">
        <MobileMenu />
        <span className="masthead__date">{todayLine()}</span>
        <Link href="/" className="masthead__logo" aria-label="Bps home">
          <img src="/bps-logo.png" alt="Bps" width={81} height={48} />
        </Link>
        <div className="masthead__actions">
          <Link href="/#subscribe" className="btn btn--blue">Subscribe</Link>
        </div>
      </div>
      <nav className="sections" aria-label="Sections">
        <Link href="/" aria-current={current === 'home' ? 'page' : undefined}>Top stories</Link>
        {SECTIONS.map((s) => (
          <Link key={s.slug} href={`/${s.slug}`} aria-current={current === s.slug ? 'page' : undefined}>{s.name}</Link>
        ))}
        <Link href="/intelligence" aria-current={current === 'intelligence' ? 'page' : undefined}>Bps Intelligence</Link>
        <Link href="/about" aria-current={current === 'about' ? 'page' : undefined}>About</Link>
      </nav>
    </header>
  );
}
