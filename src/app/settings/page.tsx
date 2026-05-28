'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import T from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import Sidebar from '@/components/inventory/Sidebar';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    setItemCount(parseInt(localStorage.getItem('inventori_item_count') ?? '0', 10));
  }, []);

  if (authLoading || !user) return null;

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: T.bg, color: T.ink, display: 'grid', gridTemplateColumns: '232px 1fr' }}>
      <Sidebar user={user} onSignOut={handleSignOut} onChangeSheet={() => router.push('/sheets')} itemCount={itemCount} />

      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Settings</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: T.mute }}>
              Manage the options available when adding or editing products.
            </p>
          </div>

          <OptionGroup
            title="Categories"
            description="Used to organize products and filter the inventory view."
            options={settings.categories}
            onAdd={(val) => updateSettings({ categories: [...settings.categories, val] })}
            onRemove={(val) => updateSettings({ categories: settings.categories.filter(c => c !== val) })}
          />

          <OptionGroup
            title="Manufacturers"
            description="Suggested values when adding or editing a product's manufacturer."
            options={settings.manufacturers}
            onAdd={(val) => updateSettings({ manufacturers: [...settings.manufacturers, val] })}
            onRemove={(val) => updateSettings({ manufacturers: settings.manufacturers.filter(m => m !== val) })}
          />

          <OptionGroup
            title="Series"
            description="Suggested values when adding or editing a product's series."
            options={settings.series}
            onAdd={(val) => updateSettings({ series: [...settings.series, val] })}
            onRemove={(val) => updateSettings({ series: settings.series.filter(s => s !== val) })}
          />
        </div>
      </main>
    </div>
  );
}

/* ── Option group ── */

interface OptionGroupProps {
  title: string;
  description: string;
  options: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

function OptionGroup({ title, description, options, onAdd, onRemove }: OptionGroupProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const val = input.trim();
    if (!val) return;
    if (options.some(o => o.toLowerCase() === val.toLowerCase())) {
      setInput('');
      return;
    }
    onAdd(val);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <Panel style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: T.mute, marginTop: 3 }}>{description}</div>
      </div>

      {/* Chip list */}
      {options.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {options.map(opt => (
            <span
              key={opt}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 100,
                background: T.bg, border: `1px solid ${T.rule}`,
                fontSize: 12.5, color: T.ink,
              }}
            >
              {opt}
              <button
                onClick={() => onRemove(opt)}
                title={`Remove ${opt}`}
                style={{
                  display: 'grid', placeItems: 'center',
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'transparent', border: 'none',
                  color: T.mute, cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.rule; e.currentTarget.style.color = T.ink; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mute; }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: T.faint, fontStyle: 'italic' }}>No options yet — add one below.</div>
      )}

      {/* Add input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}…`}
          style={{
            flex: 1, height: 34, padding: '0 11px',
            background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 7,
            fontSize: 13.5, color: T.ink, fontFamily: 'inherit', outline: 'none',
            transition: 'border-color .12s, box-shadow .12s',
          }}
          onFocus={(e) => { e.target.style.borderColor = T.brand; e.target.style.boxShadow = `0 0 0 3px ${T.brandSoft}`; }}
          onBlur={(e) => { e.target.style.borderColor = T.rule; e.target.style.boxShadow = 'none'; }}
        />
        <Btn kind="ghost" onClick={handleAdd} style={{ flexShrink: 0 }}>Add</Btn>
      </div>
    </Panel>
  );
}
