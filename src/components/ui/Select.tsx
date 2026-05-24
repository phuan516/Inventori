import type { SelectHTMLAttributes, ReactNode } from 'react';
import T from '@/lib/theme';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export default function Select({ style, children, ...rest }: SelectProps) {
  return (
    <select
      style={{
        height: 34, padding: '0 28px 0 11px',
        background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 7,
        fontSize: 13.5, color: T.ink, appearance: 'none', cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none' stroke='%236b7382' stroke-width='1.5'><path d='M2 4l3 3 3-3'/></svg>")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
        fontFamily: 'inherit',
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}
