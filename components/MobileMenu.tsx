'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SECTIONS } from '@/lib/config';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button className="menu-btn" aria-label="Open sections menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M0 2h22M0 8h22M0 14h22" /></svg>
      </button>
      {open && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Sections">
          <div className="drawer__top">
            <img src="/bps-logo.png" alt="Bps" width={54} height={32} style={{ height: 32, width: 'auto' }} />
            <button className="menu-btn" style={{ display: 'inline-flex' }} aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 1l16 16M17 1L1 17" /></svg>
            </button>
          </div>
          <nav onClick={() => setOpen(false)}>
            <Link href="/">Top stories</Link>
            {SECTIONS.map((s) => <Link key={s.slug} href={`/${s.slug}`}>{s.name}</Link>)}
            <Link href="/intelligence">Bps Intelligence</Link>
            <Link href="/about">About</Link>
            <Link href="/#subscribe">Subscribe</Link>
          </nav>
        </div>
      )}
    </>
  );
}
