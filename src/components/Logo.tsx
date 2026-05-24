import T from '@/lib/theme';

export default function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 22 : 26;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.25,
        background: T.brand, display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          width: size * 0.5, height: size * 0.5,
          border: `${size * 0.08}px solid white`, borderRadius: 2,
          transform: 'rotate(45deg)',
        }} />
      </div>
      <span style={{ fontSize: small ? 14 : 16, fontWeight: 600, letterSpacing: '-.01em' }}>
        Inventori
      </span>
    </div>
  );
}
