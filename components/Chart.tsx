'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Chart as ChartData } from '@/lib/wix';

const L = 56, R = 8, T = 16, B = 34;
const STYLES = [
  { stroke: '#2F6BFF', dash: undefined, width: 3 },
  { stroke: '#B7C1D2', dash: '6 4', width: 2 },
  { stroke: '#8AB0FF', dash: '2 4', width: 2 },
];

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

export default function Chart({ data, n }: { data: ChartData; n: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const [W, setW] = useState(894);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 600 ? 240 : 320;
  const unit = data.unit ?? '';
  const fmt = (v: number | null) => (v === null ? '–' : `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`);

  const geo = useMemo(() => {
    const all = data.series.flatMap((s) => s.values).filter((v): v is number => v !== null);
    let min = Math.min(...all), max = Math.max(...all);
    if (data.chartType === 'bar') { min = Math.min(0, min); max = Math.max(0, max); }
    const ticks = niceTicks(min, max);
    const y0 = ticks[0], y1 = ticks[ticks.length - 1];
    const y = (v: number) => T + (H - T - B) * (1 - (v - y0) / (y1 - y0 || 1));
    const nX = data.x.length;
    const band = (W - L - R) / Math.max(nX, 1);
    const x = (i: number) => (data.chartType === 'bar' ? L + band * i + band / 2 : L + ((W - L - R) * i) / Math.max(nX - 1, 1));
    return { ticks, y, x, band };
  }, [data, W, H]);

  const labelEvery = Math.max(1, Math.ceil(data.x.length / (W < 600 ? 4 : 6)));

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0, dist = Infinity;
    data.x.forEach((_, i) => { const d = Math.abs(geo.x(i) - px); if (d < dist) { dist = d; best = i; } });
    setHover(best);
  }

  return (
    <figure className="chart">
      <div className="chart__n">Chart {n}</div>
      <div className="chart__title">{data.title}</div>
      {data.subtitle && <div className="chart__sub">{data.subtitle}</div>}
      {data.series.length > 1 && (
        <div className="chart__legend">
          {data.series.map((s, i) => (
            <span key={s.name}>
              <svg width="22" height="4" aria-hidden="true"><line x1="0" y1="2" x2="22" y2="2" stroke={STYLES[i].stroke} strokeWidth={3} strokeDasharray={data.chartType === 'bar' ? undefined : STYLES[i].dash} /></svg>
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div ref={boxRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${data.title}. ${data.series.map((s) => `${s.name}: from ${fmt(s.values[0])} to ${fmt(s.values[s.values.length - 1])}`).join('; ')}.`}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <g fontSize="13" fill="#8C97AB" fontFamily="inherit">
          {geo.ticks.map((t, i) => (
            <g key={t}>
              <line x1={L} x2={W} y1={geo.y(t)} y2={geo.y(t)} stroke={i === 0 ? '#3A4A6B' : '#1A2335'} />
              <text x={0} y={geo.y(t) + 4}>{t.toLocaleString('en-US')}{unit === '%' ? '%' : ''}</text>
            </g>
          ))}
          {data.x.map((lbl, i) => i % labelEvery === 0 && (
            <text key={i} x={geo.x(i)} y={H - 8} textAnchor={data.chartType === 'bar' ? 'middle' : i === 0 ? 'start' : 'middle'}>{lbl}</text>
          ))}
        </g>
        {data.chartType === 'bar'
          ? data.series.map((s, si) => s.values.map((v, i) => {
              if (v === null) return null;
              const w = (geo.band * 0.7) / data.series.length;
              const x = geo.x(i) - (geo.band * 0.7) / 2 + si * w;
              const y = geo.y(Math.max(v, 0)), h = Math.abs(geo.y(v) - geo.y(0));
              return <rect key={`${si}-${i}`} x={x} y={y} width={w - 2} height={h} fill={STYLES[si].stroke} opacity={hover === null || hover === i ? 1 : 0.45} />;
            }))
          : data.series.map((s, si) => {
              const pts = s.values.map((v, i) => (v === null ? null : `${geo.x(i)},${geo.y(v)}`)).filter(Boolean).join(' ');
              return <polyline key={s.name} points={pts} fill="none" stroke={STYLES[si].stroke} strokeWidth={STYLES[si].width} strokeDasharray={STYLES[si].dash} strokeLinejoin="round" />;
            })}
        {hover !== null && (
          <g pointerEvents="none">
            {data.chartType !== 'bar' && <line x1={geo.x(hover)} x2={geo.x(hover)} y1={T} y2={H - B} stroke="#3A4A6B" />}
            {data.chartType !== 'bar' && data.series.map((s, si) => s.values[hover] !== null && (
              <circle key={si} cx={geo.x(hover)} cy={geo.y(s.values[hover] as number)} r={5} fill={STYLES[si].stroke} />
            ))}
          </g>
        )}
      </svg>
      </div>
      <div className="chart__tip" aria-live="polite">
        {hover !== null ? `${data.x[hover]}: ${data.series.map((s) => `${data.series.length > 1 ? `${s.name} ` : ''}${fmt(s.values[hover])}`).join(', ')}` : '\u00a0'}
      </div>
      <figcaption className="chart__src">Source: {data.source}. Chart: Bps.</figcaption>
    </figure>
  );
}
