import type { CSSProperties, ReactNode } from 'react';
import T from '@/lib/theme';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  style?: CSSProperties;
}

export default function Field({ label, hint, error, children, style }: FieldProps) {
  return (
    <label style={{ display: 'block', ...style }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>
          {label}
        </div>
      )}
      {children}
      {hint && !error && <div style={{ fontSize: 11.5, color: T.mute, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11.5, color: T.danger, marginTop: 4 }}>{error}</div>}
    </label>
  );
}
