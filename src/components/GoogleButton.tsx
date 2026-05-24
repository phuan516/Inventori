import T from '@/lib/theme';

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ background: '#fff', borderRadius: 2, padding: 1 }}>
      <path fill="#4285F4" d="M16.51 8.18c0-.57-.05-1.13-.15-1.66H9v3.13h4.21c-.18.96-.73 1.78-1.55 2.33v1.93h2.5c1.46-1.35 2.31-3.34 2.31-5.73Z"/>
      <path fill="#34A853" d="M9 17c2.1 0 3.86-.69 5.15-1.87l-2.5-1.93c-.69.46-1.58.74-2.65.74-2.04 0-3.76-1.37-4.38-3.22H1.04v2c1.28 2.54 3.92 4.28 7.96 4.28Z"/>
      <path fill="#FBBC05" d="M4.62 10.72A4.97 4.97 0 0 1 4.36 9c0-.6.1-1.18.27-1.72V5.28H1.04A8 8 0 0 0 1 9c0 1.3.31 2.51.86 3.59l2.76-1.87Z"/>
      <path fill="#EA4335" d="M9 4.06c1.15 0 2.18.4 2.99 1.17l2.21-2.21C13.46 1.74 11.7 1 9 1 4.96 1 1.94 2.93.66 5.47l2.76 2.16C4.7 5.51 6.42 4.06 9 4.06Z"/>
    </svg>
  );
}

export default function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: T.ink, color: '#fff', border: 'none', borderRadius: 8,
        padding: '0 22px', height: 44, fontSize: 14, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2731'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = T.ink; }}
    >
      <GoogleG />
      Continue with Google
    </button>
  );
}
