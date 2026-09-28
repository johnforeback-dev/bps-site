import { SITE, SECTIONS, CONTENT_TYPES, type ContentType } from './config';

const API = 'https://www.wixapis.com';
const REVALIDATE = 300; // seconds; new posts appear within 5 minutes

let cached: { token: string; expires: number } | null = null;

async function visitorToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: SITE.wixClientId, grantType: 'anonymous' }),
    next: { revalidate: 3600 }, // anonymous visitor tokens last 4 hours
  });
  if (!res.ok) throw new Error(`Wix token request failed: ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, expires: Date.now() + (data.expires_in ?? 14400) * 1000 };
  return cached.token;
}

async function wix<T>(path: string, body?: unknown, method = 'POST'): Promise<T | null> {
  try {
    const token = await visitorToken();
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      console.error(`Wix ${path} ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Wix ${path} failed`, err);
    return null;
  }
}

/* ---------- Types ---------- */

export type RichNode = {
  type: string;
  nodes?: RichNode[];
  textData?: { text: string; decorations?: { type: string; linkData?: { link?: { url?: string } } }[] };
  headingData?: { level?: number };
  imageData?: { image?: { src?: { id?: string; url?: string }; width?: number; height?: number }; altText?: string; caption?: string };
  [key: string]: unknown;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  updated: string;
  minutes: number;
  featured: boolean;
  section: (typeof SECTIONS)[number] | null;
  type: ContentType | null;
  tags: string[];
  image: string | null;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  content?: RichNode[];
};

/* ---------- Helpers ---------- */

export function wixImageUrl(src: unknown): string | null {
  if (!src) return null;
  if (typeof src === 'object') {
    const o = src as { url?: string; id?: string };
    if (o.url?.startsWith('http')) return o.url;
    if (o.id) return `https://static.wixstatic.com/media/${o.id}`;
    if (o.url) return wixImageUrl(o.url);
    return null;
  }
  const s = String(src);
  if (s.startsWith('http')) return s;
  const m = s.match(/^wix:image:\/\/v1\/([^/]+)/);
  return m ? `https://static.wixstatic.com/media/${m[1]}` : null;
}

type Maps = { catById: Map<string, (typeof SECTIONS)[number]>; tagById: Map<string, string> };

async function maps(): Promise<Maps> {
  const [cats, tags] = await Promise.all([
    wix<{ categories: { id: string; slug: string }[] }>('/blog/v3/categories/query', { query: { paging: { limit: 100 } } }),
    wix<{ tags: { id: string; label: string }[] }>('/blog/v3/tags/query', { query: { paging: { limit: 100 } } }),
  ]);
  const catById = new Map<string, (typeof SECTIONS)[number]>();
  for (const c of cats?.categories ?? []) {
    const s = SECTIONS.find((x) => x.slug === c.slug);
    if (s) catById.set(c.id, s);
  }
  const tagById = new Map<string, string>();
  for (const t of tags?.tags ?? []) tagById.set(t.id, t.label);
  return { catById, tagById };
}

const authorCache = new Map<string, string>();
async function authorName(memberId?: string): Promise<string> {
  if (!memberId) return 'Bps';
  if (authorCache.has(memberId)) return authorCache.get(memberId)!;
  const r = await wix<{ member?: { profile?: { nickname?: string } } }>(
    `/members/v1/members/${memberId}?fieldsets=PUBLIC`,
    undefined,
    'GET',
  );
  const name = r?.member?.profile?.nickname || 'Bps';
  authorCache.set(memberId, name);
  return name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function toPost(p: any, m: Maps): Promise<Post> {
  const tags: string[] = (p.tagIds ?? []).map((id: string) => m.tagById.get(id)).filter(Boolean);
  const section = (p.categoryIds ?? []).map((id: string) => m.catById.get(id)).find(Boolean) ?? null;
  const type = (tags.find((t) => (CONTENT_TYPES as readonly string[]).includes(t)) as ContentType) ?? null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? '',
    date: p.firstPublishedDate ?? p.lastPublishedDate ?? '',
    updated: p.lastPublishedDate ?? p.firstPublishedDate ?? '',
    minutes: p.minutesToRead ?? 1,
    featured: Boolean(p.featured),
    section,
    type,
    tags,
    image: wixImageUrl(p.media?.wixMedia?.image) ?? wixImageUrl(p.heroImage) ?? wixImageUrl(p.coverMedia?.image),
    author: await authorName(p.memberId),
    seoTitle: p.seoData?.tags?.find?.((t: { type: string }) => t.type === 'title')?.children,
    seoDescription: p.seoData?.tags?.find?.(
      (t: { type: string; props?: { name?: string } }) => t.type === 'meta' && t.props?.name === 'description',
    )?.props?.content,
    content: p.richContent?.nodes,
  };
}

/* ---------- Public API ---------- */

export async function getPosts(opts: { section?: string; tag?: string; limit?: number; featured?: boolean } = {}): Promise<Post[]> {
  const m = await maps();
  const filter: Record<string, unknown> = {};
  if (opts.section) {
    const id = [...m.catById.entries()].find(([, s]) => s.slug === opts.section)?.[0];
    if (!id) return [];
    filter.categoryIds = { $hasSome: [id] };
  }
  if (opts.tag) {
    const id = [...m.tagById.entries()].find(([, l]) => l === opts.tag)?.[0];
    if (!id) return [];
    filter.tagIds = { $hasSome: [id] };
  }
  if (opts.featured) filter.featured = true;
  const r = await wix<{ posts: unknown[] }>('/blog/v3/posts/query', {
    query: { filter, sort: [{ fieldName: 'firstPublishedDate', order: 'DESC' }], paging: { limit: opts.limit ?? 20 } },
    fieldsets: ['URL'],
  });
  return Promise.all((r?.posts ?? []).map((p) => toPost(p, m)));
}

export async function getPost(slug: string): Promise<Post | null> {
  const m = await maps();
  const r = await wix<{ posts: unknown[] }>('/blog/v3/posts/query', {
    query: { filter: { slug }, paging: { limit: 1 } },
    fieldsets: ['URL', 'RICH_CONTENT', 'SEO'],
  });
  const p = r?.posts?.[0];
  return p ? toPost(p, m) : null;
}

export type Chart = { title: string; subtitle?: string; chartType: 'line' | 'bar'; unit?: string; source: string; x: string[]; series: { name: string; values: (number | null)[] }[] };

export function parseCsv(csv: string): { x: string[]; series: { name: string; values: (number | null)[] }[] } {
  const rows = csv.trim().split(/\r?\n/).map((r) => r.split(',').map((c) => c.trim()));
  const [head, ...body] = rows;
  const x = body.map((r) => r[0]);
  const series = head.slice(1, 4).map((name, i) => ({
    name,
    values: body.map((r) => {
      const v = parseFloat((r[i + 1] ?? '').replace(/[%$]/g, ''));
      return Number.isFinite(v) ? v : null;
    }),
  }));
  return { x, series };
}

export async function getCharts(ids: string[]): Promise<Record<string, Chart>> {
  if (!ids.length) return {};
  const r = await wix<{ dataItems: { data: Record<string, string> }[] }>('/wix-data/v2/items/query', {
    dataCollectionId: 'Charts',
    query: { filter: { chartId: { $in: ids } }, paging: { limit: 50 } },
  });
  const out: Record<string, Chart> = {};
  for (const item of r?.dataItems ?? []) {
    const d = item.data;
    try {
      const parsed = parseCsv(d.data);
      out[d.chartId] = {
        title: d.title,
        subtitle: d.subtitle,
        chartType: d.chartType?.toLowerCase() === 'bar' ? 'bar' : 'line',
        unit: d.unit,
        source: d.source,
        ...parsed,
      };
    } catch {
      console.error(`Chart ${d.chartId} has unreadable data`);
    }
  }
  return out;
}

export type Term = { term: string; definition: string };

export async function getGlossary(section: string): Promise<Term[]> {
  const r = await wix<{ dataItems: { data: { title: string; definition: string } }[] }>('/wix-data/v2/items/query', {
    dataCollectionId: 'Glossary',
    query: { filter: { category: section }, sort: [{ fieldName: 'sortOrder', order: 'ASC' }], paging: { limit: 30 } },
  });
  return (r?.dataItems ?? []).map((i) => ({ term: i.data.title, definition: i.data.definition }));
}
