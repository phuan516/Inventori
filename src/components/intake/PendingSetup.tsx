'use client';

import { useState } from 'react';
import T from '@/lib/theme';
import { CATEGORIES, GRADES } from '@/lib/data';
import Btn from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { IIcon } from './IntakeIcons';
import type { IntakeLine } from '@/lib/intakeData';

interface Props {
  line: IntakeLine;
  onSave: (patch: Partial<IntakeLine>) => void;
  onCancel?: () => void;
}

export default function PendingSetup({ line, onSave, onCancel }: Props) {
  const [f, setF] = useState({
    name: line.name || '',
    cat: line.cat || 'Gunpla',
    grade: line.grade || 'HG',
    mfr: line.mfr || '',
    cost: line.cost || '',
  });
  const [err, setErr] = useState(false);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  function save() {
    if (!f.name.trim()) { setErr(true); return; }
    onSave({
      name: f.name.trim(), cat: f.cat, grade: f.grade,
      mfr: f.mfr.trim(), cost: parseFloat(String(f.cost)) || 0,
    });
  }

  const inputStyle = {
    width: '100%', height: 34, padding: '0 11px',
    background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 7,
    fontSize: 13.5, color: T.ink,
    transition: 'border-color .12s, box-shadow .12s',
  };

  const selectStyle = {
    ...inputStyle,
    padding: '0 28px 0 11px', appearance: 'none' as const, cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none' stroke='%236b7382' stroke-width='1.5'><path d='M2 4l3 3 3-3'/></svg>")`,
    backgroundRepeat: 'no-repeat' as const, backgroundPosition: 'right 10px center' as const,
  };

  function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = T.brand;
    e.target.style.boxShadow = `0 0 0 3px ${T.brandSoft}`;
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = T.rule;
    e.target.style.boxShadow = 'none';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: T.warn, display: 'grid', placeItems: 'center' }}>
          <IIcon.sparkle s={15} />
        </span>
        <div style={{ fontSize: 13, fontWeight: 600 }}>New product</div>
        <span style={{ fontSize: 11.5, color: T.mute, fontFamily: T.fontMono }}>{line.sku}</span>
      </div>

      <label style={{ display: 'block' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>Product name</div>
        <input
          value={f.name}
          onChange={(e) => { set('name', e.target.value); setErr(false); }}
          placeholder="e.g. HG Zaku II Custom"
          style={{ ...inputStyle, borderColor: err ? T.danger : T.rule }}
          onFocus={focusInput} onBlur={blurInput}
        />
        {err && <div style={{ fontSize: 11.5, color: T.danger, marginTop: 4 }}>Required</div>}
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>Category</div>
          <select value={f.cat} onChange={(e) => set('cat', e.target.value)} style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>Grade</div>
          <select value={f.grade} onChange={(e) => set('grade', e.target.value)} style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>Manufacturer</div>
          <input value={f.mfr} onChange={(e) => set('mfr', e.target.value)} placeholder="Bandai" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
        </label>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: T.ink2, marginBottom: 5 }}>Unit cost</div>
          <input type="number" step="0.01" value={f.cost} onChange={(e) => set('cost', e.target.value)} placeholder="0.00" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && <Btn kind="ghost" onClick={onCancel} style={{ height: 32 }}>Cancel</Btn>}
        <Btn kind="primary" onClick={save} icon={<Icon.check s={13} />} style={{ height: 32 }}>
          Create &amp; match
        </Btn>
      </div>
    </div>
  );
}
