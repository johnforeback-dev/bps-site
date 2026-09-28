'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CONTENT_TYPES } from '@/lib/config';
import type { Post } from '@/lib/wix';
import { formatDate, postHref } from '@/lib/format';
import Media from './Media';

export default function FilteredList({ posts, title }: { posts: Post[]; title: string }) {
  const [filter, setFilter] = useState<string>('All');
  const shown = filter === 'All' ? posts : posts.filter((p) => p.type === filter);
  return (
    <section aria-labelledby="list-title">
      <div className="filter-head">
        <h2 id="list-title">{title}</h2>
        <div className="filters" role="group" aria-label="Filter by type">
          {['All', ...CONTENT_TYPES].map((t) => (
            <button key={t} type="button" aria-pressed={filter === t} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>
      {shown.map((p) => (
        <article key={p.id} className="row-story">
          <Media src={p.image} />
          <div>
            {p.type && <span className="kicker__section" style={{ fontSize: 14 }}>{p.type}</span>}
            <h3><Link href={postHref(p)}>{p.title}</Link></h3>
            <div className="meta"><span>{p.author}</span><span>{formatDate(p.date, 'short')}</span><span>{p.minutes} min read</span></div>
          </div>
        </article>
      ))}
      {!shown.length && (
        <p className="list-empty">
          {posts.length ? `No ${filter.toLowerCase()} pieces here yet. Choose All to see everything.` : 'The first stories in this section are on their way. Subscribe to The 5 Bps to get them first.'}
        </p>
      )}
    </section>
  );
}
