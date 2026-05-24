'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import T from '@/lib/theme';
import Logo from '@/components/Logo';
import GoogleButton from '@/components/GoogleButton';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import { Icon } from '@/components/ui/Icon';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';

export default function LandingPage() {
  const router = useRouter();
  const goToLogin = () => router.push('/login');

  return (
    <div className="inv-fade-in" style={{ minHeight: '100vh', background: T.bg }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(246,247,249,.85)',
        backdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: `1px solid ${T.rule}`,
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '14px 32px',
          display: 'flex', alignItems: 'center', gap: 28,
        }}>
          <Logo />
          <nav style={{ display: 'flex', gap: 22, fontSize: 13.5, color: T.ink2 }}>
            <a style={{ cursor: 'pointer', color: T.ink2 }}>How it works</a>
            <a style={{ cursor: 'pointer', color: T.ink2 }}>For hobby shops</a>
            <a style={{ cursor: 'pointer', color: T.ink2 }}>FAQ</a>
          </nav>
          <div style={{ flex: 1 }} />
          <a style={{ fontSize: 13.5, color: T.ink2, cursor: 'pointer' }} onClick={goToLogin}>Sign in</a>
          <Btn kind="primary" onClick={goToLogin} style={{ height: 32 }}>Open in Google</Btn>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 32px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.brandSoft, color: T.brand,
              fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 100,
              marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.brand }} />
              Free · Your data lives in your Google Sheet
            </div>
            <h1 style={{
              margin: 0, fontSize: 56, fontWeight: 600, letterSpacing: '-.035em',
              lineHeight: 1.02, color: T.ink,
            }}>
              A simple inventory tracker.{' '}
              <span style={{ color: T.mute }}>Your spreadsheet, with a nicer face.</span>
            </h1>
            <p style={{
              margin: '22px 0 32px', fontSize: 17, lineHeight: 1.55, color: T.ink2, maxWidth: 520,
            }}>
              Sign in with Google and Inventori creates a sheet in your Drive.
              Every edit you make here writes straight to that file. No lock-in,
              no database, no monthly bill — just a friendlier way to keep score of the shelf.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <GoogleButton onClick={goToLogin} />
              <Btn kind="ghost" style={{ height: 44, padding: '0 18px' }}>See a demo shop</Btn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: 12.5, color: T.mute, flexWrap: 'wrap' }}>
              <Check>Free, always</Check>
              <Check>No credit card</Check>
              <Check>Delete the sheet, delete the app</Check>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: T.panel, borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 32px' }}>
          <div style={{ maxWidth: 720, marginBottom: 36 }}>
            <div style={{ fontSize: 12, color: T.brand, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              How it works
            </div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1.1 }}>
              Three steps. No new account, no migration, nothing to install.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Step n="01" title="Continue with Google"
              body='Sign in once. Inventori asks for the "drive.file" scope, which limits it to files it creates — not the rest of your Drive.' />
            <Step n="02" title="A sheet appears in your Drive"
              body='Called "Inventori · <shop name>". Open it any time, anywhere — phone, laptop, Excel, whatever. The data is yours.' />
            <Step n="03" title="Edit here, or edit there"
              body="Both write to the same rows. Add a kit on your phone, mark stock on a Chromebook, open the raw sheet on tax day. It just stays in sync." />
          </div>
        </div>
      </section>

      {/* ── What's in the app ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ maxWidth: 640, marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: T.brand, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            What&apos;s in the app
          </div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1.15 }}>
            Just inventory. Built for the way kits sit on hobby-shop shelves.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Feature icon={<Icon.box s={18} />} title="Grade & scale aware"
            body="HG, RG, MG, PG, SD — and 1/144, 1/100, 1/48 alongside. Filter the catalog the way collectors talk about it." />
          <Feature icon={<Icon.scan s={18} />} title="Scan or type"
            body="Manufacturer barcodes on your phone camera. Or just type a name and a count — the simple path always works." />
          <Feature icon={<Icon.bell s={18} />} title="Low-stock alerts"
            body="Per-SKU threshold. The dashboard surfaces what's running out — your PG kits and your sprue cutters get different alarms." />
        </div>
      </section>

      {/* ── Your data, your file ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 32px 72px' }}>
        <div style={{ background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 14, padding: '40px 44px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 700, color: T.ok,
                letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10,
              }}>
                <SheetGlyph s={14} /> Your data, your file
              </div>
              <h3 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.2 }}>
                The day Inventori goes away, your inventory is still there.
              </h3>
              <p style={{ margin: '12px 0 0', fontSize: 14.5, color: T.ink2, lineHeight: 1.55, maxWidth: 460 }}>
                Because the dashboard is a face on a spreadsheet you already own, you can leave any time.
                No export button to remember. No CSV dump. The sheet has always been yours,
                sitting quietly in your Drive.
              </p>
            </div>
            <SheetPreview />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ borderTop: `1px solid ${T.rule}`, background: T.panel }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ fontSize: 12, color: T.brand, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>FAQ</div>
          <h2 style={{ margin: '0 0 26px', fontSize: 28, fontWeight: 600, letterSpacing: '-.02em' }}>
            Honest questions, plain answers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Faq q="Is it really free?"
              a="Yes. Inventori doesn't store your data, so we don't have a server bill to pass on. Some day we may add an optional paid tier with multi-shop or print labels, but the inventory tracker stays free." />
            <Faq q="What does it ask Google for?"
              a='Two things. Your name and email (so we know you&apos;re you), and the "drive.file" scope — which lets Inventori see and edit only files it creates. We can&apos;t see your other Drive files, your mail, or your calendar.' />
            <Faq q="Can I edit the sheet directly?"
              a="Absolutely. Open it in Google Sheets, on your phone, in Excel — whatever. Inventori reads your changes next time it loads, and writes back the same way." />
            <Faq q="What if I want to leave?"
              a="Disconnect Inventori in your Google account settings, or just stop visiting. Your sheet stays in your Drive forever." />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 32px 88px' }}>
        <div style={{
          background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 14,
          padding: '44px 48px', display: 'grid', gridTemplateColumns: '1.4fr auto',
          alignItems: 'center', gap: 32,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15 }}>
              One click. A sheet in your Drive. A nicer view of it here.
            </h3>
            <p style={{ margin: '10px 0 0', color: T.mute, fontSize: 14.5, maxWidth: 560 }}>
              Free, forever. No card, no trial, no upsells.
            </p>
          </div>
          <GoogleButton onClick={goToLogin} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.rule}`, background: T.panel }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '22px 32px',
          display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: T.mute,
        }}>
          <Logo small />
          <span>© 2026 Inventori · A small free thing for shopkeepers.</span>
          <div style={{ flex: 1 }} />
          <a style={{ color: T.mute, cursor: 'pointer' }}>Privacy</a>
          <a style={{ color: T.mute, cursor: 'pointer' }}>Terms</a>
          <a style={{ color: T.mute, cursor: 'pointer' }}>Open source</a>
        </div>
      </footer>
    </div>
  );
}

/* ── Building blocks ── */

function Check({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%', background: T.okSoft,
        color: T.ok, display: 'grid', placeItems: 'center',
      }}>
        <Icon.check s={9} />
      </span>
      {children}
    </span>
  );
}

function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 10, padding: 22 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: T.brandSoft, color: T.brand,
        display: 'grid', placeItems: 'center', marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 10, padding: 22 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 12, color: T.brand, fontWeight: 600, letterSpacing: '.08em', marginBottom: 12 }}>{n}</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{q}</div>
      <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.6 }}>{a}</div>
    </div>
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

/* ── Hero visual: stacked dashboard + sheet cards ── */

function HeroVisual() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Dashboard card */}
      <div style={{
        position: 'relative', zIndex: 2, borderRadius: 12,
        background: T.panel, border: `1px solid ${T.rule}`,
        boxShadow: '0 30px 80px -30px rgba(15,20,25,.18), 0 4px 12px rgba(15,20,25,.04)',
        overflow: 'hidden',
      }}>
        <WindowChrome label="inventori.app / inventory" />
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { l: 'On hand', v: '284', d: '+12', tone: T.ok },
              { l: 'Low',     v: '18',  d: '!',   tone: T.warn },
              { l: 'Value',   v: '$48k', d: '+3%', tone: T.ok },
            ].map(k => (
              <div key={k.l} style={{ background: T.bg, border: `1px solid ${T.rule2}`, borderRadius: 8, padding: '9px 11px' }}>
                <div style={{ fontSize: 10, color: T.mute, marginBottom: 3 }}>{k.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{k.v}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: k.tone }}>{k.d}</div>
                </div>
              </div>
            ))}
          </div>
          {([
            { name: 'MG Barbatos Lupus Rex', sku: 'BAN-2587319', grade: 'MG', stock: 0,  tone: 'danger', hue: 20 },
            { name: 'RG Nu Gundam Ver.Ka',   sku: 'BAN-2554145', grade: 'RG', stock: 2,  tone: 'warn',   hue: 215 },
            { name: 'PG Unleashed RX-78-2',  sku: 'BAN-2620044', grade: 'PG', stock: 3,  tone: 'ok',     hue: 0 },
          ] as const).map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '26px 1fr auto auto', gap: 8,
              alignItems: 'center', padding: '7px 4px',
              borderTop: i ? `1px solid ${T.rule2}` : 'none',
            }}>
              <ImgPlaceholder w={26} h={26} hue={r.hue} sat={6} radius={4} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize: 9.5, color: T.mute, fontFamily: T.fontMono }}>{r.sku}</div>
              </div>
              <span style={{ fontSize: 9.5, fontFamily: T.fontMono, color: T.mute, border: `1px solid ${T.rule}`, padding: '0 5px', borderRadius: 3 }}>{r.grade}</span>
              <Pill tone={r.tone}>{r.stock === 0 ? 'Out' : String(r.stock)}</Pill>
            </div>
          ))}
        </div>
      </div>

      {/* Sync pill */}
      <div style={{
        position: 'relative', zIndex: 3, margin: '-8px auto 0', width: 'fit-content',
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 100,
        padding: '5px 12px 5px 8px', fontSize: 11, color: T.ink2,
        boxShadow: '0 4px 14px rgba(15,20,25,.06)',
      }}>
        <SheetGlyph s={14} />
        <span style={{ fontWeight: 500 }}>
          Synced with <span style={{ color: T.ink }}>Inventori · Saito Hobby</span>
        </span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.ok, boxShadow: `0 0 0 3px ${T.okSoft}` }} />
      </div>

      {/* Sheet card (offset behind) */}
      <div style={{
        marginTop: -6, position: 'relative', zIndex: 1, borderRadius: 12,
        background: T.panel, border: `1px solid ${T.rule}`,
        boxShadow: '0 30px 80px -30px rgba(15,20,25,.14), 0 4px 12px rgba(15,20,25,.04)',
        overflow: 'hidden', transform: 'translateX(28px)',
      }}>
        <WindowChrome label="docs.google.com / Inventori · Saito Hobby" tone="green" />
        <SheetRows />
      </div>
    </div>
  );
}

function WindowChrome({ label, tone }: { label: string; tone?: 'green' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px', borderBottom: `1px solid ${T.rule2}`,
      background: tone === 'green' ? '#f1faf3' : T.panel,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
      <div style={{
        flex: 1, textAlign: 'center', fontSize: 10.5,
        color: tone === 'green' ? '#0F9D58' : T.mute,
        fontFamily: T.fontMono,
      }}>{label}</div>
    </div>
  );
}

function SheetRows() {
  const cols = ['sku', 'name', 'grade', 'mfr', 'stock', 'price'];
  const widths = ['80px', '1fr', '40px', '70px', '48px', '56px'];
  const rows = [
    ['BAN-2587319', 'MG Barbatos Lupus Rex', 'MG', 'Bandai',     '0',  '64.99'],
    ['BAN-2554145', 'RG Nu Gundam Ver.Ka',   'RG', 'Bandai',     '2',  '89.99'],
    ['BAN-2620044', 'PG Unleashed RX-78-2',  'PG', 'Bandai',     '3', '349.99'],
    ['GSC-G94821',  'Nendoroid Frieren',     '—',  'Good Smile', '14', '74.99'],
  ];
  const gridCols = `28px ${widths.join(' ')}`;

  return (
    <div style={{ fontFamily: T.fontMono, fontSize: 10.5 }}>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, background: '#f8f9fa', borderBottom: '1px solid #e5e7eb', color: '#5f6368' }}>
        <Cell />
        {['A','B','C','D','E','F'].map(c => <Cell key={c} style={{ textAlign: 'center', fontWeight: 500 }}>{c}</Cell>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, background: '#f8f9fa', borderBottom: '1px solid #d2d4d8', color: '#202124' }}>
        <Cell style={{ background: '#f1f3f4', color: '#5f6368', textAlign: 'center' }}>1</Cell>
        {cols.map(c => <Cell key={c} style={{ fontWeight: 600 }}>{c}</Cell>)}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid #e5e7eb' }}>
          <Cell style={{ background: '#f1f3f4', color: '#5f6368', textAlign: 'center' }}>{ri + 2}</Cell>
          {r.map((v, ci) => (
            <Cell key={ci} style={{
              color: ci === 4 && v === '0' ? T.danger : ci === 4 && parseInt(v) <= 3 ? T.warn : '#202124',
              fontWeight: ci === 4 ? 600 : 400,
              textAlign: ci === 4 || ci === 5 ? 'right' : 'left',
            }}>{v}</Cell>
          ))}
        </div>
      ))}
    </div>
  );
}

function Cell({ children, style }: { children?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...style }}>
      {children}
    </div>
  );
}

function SheetPreview() {
  return (
    <div style={{ borderRadius: 10, background: T.panel, border: `1px solid ${T.rule}`, boxShadow: '0 12px 30px -10px rgba(15,20,25,.14)', overflow: 'hidden' }}>
      <WindowChrome label="docs.google.com / Inventori · Saito Hobby" tone="green" />
      <SheetRows />
    </div>
  );
}
