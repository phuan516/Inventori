// Discount wireframes for Record-a-Sale Direction B.
// Three discount surfaces, all in the same grayscale mid-fi kit (sales-kit.jsx):
//   1. Item discount     — % / $ off, or set unit price, on a single line.
//   2. Sale discount     — % / $ off the whole ticket.
//   3. Partial-qty       — when a line's qty > 1, discount only N of those units.
// Discounts are pure price adjustments on the Sale record (no tax / tender —
// Inventori still doesn't process payment). Loads after sales-kit.jsx + icons.jsx.

const dmoney = (n) => '$' + n.toFixed(2);
const SHELL_D = { width: '100%', height: '100%', display: 'grid',
  gridTemplateColumns: '232px 1fr', background: WT.bg };
const GRID_COLS = '1fr 96px 116px 104px';
const ROW_INDENT = 67; // aligns sub-rows under the item name (18 pad + 38 thumb + 11 gap)

/* ─────────────── small shared bits ─────────────── */

// "%-tag" discount glyph
const DTag = (p) => (
  <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
    <path d="M2 2h5.2L14 8.8 8.8 14 2 7.2V2Z"/><circle cx="5" cy="5" r=".9"/>
    <path d="M6 10.5 10.5 6"/>
  </svg>
);

// muted "add discount" affordance shown under a line item at rest
function AddDiscountLink({ children = 'Add discount' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5,
      color: WT.mute, border: `1px dashed ${WT.rule}`, borderRadius: 5,
      padding: '2px 8px', background: WT.panel }}>
      <DTag s={12}/> {children}
    </span>
  );
}

// applied-discount pill that replaces the link once a discount exists
function DiscountPill({ children, onEdit }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5,
      fontWeight: 600, color: WT.ink2, background: WT.fill, border: `1px solid ${WT.rule}`,
      borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' }}>
      <DTag s={12}/> {children}
      <span style={{ width: 1, height: 11, background: WT.rule }}/>
      <span style={{ color: WT.mute, fontWeight: 500, fontFamily: WT.mono, fontSize: 10.5 }}>EDIT</span>
    </span>
  );
}

// price cell showing a strike-through original + new price
function PriceWas({ was, now }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
      <span style={{ fontFamily: WT.mono, fontSize: 11, color: WT.faint,
        textDecoration: 'line-through' }}>{dmoney(was)}</span>
      <span style={{ fontFamily: WT.mono, fontSize: 13, fontWeight: 600 }}>{dmoney(now)}</span>
    </span>
  );
}

// radio control (wireframe)
function Radio({ on, label, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 11px',
      border: `1px solid ${on ? WT.ink : WT.rule}`, borderRadius: 8, background: WT.panel,
      boxShadow: on ? `inset 0 0 0 1px ${WT.ink}` : 'none' }}>
      <span style={{ flex: '0 0 auto', width: 16, height: 16, borderRadius: '50%', marginTop: 1,
        border: `1.5px solid ${on ? WT.ink : WT.faint}`, display: 'grid', placeItems: 'center' }}>
        {on && <span style={{ width: 7, height: 7, borderRadius: '50%', background: WT.ink }}/>}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: on ? 600 : 500, color: WT.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: WT.mute, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// big amount entry — prefix/suffix vary by discount type
function AmountField({ prefix, value, suffix, chips }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px',
        border: `1.5px solid ${WT.ink}`, borderRadius: 9, background: WT.panel, gap: 6 }}>
        {prefix && <span style={{ fontFamily: WT.mono, fontSize: 22, color: WT.mute }}>{prefix}</span>}
        <span style={{ flex: 1, fontFamily: WT.mono, fontSize: 24, fontWeight: 600,
          letterSpacing: '-.02em' }}>{value}</span>
        {suffix && <span style={{ fontSize: 13, color: WT.mute, fontWeight: 500,
          whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
      {chips && (
        <div style={{ display: 'flex', gap: 6 }}>
          {chips.map((c, i) => (
            <span key={c} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600,
              fontFamily: WT.mono, padding: '6px 0', borderRadius: 6,
              border: `1px solid ${i === 2 ? WT.ink : WT.rule}`,
              background: i === 2 ? WT.ink : WT.panel, color: i === 2 ? '#fff' : WT.ink2 }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// faux select field
function Selectish({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11.5, color: WT.mute, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', height: 38, padding: '0 12px',
        border: `1px solid ${WT.rule}`, borderRadius: 8, background: WT.panel }}>
        <span style={{ flex: 1, fontSize: 13, color: value ? WT.ink : WT.faint }}>
          {value || 'Optional'}</span>
        <Icon.chevDown s={15}/>
      </div>
    </div>
  );
}

/* ─────────────── the discount popover (item + sale share it) ─────────────── */

function DiscountCard({ title, sub, type = 'pct', partial, w = 312 }) {
  const types = [
    { id: 'pct', label: '% off' },
    { id: 'amt', label: '$ off' },
    { id: 'set', label: 'Set price' },
  ];
  const field = type === 'pct'
    ? <AmountField value="10" suffix="% off" chips={['5%', '10%', '15%', '20%']}/>
    : type === 'amt'
    ? <AmountField prefix="$" value="5.00" suffix="off" chips={['$2', '$5', '$10', '$20']}/>
    : <AmountField prefix="$" value="71.99" suffix="each"/>;
  return (
    <div style={{ width: w, background: WT.panel, border: `1px solid ${WT.rule}`,
      borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,.18)', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
        borderBottom: `1px solid ${WT.rule2}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          {sub && <div style={{ fontSize: 11.5, color: WT.mute, marginTop: 2, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        </div>
        <Icon.x s={15}/>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* type toggle */}
        <div style={{ display: 'flex', background: WT.bg, border: `1px solid ${WT.rule}`,
          borderRadius: 8, padding: 3, gap: 2 }}>
          {types.map((t) => {
            const on = t.id === type;
            return (
              <span key={t.id} style={{ flex: 1, textAlign: 'center', fontSize: 12.5,
                fontWeight: on ? 600 : 500, padding: '6px 0', borderRadius: 5,
                background: on ? WT.ink : 'transparent', color: on ? '#fff' : WT.ink2 }}>{t.label}</span>
            );
          })}
        </div>

        {field}

        {/* partial-quantity control — only when qty > 1 */}
        {partial && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: WT.mute, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '.04em' }}>Apply to</span>
            <Radio on={false} label="All 2 units" sub="Discount every unit on this line"/>
            <Radio on label="Part of the quantity" sub="Only some units (damaged box, floor model…)"
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WStep sign="−"/>
                  <span style={{ minWidth: 30, textAlign: 'center', fontFamily: WT.mono,
                    fontWeight: 600, fontSize: 14 }}>1</span>
                  <WStep sign="+"/>
                  <span style={{ fontSize: 11.5, color: WT.mute }}>of 2</span>
                </div>
              }/>
          </div>
        )}

        <Selectish label="Reason" value="Floor model"/>
      </div>

      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
        borderTop: `1px solid ${WT.rule2}`, background: WT.bg }}>
        <WBtn kind="subtle" style={{ color: WT.mute, padding: '0 6px' }}>Remove</WBtn>
        <div style={{ flex: 1 }}/>
        <WBtn kind="primary" icon={<Icon.check s={14}/>}>Apply discount</WBtn>
      </div>
    </div>
  );
}

/* ─────────────── ticket row (resting + applied + partial) ─────────────── */

function TicketRowD({ item, top, mode }) {
  // mode: 'rest' | 'item' (whole-line %) | 'partial' (some units)
  const lineWas = item.price * item.qty;
  let lineNow = lineWas, sub = null, priceCell, discNode;

  if (mode === 'item') {
    const off = item.price * 0.10;
    lineNow = lineWas - off * item.qty;
    priceCell = <PriceWas was={item.price} now={item.price - off}/>;
    discNode = <DiscountPill>−10% · Loyalty</DiscountPill>;
  } else if (mode === 'partial') {
    const unitOff = 5.0;
    lineNow = lineWas - unitOff; // one unit discounted
    priceCell = <span style={{ fontFamily: WT.mono, fontSize: 13 }}>{dmoney(item.price)}</span>;
    discNode = <DiscountPill>1 unit −$5.00 · Damaged box</DiscountPill>;
    sub = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {[
          { q: item.qty - 1, p: item.price, tag: 'full price' },
          { q: 1, p: item.price - unitOff, tag: '−$5.00 · damaged box' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5,
            color: WT.ink2, fontFamily: WT.mono }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${WT.rule}`,
              display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600 }}>{s.q}</span>
            <span style={{ color: WT.mute }}>×</span>
            <span>{dmoney(s.p)}</span>
            <span style={{ color: WT.faint, fontFamily: WT.font, fontSize: 11 }}>{s.tag}</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontWeight: 600 }}>{dmoney(s.q * s.p)}</span>
          </div>
        ))}
      </div>
    );
  } else {
    priceCell = <span style={{ fontFamily: WT.mono, fontSize: 13 }}>{dmoney(item.price)}</span>;
    discNode = <AddDiscountLink/>;
  }

  return (
    <div style={{ borderBottom: `1px solid ${WT.rule2}`, background: top ? WT.bg : WT.panel,
      padding: '13px 18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <ImgPlaceholder w={38} h={38} hue={220} sat={0} light={92} radius={6}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: WT.mute, fontFamily: WT.mono, marginTop: 2 }}>{item.sku}</div>
          </div>
        </div>
        {priceCell}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <WStep sign="−"/>
          <span style={{ minWidth: 16, textAlign: 'center', fontFamily: WT.mono, fontWeight: 600,
            fontSize: 13 }}>{item.qty}</span>
          <WStep sign="+"/>
        </div>
        <span style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          {lineNow !== lineWas && <span style={{ fontFamily: WT.mono, fontSize: 11, color: WT.faint,
            textDecoration: 'line-through' }}>{dmoney(lineWas)}</span>}
          <span style={{ fontFamily: WT.mono, fontSize: 13, fontWeight: 700 }}>{dmoney(lineNow)}</span>
        </span>
      </div>
      {/* discount affordance row, indented under the name */}
      <div style={{ paddingLeft: ROW_INDENT, marginTop: 8 }}>{discNode}</div>
      <div style={{ paddingLeft: ROW_INDENT }}>{sub}</div>
    </div>
  );
}

function TicketHead() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 8, padding: '10px 18px',
      borderBottom: `1px solid ${WT.rule2}`, background: WT.bg, fontSize: 10.5, fontWeight: 700,
      color: WT.mute, letterSpacing: '.05em', textTransform: 'uppercase' }}>
      <span>Item</span><span>Price</span>
      <span style={{ textAlign: 'center' }}>Qty</span>
      <span style={{ textAlign: 'right' }}>Total</span>
    </div>
  );
}

/* ─────────────── totals summary card ─────────────── */

function TotalsCard({ rows, total, saved }) {
  return (
    <WPanel style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          fontSize: 13, color: r.disc ? WT.ink2 : WT.ink2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {r.disc && <DTag s={13}/>}{r.label}</span>
          <span style={{ fontFamily: WT.mono, fontSize: 13, fontWeight: 500,
            color: r.disc ? WT.ink : WT.ink }}>{r.value}</span>
        </div>
      ))}
      <div style={{ height: 1, background: WT.rule, margin: '3px 0' }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Sale total</span>
        <span style={{ fontFamily: WT.mono, fontSize: 20, fontWeight: 700,
          letterSpacing: '-.02em' }}>{total}</span>
      </div>
      {saved && (
        <div style={{ fontSize: 11.5, color: WT.mute, display: 'flex', alignItems: 'center', gap: 6 }}>
          <DTag s={12}/> Customer saves {saved} on this sale</div>
      )}
    </WPanel>
  );
}

Object.assign(window, {
  dmoney, SHELL_D, GRID_COLS, DTag, AddDiscountLink, DiscountPill, PriceWas, Radio,
  AmountField, Selectish, DiscountCard, TicketRowD, TicketHead, TotalsCard,
});
