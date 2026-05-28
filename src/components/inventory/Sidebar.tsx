'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';
import T from '@/lib/theme';
import type { User } from '@/lib/types';
import { Icon, type IconComponent } from '@/components/ui/Icon';

interface SidebarProps {
  user: User | null;
  onSignOut: () => void;
  onChangeSheet: () => void;
  itemCount?: number;
}

export default function Sidebar({ user, onSignOut, onChangeSheet, itemCount = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useNavigation();

  function navigate(to: string) {
    if (to !== pathname) startLoading();
    router.push(to);
  }

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
        <NavItem icon={Icon.box}   label="Inventory" active={pathname === '/inventory'} onClick={() => navigate('/inventory')} count={itemCount} />
        <NavItem icon={Icon.chart} label="Reports"   disabled hint="Soon" />
        <NavItem icon={Icon.cog}   label="Settings"  active={pathname === '/settings'}  onClick={() => navigate('/settings')} />
      </nav>

      {/* User footer */}
      <div style={{ padding: 10, borderTop: `1px solid ${T.rule2}` }}>
        <button
          onClick={onChangeSheet}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 6, marginBottom: 4,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: T.ink2, fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon.sheet s={14} />
          Change sheet
        </button>
        {user ? (
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
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.rule, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, width: '60%', borderRadius: 4, background: T.rule, marginBottom: 5 }} />
              <div style={{ height: 9, width: '80%', borderRadius: 4, background: T.rule2 }} />
            </div>
          </div>
        )}
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
  onClick?: () => void;
}

function NavItem({ icon: I, label, active, count, disabled, hint, onClick }: NavItemProps) {
  return (
    <div
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={onClick && !disabled ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, fontSize: 13.5,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? T.faint : active ? T.brand : T.ink2,
        background: active ? T.brandSoft : 'transparent',
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = T.bg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
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
