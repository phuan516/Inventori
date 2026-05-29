'use client';

import { useState, useEffect } from 'react';
import T from '@/lib/theme';
import type { Product } from '@/lib/types';
import { useSettings } from '@/context/SettingsContext';
import { Icon } from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import ComboInput from '@/components/ui/ComboInput';

function genSku(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (p: Product) => void;
  products: Product[];
}

export default function AddProductModal({ onClose, onAdd, products }: AddProductModalProps) {
  const { settings } = useSettings();
  const [f, setF] = useState<Product>({
    sku: '', upc: '', name: '', cat: '',
    mfr: '', series: '', stock: 1, low: 0, price: 0, cost: 0, hue: 200,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>({});

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setF(prev => ({ ...prev, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function submit() {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = 'Required';
    const sku = f.sku.trim();
    if (sku && products.some(p => p.sku === sku)) errs.sku = 'SKU already exists';
    const upc = f.upc.trim();
    if (upc && products.some(p => p.upc === upc)) errs.upc = 'UPC already exists';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      ...f,
      sku:   f.sku.trim(),
      hue:   Math.floor(Math.random() * 360),
      price: parseFloat(String(f.price)) || 0,
      cost:  parseFloat(String(f.cost))  || 0,
      stock: parseInt(String(f.stock))   || 0,
      low:   parseInt(String(f.low))     || 0,
    });
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="inv-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(15,20,25,.42)', backdropFilter: 'blur(4px)',
        display: 'grid', placeItems: 'center', padding: 20,
      }}
    >
      <div
        className="inv-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, background: T.panel, borderRadius: 14,
          boxShadow: '0 30px 80px rgba(0,0,0,.35)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${T.rule}` }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Add product</div>
            <div style={{ fontSize: 12, color: T.mute, marginTop: 2 }}>Catalog a new SKU. You can add more details later.</div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, background: 'transparent', border: 'none', color: T.mute, cursor: 'pointer', borderRadius: 6, display: 'grid', placeItems: 'center' }}
          >
            <Icon.x s={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Product name" error={errors.name}>
            <Input value={f.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. MG Wing Gundam Zero EW" autoFocus />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="SKU" error={errors.sku}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input
                  value={f.sku}
                  onChange={(e) => set('sku', e.target.value.toUpperCase())}
                  placeholder="BAN-2607193"
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
            <Field label="UPC" hint="Scan or type manually" error={errors.upc}>
              <Input value={f.upc} onChange={(e) => set('upc', e.target.value)}
                placeholder="e.g. 4573102620767" style={{ fontFamily: T.fontMono }} />
            </Field>
            <Field label="Category">
              <ComboInput
                listId="modal-categories"
                options={settings.categories}
                value={f.cat}
                onChange={(e) => set('cat', e.target.value)}
                placeholder="e.g. Gunpla"
              />
            </Field>
            <Field label="Manufacturer">
              <ComboInput
                listId="modal-manufacturers"
                options={settings.manufacturers}
                value={f.mfr}
                onChange={(e) => set('mfr', e.target.value)}
                placeholder="e.g. Bandai"
              />
            </Field>
            <Field label="Series">
              <ComboInput
                listId="modal-series"
                options={settings.series}
                value={f.series}
                onChange={(e) => set('series', e.target.value)}
                placeholder="e.g. Wing"
              />
            </Field>
            <Field label="Initial stock">
              <Input type="number" value={f.stock} onChange={(e) => set('stock', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Low-stock threshold" hint="Alert when at or below">
              <Input type="number" value={f.low} onChange={(e) => set('low', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Cost">
              <Input type="number" step="0.01" value={f.cost} onChange={(e) => set('cost', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Selling price" style={{ gridColumn: '1 / -1' }}>
              <Input type="number" step="0.01" value={f.price} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '14px 22px', borderTop: `1px solid ${T.rule}` }}>
          <Btn kind="ghost" onClick={onClose}>Cancel</Btn>
          <Btn kind="primary" onClick={submit}>Add to inventory</Btn>
        </div>
      </div>
    </div>
  );
}
