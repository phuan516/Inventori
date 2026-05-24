import T from '@/lib/theme';
import type { User } from '@/lib/types';
import { Icon, type IconComponent } from '@/components/ui/Icon';

interface SidebarProps {
  user: User;
  onSignOut: () => void;
  itemCount: number;
}

export default function Sidebar({ user, onSignOut, itemCount }: SidebarProps) {
  return (
    <aside style={{
      background: T.panel, borderRight: `1px solid ${T.rule}`,
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '18px 18px', borderBottom: `1px solid ${T.rule2}`,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brand, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 14, height: 14, border: '2px solid white', borderRadius: 2, transform: 'rotate(45deg)' }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>Inventori</div>
          <div style={{ fontSize: 11, color: T.mute }}>Saito Hobby</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <NavItem icon={Icon.box}   label="Inventory" active count={itemCount} />
        <NavItem icon={Icon.chart} label="Reports"   disabled hint="Soon" />
        <NavItem icon={Icon.cog}   label="Settings" />
      </nav>

      {/* User footer */}
      <div style={{ padding: 10, borderTop: `1px solid ${T.rule2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: user.tone,
            color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}>
            {user.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: T.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={onSignOut} title="Sign out"
            style={{ background: 'transparent', border: 'none', color: T.mute, cursor: 'pointer', padding: 6, borderRadius: 6, display: 'grid', placeItems: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mute; }}
          >
            <Icon.logout s={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: IconComponent;
  label: string;
  active?: boolean;
  count?: number;
  disabled?: boolean;
  hint?: string;
}

function NavItem({ icon: I, label, active, count, disabled, hint }: NavItemProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 13.5,
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? T.faint : active ? T.brand : T.ink2,
      background: active ? T.brandSoft : 'transparent',
      fontWeight: active ? 500 : 400,
    }}>
      <I s={15} />
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && (
        <span style={{
          fontSize: 10.5, fontFamily: T.fontMono, padding: '1px 6px', borderRadius: 100,
          background: active ? '#fff' : T.rule2, color: active ? T.brand : T.mute, fontWeight: 600,
        }}>{count}</span>
      )}
      {hint && <span style={{ fontSize: 10, color: T.faint }}>{hint}</span>}
    </div>
  );
}
