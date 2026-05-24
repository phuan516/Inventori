import type { InputHTMLAttributes } from 'react';
import T from '@/lib/theme';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ style, onFocus, onBlur, ...rest }: InputProps) {
  return (
    <input
      style={{
        width: '100%', height: 34, padding: '0 11px',
        background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 7,
        fontSize: 13.5, color: T.ink,
        transition: 'border-color .12s, box-shadow .12s',
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = T.brand;
        e.target.style.boxShadow = `0 0 0 3px ${T.brandSoft}`;
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = T.rule;
        e.target.style.boxShadow = 'none';
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
