'use client';

import { useState, useEffect } from 'react';
import T from '@/lib/theme';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function CostCell({ value, onChange }: Props) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <span style={{ fontFamily: T.fontMono, fontSize: 13, color: T.faint }}>$</span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={(e) => {
          onChange(parseFloat(v) || 0);
          e.currentTarget.style.borderBottomColor = 'transparent';
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        onFocus={(e) => { e.currentTarget.style.borderBottomColor = T.brand; }}
        style={{
          width: 54, textAlign: 'right', border: 'none', background: 'transparent',
          fontFamily: T.fontMono, fontSize: 13, color: T.ink, padding: '2px 2px',
          borderBottom: '1px solid transparent', transition: 'border-color .12s',
        }}
      />
    </span>
  );
}
