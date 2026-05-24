'use client';

import { useRouter } from 'next/navigation';
import T from '@/lib/theme';
import Btn from '@/components/ui/Btn';

export default function SettingsPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Settings</div>
        <div style={{ fontSize: 13, color: T.mute, marginBottom: 18 }}>Coming in a future release.</div>
        <Btn kind="ghost" onClick={() => router.push('/inventory')}>← Back to inventory</Btn>
      </div>
    </div>
  );
}
