import { NextResponse } from 'next/server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) {
    return NextResponse.json({ error: 'Subscriptions open soon. Please try again later.' }, { status: 503 });
  }
  let email = '';
  try {
    email = String((await req.json()).email ?? '').trim().toLowerCase();
  } catch {
    /* fall through to validation */
  }
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, reactivate_existing: false, send_welcome_email: true, utm_source: 'readbps.com', utm_medium: 'website' }),
  });
  if (res.status === 429) return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  if (!res.ok) {
    console.error('Beehiiv subscribe failed', res.status, await res.text());
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
