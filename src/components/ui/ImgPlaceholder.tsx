'use client';

import { useId } from 'react';

interface ImgPlaceholderProps {
  w?: number;
  h?: number;
  hue?: number;
  sat?: number;
  light?: number;
  label?: string;
  radius?: number;
}

export default function ImgPlaceholder({
  w = 48, h = 48, hue, sat = 8, light = 88, label, radius = 6,
}: ImgPlaceholderProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '_');
  const h2 = hue ?? 200;
  const bg = `oklch(${light}% ${sat / 100} ${h2})`;
  const fg = `oklch(${Math.max(0, light - 10)}% ${sat / 100} ${h2})`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', borderRadius: radius }}>
      <defs>
        <pattern id={`p${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={bg} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={fg} strokeWidth="2" />
        </pattern>
        <clipPath id={`c${id}`}><rect width={w} height={h} rx={radius} /></clipPath>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width={w} height={h} fill={`url(#p${id})`} />
      </g>
      {label && (
        <text
          x={w / 2} y={h / 2}
          dominantBaseline="middle" textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize={Math.min(w, h) / 6.5}
          fill="rgba(0,0,0,.42)"
          style={{ letterSpacing: '.04em', fontWeight: 600 }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
