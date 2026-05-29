'use client';

import { useState } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import { IIcon } from './IntakeIcons';

interface Props {
  onScan: (v: string) => void;
  onSimulate: () => void;
}

export default function ScanField({ onScan, onSimulate }: Props) {
  const [v, setV] = useState('');

  function submit() {
    if (v.trim()) { onScan(v); setV(''); }
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
      <div style={{
        flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
        animation: 'intkScanPulse 2.6s ease-in-out infinite',
        borderRadius: 12,
      }}>
        <span style={{
          position: 'absolute', left: 16, color: T.brand,
          display: 'grid', placeItems: 'center', pointerEvents: 'none',
        }}>
          <Icon.scan s={20} />
        </span>
        <input
          value={v}
          onChange={(e) => setV(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Scan or type a barcode, then press Enter"
          style={{
            width: '100%', height: 56,
            padding: '0 16px 0 46px',
            background: T.panel, border: `1.5px solid ${T.rule}`, borderRadius: 12,
            fontSize: 16, fontWeight: 500, color: T.ink,
            fontFamily: T.fontMono,
            transition: 'border-color .12s, box-shadow .12s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.brand;
            e.target.style.boxShadow = `0 0 0 3px ${T.brandSoft}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.rule;
            e.target.style.boxShadow = 'none';
          }}
        />
        <kbd style={{
          position: 'absolute', right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: T.faint, fontFamily: T.fontMono, pointerEvents: 'none',
        }}>
          <IIcon.enter s={13} />
        </kbd>
      </div>
      <button
        onClick={onSimulate}
        title="Simulate a scan"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          height: 56, padding: '0 18px',
          borderRadius: 12, border: `1px solid ${T.rule}`, background: T.panel,
          color: T.ink2, fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'background .12s, border-color .12s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = T.bg;
          e.currentTarget.style.borderColor = T.faint;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = T.panel;
          e.currentTarget.style.borderColor = T.rule;
        }}
      >
        <IIcon.bolt s={15} /> Simulate scan
      </button>
    </div>
  );
}
