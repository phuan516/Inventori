// Discount wireframe SCREENS for Record-a-Sale (B). Builds on sales-kit.jsx,
// sales-discounts.jsx, icons.jsx. Four register states + focused popovers.

const DTICKET = [
  { sku: 'BAN-2554145', name: 'RG Nu Gundam Ver.Ka',        price: 89.99, qty: 1 },
  { sku: 'BAN-2606107', name: 'HG Gouf Custom',             price: 24.99, qty: 2 },
  { sku: 'TAM-87038',   name: 'Tamiya Extra Thin Cement',   price: 6.99,  qty: 1 },
];

/* shared register chrome wrapping a ticket + actions + sticky bar */
function RegisterShell({ children, stickyOverline, stickyTotal, stickyNote }) {
  return (
    <div className="sw" style={{ ...SHELL_D, position: 'relative' }}>
      <Sidebar active="sales"/>
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar/>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center',
          padding: '24px 24px 104px' }}>
          <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <PageHead crumb="Saito Hobby · Register" title="New sale"/>
              <WBtn kind="ghost" icon={<SX.clock s={14}/>}>Held (2)</WBtn>
            </div>
            {/* scan field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 58, padding: '0 18px',
              background: WT.panel, border: `1.5px solid ${WT.ink}`, borderRadius: 12 }}>
              <Icon.scan s={20}/>
              <span style={{ flex: 1, fontSize: 15, color: WT.faint }}>Scan barcode or type SKU…</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
                fontWeight: 600, color: WT.mute, fontFamily: WT.mono, padding: '4px 9px',
                border: `1px solid ${WT.rule}`, borderRadius: 6 }}><SX.enter s={12}/> ENTER</span>
            </div>
            {children}
          </div>
        </div>
        {/* sticky record bar */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: WT.panel,
          borderTop: `1px solid ${WT.rule}`, padding: '14px 28px', display: 'flex',
          alignItems: 'center', gap: 20, boxShadow: '0 -6px 20px rgba(0,0,0,.05)' }}>
          <div>
            <div style={{ fontSize: 11.5, color: WT.mute }}>{stickyOverline}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: WT.mono, letterSpacing: '-.02em' }}>{stickyTotal}</div>
          </div>
          <div style={{ fontSize: 11.5, color: WT.mute, lineHeight: 1.5, display: 'flex',
            alignItems: 'center', gap: 7 }}>
            <Icon.box s={15}/><span>{stickyNote}</span></div>
          <div style={{ flex: 1 }}/>
          <WBtn kind="ghost" style={{ height: 48, padding: '0 18px' }} icon={<SX.clock s={14}/>}>Hold</WBtn>
          <WBtn kind="primary" style={{ height: 48, padding: '0 28px', fontSize: 16 }}
            icon={<Icon.check s={16}/>}>Record sale</WBtn>
        </div>
      </main>
    </div>
  );
}

function ActionsRow({ discount }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <WBtn kind="ghost" icon={<SX.user s={13}/>}>Attach customer</WBtn>
      <WBtn kind="ghost" icon={<SX.receipt s={13}/>}>Add note</WBtn>
      <WBtn kind={discount ? 'primary' : 'ghost'} icon={<DTag s={13}/>}>
        {discount ? 'Sale discount · 10%' : 'Add sale discount'}</WBtn>
    </div>
  );
}

/* ════ B1 · Register — discount affordances at rest ════ */
function RegisterRest() {
  return (
    <RegisterShell stickyOverline="4 items · Sale total" stickyTotal={dmoney(146.96)}
      stickyNote={<>Records the sale and<br/>deducts 4 units from stock</>}>
      <WPanel style={{ overflow: 'hidden' }}>
        <TicketHead/>
        {DTICKET.map((it, i) => <TicketRowD key={it.sku} item={it} top={i === 0} mode="rest"/>)}
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
          color: WT.mute, fontSize: 12.5 }}>
          <Icon.search s={13}/> Can't scan it? Search the catalog instead</div>
      </WPanel>
      <ActionsRow/>
    </RegisterShell>
  );
}

/* ════ B2 · Register — discounts applied (item · partial · sale) ════ */
function RegisterApplied() {
  return (
    <RegisterShell stickyOverline="4 items · 3 discounts applied" stickyTotal={dmoney(119.66)}
      stickyNote={<>Records the sale and<br/>deducts 4 units from stock</>}>
      <WPanel style={{ overflow: 'hidden' }}>
        <TicketHead/>
        <TicketRowD item={DTICKET[0]} top mode="item"/>
        <TicketRowD item={DTICKET[1]} mode="partial"/>
        <TicketRowD item={DTICKET[2]} mode="rest"/>
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
          color: WT.mute, fontSize: 12.5 }}>
          <Icon.search s={13}/> Can't scan it? Search the catalog instead</div>
      </WPanel>
      <ActionsRow discount/>
      <TotalsCard
        rows={[
          { label: 'Subtotal · 4 units', value: dmoney(146.96) },
          { label: 'Item discounts (2)', value: '−' + dmoney(14.00), disc: true },
          { label: 'Sale discount · 10%', value: '−' + dmoney(13.30), disc: true },
        ]}
        total={dmoney(119.66)} saved={dmoney(27.30)}/>
    </RegisterShell>
  );
}

/* ════ focused popover compositions ════ */

// faint ticket-row context behind a popover
function GhostRow({ item, dim = 1 }) {
  return (
    <div style={{ opacity: dim, display: 'grid', gridTemplateColumns: GRID_COLS, gap: 8,
      alignItems: 'center', padding: '13px 18px', background: WT.panel,
      border: `1px solid ${WT.rule}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <ImgPlaceholder w={38} h={38} hue={220} sat={0} light={92} radius={6}/>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis' }}>{item.name}</div>
          <div style={{ fontSize: 11, color: WT.mute, fontFamily: WT.mono, marginTop: 2 }}>{item.sku}</div>
        </div>
      </div>
      <span style={{ fontFamily: WT.mono, fontSize: 13 }}>{dmoney(item.price)}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <WStep sign="−"/><span style={{ minWidth: 16, textAlign: 'center', fontFamily: WT.mono,
          fontWeight: 600, fontSize: 13 }}>{item.qty}</span><WStep sign="+"/>
      </div>
      <span style={{ textAlign: 'right', fontFamily: WT.mono, fontSize: 13, fontWeight: 700 }}>
        {dmoney(item.price * item.qty)}</span>
    </div>
  );
}

function PopoverStage({ children, label }) {
  return (
    <div className="sw" style={{ width: '100%', height: '100%', background: WT.bg, padding: 28,
      display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      {label && <div style={{ fontSize: 11.5, fontWeight: 700, color: WT.mute, letterSpacing: '.05em',
        textTransform: 'uppercase' }}>{label}</div>}
      {children}
    </div>
  );
}

// C1 · item discount popover, qty = 1
function ItemPopoverQ1() {
  return (
    <PopoverStage label="Tap the discount tag on a line → item discount">
      <GhostRow item={DTICKET[0]} dim={.5}/>
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <DiscountCard title="Item discount" sub="RG Nu Gundam Ver.Ka · BAN-2554145" type="pct"/>
      </div>
    </PopoverStage>
  );
}

// C2 · item discount popover, qty > 1 (partial control visible)
function ItemPopoverQN() {
  return (
    <PopoverStage label="Qty > 1 → choose how many units to discount">
      <GhostRow item={DTICKET[1]} dim={.5}/>
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <DiscountCard title="Item discount" sub="HG Gouf Custom · qty 2" type="amt" partial/>
      </div>
    </PopoverStage>
  );
}

// C3 · partial-quantity result line, isolated
function PartialDetail() {
  return (
    <PopoverStage label="Result · line splits into discounted + full-price units">
      <WPanel style={{ overflow: 'hidden' }}>
        <TicketHead/>
        <TicketRowD item={DTICKET[1]} top mode="partial"/>
      </WPanel>
      <div style={{ fontSize: 12, color: WT.mute, lineHeight: 1.5, maxWidth: 520 }}>
        The line keeps a single qty stepper but shows a breakdown: discounted units are split
        out with their reason. Stock still deducts the full quantity — only price is adjusted.
      </div>
    </PopoverStage>
  );
}

// C4 · sale-level discount popover + totals
function SalePopover() {
  return (
    <PopoverStage label="'Add sale discount' → whole-ticket adjustment">
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <DiscountCard title="Sale discount" sub="Applies to the whole ticket" type="pct" w={300}/>
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TotalsCard
            rows={[
              { label: 'Subtotal · 4 units', value: dmoney(132.96) },
              { label: 'Sale discount · 10%', value: '−' + dmoney(13.30), disc: true },
            ]}
            total={dmoney(119.66)} saved={dmoney(13.30)}/>
          <div style={{ fontSize: 12, color: WT.mute, lineHeight: 1.5 }}>
            Sale discount stacks on top of any item discounts and recomputes the total live.
            No tax, no tender — Inventori only records the adjusted sale value.</div>
        </div>
      </div>
    </PopoverStage>
  );
}

Object.assign(window, {
  RegisterRest, RegisterApplied, ItemPopoverQ1, ItemPopoverQN, PartialDetail, SalePopover,
});
