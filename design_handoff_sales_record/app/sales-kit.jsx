// Sales wireframe kit — grayscale ("mid-fi") variant of the Inventori studio
// theme. Same layout DNA as inventory.jsx (sidebar · topbar · panels · table ·
// steppers · pills) but desaturated to a wireframe palette so the focus stays
// on structure. Primary action = solid ink fill; everything else greyscale.

const WT = {
  ink:   '#1b1f24',
  ink2:  '#434a53',
  mute:  '#7b828c',
  faint: '#a7adb6',
  rule:  '#dde0e4',
  rule2: '#eef0f2',
  bg:    '#f4f5f7',
  panel: '#ffffff',
  fill:  '#eceef1',   // tappable / placeholder fills
  fillHi:'#e2e5e9',
  ink0:  '#11141a',   // primary button fill
  font:  "'Geist', 'Inter', system-ui, sans-serif",
  mono:  "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
};

if (typeof document !== 'undefined' && !document.getElementById('sw-base')) {
  const s = document.createElement('style');
  s.id = 'sw-base';
  s.textContent = `
    .sw *, .sw *::before, .sw *::after { box-sizing: border-box; }
    .sw { font-family: ${WT.font}; color: ${WT.ink}; background: ${WT.bg};
      font-feature-settings: "ss01","cv11"; height: 100%; }
    .sw button { font-family: inherit; cursor: pointer; }
    .sw input { font-family: inherit; color: inherit; }
    .sw ::placeholder { color: ${WT.faint}; }
    .sw .row:hover { background: ${WT.bg}; }
    .sw .tap:hover { border-color: ${WT.faint}; background: ${WT.panel}; }
  `;
  document.head.appendChild(s);
}

/* ───────────────────────── primitives ───────────────────────── */

function WPanel({ children, style, ...rest }) {
  return (
    <div style={{ background: WT.panel, border: `1px solid ${WT.rule}`,
      borderRadius: 10, ...style }} {...rest}>{children}</div>
  );
}

function WBtn({ kind = 'ghost', icon, children, style, ...rest }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderRadius: 7, fontSize: 13, fontWeight: 500, padding: '0 14px',
    height: 34, whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: WT.ink0, color: '#fff', border: 'none' },
    ghost:   { background: WT.panel, color: WT.ink2, border: `1px solid ${WT.rule}` },
    subtle:  { background: 'transparent', color: WT.ink2, border: 'none' },
  };
  return (
    <button style={{ ...base, ...variants[kind], ...style }} {...rest}>
      {icon}{children}
    </button>
  );
}

// Wireframe "pill" — neutral outline chip, optional filled (dark) emphasis.
function WPill({ children, solid, dot, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11,
      fontWeight: 600, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
      background: solid ? WT.ink : WT.fill, color: solid ? '#fff' : WT.ink2,
      border: solid ? 'none' : `1px solid ${WT.rule}`, ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%',
        border: `1.5px solid ${solid ? '#fff' : WT.mute}` }}/>}
      {children}
    </span>
  );
}

function WInput({ icon, style, wrapStyle, ...rest }) {
  return (
    <div style={{ position: 'relative', ...wrapStyle }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%',
        transform: 'translateY(-50%)', color: WT.mute, pointerEvents: 'none',
        display: 'grid' }}>{icon}</span>}
      <input style={{
        width: '100%', height: 36, padding: icon ? '0 12px 0 36px' : '0 12px',
        background: WT.bg, border: `1px solid ${WT.rule}`, borderRadius: 8,
        fontSize: 13.5, color: WT.ink, outline: 'none', ...style,
      }} {...rest}/>
    </div>
  );
}

// Stepper used in tickets and rows
function WStep({ sign, onClick, disabled, big }) {
  const d = big ? 30 : 22;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: d, height: d, borderRadius: big ? 7 : 5, border: `1px solid ${WT.rule}`,
      background: WT.panel, color: WT.ink2, display: 'grid', placeItems: 'center',
      opacity: disabled ? .4 : 1, padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      <svg width={big ? 14 : 11} height={big ? 14 : 11} viewBox="0 0 16 16"
        fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {sign === '+' ? <path d="M8 3v10M3 8h10"/> : <path d="M3 8h10"/>}
      </svg>
    </button>
  );
}

// Small segmented control
function WSeg({ items, value, onChange, style }) {
  return (
    <div style={{ display: 'inline-flex', background: WT.panel,
      border: `1px solid ${WT.rule}`, borderRadius: 8, padding: 3, gap: 2, ...style }}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button key={it.id} onClick={() => onChange && onChange(it.id)} style={{
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: on ? 600 : 400,
            padding: '5px 12px', borderRadius: 5, border: 'none',
            background: on ? WT.ink : 'transparent', color: on ? '#fff' : WT.ink2,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>{it.icon}{it.label}</button>
        );
      })}
    </div>
  );
}

// Numbered annotation pin — wireframe callout
function Pin({ n, top, left, right, bottom, label, w = 188, dir = 'right' }) {
  return (
    <div style={{ position: 'absolute', top, left, right, bottom, zIndex: 6,
      display: 'flex', flexDirection: dir === 'left' ? 'row-reverse' : 'row',
      alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
      <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: '50%',
        background: WT.ink0, color: '#fff', fontSize: 11, fontWeight: 700,
        display: 'grid', placeItems: 'center', fontFamily: WT.mono }}>{n}</span>
      <span style={{ width: w, fontSize: 11.5, lineHeight: 1.35, color: WT.ink2,
        textAlign: dir === 'left' ? 'right' : 'left', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ───────────── local icon supplements (POS-specific) ───────────── */

const SX = {
  cart:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M2 2h1.6l1.2 8.2h7L13.4 5H4.4"/><circle cx="6.2" cy="13.2" r="1.1"/><circle cx="11.6" cy="13.2" r="1.1"/></svg>,
  card:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 6.5h13M4 10h2"/></svg>,
  cash:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><rect x="1.5" y="4" width="13" height="8" rx="1"/><circle cx="8" cy="8" r="1.8"/><path d="M3.5 6v4M12.5 6v4"/></svg>,
  receipt: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M3.5 1.5h9v13l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1V1.5Z"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/></svg>,
  user:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="2.6"/><path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4"/></svg>,
  tag:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 2h5.5l6.5 6.5-5.5 5.5L2 7.5V2Z"/><circle cx="5" cy="5" r="1"/></svg>,
  clock:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.2L10 10"/></svg>,
  back:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>,
  enter:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5H4M7 5 4 8l3 3"/></svg>,
};

/* ───────────────── shared chrome: sidebar + topbar ───────────────── */

function Sidebar({ active = 'sales' }) {
  const items = [
    { id: 'inventory', label: 'Inventory', icon: Icon.box,   count: 18 },
    { id: 'sales',     label: 'Sales',     icon: SX.cart,    badge: 'New' },
    { id: 'reports',   label: 'Reports',   icon: Icon.chart },
    { id: 'settings',  label: 'Settings',  icon: Icon.cog },
  ];
  return (
    <aside style={{ background: WT.panel, borderRight: `1px solid ${WT.rule}`,
      display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: 18, borderBottom: `1px solid ${WT.rule2}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: WT.ink,
          display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 14, height: 14, border: '2px solid #fff',
            borderRadius: 2, transform: 'rotate(45deg)' }}/>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>Inventori</div>
          <div style={{ fontSize: 11, color: WT.mute }}>Saito Hobby</div>
        </div>
      </div>

      <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column',
        gap: 2, flex: 1 }}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 7, fontSize: 13.5,
              color: on ? WT.ink : WT.ink2, background: on ? WT.fill : 'transparent',
              fontWeight: on ? 600 : 400,
              boxShadow: on ? `inset 0 0 0 1px ${WT.rule}` : 'none' }}>
              <it.icon s={16}/>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.count != null && <span style={{ fontSize: 10.5, fontFamily: WT.mono,
                padding: '1px 6px', borderRadius: 100, background: WT.rule2,
                color: WT.mute, fontWeight: 600 }}>{it.count}</span>}
              {it.badge && <span style={{ fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 100, background: WT.ink,
                color: '#fff', letterSpacing: '.02em' }}>{it.badge}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: 10, borderTop: `1px solid ${WT.rule2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: WT.fillHi,
            border: `1px solid ${WT.rule}`, display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 700, color: WT.ink2, fontFamily: WT.mono }}>KS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Kenji Saito</div>
            <div style={{ fontSize: 11, color: WT.mute }}>Register · Berkeley</div>
          </div>
          <Icon.logout s={15}/>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, sub, showQuickSell, right }) {
  return (
    <header style={{ background: WT.panel, borderBottom: `1px solid ${WT.rule}`,
      display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px' }}>
      <div style={{ flex: 1, maxWidth: 420 }}>
        <WInput icon={<Icon.search s={15}/>} placeholder="Search products, SKUs…"
          readOnly style={{ height: 34 }}/>
      </div>
      <div style={{ flex: 1 }}/>
      {showQuickSell && (
        <WBtn kind="primary" icon={<SX.cart s={14}/>}>Quick sell</WBtn>
      )}
      {right}
      <div style={{ width: 34, height: 34, borderRadius: 7, border: `1px solid ${WT.rule}`,
        background: WT.panel, display: 'grid', placeItems: 'center', color: WT.ink2,
        position: 'relative' }}>
        <Icon.bell s={15}/>
        <span style={{ position: 'absolute', top: 7, right: 9, width: 5, height: 5,
          borderRadius: '50%', background: WT.ink }}/>
      </div>
    </header>
  );
}

// Page heading block (breadcrumb · h1 · actions)
function PageHead({ crumb, title, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: WT.mute, marginBottom: 4 }}>{crumb}</div>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-.02em' }}>{title}</h1>
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

Object.assign(window, {
  WT, WPanel, WBtn, WPill, WInput, WStep, WSeg, Pin, SX, Sidebar, Topbar, PageHead,
});
