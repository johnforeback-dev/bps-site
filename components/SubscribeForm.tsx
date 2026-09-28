'use client';
import { useId, useState } from 'react';

export default function SubscribeForm({ dark = false, label = 'Work email' }: { dark?: boolean; label?: string }) {
  const id = useId();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    setState('sending');
    setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Subscription failed.');
      setState('done');
      setMsg('Subscribed. Check your inbox to confirm.');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Subscription failed.');
    }
  }

  return (
    <form className={`subscribe${dark ? ' subscribe--dark' : ''}`} onSubmit={onSubmit}>
      <label htmlFor={id}>{label}</label>
      <div className="subscribe__row">
        <input id={id} name="email" type="email" required autoComplete="email" placeholder="you@firm.com" disabled={state === 'done'} />
        <button type="submit" className={`btn ${dark ? 'btn--blue' : 'btn--black'}`} disabled={state === 'sending' || state === 'done'}>
          {state === 'sending' ? 'Subscribing…' : state === 'done' ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
      <p className="subscribe__msg" role="status" aria-live="polite">{msg}</p>
    </form>
  );
}
