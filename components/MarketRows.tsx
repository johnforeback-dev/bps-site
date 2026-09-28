'use client';
import { useState } from 'react';
import type { Benchmark } from '@/lib/market';

const SCALE = 25; // bps shown at full bar length

function describeChange(c: number | null) {
  if (c === null) return 'change unavailable';
  if (c === 0) return 'unchanged on the day';
  const n = Math.abs(c);
  return `${c > 0 ? 'up' : 'down'} ${n} basis ${n === 1 ? 'point' : 'points'}`;
}

export default function MarketRows({ rows }: { rows: Benchmark[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <div className="market__head" aria-hidden="true">
        <span>Benchmark</span>
        <div className="market__scale"><span>−{SCALE} bps</span><span>0</span><span>+{SCALE} bps</span></div>
        <span style={{ textAlign: 'right' }}>Change</span>
        <span style={{ textAlign: 'right' }}>Level</span>
      </div>
      <div className="market__rows">
        {rows.map((r, i) => {
          const c = r.changeBps;
          const w = c === null ? 0 : (Math.min(Math.abs(c), SCALE) / SCALE) * 50;
          const isOpen = open === r.key;
          return (
            <div key={r.key}>
              <button type="button" className="bm" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.key)}
                aria-label={`${r.label}: ${r.level}, ${describeChange(c)}. Show explanation.`}>
                <span className="bm__label">
                  <span className="bm__name">{r.label}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="7" cy="7" r="6" /><path d="M7 6v4M7 4v.5" /></svg></span>
                  <span className="bm__lvl-m num">{r.level}</span>
                </span>
                <span className="bm__track" aria-hidden="true">
                  <span className="bm__zero" />
                  {c !== null && c !== 0 && (
                    <span className={`bm__bar${c < 0 ? ' bm__bar--neg' : ''}`}
                      style={{ left: c > 0 ? '50%' : `${50 - w}%`, width: `${w}%`, animationDelay: `${i * 90}ms` }} />
                  )}
                </span>
                <span className="bm__change num">{c === null ? '–' : c > 0 ? `+${c}` : c < 0 ? `−${Math.abs(c)}` : '0'}</span>
                <span className="bm__level num">{r.level}</span>
              </button>
              {isOpen && <p className="bm__explain">{r.explainer} <span style={{ color: 'var(--muted)' }}>Source: {r.source}.</span></p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
