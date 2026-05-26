import Link from 'next/link';
import T from '@/lib/theme';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Terms of Service — Inventori',
};

const EFFECTIVE = 'May 25, 2026';
const CONTACT   = 'peterhuang516@gmail.com';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(246,247,249,.85)',
        backdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: `1px solid ${T.rule}`,
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '14px 32px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ fontSize: 13.5, color: T.ink2, textDecoration: 'none' }}>← Back</Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px 96px' }}>

        {/* Title */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: T.brand,
            letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Legal
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-.03em', lineHeight: 1.1 }}>
            Terms of Service
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: T.mute }}>
            Effective {EFFECTIVE}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="Agreement">
            <P>
              By requesting access to or using Inventori ("the Service"), you agree to these
              Terms of Service. If you do not agree, do not use the Service.
            </P>
            <P>
              These terms apply to all users of Inventori, including those who have been granted
              access and those browsing the site.
            </P>
          </Section>

          <Section title="What Inventori is">
            <P>
              Inventori is an inventory management tool for hobby shops. It connects to your
              Google account to read and manage inventory files stored in your Google Drive.
              It is provided free of charge, as-is, with no guarantees of uptime or continuity.
            </P>
          </Section>

          <Section title="Access">
            <P>
              Inventori is currently invite-only. Access is granted at our discretion. We may
              revoke access at any time, for any reason, without notice. We may also discontinue
              the Service at any time.
            </P>
            <P>
              You may not share your credentials or attempt to circumvent the access request
              process.
            </P>
          </Section>

          <Section title="Your account and data">
            <P>
              You are responsible for your Google account and for maintaining the security of
              your sign-in credentials. Your inventory data is stored in your own Google Drive
              and remains yours at all times.
            </P>
            <P>
              You agree not to use Inventori to store data that is unlawful, harmful, or
              infringes on the rights of others.
            </P>
          </Section>

          <Section title="Google Drive access">
            <P>
              By signing in, you authorize Inventori to access your Google Drive on your behalf
              to read and manage your inventory files. You can revoke this access at any time
              from your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.brand }}
              >
                Google account permissions page
              </a>
              . Revoking access does not delete your files.
            </P>
            <P>
              Your use of Google's services is also governed by{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.brand }}
              >
                Google's Terms of Service
              </a>
              .
            </P>
          </Section>

          <Section title="Acceptable use">
            <P>You agree not to:</P>
            <ul style={{ margin: '8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Li>Use the Service for any unlawful purpose.</Li>
              <Li>Attempt to reverse-engineer, scrape, or abuse the Service.</Li>
              <Li>Interfere with the Service or its infrastructure.</Li>
              <Li>Use the Service in a way that could harm Inventori or other users.</Li>
            </ul>
          </Section>

          <Section title="No warranties">
            <P>
              Inventori is provided <strong>"as is"</strong> without any warranty of any kind —
              express or implied. We do not warrant that the Service will be uninterrupted,
              error-free, or that any data will be preserved. Use it at your own risk.
            </P>
            <P>
              Because your data lives in your Google Drive, you retain access to it regardless
              of the availability of this Service.
            </P>
          </Section>

          <Section title="Limitation of liability">
            <P>
              To the fullest extent permitted by law, Inventori and its operators shall not be
              liable for any indirect, incidental, special, or consequential damages arising
              from your use of — or inability to use — the Service, even if we have been advised
              of the possibility of such damages.
            </P>
          </Section>

          <Section title="Changes to these terms">
            <P>
              We may update these terms from time to time. When we do, we will update the
              effective date at the top of this page. Continued use of the Service after a
              change constitutes your acceptance of the new terms.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions about these terms? Email us at{' '}
              <a href={`mailto:${CONTACT}`} style={{ color: T.brand }}>{CONTACT}</a>.
            </P>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.rule}`, background: T.panel }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '22px 32px',
          display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: T.mute,
        }}>
          <Logo small />
          <span>© 2026 Inventori · A small free thing for shopkeepers.</span>
          <div style={{ flex: 1 }} />
          <Link href="/privacy" style={{ color: T.mute, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: T.mute, textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{
        margin: '0 0 14px', fontSize: 18, fontWeight: 600,
        letterSpacing: '-.015em', color: T.ink,
        paddingBottom: 10, borderBottom: `1px solid ${T.rule}`,
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 14.5, color: T.ink2, lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ fontSize: 14.5, color: T.ink2, lineHeight: 1.7 }}>
      {children}
    </li>
  );
}
