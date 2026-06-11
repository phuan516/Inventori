import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

interface TopbarProps {
  query: string;
  setQuery: (q: string) => void;
}

export default function Topbar({ query, setQuery }: TopbarProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 5, background: T.panel,
      display: 'flex', alignItems: 'center', gap: 12,
      height: 56, flexShrink: 0,
      padding: '0 28px', borderBottom: `1px solid ${T.rule}`,
    }}>
      <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.mute, pointerEvents: 'none' }}>
          <Icon.search s={14} />
        </span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, SKU, series, manufacturer…"
          style={{ paddingLeft: 32, background: T.bg }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T.mute, padding: 4, borderRadius: 4, display: 'grid', placeItems: 'center',
            }}
          >
            <Icon.x s={13} />
          </button>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <button
        title="Notifications"
        style={{
          width: 34, height: 34, background: T.panel, border: `1px solid ${T.rule}`,
          borderRadius: 7, color: T.ink2, cursor: 'pointer',
          display: 'grid', placeItems: 'center', position: 'relative',
        }}
      >
        <Icon.bell s={15} />
        <span style={{
          position: 'absolute', top: 6, right: 8, width: 6, height: 6,
          borderRadius: '50%', background: T.danger, boxShadow: `0 0 0 2px ${T.panel}`,
        }} />
      </button>
    </header>
  );
}
