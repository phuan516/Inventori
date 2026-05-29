import type { ReactNode } from 'react';
import T from '@/lib/theme';
import type { Product } from '@/lib/types';
import { statusOf } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import Btn from '@/components/ui/Btn';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';

export const TABLE_MIN_WIDTH = 960;

const COLS = [
  { w: '60px',  label: '' },
  { w: '1fr',   label: 'Product' },
  { w: '110px', label: 'Category' },
  { w: '110px', label: 'Stock' },
  { w: '110px', label: 'Status' },
  { w: '90px',  label: 'Price', align: 'right' as const },
  { w: '40px',  label: '' },
];
const GRID = COLS.map(c => c.w).join(' ');

export function TableHeader() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: GRID, gap: 14,
      padding: '11px 18px', alignItems: 'center',
      borderBottom: `1px solid ${T.rule2}`, background: T.bg,
    }}>
      {COLS.map((c, i) => (
        <div key={i} style={{
          fontSize: 11, fontWeight: 600, color: T.mute,
          letterSpacing: '.04em', textTransform: 'uppercase',
          textAlign: c.align || 'left',
        }}>{c.label}</div>
      ))}
    </div>
  );
}

interface RowProps {
  p: Product;
  onSelect: () => void;
  onInc: () => void;
  onDec: () => void;
}

export function Row({ p, onSelect, onInc, onDec }: RowProps) {
  const st = statusOf(p);
  return (
    <div
      className="inv-row"
      style={{
        display: 'grid', gridTemplateColumns: GRID, gap: 14,
        padding: '12px 18px', alignItems: 'center',
        borderBottom: `1px solid ${T.rule2}`, cursor: 'pointer',
        transition: 'background .08s',
      }}
      onClick={onSelect}
    >
      <ImgPlaceholder w={44} h={44} hue={p.hue} sat={9} radius={6} />

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 2, fontSize: 11.5, color: T.mute }}>
          {p.sku    && <span style={{ fontFamily: T.fontMono }}>{p.sku}</span>}
          {p.mfr    && <span>{p.sku ? '· ' : ''}{p.mfr}</span>}
          {p.series && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(p.sku || p.mfr) ? '· ' : ''}{p.series}</span>}
        </div>
      </div>

      <span style={{ fontSize: 12.5, color: T.ink2 }}>{p.cat || '—'}</span>

      {/* Stock stepper — stopPropagation so row click doesn't fire */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
        <Stepper icon={<Icon.minus s={11} />} onClick={onDec} disabled={p.stock === 0} />
        <span style={{
          minWidth: 32, textAlign: 'center', fontFamily: T.fontMono, fontWeight: 600, fontSize: 13,
          color: st === 'out' ? T.danger : st === 'low' ? T.warn : T.ink,
        }}>{p.stock}</span>
        <Stepper icon={<Icon.plus s={11} />} onClick={onInc} />
        <span style={{ fontSize: 11, color: T.faint, marginLeft: 2 }}>/ {p.low}</span>
      </div>

      <Pill tone={st === 'out' ? 'danger' : st === 'low' ? 'warn' : 'ok'}>
        {st === 'out' ? 'Out of stock' : st === 'low' ? 'Low stock' : 'In stock'}
      </Pill>

      <span style={{ fontFamily: T.fontMono, fontSize: 13, textAlign: 'right' }}>
        ${p.price.toFixed(2)}
      </span>

      <Icon.chev s={14} />
    </div>
  );
}

function Stepper({ icon, onClick, disabled }: { icon: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        width: 22, height: 22, borderRadius: 5, border: `1px solid ${T.rule}`,
        background: T.panel, color: T.ink2, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'grid', placeItems: 'center', opacity: disabled ? 0.4 : 1, padding: 0,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.faint; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = T.panel; e.currentTarget.style.borderColor = T.rule; }}
    >
      {icon}
    </button>
  );
}

export function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: GRID, gap: 14,
          padding: '12px 18px', alignItems: 'center',
          borderBottom: `1px solid ${T.rule2}`,
          opacity: 1 - i * 0.08,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 6, background: T.rule2 }} />
          <div>
            <div style={{ height: 13, width: '55%', borderRadius: 4, background: T.rule2, marginBottom: 7 }} />
            <div style={{ height: 10, width: '35%', borderRadius: 4, background: T.rule2 }} />
          </div>
          <div style={{ height: 11, width: 64, borderRadius: 4, background: T.rule2 }} />
          <div style={{ height: 11, width: 40, borderRadius: 4, background: T.rule2 }} />
          <div style={{ height: 20, width: 72, borderRadius: 100, background: T.rule2 }} />
          <div style={{ height: 11, width: 48, borderRadius: 4, background: T.rule2, marginLeft: 'auto' }} />
          <div />
        </div>
      ))}
    </>
  );
}

export function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: T.bg, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: T.mute }}>
        <Icon.search s={20} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No products match these filters</div>
      <div style={{ fontSize: 13, color: T.mute, marginBottom: 14 }}>
        {query ? `Nothing found for "${query}".` : 'Try a different combination.'}
      </div>
      <Btn kind="ghost" onClick={onClear}>Clear filters</Btn>
    </div>
  );
}
