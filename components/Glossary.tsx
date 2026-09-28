'use client';
import { useState } from 'react';
import type { Term } from '@/lib/wix';

export default function Glossary({ terms }: { terms: Term[] }) {
  const [open, setOpen] = useState<string | null>(terms[0]?.term ?? null);
  if (!terms.length) return null;
  return (
    <aside className="glossary" aria-labelledby="terms-title">
      <h2 id="terms-title">Key terms</h2>
      <p>The vocabulary behind this section. Select a term to read its definition.</p>
      <dl style={{ margin: 0 }}>
        {terms.map((t) => {
          const isOpen = open === t.term;
          return (
            <div key={t.term}>
              <dt>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : t.term)}>
                  {t.term}<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </dt>
              {isOpen && <dd>{t.definition}</dd>}
            </div>
          );
        })}
      </dl>
    </aside>
  );
}
