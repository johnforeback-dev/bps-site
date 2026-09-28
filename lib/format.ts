export function formatDate(iso: string, style: 'long' | 'short' = 'long') {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString('en-US', {
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

export function todayLine() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
  });
}

export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const postHref = (p: { slug: string; section: { slug: string } | null }) =>
  `/${p.section?.slug ?? 'markets-macro'}/${p.slug}`;
