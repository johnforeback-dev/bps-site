// End-of-day benchmark data from official public sources.
// U.S. Treasury daily par yield curve and Federal Reserve Bank of New York reference rates.

export type Benchmark = {
  key: string;
  label: string;
  explainer: string;
  level: string; // formatted level, e.g. "4.52%" or "+18 bps"
  changeBps: number | null; // day-over-day change in basis points
  asOf: string; // ISO date of the observation
  source: string;
};

const DAY = 60 * 60 * 6; // refresh every 6 hours; data is end-of-day

function ym(d: Date) {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function treasuryMonth(month: string): Promise<{ date: string; y2: number; y10: number }[]> {
  const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value_month=${month}`;
  const res = await fetch(url, { next: { revalidate: DAY } });
  if (!res.ok) return [];
  const xml = await res.text();
  const out: { date: string; y2: number; y10: number }[] = [];
  for (const entry of xml.split('<entry>').slice(1)) {
    const date = entry.match(/<d:NEW_DATE[^>]*>([^<]+)</)?.[1]?.slice(0, 10);
    const y2 = parseFloat(entry.match(/<d:BC_2YEAR[^>]*>([^<]+)</)?.[1] ?? '');
    const y10 = parseFloat(entry.match(/<d:BC_10YEAR[^>]*>([^<]+)</)?.[1] ?? '');
    if (date && Number.isFinite(y2) && Number.isFinite(y10)) out.push({ date, y2, y10 });
  }
  return out;
}

async function treasury() {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const rows = [...(await treasuryMonth(ym(prev))), ...(await treasuryMonth(ym(now)))].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return rows.slice(-2);
}

async function nyfed(path: string): Promise<{ date: string; rate: number }[]> {
  const res = await fetch(`https://markets.newyorkfed.org/api/rates/${path}/last/2.json`, { next: { revalidate: DAY } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.refRates ?? [])
    .map((r: { effectiveDate: string; percentRate: number }) => ({ date: r.effectiveDate, rate: r.percentRate }))
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date));
}

const bps = (a: number, b: number) => Math.round((b - a) * 100);
const pct = (v: number) => `${v.toFixed(2)}%`;

export async function getBenchmarks(): Promise<Benchmark[]> {
  try {
    const [t, sofr, effr] = await Promise.all([treasury(), nyfed('secured/sofr'), nyfed('unsecured/effr')]);
    const out: Benchmark[] = [];
    const TSY = 'U.S. Department of the Treasury';
    const NYF = 'Federal Reserve Bank of New York';
    if (t.length) {
      const [p, c] = t.length === 2 ? t : [null, t[0]];
      out.push({ key: 'ust10', label: 'US 10-year', level: pct(c.y10), changeBps: p ? bps(p.y10, c.y10) : null, asOf: c.date, source: TSY,
        explainer: 'The yield on 10-year U.S. Treasury notes. It anchors pricing for mortgages, commercial real estate debt, and long-dated corporate bonds.' });
      out.push({ key: 'ust2', label: 'US 2-year', level: pct(c.y2), changeBps: p ? bps(p.y2, c.y2) : null, asOf: c.date, source: TSY,
        explainer: 'The yield on 2-year Treasury notes. It moves closely with market expectations for the Fed’s policy rate over the next two years.' });
      const s = Math.round((c.y10 - c.y2) * 100);
      const sp = p ? Math.round((p.y10 - p.y2) * 100) : null;
      out.push({ key: '2s10s', label: '2s10s curve', level: `${s > 0 ? '+' : ''}${s} bps`, changeBps: sp === null ? null : s - sp, asOf: c.date, source: TSY,
        explainer: 'The 10-year yield minus the 2-year yield. A negative number means the curve is inverted; a steepening curve usually means long rates are rising relative to short ones.' });
    }
    if (sofr.length) {
      const c = sofr[sofr.length - 1];
      const p = sofr.length > 1 ? sofr[0] : null;
      out.push({ key: 'sofr', label: 'SOFR', level: pct(c.rate), changeBps: p ? bps(p.rate, c.rate) : null, asOf: c.date, source: NYF,
        explainer: 'The Secured Overnight Financing Rate: the cost of borrowing cash overnight against Treasury collateral. Most floating-rate loans in the U.S. now reference it.' });
    }
    if (effr.length) {
      const c = effr[effr.length - 1];
      const p = effr.length > 1 ? effr[0] : null;
      out.push({ key: 'effr', label: 'Effective fed funds', level: pct(c.rate), changeBps: p ? bps(p.rate, c.rate) : null, asOf: c.date, source: NYF,
        explainer: 'The rate at which banks lend reserves to each other overnight. The Fed steers it to keep it inside its target range.' });
    }
    return out;
  } catch (err) {
    console.error('Market data failed', err);
    return [];
  }
}
