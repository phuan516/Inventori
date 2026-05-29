import T from '@/lib/theme';

interface Props {
  status: 'draft' | 'committed';
  size?: 'sm' | 'md';
}

export default function IntakeStatus({ status, size = 'sm' }: Props) {
  const draft = status === 'draft';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: size === 'sm' ? 10.5 : 11.5, fontWeight: 600,
      padding: size === 'sm' ? '2px 7px' : '3px 9px', borderRadius: 100,
      background: draft ? T.warnSoft : T.okSoft,
      color: draft ? T.warn : T.ok,
      whiteSpace: 'nowrap', letterSpacing: '.01em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: draft ? T.warn : T.ok }} />
      {draft ? 'Draft' : 'Committed'}
    </span>
  );
}
