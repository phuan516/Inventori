'use client';

import T from '@/lib/theme';
import { IIcon } from './IntakeIcons';
import IntakeStatus from './IntakeStatus';
import type { IntakeSession } from '@/lib/intakeData';

interface Props {
  intakes: IntakeSession[];
  selectedId: string | null;
  loading: boolean;
  creating: boolean;
  onSelect: (intake: IntakeSession) => void;
  onNew: () => void;
}

export default function IntakeList({ intakes, selectedId, loading, creating, onSelect, onNew }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <style>{`
        @keyframes intk-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes intk-spin  { to{transform:rotate(360deg)} }
      `}</style>

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
          disabled={creating}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 9px',
            borderRadius: 6, border: 'none',
            background: creating ? T.rule : T.brand,
            color: creating ? T.mute : '#fff',
            fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            cursor: creating ? 'default' : 'pointer',
          }}
        >
          {creating ? <Spinner /> : (
            <>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M8 3v10M3 8h10"/>
              </svg>
              New
            </>
          )}
        </button>
      </div>

      <div style={{
        overflowY: 'auto', flex: 1, padding: '0 8px 10px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {/* Creating ghost row */}
        {creating && (
          <div style={{
            borderRadius: 8, padding: '9px 10px',
            display: 'flex', flexDirection: 'column', gap: 6,
            background: T.brandSoft,
            boxShadow: `inset 0 0 0 1px ${T.brand}22`,
            animation: 'intk-pulse 1.4s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: `${T.brand}44`, flexShrink: 0 }} />
              <div style={{ height: 11, width: '55%', borderRadius: 3, background: `${T.brand}33` }} />
            </div>
            <div style={{ display: 'flex', gap: 6, paddingLeft: 21 }}>
              <div style={{ height: 9, width: '30%', borderRadius: 3, background: `${T.brand}22` }} />
              <div style={{ height: 9, width: '20%', borderRadius: 3, background: `${T.brand}22` }} />
            </div>
          </div>
        )}

        {/* Skeleton rows while loading */}
        {loading && [0, 1, 2].map(i => (
          <div key={i} style={{
            borderRadius: 8, padding: '9px 10px',
            display: 'flex', flexDirection: 'column', gap: 6,
            animation: `intk-pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: T.rule, flexShrink: 0 }} />
              <div style={{ height: 11, width: `${50 + i * 12}%`, borderRadius: 3, background: T.rule }} />
            </div>
            <div style={{ display: 'flex', gap: 6, paddingLeft: 21 }}>
              <div style={{ height: 9, width: '28%', borderRadius: 3, background: T.rule2 }} />
              <div style={{ height: 9, width: '18%', borderRadius: 3, background: T.rule2 }} />
            </div>
          </div>
        ))}

        {!loading && intakes.length === 0 && !creating && (
          <div style={{ padding: '20px 10px', textAlign: 'center', color: T.mute, fontSize: 12.5, lineHeight: 1.55 }}>
            No intake sessions yet.<br />Click <strong>New</strong> to start one.
          </div>
        )}

        {intakes.map(it => {
          const active = it.id === selectedId;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it)}
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
                <span style={{ fontSize: 10.5, color: T.faint }}>{it.date}</span>
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

function Spinner() {
  return (
    <svg
      width={13} height={13} viewBox="0 0 16 16" fill="none"
      style={{ animation: 'intk-spin .7s linear infinite' }}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity=".25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
