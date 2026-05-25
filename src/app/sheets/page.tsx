'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import T from '@/lib/theme';

interface Sheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export default function SheetsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => {
        setSheets(data.sheets ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your sheets. Try refreshing.');
        setLoading(false);
      });
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink }}>

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

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-.02em' }}>
            Choose a Google Sheet
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: T.ink2, lineHeight: 1.55 }}>
            Pick an existing spreadsheet to use as your inventory, or open a new one in Google Sheets.
          </p>
        </div>

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

        {!loading && !error && sheets.length === 0 && <EmptyState />}

        {!loading && !error && sheets.length > 0 && (
          <div style={{
            background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 12, overflow: 'hidden',
          }}>
            {sheets.map((sheet, i) => (
              <SheetRow
                key={sheet.id}
                sheet={sheet}
                divider={i > 0}
                onSelect={() => router.push(`/inventory`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sheet row ── */

function SheetRow({ sheet, divider, onSelect }: { sheet: Sheet; divider: boolean; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const date = sheet.modifiedTime
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(sheet.modifiedTime))
    : '—';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        borderTop: divider ? `1px solid ${T.rule}` : 'none',
        background: hover ? T.bg : T.panel,
        cursor: 'pointer', transition: 'background .1s',
      }}
    >
      <SheetIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sheet.name}
        </div>
        <div style={{ fontSize: 12, color: T.mute, marginTop: 2 }}>Modified {date}</div>
      </div>
      <ChevronRight />
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
      <SheetIcon size={40} />
      <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600 }}>No spreadsheets found</div>
      <div style={{ marginTop: 6, fontSize: 13.5, color: T.mute, maxWidth: 360, margin: '6px auto 0', lineHeight: 1.55 }}>
        Create a new Google Sheet in your Drive, then come back here to select it.
      </div>
    </div>
  );
}

/* ── Icons ── */

function SheetIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="6" fill="#0F9D58" />
      <rect x="7" y="9"  width="18" height="3" rx="1" fill="#fff" opacity=".95" />
      <rect x="7" y="14" width="18" height="3" rx="1" fill="#fff" opacity=".95" />
      <rect x="7" y="19" width="12" height="3" rx="1" fill="#fff" opacity=".95" />
      <rect x="15" y="8" width="2"  height="16" rx="1" fill="#0F9D58" />
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
