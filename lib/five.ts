import { getPost, getPosts, type RichNode } from './wix';
import { TAG_FIVE_BPS } from './config';
import { postHref } from './format';

function text(n: RichNode): string {
  if (n.type === 'TEXT') return n.textData?.text ?? '';
  return (n.nodes ?? []).map(text).join('');
}

/** The latest post tagged "The 5 Bps": its first list, up to five items. */
export async function getFiveBps(): Promise<{ items: string[]; href: string; date: string } | null> {
  const [latest] = await getPosts({ tag: TAG_FIVE_BPS, limit: 1 });
  if (!latest) return null;
  const full = await getPost(latest.slug);
  const list = full?.content?.find((n) => n.type === 'ORDERED_LIST' || n.type === 'BULLETED_LIST');
  const items = (list?.nodes ?? []).map(text).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  return items.length ? { items, href: postHref(latest), date: latest.date } : null;
}
