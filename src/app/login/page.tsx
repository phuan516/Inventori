'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import T from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/ui/Icon';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  function handleGoogleSignIn() {
    signIn('/sheets');
  }

  return (
    <div className="inv-fade-in" style={{
      minHeight: '100vh', background: T.bg, color: T.ink,
      display: 'grid', gridTemplateColumns: 'minmax(0, 480px) 1fr',
    }}>

      {/* ── Left panel — brand ── */}
      <aside style={{
        background: T.ink, color: '#fff',
        padding: '32px 40px', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gradient blooms */}
        <div style={{
          position: 'absolute', top: -160, right: -120, width: 460, height: 460,
          background: `radial-gradient(closest-side, ${T.brand}, transparent 70%)`,
          opacity: .45, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -180, left: -120, width: 380, height: 380,
          background: `radial-gradient(closest-side, #2a3a8a, transparent 70%)`,
          opacity: .35, pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brand, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 14, height: 14, border: '2px solid white', borderRadius: 2, transform: 'rotate(45deg)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>Inventori</span>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
            color: '#fff', fontSize: 11.5, fontWeight: 500, padding: '4px 10px',
            borderRadius: 100, marginBottom: 20,
          }}>
            <SheetGlyph s={13} /> Powered by your Google Drive
          </div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1.15, maxWidth: 360 }}>
            Welcome back to a tidier shelf.
          </h2>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', maxWidth: 360 }}>
            Sign in with the same Google account that owns your Inventori sheet.
            We don&apos;t store passwords — Google handles that.
          </p>
        </div>
      </aside>

      {/* ── Right panel — sign-in card ── */}
      <main style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', color: T.ink2,
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 6, borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.ink; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.ink2; }}
          >
            <Icon.arrowLeft s={14} /> Back
          </button>
        </div>

        {/* Centered card */}
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 32 }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15 }}>
              Sign in to Inventori
            </h1>
            <p style={{ margin: '8px 0 28px', fontSize: 14, color: T.mute, lineHeight: 1.55 }}>
              Use your Google account. It&apos;s the only way in — and the only place your data lives.
            </p>

            {/* Primary Google button */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', height: 48, background: T.ink, color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 14.5, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2731'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = T.ink; }}
            >
              <GoogleG /> Continue with Google
            </button>

            {/* Scope reassurance */}
            <div style={{
              marginTop: 28, padding: '12px 14px',
              background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 9,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ color: T.ok, marginTop: 1 }}><ShieldGlyph s={16} /></span>
              <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.5 }}>
                Inventori accesses your Google Drive to read and manage your inventory files stored there.
                We don&apos;t access your mail or calendar.
              </div>
            </div>

            <p style={{ marginTop: 22, fontSize: 11.5, color: T.mute, lineHeight: 1.55 }}>
              By continuing, you agree to Inventori&apos;s{' '}
              <Link href="/terms" className="inv-link">Terms of Service</Link> and{' '}
              <a className="inv-link">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 16, padding: '14px 32px', borderTop: `1px solid ${T.rule}`, fontSize: 12, color: T.mute }}>
          <span>© 2026 Inventori</span>
          <div style={{ flex: 1 }} />
          <a style={{ color: T.mute, cursor: 'pointer' }}>Help</a>
          <Link href="/privacy" style={{ color: T.mute, textDecoration: 'none' }}>Privacy</Link>
          <a style={{ color: T.mute, cursor: 'pointer' }}>Status</a>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function StatItem({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>{v}</div>
      <div style={{ marginTop: 4, fontSize: 11 }}>{l}</div>
    </div>
  );
}

function DisabledProvider({ icon, label, hint, style }: { icon: ReactNode; label: string; hint: string; style?: CSSProperties }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 44,
      padding: '0 14px', background: T.panel, border: `1px solid ${T.rule}`,
      borderRadius: 9, color: T.mute, fontSize: 13.5, cursor: 'not-allowed', ...style,
    }}>
      {icon}
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: T.bg, color: T.mute, fontWeight: 500, border: `1px solid ${T.rule}` }}>
        {hint}
      </span>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ background: '#fff', borderRadius: 2, padding: 1, flexShrink: 0 }}>
      <path fill="#4285F4" d="M16.51 8.18c0-.57-.05-1.13-.15-1.66H9v3.13h4.21c-.18.96-.73 1.78-1.55 2.33v1.93h2.5c1.46-1.35 2.31-3.34 2.31-5.73Z"/>
      <path fill="#34A853" d="M9 17c2.1 0 3.86-.69 5.15-1.87l-2.5-1.93c-.69.46-1.58.74-2.65.74-2.04 0-3.76-1.37-4.38-3.22H1.04v2c1.28 2.54 3.92 4.28 7.96 4.28Z"/>
      <path fill="#FBBC05" d="M4.62 10.72A4.97 4.97 0 0 1 4.36 9c0-.6.1-1.18.27-1.72V5.28H1.04A8 8 0 0 0 1 9c0 1.3.31 2.51.86 3.59l2.76-1.87Z"/>
      <path fill="#EA4335" d="M9 4.06c1.15 0 2.18.4 2.99 1.17l2.21-2.21C13.46 1.74 11.7 1 9 1 4.96 1 1.94 2.93.66 5.47l2.76 2.16C4.7 5.51 6.42 4.06 9 4.06Z"/>
    </svg>
  );
}

function SheetGlyph({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 14 14">
      <rect x="1" y="1" width="12" height="12" rx="2" fill="#0F9D58"/>
      <rect x="3" y="4" width="8" height="1.4" fill="#fff" opacity=".95"/>
      <rect x="3" y="6.2" width="8" height="1.4" fill="#fff" opacity=".95"/>
      <rect x="3" y="8.4" width="8" height="1.4" fill="#fff" opacity=".95"/>
      <rect x="6.6" y="3.4" width="1" height="7" fill="#0F9D58"/>
    </svg>
  );
}

function ShieldGlyph({ s = 14 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M8 2 3 4v5c0 3 2 4.5 5 5.5 3-1 5-2.5 5-5.5V4L8 2Z"/>
      <path d="m5.5 8.2 1.7 1.7L10.5 6.5" strokeLinecap="round"/>
    </svg>
  );
}

function MicrosoftG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <rect x="1"   y="1"   width="7.5" height="7.5" fill="#9aa1ad" opacity=".6"/>
      <rect x="9.5" y="1"   width="7.5" height="7.5" fill="#9aa1ad" opacity=".6"/>
      <rect x="1"   y="9.5" width="7.5" height="7.5" fill="#9aa1ad" opacity=".6"/>
      <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#9aa1ad" opacity=".6"/>
    </svg>
  );
}

function EmailG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9aa1ad" strokeWidth="1.4">
      <rect x="2" y="4" width="14" height="10" rx="2"/>
      <path d="m3 5 6 5 6-5"/>
    </svg>
  );
}
