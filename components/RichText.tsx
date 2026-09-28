import type { ReactNode } from 'react';
import type { RichNode, Chart as ChartData } from '@/lib/wix';
import { wixImageUrl } from '@/lib/wix';
import Chart from './Chart';

const CHART_RE = /^\s*\[\[chart:([\w-]+)\]\]\s*$/i;

export function plainText(n: RichNode): string {
  if (n.type === 'TEXT') return n.textData?.text ?? '';
  return (n.nodes ?? []).map(plainText).join('');
}

export function chartIds(nodes: RichNode[] = []): string[] {
  return nodes.filter((n) => n.type === 'PARAGRAPH').map((n) => plainText(n).match(CHART_RE)?.[1]).filter((x): x is string => Boolean(x));
}

function text(n: RichNode, key: number): ReactNode {
  let el: ReactNode = n.textData?.text ?? '';
  for (const d of n.textData?.decorations ?? []) {
    if (d.type === 'BOLD') el = <strong>{el}</strong>;
    else if (d.type === 'ITALIC') el = <em>{el}</em>;
    else if (d.type === 'UNDERLINE') el = <u>{el}</u>;
    else if (d.type === 'LINK' && d.linkData?.link?.url) {
      const url = d.linkData.link.url;
      const external = /^https?:/.test(url) && !url.includes('readbps.com');
      el = <a href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{el}</a>;
    }
  }
  return <span key={key}>{el}</span>;
}

type Ctx = { charts: Record<string, ChartData>; counter: { n: number } };

function node(n: RichNode, key: number, ctx: Ctx): ReactNode {
  const kids = () => (n.nodes ?? []).map((c, i) => node(c, i, ctx));
  switch (n.type) {
    case 'TEXT': return text(n, key);
    case 'PARAGRAPH': {
      const id = plainText(n).match(CHART_RE)?.[1];
      if (id) {
        const data = ctx.charts[id];
        if (!data) {
          console.error(`Chart "${id}" is referenced in an article but missing from the Charts collection.`);
          return null;
        }
        ctx.counter.n += 1;
        return <Chart key={key} data={data} n={ctx.counter.n} />;
      }
      if (!plainText(n).trim() && !(n.nodes ?? []).some((c) => c.type !== 'TEXT')) return null;
      return <p key={key}>{kids()}</p>;
    }
    case 'HEADING': {
      const lvl = n.headingData?.level ?? 2;
      return lvl <= 2 ? <h2 key={key}>{kids()}</h2> : <h3 key={key}>{kids()}</h3>;
    }
    case 'BULLETED_LIST': return <ul key={key}>{kids()}</ul>;
    case 'ORDERED_LIST': return <ol key={key}>{kids()}</ol>;
    case 'LIST_ITEM': return <li key={key}>{(n.nodes ?? []).flatMap((c) => (c.type === 'PARAGRAPH' ? (c.nodes ?? []) : [c])).map((c, i) => node(c, i, ctx))}</li>;
    case 'BLOCKQUOTE': return <blockquote key={key}>{kids()}</blockquote>;
    case 'DIVIDER': return <hr key={key} />;
    case 'CODE_BLOCK': return <pre key={key} style={{ overflowX: 'auto', fontSize: 15 }}>{plainText(n)}</pre>;
    case 'IMAGE': {
      const src = wixImageUrl(n.imageData?.image?.src);
      if (!src) return null;
      const cap = typeof n.imageData?.caption === 'string' ? n.imageData.caption : undefined;
      return (
        <figure key={key}>
          <img src={src} alt={n.imageData?.altText ?? cap ?? ''} loading="lazy" decoding="async" />
          {cap && <figcaption>{cap}</figcaption>}
        </figure>
      );
    }
    case 'TABLE': return <div key={key} className="table-wrap"><table><tbody>{kids()}</tbody></table></div>;
    case 'TABLE_ROW': return <tr key={key}>{kids()}</tr>;
    case 'TABLE_CELL': return <td key={key}>{(n.nodes ?? []).flatMap((c) => (c.type === 'PARAGRAPH' ? (c.nodes ?? []) : [c])).map((c, i) => node(c, i, ctx))}</td>;
    default: return n.nodes?.length ? <div key={key}>{kids()}</div> : null;
  }
}

/** Renders Wix rich content. Two author conventions get special treatment:
 *  a heading "Key points" followed by a list becomes the key points box;
 *  a heading "Sources" followed by a list becomes the sources block. */
export default function RichText({ nodes = [], charts }: { nodes?: RichNode[]; charts: Record<string, ChartData> }) {
  const ctx: Ctx = { charts, counter: { n: 0 } };
  const out: ReactNode[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const next = nodes[i + 1];
    const label = n.type === 'HEADING' ? plainText(n).trim().toLowerCase() : '';
    const isList = next && (next.type === 'BULLETED_LIST' || next.type === 'ORDERED_LIST');
    if ((label === 'key points' || label === 'sources') && isList) {
      out.push(
        <section key={i} className={label === 'key points' ? 'keypoints' : 'sources'}>
          <h2>{label === 'key points' ? 'Key points' : 'Sources'}</h2>
          {node(next, i + 1, ctx)}
        </section>,
      );
      i++;
      continue;
    }
    out.push(node(n, i, ctx));
  }
  return <>{out}</>;
}
