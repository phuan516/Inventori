import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import T from '@/lib/theme';
import type { BtnKind } from '@/lib/types';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: BtnKind;
  icon?: ReactNode;
}

const variants: Record<BtnKind, CSSProperties> = {
  primary: { background: T.brand,  color: '#fff',    border: 'none' },
  ghost:   { background: T.panel,  color: T.ink2,    border: `1px solid ${T.rule}` },
  subtle:  { background: 'transparent', color: T.ink2, border: 'none' },
  danger:  { background: T.panel,  color: T.danger,  border: `1px solid ${T.rule}` },
};

export default function Btn({ kind = 'ghost', icon, children, style, disabled, ...rest }: BtnProps) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 7, fontSize: 13, fontWeight: 500,
    padding: '0 14px', height: 34,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    transition: 'background .12s, border-color .12s, color .12s',
    fontFamily: 'inherit',
  };

  return (
    <button disabled={disabled} style={{ ...base, ...variants[kind], ...style }} {...rest}>
      {icon}{children}
    </button>
  );
}
