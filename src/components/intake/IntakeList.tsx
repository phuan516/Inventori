'use client';

import { useState } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import { IIcon } from './IntakeIcons';
import IntakeStatus from './IntakeStatus';
import { INTAKES } from '@/lib/intakeData';

interface Props {
  onNew?: () => void;
}

export default function IntakeList({ onNew }: Props) {
  const [sel, setSel] = useState('i00');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.mute,
          letterSpacing: '.06em', textTransform: 'uppercase',
        }}>Intakes</div>
        <button
          onClick={onNew}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 9px',
            borderRadius: 6, border: 'none', background: T.brand, color: '#fff',
            fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <Icon.plus s={12} /> New
        </button>
      </div>
      <div style={{
        overflowY: 'auto', flex: 1, padding: '0 8px 10px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {INTAKES.map(it => {
          const active = it.id === sel;
          return (
            <button
              key={it.id}
              onClick={() => setSel(it.id)}
              className="intk-row"
              style={{
                textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: active ? T.brandSoft : 'transparent',
                borderRadius: 8, padding: '9px 10px',
                display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: active ? `inset 0 0 0 1px ${T.brand}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: active ? T.brand : T.faint, display: 'grid', placeItems: 'center' }}>
                  <IIcon.file s={14} />
                </span>
                <span style={{
                  flex: 1, fontSize: 12.5, fontWeight: 500,
                  color: active ? T.ink : T.ink2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 21 }}>
                <span style={{ fontSize: 10.5, fontFamily: T.fontMono, color: T.faint }}>{it.ref}</span>
                <span style={{ fontSize: 10.5, color: T.faint }}>· {it.date}</span>
                <span style={{ flex: 1 }} />
                <IntakeStatus status={it.status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
