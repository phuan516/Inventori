'use client';

import { useState } from 'react';
import T from '@/lib/theme';
import { useSettings } from '@/context/SettingsContext';
import Btn from '@/components/ui/Btn';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import ComboInput from '@/components/ui/ComboInput';
import { Icon } from '@/components/ui/Icon';
import { IIcon } from './IntakeIcons';
import type { IntakeLine } from '@/lib/intakeData';

function genSku(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface Props {
  line: IntakeLine;
  onSave: (patch: Partial<IntakeLine>) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export default function PendingSetup({ line, onSave, onCancel, isEdit }: Props) {
  const { settings } = useSettings();
  const [f, setF] = useState({
    sku:    line.sku    || '',
    upc:    line.upc    || '',
    name:   line.name   || '',
    cat:    line.cat    || '',
    mfr:    line.mfr    || '',
    series: line.series || '',
    cost:   line.cost   || '',
    price:  line.price  || '',
    low:    line.low    ?? 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof f, string>>>({});

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF(prev => ({ ...prev, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function save() {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      sku:    f.sku.trim(),
      upc:    f.upc.trim(),
      name:   f.name.trim(),
      cat:    f.cat.trim(),
      mfr:    f.mfr.trim(),
      series: f.series.trim(),
      cost:   parseFloat(String(f.cost))  || 0,
      price:  parseFloat(String(f.price)) || 0,
      low:    parseInt(String(f.low))     || 0,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: isEdit ? T.brand : T.warn, display: 'grid', placeItems: 'center' }}>
          <IIcon.sparkle s={15} />
        </span>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{isEdit ? 'Edit product (saves as new)' : 'New product'}</div>
      </div>

      <Field label="Product name" error={errors.name}>
        <Input
          value={f.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. HG Zaku II Custom"
          autoFocus
        />
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
        <Field label="UPC" hint="Scanned barcode">
          <Input
            value={f.upc}
            onChange={(e) => set('upc', e.target.value)}
            style={{ fontFamily: T.fontMono }}
          />
        </Field>
        <Field label="Category">
          <ComboInput
            listId="pending-categories"
            options={settings.categories}
            value={f.cat}
            onChange={(e) => set('cat', e.target.value)}
            placeholder="e.g. Gunpla"
          />
        </Field>
        <Field label="Manufacturer">
          <ComboInput
            listId="pending-manufacturers"
            options={settings.manufacturers}
            value={f.mfr}
            onChange={(e) => set('mfr', e.target.value)}
            placeholder="e.g. Bandai"
          />
        </Field>
        <Field label="Series">
          <ComboInput
            listId="pending-series"
            options={settings.series}
            value={f.series}
            onChange={(e) => set('series', e.target.value)}
            placeholder="e.g. Wing"
          />
        </Field>
        <Field label="Low-stock threshold" hint="Alert when at or below">
          <Input
            type="number"
            value={f.low}
            onChange={(e) => set('low', parseInt(e.target.value) || 0)}
          />
        </Field>
        <Field label="Unit cost">
          <Input
            type="number"
            step="0.01"
            value={f.cost}
            onChange={(e) => set('cost', e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Selling price" style={{ gridColumn: '1 / -1' }}>
          <Input
            type="number"
            step="0.01"
            value={f.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && <Btn kind="ghost" onClick={onCancel} style={{ height: 32 }}>Cancel</Btn>}
        <Btn kind="primary" onClick={save} icon={<Icon.check s={13} />} style={{ height: 32 }}>
          {isEdit ? 'Save as new product' : 'Create & match'}
        </Btn>
      </div>
    </div>
  );
}
