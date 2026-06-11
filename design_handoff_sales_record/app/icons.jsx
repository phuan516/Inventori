// Line-icon set (16px native, scales via `s` prop). All currentColor.

const Icon = {
  search: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14" strokeLinecap="round"/></svg>,
  plus: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  minus: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10"/></svg>,
  scan: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M3 5V3h2M11 3h2v2M13 11v2h-2M5 13H3v-2"/><path d="M5.5 5.5v5M8 5.5v5M10.5 5.5v5"/></svg>,
  box: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="m2 5 6-3 6 3v6l-6 3-6-3V5Z"/><path d="m2 5 6 3 6-3M8 8v6"/></svg>,
  cog: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"/></svg>,
  chart: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 14V2M2 14h12"/><path d="M5 11V8M8 11V5M11 11V7"/></svg>,
  bell: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v1M4 6.5a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  filter: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 3h12l-4.5 6v4l-3 1V9L2 3Z"/></svg>,
  x: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>,
  check: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8 3 3 6-6.5"/></svg>,
  chev: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 4 4 4-4 4"/></svg>,
  chevDown: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m4 6 4 4 4-4"/></svg>,
  kebab: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>,
  edit: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14h3l8-8-3-3-8 8v3Z"/><path d="m9 4 3 3"/></svg>,
  trash: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.7 9.5a1 1 0 0 0 1 .9h2.6a1 1 0 0 0 1-.9L11 4"/></svg>,
  arrowLeft: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>,
  logout: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 2H3v12h6M11 5l3 3-3 3M14 8H6"/></svg>,
};

// Striped placeholder for product images
function ImgPlaceholder({ w = 48, h = 48, hue, sat = 8, light = 88, label, radius = 6 }) {
  const id = React.useId();
  const h2 = hue ?? 200;
  const bg = `oklch(${light}% ${sat / 100} ${h2})`;
  const fg = `oklch(${Math.max(0, light - 10)}% ${sat / 100} ${h2})`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', borderRadius: radius }}>
      <defs>
        <pattern id={`p${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={bg}/>
          <line x1="0" y1="0" x2="0" y2="6" stroke={fg} strokeWidth="2"/>
        </pattern>
        <clipPath id={`c${id}`}><rect width={w} height={h} rx={radius}/></clipPath>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width={w} height={h} fill={`url(#p${id})`}/>
      </g>
      {label && (
        <text x={w/2} y={h/2} dominantBaseline="middle" textAnchor="middle"
          fontFamily="'Geist Mono', monospace" fontSize={Math.min(w,h)/6.5}
          fill="rgba(0,0,0,.42)" style={{ letterSpacing: '.04em', fontWeight: 600 }}>
          {label}
        </text>
      )}
    </svg>
  );
}

Object.assign(window, { Icon, ImgPlaceholder });
