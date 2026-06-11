'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import T from '@/lib/theme';

let storesCache: { stores: Store[]; ts: number } | null = null;
const STORES_CACHE_TTL = 5 * 60 * 1000;

interface Store {
  id: string;
  sheetId: string;
  name: string;
  modifiedTime: string;
}

export default function SheetsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadStores = useCallback(async (bust = false) => {
    if (bust) storesCache = null;
    if (storesCache && Date.now() - storesCache.ts < STORES_CACHE_TTL) {
      setStores(storesCache.stores);
      setLoading(false);
      return;
    }
    try {
      const data = await fetch('/api/sheets').then(r => r.json());
      const loaded: Store[] = data.stores ?? [];
      storesCache = { stores: loaded, ts: Date.now() };
      setStores(loaded);
    } catch {
      setError('Could not load your stores. Try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadStores();
  }, [user, authLoading, router, loadStores]);

  async function handleCreate() {
    const fullName = `Inventori - ${createName.trim()}`;
    if (stores.some(s => s.name === fullName)) {
      setCreateError('A store with that name already exists');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create store');
      localStorage.setItem('inventori_store_id', data.folderId);
      localStorage.setItem('inventori_sheet_id', data.sheetId);
      localStorage.setItem('inventori_sheet_name', data.name ?? fullName);
      if (data.salesSheetId) localStorage.setItem('inventori_sales_sheet_id', data.salesSheetId);
      if (data.holdSheetId) localStorage.setItem('inventori_hold_sheet_id', data.holdSheetId);
      router.push('/dashboard');
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create store');
    } finally {
      setCreating(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(246,247,249,.9)',
        backdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: `1px solid ${T.rule}`,
      }}>
        <div style={{
          maxWidth: 820, margin: '0 auto', padding: '13px 32px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Logo />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={user.initials} />
            <div style={{ fontSize: 13, lineHeight: 1.3 }}>
              <div style={{ fontWeight: 500, color: T.ink }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: T.mute }}>{user.email}</div>
            </div>
            <button
              onClick={signOut}
              style={{
                marginLeft: 8, padding: '4px 12px', borderRadius: 6,
                border: `1px solid ${T.rule}`, background: T.panel,
                fontSize: 12.5, color: T.ink2, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px' }}>

        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-.02em' }}>
              Choose a Store
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14.5, color: T.ink2, lineHeight: 1.55 }}>
              Only stores named <strong>Inventori - …</strong> are shown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <button
              onClick={() => { setRefreshing(true); loadStores(true); }}
              disabled={refreshing || loading}
              title="Refresh store list"
              style={{
                padding: '9px 13px', borderRadius: 8,
                border: `1px solid ${T.rule}`, background: T.panel,
                fontSize: 13.5, color: T.ink2, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {refreshing ? '…' : '↻'}
            </button>
            <button
              onClick={() => { setShowCreate(v => !v); setCreateError(null); }}
              style={{
                padding: '9px 16px', borderRadius: 8,
                border: `1px solid ${T.brand}`,
                background: T.brand, color: '#fff',
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              + New store
            </button>
          </div>
        </div>

        {showCreate && (
          <div style={{
            marginBottom: 20, padding: '16px 18px', borderRadius: 10,
            background: T.panel, border: `1px solid ${T.rule}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Create a new Inventori store</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                padding: '8px 12px', borderRadius: 7,
                border: `1px solid ${T.rule}`, background: T.bg,
                fontSize: 13.5, color: T.mute, whiteSpace: 'nowrap',
              }}>
                Inventori -
              </span>
              <input
                autoFocus
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createName.trim() && handleCreate()}
                placeholder="Store name"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 7,
                  border: `1px solid ${T.rule}`, background: T.bg,
                  fontSize: 13.5, color: T.ink, fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button
                onClick={() => handleCreate()}
                disabled={!createName.trim() || creating}
                style={{
                  padding: '8px 16px', borderRadius: 7,
                  border: 'none', background: createName.trim() ? T.brand : T.rule,
                  color: createName.trim() ? '#fff' : T.mute,
                  fontSize: 13.5, fontWeight: 500, cursor: createName.trim() ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'background .15s',
                }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
            {createError && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: T.danger }}>{createError}</div>
            )}
          </div>
        )}

        {loading && <LoadingState />}

        {error && (
          <div style={{
            padding: '14px 16px', borderRadius: 9,
            background: T.dangerSoft, border: `1px solid ${T.danger}22`,
            fontSize: 13.5, color: T.danger,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && stores.length === 0 && <EmptyState />}

        {!loading && !error && stores.length > 0 && (
          <div style={{
            background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 12, overflow: 'hidden',
          }}>
            {stores.map((store, i) => (
              <StoreRow
                key={store.id}
                store={store}
                divider={i > 0}
                selecting={selectedId === store.id}
                dimmed={selectedId !== null && selectedId !== store.id}
                onSelect={() => {
                  localStorage.setItem('inventori_store_id', store.id);
                  localStorage.setItem('inventori_sheet_id', store.sheetId);
                  localStorage.setItem('inventori_sheet_name', store.name ?? '');
                  // Clear stale sheet IDs from any previously selected store
                  localStorage.removeItem('inventori_sales_sheet_id');
                  localStorage.removeItem('inventori_hold_sheet_id');
                  setSelectedId(store.id);
                  router.push('/dashboard');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Store row ── */

function StoreRow({ store, divider, selecting, dimmed, onSelect }: {
  store: Store; divider: boolean; selecting: boolean; dimmed: boolean; onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const date = store.modifiedTime
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(store.modifiedTime))
    : '—';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !selecting && !dimmed && onSelect()}
      onKeyDown={(e) => e.key === 'Enter' && !selecting && !dimmed && onSelect()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        borderTop: divider ? `1px solid ${T.rule}` : 'none',
        background: selecting ? T.brandSoft : hover && !dimmed ? T.bg : T.panel,
        cursor: dimmed || selecting ? 'default' : 'pointer',
        transition: 'background .1s, opacity .1s',
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <FolderIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.name}
        </div>
        <div style={{ fontSize: 12, color: selecting ? T.brand : T.mute, marginTop: 2 }}>
          {selecting ? 'Opening…' : `Modified ${date}`}
        </div>
      </div>
      {selecting ? <Spinner /> : <ChevronRight />}
    </div>
  );
}

/* ── States ── */

function LoadingState() {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 12, overflow: 'hidden',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
          borderTop: i > 0 ? `1px solid ${T.rule}` : 'none',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: T.rule, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, width: '40%', borderRadius: 4, background: T.rule, marginBottom: 6 }} />
            <div style={{ height: 11, width: '20%', borderRadius: 4, background: T.rule2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '56px 32px',
      background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 12,
    }}>
      <FolderIcon size={40} />
      <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600 }}>No Inventori stores found</div>
      <div style={{ marginTop: 6, fontSize: 13.5, color: T.mute, maxWidth: 360, margin: '6px auto 0', lineHeight: 1.55 }}>
        Click <strong>+ New store</strong> above to create your first Inventori store.
      </div>
    </div>
  );
}

/* ── Icons ── */

function FolderIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="6" fill="#F4B400" />
      <path d="M6 12a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V12z" fill="#fff" opacity=".9" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ animation: 'spin .7s linear infinite', flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke={T.rule} strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke={T.brand} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={T.mute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%',
      background: T.brandSoft, color: T.brand,
      display: 'grid', placeItems: 'center',
      fontSize: 11, fontWeight: 700, letterSpacing: '-.01em',
    }}>
      {initials}
    </div>
  );
}
