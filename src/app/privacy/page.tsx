import Link from 'next/link';
import T from '@/lib/theme';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Privacy Policy — Inventori',
};

const EFFECTIVE = 'May 25, 2026';
const CONTACT   = 'peterhuang516@gmail.com';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: T.mute }}>
            Effective {EFFECTIVE}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="Overview">
            <P>
              Inventori is a hobby-shop inventory tracker. This policy explains what information
              we collect, how we use it, and what rights you have over it. We've tried to keep
              it short and plain.
            </P>
            <P>
              The short version: we collect the minimum we need to make the app work. Your
              inventory data is stored in your own Google Drive — not on our servers.
            </P>
          </Section>

          <Section title="Information we collect">
            <P>When you sign in with Google, we receive:</P>
            <ul style={{ margin: '8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Li><strong>Your name and email address</strong> — used to identify your account.</Li>
              <Li><strong>A Google OAuth token</strong> — used to read and write files in your Google Drive on your behalf. This token is kept in your browser session and is never stored on our servers.</Li>
            </ul>
            <P>We do not collect payment information, passwords, or any data beyond what Google provides during sign-in.</P>
          </Section>

          <Section title="Google Drive access">
            <P>
              Inventori requests access to your Google Drive in order to read and manage your
              inventory files. This means the app can see and edit files in your Drive.
            </P>
            <P>
              We only read or write files that are directly relevant to running the inventory
              tracker. We do not scan, index, share, or sell any data found in your Drive.
            </P>
            <P>
              You can revoke Drive access at any time from your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.brand }}
              >
                Google account permissions page
              </a>
              . Revoking access does not delete any files — your data stays in your Drive.
            </P>
          </Section>

          <Section title="How we use your information">
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Li>To authenticate you and maintain your session.</Li>
              <Li>To read and write your inventory data in Google Drive.</Li>
              <Li>To respond to support or access requests you send us.</Li>
            </ul>
            <P>We do not use your information for advertising. We do not sell your data to third parties.</P>
          </Section>

          <Section title="Data storage">
            <P>
              Your inventory data lives entirely in your Google Drive. Inventori does not maintain
              a database of user content. The only information we may log server-side is basic
              request metadata (such as error logs) necessary to keep the service running, and
              this is not tied to your personal data.
            </P>
          </Section>

          <Section title="Third-party services">
            <P>
              Inventori uses <strong>Google Sign-In</strong> for authentication and{' '}
              <strong>Google Drive</strong> for storage. Your use of those services is governed
              by{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.brand }}
              >
                Google's Privacy Policy
              </a>
              . We do not use any other third-party analytics or tracking services.
            </P>
          </Section>

          <Section title="Your rights">
            <P>You can, at any time:</P>
            <ul style={{ margin: '8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Li><strong>Revoke access</strong> — remove Inventori's access to your Drive via your Google account settings.</Li>
              <Li><strong>Delete your data</strong> — delete the inventory files directly from your Google Drive. Once deleted, Inventori has nothing left to access.</Li>
              <Li><strong>Request information</strong> — email us and we will tell you what, if any, information we hold about you.</Li>
            </ul>
          </Section>

          <Section title="Changes to this policy">
            <P>
              If we make material changes to this policy, we will update the effective date at
              the top of this page. Continued use of Inventori after a change constitutes
              acceptance of the updated policy.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions or concerns? Email us at{' '}
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
          <a style={{ color: T.mute, cursor: 'pointer' }}>Terms</a>
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
