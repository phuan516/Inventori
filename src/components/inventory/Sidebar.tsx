'use client';

import T from '@/lib/theme';
import type { User } from '@/lib/types';
import { Icon, type IconComponent } from '@/components/ui/Icon';

export type AppTab = 'inventory' | 'intake' | 'sales' | 'settings';

interface SidebarProps {
  user: User | null;
  onSignOut: () => void;
  onChangeSheet: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  itemCount?: number;
  sheetName?: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ user, onSignOut, onChangeSheet, activeTab, onTabChange, itemCount = 0, sheetName, collapsed, onToggle }: SidebarProps) {
  const c = collapsed;

  return (
    <aside style={{
      background: T.panel, borderRight: `1px solid ${T.rule}`,
      display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'stretch',
      position: 'sticky', top: 0, height: '100vh',
      width: c ? 56 : 232, minWidth: c ? 56 : 232,
      transition: 'width 180ms ease, min-width 180ms ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: c ? '0' : '0 14px',
        justifyContent: c ? 'center' : 'flex-start',
        borderBottom: `1px solid ${T.rule2}`,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brand, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <div style={{ width: 14, height: 14, border: '2px solid white', borderRadius: 2, transform: 'rotate(45deg)' }} />
        </div>
        {!c && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>Inventori</div>
            {sheetName && <div style={{ fontSize: 11, color: T.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sheetName}</div>}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        padding: c ? '8px 0' : '12px 10px',
        display: 'flex', flexDirection: 'column',
        alignItems: c ? 'center' : 'stretch',
        gap: c ? 2 : 1, flex: 1,
      }}>
        <NavItem icon={Icon.box}   label="Inventory" active={activeTab === 'inventory'} onClick={() => onTabChange('inventory')} count={itemCount} collapsed={c} />
        <NavItem icon={Icon.cart}  label="Sales"     active={activeTab === 'sales'}     onClick={() => onTabChange('sales')} collapsed={c} />
        <NavItem icon={Icon.inbox} label="Intake"    active={activeTab === 'intake'}    onClick={() => onTabChange('intake')} collapsed={c} />
        <NavItem icon={Icon.chart} label="Reports"   disabled hint="Soon" collapsed={c} />
        <NavItem icon={Icon.cog}   label="Settings"  active={activeTab === 'settings'}  onClick={() => onTabChange('settings')} collapsed={c} />
      </nav>

      {/* Toggle */}
      <div style={{ padding: c ? '4px 0 6px' : '4px 10px 6px', display: 'flex', justifyContent: c ? 'center' : 'flex-end' }}>
        <button
          onClick={onToggle}
          title={c ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: T.mute, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.ink; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mute; }}
        >
          {c ? <Icon.chev s={14} /> : <Icon.chevLeft s={14} />}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        padding: c ? '8px 0' : '8px 10px',
        borderTop: `1px solid ${T.rule2}`,
        display: 'flex', flexDirection: 'column',
        alignItems: c ? 'center' : 'stretch',
        gap: 4,
      }}>
        {c ? (
          <IconBtn icon={<Icon.sheet s={15} />} title="Change sheet" onClick={onChangeSheet} />
        ) : (
          <button
            onClick={onChangeSheet}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 6, marginBottom: 2,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T.ink2, fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon.sheet s={14} />
            Change sheet
          </button>
        )}

        {user ? (
          c ? (
            <>
              <div title={`${user.name}\n${user.email}`} style={{
                width: 30, height: 30, borderRadius: '50%', background: user.tone,
                color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 600, flexShrink: 0, cursor: 'default',
              }}>
                {user.initials}
              </div>
              <IconBtn icon={<Icon.logout s={15} />} title="Sign out" onClick={onSignOut} />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: user.tone,
                color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}>
                {user.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: T.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
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
          )
        ) : !c ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.rule, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, width: '60%', borderRadius: 4, background: T.rule, marginBottom: 5 }} />
              <div style={{ height: 9, width: '80%', borderRadius: 4, background: T.rule2 }} />
            </div>
          </div>
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.rule }} />
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
  badge?: string;
  disabled?: boolean;
  hint?: string;
  collapsed?: boolean;
  onClick?: () => void;
}

function NavItem({ icon: I, label, active, count, badge, disabled, hint, collapsed, onClick }: NavItemProps) {
  return (
    <div
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      title={collapsed ? label : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={onClick && !disabled ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '0' : '7px 10px',
        width: collapsed ? 36 : undefined,
        height: collapsed ? 36 : undefined,
        justifyContent: collapsed ? 'center' : undefined,
        borderRadius: collapsed ? 8 : 6,
        fontSize: 13.5,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? T.faint : active ? T.brand : T.ink2,
        background: active ? T.brandSoft : 'transparent',
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = T.bg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <I s={collapsed ? 16 : 15} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && count != null && (
        <span style={{
          fontSize: 10.5, fontFamily: T.fontMono, padding: '1px 6px', borderRadius: 100,
          background: active ? '#fff' : T.rule2, color: active ? T.brand : T.mute, fontWeight: 600,
        }}>{count}</span>
      )}
      {!collapsed && badge && (
        <span style={{
          fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 100,
          background: active ? T.brand : T.ink, color: '#fff', letterSpacing: '.02em',
        }}>{badge}</span>
      )}
      {!collapsed && hint && <span style={{ fontSize: 10, color: T.faint }}>{hint}</span>}
    </div>
  );
}

function IconBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'transparent', border: 'none',
        color: T.mute, cursor: 'pointer',
        display: 'grid', placeItems: 'center',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.ink; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mute; }}
    >
      {icon}
    </button>
  );
}
