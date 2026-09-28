'use client';
import { useState } from 'react';

export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="share">
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">X</a>
      <a href={`mailto:?subject=${t}&body=${u}`}>Email</a>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
