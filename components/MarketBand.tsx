import { getBenchmarks } from '@/lib/market';
import { formatDate } from '@/lib/format';
import MarketRows from './MarketRows';

export default async function MarketBand() {
  const rows = await getBenchmarks();
  if (!rows.length) return null; // never show stale or invented numbers
  const asOf = rows.map((r) => r.asOf).sort().at(-1)!;
  return (
    <section className="market" aria-labelledby="market-title">
      <div className="market__intro">
        <h2 id="market-title">The day in basis points</h2>
        <p>How far each benchmark moved at the latest close. Select one to see what it measures.</p>
        <p className="market__source">
          End-of-day data, latest close {formatDate(asOf)}. Sources: U.S. Department of the Treasury; Federal Reserve Bank of New York. Rates publish on different schedules, so dates can differ by a day.
        </p>
      </div>
      <MarketRows rows={rows} />
    </section>
  );
}
