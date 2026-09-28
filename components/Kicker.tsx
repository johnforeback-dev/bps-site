import Link from 'next/link';
import type { Post } from '@/lib/wix';

export default function Kicker({ post, showType = true }: { post: Post; showType?: boolean }) {
  return (
    <div className="kicker">
      {post.section && <Link className="kicker__section" href={`/${post.section.slug}`}>{post.section.name}</Link>}
      {showType && post.type && <span className="kicker__type">{post.type}</span>}
    </div>
  );
}
