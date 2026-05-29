'use client';

import { useState, useEffect } from 'react';
import T from '@/lib/theme';
import type { Product } from '@/lib/types';
import { statusOf } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import { Icon } from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import Btn from '@/components/ui/Btn';
import Panel from '@/components/ui/Panel';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import ComboInput from '@/components/ui/ComboInput';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';

function genSku(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface DrawerProps {
  item: Product;
  onClose: () => void;
  onSave: (updated: Product) => void;
  onDelete: () => void;
  onInc: () => void;
  onDec: () => void;
  products: Product[];
}

export default function ProductDrawer({ item, onClose, onSave, onDelete, onInc, onDec, products }: DrawerProps) {
  const { settings } = useSettings();
  const [draft, setDraft] = useState<Product>(item);
  const [confirming, setConfirming] = useState(false);
  const [errors, setErrors] = useState<{ sku?: string; upc?: string }>({});

  const st = statusOf(item);
  const margin = draft.price > 0 ? (((draft.price - draft.cost) / draft.price) * 100).toFixed(0) : '0';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setDraft(prev => ({ ...prev, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function handleSave() {
    const errs: typeof errors = {};
    const others = products.filter(p => p.name !== item.name);
    const sku = draft.sku.trim();
    if (sku && others.some(p => p.sku === sku)) errs.sku = 'SKU already exists';
    const upc = draft.upc.trim();
    if (upc && others.some(p => p.upc === upc)) errs.upc = 'UPC already exists';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...draft, sku, stock: item.stock });
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,20,25,.32)', animation: 'invFade .18s ease' }}
    >
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 460, background: T.panel, boxShadow: '-12px 0 32px rgba(0,0,0,.12)',
          display: 'flex', flexDirection: 'column',
          animation: 'invSlide .22s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${T.rule}` }}>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, background: 'transparent', border: 'none', color: T.mute, cursor: 'pointer', borderRadius: 6, display: 'grid', placeItems: 'center' }}
          >
            <Icon.x s={16} />
          </button>
          <div style={{ flex: 1, fontSize: 12, color: T.mute, fontFamily: T.fontMono }}>{draft.sku}</div>
          <Btn kind="danger" icon={<Icon.trash s={13} />} onClick={() => setConfirming(true)} style={{ height: 30, padding: '0 11px' }}>
            Delete
          </Btn>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Hero block */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, marginBottom: 22 }}>
            <ImgPlaceholder w={120} h={120} hue={item.hue} sat={10} light={84} radius={10} />
            <div>
              {draft.mfr && <div style={{ fontSize: 11, color: T.mute, fontFamily: T.fontMono, marginBottom: 4 }}>{draft.mfr}</div>}
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-.01em' }}>{draft.name}</h2>
              {draft.series && <div style={{ fontSize: 12.5, color: T.mute, marginTop: 4 }}>{draft.series}</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <Pill tone={st === 'out' ? 'danger' : st === 'low' ? 'warn' : 'ok'}>
                  {st === 'out' ? 'Out of stock' : st === 'low' ? 'Low stock' : 'In stock'}
                </Pill>
                {draft.cat && <Pill tone="mute">{draft.cat}</Pill>}
              </div>
            </div>
          </div>

          {/* Stock control */}
          <Panel style={{ padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: T.mute, fontWeight: 500, marginBottom: 10 }}>On-hand quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={onDec} disabled={item.stock === 0} style={bigBtn(item.stock === 0)}>
                <Icon.minus s={16} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  fontSize: 38, fontWeight: 600, letterSpacing: '-.02em',
                  color: st === 'out' ? T.danger : st === 'low' ? T.warn : T.ink,
                  fontFamily: T.fontMono,
                }}>{item.stock}</div>
                <div style={{ fontSize: 11, color: T.mute }}>Threshold: {draft.low}</div>
              </div>
              <button onClick={onInc} style={bigBtn(false)}>
                <Icon.plus s={16} />
              </button>
            </div>
          </Panel>

          {/* Editable fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Name" style={{ gridColumn: '1 / -1' }}>
              <Input value={draft.name} onChange={(e) => set('name', e.target.value)} style={{ width: '100%' }} />
            </Field>
            <Field label="SKU" error={errors.sku}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input
                  value={draft.sku}
                  onChange={(e) => set('sku', e.target.value.toUpperCase())}
                  style={{ fontFamily: T.fontMono, flex: 1, minWidth: 0 }}
                />
                <button
                  type="button"
                  onClick={() => set('sku', genSku())}
                  title="Auto-generate SKU"
                  style={{
                    flexShrink: 0, height: 36, padding: '0 10px', borderRadius: 7,
                    border: `1px solid ${T.rule}`, background: T.bg, color: T.ink2,
                    cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  }}
                >
                  Auto
                </button>
              </div>
            </Field>
            <Field label="UPC" error={errors.upc}>
              <Input value={draft.upc} onChange={(e) => set('upc', e.target.value)}
                placeholder="e.g. 4573102620767" style={{ fontFamily: T.fontMono }} />
            </Field>
            <Field label="Category" style={{ gridColumn: '1 / -1' }}>
              <ComboInput
                listId="drawer-categories"
                options={settings.categories}
                value={draft.cat}
                onChange={(e) => set('cat', e.target.value)}
                style={{ width: '100%' }}
              />
            </Field>
            <Field label="Manufacturer">
              <ComboInput
                listId="drawer-manufacturers"
                options={settings.manufacturers}
                value={draft.mfr}
                onChange={(e) => set('mfr', e.target.value)}
              />
            </Field>
            <Field label="Series">
              <ComboInput
                listId="drawer-series"
                options={settings.series}
                value={draft.series}
                onChange={(e) => set('series', e.target.value)}
              />
            </Field>
            <Field label="Selling price">
              <Input type="number" step="0.01" value={draft.price}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Cost">
              <Input type="number" step="0.01" value={draft.cost}
                onChange={(e) => set('cost', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Low-stock threshold" style={{ gridColumn: '1 / -1' }}>
              <Input type="number" value={draft.low}
                onChange={(e) => set('low', parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </Field>
          </div>

          {/* Margin readout */}
          <div style={{
            marginTop: 18, padding: '12px 14px', background: T.bg,
            border: `1px solid ${T.rule}`, borderRadius: 8,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          }}>
            <KV label="Margin"      value={`${margin}%`} />
            <KV label="Per unit"    value={`$${(draft.price - draft.cost).toFixed(2)}`} />
            <KV label="Stock value" value={`$${(item.stock * draft.cost).toFixed(2)}`} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 18px', borderTop: `1px solid ${T.rule}` }}>
          <Btn kind="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn kind="primary" onClick={handleSave} style={{ flex: 1 }}>Save</Btn>
        </div>

        {/* Delete confirmation overlay */}
        {confirming && (
          <ConfirmDelete
            name={draft.name}
            onCancel={() => setConfirming(false)}
            onConfirm={onDelete}
          />
        )}
      </div>
    </div>
  );
}

function bigBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 48, height: 48, borderRadius: 10, border: `1px solid ${T.rule}`,
    background: T.panel, color: T.ink, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid', placeItems: 'center', opacity: disabled ? 0.4 : 1, padding: 0,
  };
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: T.mute, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, fontFamily: T.fontMono }}>{value}</div>
    </div>
  );
}

function ConfirmDelete({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      className="inv-fade-in"
      style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', padding: 20 }}
    >
      <Panel style={{ padding: 24, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.dangerSoft, color: T.danger, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
          <Icon.trash s={20} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Remove from inventory?</div>
        <div style={{ fontSize: 13, color: T.mute, lineHeight: 1.55, marginBottom: 18 }}>
          &ldquo;{name}&rdquo; will be deleted. You can&apos;t undo this.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn kind="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</Btn>
          <Btn kind="primary" onClick={onConfirm} style={{ flex: 1, background: T.danger }}>Delete</Btn>
        </div>
      </Panel>
    </div>
  );
}
