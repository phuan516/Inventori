import type { CSSProperties, ReactNode } from 'react';
import T from '@/lib/theme';
import type { PillTone } from '@/lib/types';

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  style?: CSSProperties;
}

const tones: Record<PillTone, { bg: string; fg: string }> = {
  ok:     { bg: T.okSoft,     fg: T.ok },
  warn:   { bg: T.warnSoft,   fg: T.warn },
  danger: { bg: T.dangerSoft, fg: T.danger },
  brand:  { bg: T.brandSoft,  fg: T.brand },
  mute:   { bg: T.rule2,      fg: T.mute },
};

export default function Pill({ tone = 'mute', children, style }: PillProps) {
  const { bg, fg } = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
      background: bg, color: fg, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  );
}
