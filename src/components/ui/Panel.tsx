import type { HTMLAttributes } from 'react';
import T from '@/lib/theme';

type PanelProps = HTMLAttributes<HTMLDivElement>;

export default function Panel({ children, style, ...rest }: PanelProps) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.rule}`,
        borderRadius: 10,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
