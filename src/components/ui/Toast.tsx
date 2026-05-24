import T from '@/lib/theme';

interface ToastProps {
  msg: string;
  tone?: 'ok' | 'warn';
  id: number;
}

export default function Toast({ msg, tone = 'ok', id }: ToastProps) {
  return (
    <div key={id} style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      background: T.ink, color: '#fff',
      padding: '10px 14px', borderRadius: 8, fontSize: 13,
      boxShadow: '0 12px 28px rgba(0,0,0,.25)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'invToast .25s cubic-bezier(.2,.7,.3,1)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: tone === 'warn' ? T.warn : T.ok,
        flexShrink: 0,
      }} />
      {msg}
    </div>
  );
}
