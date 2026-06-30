import Image from 'next/image';
import T from '@/lib/theme';

export default function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 22 : 26;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.25,
        background: T.brand, display: 'grid', placeItems: 'center',
      }}>
        <Image src="/inventori-mark.png" alt="" width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} />
      </div>
      <span style={{ fontSize: small ? 14 : 16, fontWeight: 600, letterSpacing: '-.01em' }}>
        Inventori
      </span>
    </div>
  );
}
