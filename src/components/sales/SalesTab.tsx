'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';
import type { Product, TicketLine } from '@/lib/types';
import SalesHistoryTab from './SalesHistoryTab';

const money = (n: number) => '$' + n.toFixed(2);

const holdCache = new Map<string, { tickets: HeldTicket[]; ts: number }>();
const HOLD_CACHE_TTL = 5 * 60 * 1000;

function skuHue(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) % 360;
  return h;
}

// Discount icon with % slash — used in affordance links, pills, totals
function DTagIcon({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M2 2h5.2L14 8.8 8.8 14 2 7.2V2Z"/>
      <circle cx="5" cy="5" r=".9" fill="currentColor" stroke="none"/>
      <path d="M6 10.5 10.5 6"/>
    </svg>
  );
}

type DiscType = 'pct' | 'amt' | 'set';

interface ItemDiscount {
  type: DiscType;
  value: number;
  applyToAll: boolean;
  partialQty: number;
  reason: string;
}

interface SaleDiscount {
  type: 'pct' | 'amt';
  value: number;
  reason: string;
}

interface HeldTicket {
  id: string;
  customer: string;
  lines: TicketLine[];
  discounts: Record<string, ItemDiscount>;
  saleDiscount: SaleDiscount | null;
}

interface SalesTabProps {
  products: Product[];
  sheetName: string;
  salesSheetId: string | null;
  holdSheetId: string | null;
  sheetId: string | null;
  onStockUpdate: (sku: string, delta: number) => void;
  onToast: (msg: string, tone: 'ok' | 'warn') => void;
}

export default function SalesTab({ products, sheetName, salesSheetId: salesSheetIdProp, holdSheetId: holdSheetIdProp, sheetId, onStockUpdate, onToast }: SalesTabProps) {
  const [subTab, setSubTab] = useState<'register' | 'history'>('register');
  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [heldTickets, setHeldTickets] = useState<HeldTicket[]>([]);
  const [lastAddedSku, setLastAddedSku] = useState<string | null>(null);
  const [scanValue, setScanValue] = useState('');
  const [noMatch, setNoMatch] = useState(false);
  const [maxWarn, setMaxWarn] = useState<string | null>(null);
  const [showHeld, setShowHeld] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState('');
  const [discounts, setDiscounts] = useState<Record<string, ItemDiscount>>({});
  const [saleDiscount, setSaleDiscount] = useState<SaleDiscount | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSaleDiscPopover, setShowSaleDiscPopover] = useState(false);
  // Resolved sheet IDs — may be provisioned lazily on first hold/sale for pre-existing stores
  const [salesSheetId, setSalesSheetId] = useState(salesSheetIdProp);
  const [holdSheetId, setHoldSheetId] = useState(holdSheetIdProp);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setSalesSheetId(salesSheetIdProp); }, [salesSheetIdProp]);
  useEffect(() => { setHoldSheetId(holdSheetIdProp); }, [holdSheetIdProp]);

  // Resolve sheet IDs when opening history without a salesSheetId
  useEffect(() => {
    if (subTab === 'history' && !salesSheetId) {
      ensureSheets().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  // Ensure Sales folder, Sales sheet, and Hold sheet exist — creates them if missing.
  // Returns the resolved IDs, or null if storeId is unavailable.
  async function ensureSheets(): Promise<{ salesSheetId: string; holdSheetId: string } | null> {
    if (salesSheetId && holdSheetId) return { salesSheetId, holdSheetId };
    const storeId = localStorage.getItem('inventori_store_id');
    if (!storeId) return null;
    const res = await fetch('/api/sales/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setSalesSheetId(data.salesSheetId);
    setHoldSheetId(data.holdSheetId);
    localStorage.setItem('inventori_sales_sheet_id', data.salesSheetId);
    localStorage.setItem('inventori_hold_sheet_id', data.holdSheetId);
    return data;
  }

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  // Load persisted held tickets from the Hold sheet on mount
  useEffect(() => {
    if (!holdSheetId) return;
    const cached = holdCache.get(holdSheetId);
    if (cached && Date.now() - cached.ts < HOLD_CACHE_TTL) {
      setHeldTickets(cached.tickets);
      return;
    }
    fetch(`/api/hold?holdSheetId=${holdSheetId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.tickets)) {
          holdCache.set(holdSheetId, { tickets: data.tickets, ts: Date.now() });
          setHeldTickets(data.tickets);
        }
      })
      .catch(() => {});
  }, [holdSheetId]);

  function effectiveUnitPrice(line: TicketLine): number {
    const d = discounts[line.sku];
    if (!d || d.value === 0) return line.price;
    if (d.type === 'pct') return line.price * (1 - Math.min(d.value, 100) / 100);
    if (d.type === 'amt') return Math.max(0, line.price - d.value);
    return Math.max(0, d.value); // 'set'
  }

  function effectiveLineTotal(line: TicketLine): number {
    const d = discounts[line.sku];
    if (!d || d.value === 0) return line.price * line.qty;
    const effPrice = effectiveUnitPrice(line);
    if (d.applyToAll) return effPrice * line.qty;
    const partial = Math.min(d.partialQty, line.qty);
    return effPrice * partial + line.price * (line.qty - partial);
  }

  const subtotal = ticket.reduce((s, l) => s + l.price * l.qty, 0);
  const afterItemDiscounts = ticket.reduce((s, l) => s + effectiveLineTotal(l), 0);
  const itemDiscountSavings = subtotal - afterItemDiscounts;
  const saleDiscAmt = !saleDiscount || saleDiscount.value === 0 ? 0
    : saleDiscount.type === 'pct'
      ? afterItemDiscounts * Math.min(saleDiscount.value, 100) / 100
      : Math.min(saleDiscount.value, afterItemDiscounts);
  const saleTotal = afterItemDiscounts - saleDiscAmt;
  const totalSavings = subtotal - saleTotal;
  const unitCount = ticket.reduce((s, l) => s + l.qty, 0);
  const hasDiscounts = itemDiscountSavings > 0 || saleDiscAmt > 0;

  const refocusScan = useCallback(() => {
    requestAnimationFrame(() => scanRef.current?.focus());
  }, []);

  function addToTicket(product: Product) {
    const currentQty = ticket.find(l => l.sku === product.sku)?.qty ?? 0;
    if (currentQty >= product.stock) {
      setMaxWarn(`${product.name} — only ${product.stock} in stock`);
      setScanValue('');
      refocusScan();
      return;
    }
    setMaxWarn(null);
    setTicket(prev => {
      const existing = prev.find(l => l.sku === product.sku);
      if (existing) return prev.map(l => l.sku === product.sku ? { ...l, qty: l.qty + 1 } : l);
      return [{ sku: product.sku, name: product.name, price: product.price, qty: 1 }, ...prev];
    });
    setLastAddedSku(product.sku);
    setTimeout(() => setLastAddedSku(null), 1400);
    setScanValue('');
    setNoMatch(false);
    refocusScan();
  }

  function handleScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const val = scanValue.trim();
    if (!val) return;
    const lc = val.toLowerCase();
    const product = products.find(p =>
      p.sku.toLowerCase() === lc || p.upc === val || p.name.toLowerCase() === lc
    );
    if (product) addToTicket(product);
    else { setNoMatch(true); setMaxWarn(null); }
  }

  function updateQty(sku: string, delta: number) {
    if (delta > 0) {
      const line = ticket.find(l => l.sku === sku);
      const stock = products.find(p => p.sku === sku)?.stock ?? 0;
      if (line && line.qty >= stock) return; // + stepper is disabled at max; guard for safety
    }
    setTicket(prev => {
      const line = prev.find(l => l.sku === sku);
      if (!line) return prev;
      const next = line.qty + delta;
      if (next <= 0) {
        setDiscounts(d => { const nd = { ...d }; delete nd[sku]; return nd; });
        return prev.filter(l => l.sku !== sku);
      }
      return prev.map(l => l.sku === sku ? { ...l, qty: next } : l);
    });
  }

  async function handleHold() {
    if (!ticket.length || isHolding || isRecording) return;
    setIsHolding(true);
    const ticketId = `HOLD-${Date.now()}`;
    const held: HeldTicket = { id: ticketId, customer, lines: ticket, discounts, saleDiscount };
    const sheets = await ensureSheets();
    if (sheets) {
      if (sheets.holdSheetId) holdCache.delete(sheets.holdSheetId);
      fetch('/api/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdSheetId: sheets.holdSheetId, ticketId, customer, lines: ticket, discounts, saleDiscount, ticketTotal: saleTotal }),
      }).catch(() => {});
    }
    setHeldTickets(prev => [...prev, held]);
    setTicket([]);
    setScanValue('');
    setDiscounts({});
    setSaleDiscount(null);
    setShowHeld(false);
    setIsHolding(false);
    refocusScan();
  }

  function resumeHeld(idx: number) {
    const held = heldTickets[idx];
    // Remove resumed ticket from the sheet
    if (holdSheetId) {
      holdCache.delete(holdSheetId);
      fetch(`/api/hold/${held.id}?holdSheetId=${holdSheetId}`, { method: 'DELETE' }).catch(() => {});
    }
    if (ticket.length > 0) {
      // Hold the current ticket in place of the resumed slot
      const newId = `HOLD-${Date.now()}`;
      const newHeld: HeldTicket = { id: newId, customer, lines: ticket, discounts, saleDiscount };
      if (holdSheetId) {
        fetch('/api/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdSheetId, ticketId: newId, customer, lines: ticket, discounts, saleDiscount, ticketTotal: saleTotal }),
        }).catch(() => {});
      }
      setHeldTickets(prev => { const next = [...prev]; next[idx] = newHeld; return next; });
    } else {
      setHeldTickets(prev => prev.filter((_, i) => i !== idx));
    }
    setTicket(held.lines);
    setCustomer(held.customer);
    setDiscounts(held.discounts ?? {});
    setSaleDiscount(held.saleDiscount ?? null);
    setShowHeld(false);
    refocusScan();
  }

  async function handleRecordSale() {
    if (!ticket.length || isHolding || isRecording) return;
    setIsRecording(true);
    const sheets = await ensureSheets();
    if (!sheets) {
      onToast('Could not reach sales sheet — sale not recorded', 'warn');
      setIsRecording(false);
      return;
    }
    ticket.forEach(l => onStockUpdate(l.sku, -l.qty));
    const saleId = `SALE-${Date.now()}`;
    const now = new Date();
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salesSheetId: sheets.salesSheetId,
        sheetId,
        saleId,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        customer,
        lines: ticket.map(l => ({
          sku: l.sku,
          name: l.name,
          qty: l.qty,
          unitPrice: l.price,
          discount: discounts[l.sku] ? formatDiscLabel(discounts[l.sku]) : '',
          effectivePrice: effectiveUnitPrice(l),
          lineTotal: effectiveLineTotal(l),
        })),
        saleDiscount: saleDiscount ? formatSaleDiscLabel(saleDiscount) : '',
        saleTotal,
      }),
    }).catch(() => {});
    const n = unitCount;
    setTicket([]);
    setScanValue('');
    setCustomer('');
    setDiscounts({});
    setSaleDiscount(null);
    setShowSaleDiscPopover(false);
    setShowCustomer(false);
    setIsRecording(false);
    onToast(`Sale recorded · ${n} unit${n !== 1 ? 's' : ''} out`, 'ok');
    refocusScan();
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, position: 'relative' }}>
      <SalesTopbar subTab={subTab} onTabChange={setSubTab} />

      {subTab === 'history' && (
        <SalesHistoryTab
          salesSheetId={salesSheetId}
          sheetName={sheetName}
          sheetId={sheetId}
          onStockUpdate={onStockUpdate}
          onToast={onToast}
        />
      )}

      {subTab === 'register' && (
      <>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '24px 24px 110px' }}>
        <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Page heading */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              {sheetName && <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>{sheetName} · Register</div>}
              <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-.02em' }}>New sale</h1>
            </div>
            <div style={{ position: 'relative' }}>
              <Btn kind="ghost" icon={<Icon.clock s={14} />} onClick={() => setShowHeld(v => !v)}>
                Held ({heldTickets.length})
              </Btn>
              {showHeld && heldTickets.length > 0 && (
                <HeldDropdown tickets={heldTickets} onResume={resumeHeld} onClose={() => setShowHeld(false)} />
              )}
            </div>
          </div>

          {/* Scan field */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              height: 64, padding: '0 18px', background: T.panel,
              border: `1.5px solid ${noMatch ? T.danger : maxWarn ? T.warn : T.brand}`,
              borderRadius: 12,
              boxShadow: `0 0 0 3px ${noMatch ? T.dangerSoft : maxWarn ? T.warnSoft : T.brandSoft}`,
              transition: 'border-color .12s, box-shadow .12s',
            }}>
              <span style={{ color: noMatch ? T.danger : maxWarn ? T.warn : T.mute, flexShrink: 0 }}>
                <Icon.scan s={22} />
              </span>
              <input
                ref={scanRef}
                value={scanValue}
                onChange={e => { setScanValue(e.target.value); setNoMatch(false); setMaxWarn(null); }}
                onKeyDown={handleScan}
                disabled={isHolding || isRecording}
                placeholder={isHolding ? 'Holding…' : isRecording ? 'Recording…' : 'Scan barcode or type SKU…'}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: T.ink, fontFamily: 'inherit', opacity: (isHolding || isRecording) ? 0.5 : 1 }}
              />
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11.5, fontWeight: 600, color: T.mute,
                fontFamily: T.fontMono, padding: '4px 9px',
                border: `1px solid ${T.rule}`, borderRadius: 6, flexShrink: 0,
              }}>
                <Icon.enter s={13} /> ENTER
              </span>
            </div>
            {noMatch && (
              <div style={{ marginTop: 6, fontSize: 12, color: T.danger, paddingLeft: 4 }}>
                No match — try a different SKU or search below
              </div>
            )}
            {maxWarn && (
              <div style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 8,
                background: T.warnSoft, border: `1px solid ${T.warn}44`,
                fontSize: 13, fontWeight: 500, color: T.warn,
              }}>
                Stock limit reached · {maxWarn}
              </div>
            )}
          </div>

          {/* Ticket or empty state */}
          {ticket.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: T.mute, fontSize: 14 }}>
              Scan an item to start a sale.
            </div>
          ) : (
            <Panel style={{ overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 92px 120px 96px', gap: 8,
                padding: '10px 18px', borderBottom: `1px solid ${T.rule2}`,
                background: T.bg, fontSize: 10.5, fontWeight: 700, color: T.mute,
                letterSpacing: '.05em', textTransform: 'uppercase',
              }}>
                <span>Item</span>
                <span>Price</span>
                <span style={{ textAlign: 'center' }}>Qty</span>
                <span style={{ textAlign: 'right' }}>Total</span>
              </div>

              {/* Line items */}
              {ticket.map(line => (
                <TicketRow
                  key={line.sku}
                  line={line}
                  highlighted={line.sku === lastAddedSku}
                  maxQty={products.find(p => p.sku === line.sku)?.stock ?? Infinity}
                  discount={discounts[line.sku]}
                  effectiveUnitPrice={effectiveUnitPrice(line)}
                  effectiveLineTotal={effectiveLineTotal(line)}
                  onDiscount={d => setDiscounts(prev => {
                    if (!d) { const next = { ...prev }; delete next[line.sku]; return next; }
                    return { ...prev, [line.sku]: d };
                  })}
                  onInc={() => updateQty(line.sku, +1)}
                  onDec={() => updateQty(line.sku, -1)}
                />
              ))}
            </Panel>
          )}

          {/* Actions row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn kind="ghost" icon={<Icon.user s={13} />} onClick={() => setShowCustomer(v => !v)}>
              {customer ? `Customer: ${customer}` : 'Attach customer'}
            </Btn>
            <Btn
              kind={saleDiscount ? 'primary' : 'ghost'}
              icon={<DTagIcon s={13} />}
              onClick={() => setShowSaleDiscPopover(true)}
              disabled={ticket.length === 0}
            >
              {saleDiscount ? formatSaleDiscLabel(saleDiscount) : 'Add sale discount'}
            </Btn>
          </div>

          {showCustomer && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                autoFocus
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                placeholder="Customer name…"
                style={{
                  flex: 1, height: 34, padding: '0 11px', background: T.panel,
                  border: `1px solid ${T.rule}`, borderRadius: 7,
                  fontSize: 13.5, color: T.ink, outline: 'none', fontFamily: 'inherit',
                }}
                onKeyDown={e => e.key === 'Enter' && setShowCustomer(false)}
              />
              <Btn kind="primary" onClick={() => setShowCustomer(false)}>Done</Btn>
            </div>
          )}

          {/* Sale discount popover */}
          {showSaleDiscPopover && (
            <SaleDiscountPopover
              initialDiscount={saleDiscount ?? undefined}
              onApply={d => { setSaleDiscount(d); setShowSaleDiscPopover(false); }}
              onRemove={() => { setSaleDiscount(null); setShowSaleDiscPopover(false); }}
              onClose={() => setShowSaleDiscPopover(false)}
            />
          )}

          {/* Totals breakdown card */}
          {hasDiscounts && ticket.length > 0 && (
            <TotalsCard
              subtotal={subtotal}
              unitCount={unitCount}
              itemDiscountCount={Object.keys(discounts).length}
              itemDiscountSavings={itemDiscountSavings}
              saleDiscount={saleDiscount}
              saleDiscAmt={saleDiscAmt}
              totalSavings={totalSavings}
            />
          )}
        </div>
      </div>

      {/* Sticky record bar */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: T.panel, borderTop: `1px solid ${T.rule}`,
        padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 -6px 20px rgba(0,0,0,.05)', zIndex: 4,
      }}>
        <div>
          <div style={{ fontSize: 11.5, color: T.mute }}>
            {unitCount > 0
              ? `${unitCount} item${unitCount !== 1 ? 's' : ''}${totalSavings > 0 ? ' · discounts applied' : ' · Sale total'}`
              : 'No items yet'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{
              fontSize: 26, fontWeight: 700, fontFamily: T.fontMono, letterSpacing: '-.02em',
              color: ticket.length === 0 ? T.faint : T.ink,
            }}>
              {money(saleTotal)}
            </div>
            {totalSavings > 0 && ticket.length > 0 && (
              <div style={{ fontSize: 13, color: T.mute, fontFamily: T.fontMono, textDecoration: 'line-through' }}>
                {money(subtotal)}
              </div>
            )}
          </div>
          {totalSavings > 0 && ticket.length > 0 && (
            <div style={{ fontSize: 11.5, color: T.ok, marginTop: 1 }}>
              Saving {money(totalSavings)}
            </div>
          )}
        </div>
        {ticket.length > 0 && (
          <div style={{ fontSize: 11.5, color: T.mute, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon.box s={15} />
            <span>Records the sale and<br />deducts {unitCount} unit{unitCount !== 1 ? 's' : ''} from stock</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <Btn kind="ghost" style={{ height: 48, padding: '0 18px' }} icon={<Icon.clock s={14} />} onClick={handleHold} disabled={ticket.length === 0 || isHolding || isRecording}>
          {isHolding ? 'Holding…' : 'Hold'}
        </Btn>
        <Btn kind="primary" style={{ height: 48, padding: '0 28px', fontSize: 16 }} icon={<Icon.check s={16} />} onClick={handleRecordSale} disabled={ticket.length === 0 || isHolding || isRecording}>
          {isRecording ? 'Recording…' : 'Record sale'}
        </Btn>
      </div>
      </>
      )}
    </main>
  );
}

/* ─── helpers ─── */

function formatDiscLabel(d: ItemDiscount): string {
  const v = d.type === 'pct' ? `−${d.value}%`
    : d.type === 'amt' ? `−${money(d.value)}`
    : `→${money(d.value)}`;
  const q = !d.applyToAll ? `${d.partialQty} unit${d.partialQty !== 1 ? 's' : ''} ` : '';
  const r = d.reason ? ` · ${d.reason}` : '';
  return `${q}${v}${r}`;
}

function formatSaleDiscLabel(d: SaleDiscount): string {
  return d.type === 'pct' ? `Sale discount · ${d.value}%` : `Sale discount · −${money(d.value)}`;
}

/* ─── AddDiscountLink ─── */

function AddDiscountLink({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5,
        color: hover ? T.ink2 : T.mute,
        border: `1px dashed ${hover ? T.mute : T.rule}`,
        borderRadius: 5, padding: '2px 8px', background: T.panel,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'color .1s, border-color .1s',
      }}
    >
      <DTagIcon s={12} /> Add discount
    </button>
  );
}

/* ─── DiscountPill ─── */

function DiscountPill({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5,
        fontWeight: 600, color: T.ink2, background: T.bg, border: `1px solid ${T.rule}`,
        borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <DTagIcon s={12} /> {label}
      <span style={{ width: 1, height: 11, background: T.rule }} />
      <span style={{ color: T.mute, fontWeight: 500, fontFamily: T.fontMono, fontSize: 10.5 }}>EDIT</span>
    </button>
  );
}

/* ─── TicketRow ─── */

interface TicketRowProps {
  line: TicketLine;
  highlighted: boolean;
  maxQty: number;
  discount: ItemDiscount | undefined;
  effectiveUnitPrice: number;
  effectiveLineTotal: number;
  onDiscount: (d: ItemDiscount | undefined) => void;
  onInc: () => void;
  onDec: () => void;
}

function TicketRow({ line, highlighted, maxQty, discount, effectiveUnitPrice, effectiveLineTotal, onDiscount, onInc, onDec }: TicketRowProps) {
  const [showPopover, setShowPopover] = useState(false);
  const isDiscounted = !!discount && discount.value > 0;
  const isPartial = isDiscounted && !discount.applyToAll;
  const lineWas = line.price * line.qty;
  const atMax = line.qty >= maxQty;

  return (
    <div style={{ borderBottom: `1px solid ${T.rule2}` }}>
      {/* Main row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 92px 120px 96px', gap: 8,
        alignItems: 'center', padding: '13px 18px 6px',
        background: highlighted ? T.bg : T.panel,
        transition: 'background .3s',
      }}>
        {/* Item */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <ImgPlaceholder w={38} h={38} hue={skuHue(line.sku)} radius={6} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {line.name}
            </div>
            <div style={{ fontSize: 11, color: T.mute, fontFamily: T.fontMono, marginTop: 2 }}>{line.sku}</div>
          </div>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isDiscounted && !isPartial && (
            <span style={{ fontFamily: T.fontMono, fontSize: 10.5, color: T.faint, textDecoration: 'line-through' }}>
              {money(line.price)}
            </span>
          )}
          <span style={{ fontFamily: T.fontMono, fontSize: 13, color: isDiscounted && !isPartial ? T.ok : T.ink }}>
            {isPartial ? money(line.price) : money(effectiveUnitPrice)}
          </span>
        </div>

        {/* Qty stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Stepper onClick={onDec} sign="−" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ minWidth: 16, textAlign: 'center', fontFamily: T.fontMono, fontWeight: 600, fontSize: 13 }}>
              {line.qty}
            </span>
            {atMax && (
              <span style={{ fontSize: 9, fontWeight: 700, color: T.warn, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Max
              </span>
            )}
          </div>
          <Stepper onClick={onInc} sign="+" disabled={atMax} />
        </div>

        {/* Line total */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
          {isDiscounted && effectiveLineTotal !== lineWas && (
            <span style={{ fontFamily: T.fontMono, fontSize: 10.5, color: T.faint, textDecoration: 'line-through' }}>
              {money(lineWas)}
            </span>
          )}
          <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: isDiscounted ? T.ok : T.ink }}>
            {money(effectiveLineTotal)}
          </span>
        </div>
      </div>

      {/* Discount affordance row — always visible under the item name */}
      <div style={{ paddingLeft: 67, paddingRight: 18, paddingBottom: showPopover ? 4 : 10, background: highlighted ? T.bg : T.panel }}>
        {isDiscounted ? (
          <DiscountPill label={formatDiscLabel(discount)} onEdit={() => setShowPopover(v => !v)} />
        ) : (
          <AddDiscountLink onClick={() => setShowPopover(v => !v)} />
        )}
      </div>

      {/* Partial qty breakdown */}
      {isPartial && (
        <div style={{ paddingLeft: 67, paddingRight: 18, paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 4, background: highlighted ? T.bg : T.panel }}>
          {[
            { q: line.qty - Math.min(discount.partialQty, line.qty), p: line.price, tag: 'full price' },
            { q: Math.min(discount.partialQty, line.qty), p: effectiveUnitPrice, tag: discount.reason || formatDiscLabel({ ...discount, reason: '' }) },
          ].filter(s => s.q > 0).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: T.ink2 }}>
              <span style={{
                width: 18, height: 18, borderRadius: 4, border: `1px solid ${T.rule}`,
                display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: T.fontMono, flexShrink: 0,
              }}>{s.q}</span>
              <span style={{ color: T.mute, fontFamily: T.fontMono }}>×</span>
              <span style={{ fontFamily: T.fontMono }}>{money(s.p)}</span>
              <span style={{ color: T.faint, fontSize: 11 }}>{s.tag}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontFamily: T.fontMono, fontWeight: 600 }}>{money(s.q * s.p)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Item discount popover */}
      {showPopover && (
        <div style={{ padding: '0 18px 14px', background: highlighted ? T.bg : T.panel }}>
          <ItemDiscountPopover
            line={line}
            initialDiscount={discount}
            onApply={d => { onDiscount(d); setShowPopover(false); }}
            onRemove={() => { onDiscount(undefined); setShowPopover(false); }}
            onClose={() => setShowPopover(false)}
          />
        </div>
      )}
    </div>
  );
}

/* ─── ItemDiscountPopover ─── */

interface ItemDiscountPopoverProps {
  line: TicketLine;
  initialDiscount: ItemDiscount | undefined;
  onApply: (d: ItemDiscount) => void;
  onRemove: () => void;
  onClose: () => void;
}

function ItemDiscountPopover({ line, initialDiscount, onApply, onRemove, onClose }: ItemDiscountPopoverProps) {
  const [type, setType] = useState<DiscType>(initialDiscount?.type ?? 'pct');
  const [rawValue, setRawValue] = useState(initialDiscount ? String(initialDiscount.value) : '');
  const [applyToAll, setApplyToAll] = useState(initialDiscount?.applyToAll ?? true);
  const [partialQty, setPartialQty] = useState(initialDiscount?.partialQty ?? 1);
  const [reason, setReason] = useState(initialDiscount?.reason ?? '');

  const chips = type === 'pct' ? ['5%', '10%', '15%', '20%']
    : type === 'amt' ? ['$2', '$5', '$10', '$20'] : null;

  function handleApply() {
    const v = parseFloat(rawValue);
    if (isNaN(v) || v <= 0) { onClose(); return; }
    onApply({
      type, value: v,
      applyToAll: line.qty === 1 ? true : applyToAll,
      partialQty: Math.min(partialQty, line.qty - 1) || 1,
      reason,
    });
  }

  function chipValue(c: string): string {
    return String(parseFloat(c.replace(/[^0-9.]/g, '')));
  }

  return (
    <div style={{
      width: 316, background: T.panel, border: `1px solid ${T.rule}`,
      borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,.15)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${T.rule2}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Item discount</div>
          <div style={{ fontSize: 11.5, color: T.mute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {line.name} · {line.sku}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.faint, padding: 2, display: 'grid', placeItems: 'center' }}>
          <Icon.x s={15} />
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {([['pct', '% off'], ['amt', '$ off'], ['set', 'Set price']] as [DiscType, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setType(id); setRawValue(''); }}
              style={{
                flex: 1, textAlign: 'center', fontSize: 12.5, padding: '6px 0', borderRadius: 5,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: type === id ? 600 : 500,
                background: type === id ? T.ink : 'transparent',
                color: type === id ? '#fff' : T.ink2,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px', border: `1.5px solid ${T.ink}`, borderRadius: 9, background: T.panel, gap: 6 }}>
            {(type === 'amt' || type === 'set') && (
              <span style={{ fontFamily: T.fontMono, fontSize: 22, color: T.mute }}>$</span>
            )}
            <input
              autoFocus
              type="number"
              min={0}
              max={type === 'pct' ? 100 : undefined}
              value={rawValue}
              onChange={e => setRawValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
              placeholder={type === 'set' ? line.price.toFixed(2) : '0'}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: T.fontMono, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', color: T.ink,
              }}
            />
            <span style={{ fontSize: 13, color: T.mute, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {type === 'pct' ? '% off' : type === 'amt' ? 'off' : 'each'}
            </span>
          </div>
          {chips && (
            <div style={{ display: 'flex', gap: 6 }}>
              {chips.map(c => {
                const cv = chipValue(c);
                const active = rawValue === cv;
                return (
                  <button
                    key={c}
                    onClick={() => setRawValue(cv)}
                    style={{
                      flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600,
                      fontFamily: 'inherit', padding: '6px 0', borderRadius: 6, cursor: 'pointer',
                      border: `1px solid ${active ? T.ink : T.rule}`,
                      background: active ? T.ink : T.panel,
                      color: active ? '#fff' : T.ink2,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Partial qty — only when qty > 1 */}
        {line.qty > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: T.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Apply to
            </span>
            {/* All units */}
            <div
              role="radio"
              aria-checked={applyToAll}
              tabIndex={0}
              onClick={() => setApplyToAll(true)}
              onKeyDown={e => e.key === 'Enter' && setApplyToAll(true)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 11px',
                border: `1px solid ${applyToAll ? T.ink : T.rule}`,
                boxShadow: applyToAll ? `inset 0 0 0 1px ${T.ink}` : 'none',
                borderRadius: 8, background: T.panel, cursor: 'pointer',
              }}
            >
              <span style={{ width: 16, height: 16, borderRadius: '50%', marginTop: 1, border: `1.5px solid ${applyToAll ? T.ink : T.faint}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {applyToAll && <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.ink }} />}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: applyToAll ? 600 : 500, color: T.ink }}>All {line.qty} units</div>
                <div style={{ fontSize: 11.5, color: T.mute, marginTop: 2 }}>Discount every unit on this line</div>
              </div>
            </div>
            {/* Partial */}
            <div
              role="radio"
              aria-checked={!applyToAll}
              tabIndex={0}
              onClick={() => setApplyToAll(false)}
              onKeyDown={e => e.key === 'Enter' && setApplyToAll(false)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 11px',
                border: `1px solid ${!applyToAll ? T.ink : T.rule}`,
                boxShadow: !applyToAll ? `inset 0 0 0 1px ${T.ink}` : 'none',
                borderRadius: 8, background: T.panel, cursor: 'pointer',
              }}
            >
              <span style={{ width: 16, height: 16, borderRadius: '50%', marginTop: 1, border: `1.5px solid ${!applyToAll ? T.ink : T.faint}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {!applyToAll && <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.ink }} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: !applyToAll ? 600 : 500, color: T.ink }}>Part of the quantity</div>
                <div style={{ fontSize: 11.5, color: T.mute, marginTop: 2 }}>Only some units (damaged box, floor model…)</div>
              </div>
              {!applyToAll && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 4 }} onClick={e => e.stopPropagation()}>
                  <Stepper onClick={() => setPartialQty(q => Math.max(1, q - 1))} sign="−" />
                  <span style={{ minWidth: 28, textAlign: 'center', fontFamily: T.fontMono, fontWeight: 600, fontSize: 14 }}>{partialQty}</span>
                  <Stepper onClick={() => setPartialQty(q => Math.min(line.qty - 1, q + 1))} sign="+" />
                  <span style={{ fontSize: 11.5, color: T.mute }}>of {line.qty}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: T.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Reason</span>
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Optional"
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            style={{
              height: 38, padding: '0 12px', border: `1px solid ${T.rule}`, borderRadius: 8,
              background: T.panel, fontSize: 13, color: T.ink, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderTop: `1px solid ${T.rule2}`, background: T.bg }}>
        <Btn kind="ghost" style={{ color: T.mute, padding: '0 8px' }} onClick={onRemove}>Remove</Btn>
        <div style={{ flex: 1 }} />
        <Btn kind="primary" icon={<Icon.check s={14} />} onClick={handleApply}>Apply discount</Btn>
      </div>
    </div>
  );
}

/* ─── SaleDiscountPopover ─── */

interface SaleDiscountPopoverProps {
  initialDiscount: SaleDiscount | undefined;
  onApply: (d: SaleDiscount) => void;
  onRemove: () => void;
  onClose: () => void;
}

function SaleDiscountPopover({ initialDiscount, onApply, onRemove, onClose }: SaleDiscountPopoverProps) {
  const [type, setType] = useState<'pct' | 'amt'>(initialDiscount?.type ?? 'pct');
  const [rawValue, setRawValue] = useState(initialDiscount ? String(initialDiscount.value) : '');
  const [reason, setReason] = useState(initialDiscount?.reason ?? '');

  const chips = type === 'pct' ? ['5%', '10%', '15%', '20%'] : ['$5', '$10', '$20', '$50'];

  function handleApply() {
    const v = parseFloat(rawValue);
    if (isNaN(v) || v <= 0) { onClose(); return; }
    onApply({ type, value: v, reason });
  }

  function chipValue(c: string): string {
    return String(parseFloat(c.replace(/[^0-9.]/g, '')));
  }

  return (
    <div style={{
      width: 316, background: T.panel, border: `1px solid ${T.rule}`,
      borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,.15)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${T.rule2}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Sale discount</div>
          <div style={{ fontSize: 11.5, color: T.mute, marginTop: 2 }}>Applies to the whole ticket</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.faint, padding: 2, display: 'grid', placeItems: 'center' }}>
          <Icon.x s={15} />
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {([['pct', '% off'], ['amt', '$ off']] as ['pct' | 'amt', string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setType(id); setRawValue(''); }}
              style={{
                flex: 1, textAlign: 'center', fontSize: 12.5, padding: '6px 0', borderRadius: 5,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: type === id ? 600 : 500,
                background: type === id ? T.ink : 'transparent',
                color: type === id ? '#fff' : T.ink2,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 52, padding: '0 14px', border: `1.5px solid ${T.ink}`, borderRadius: 9, background: T.panel, gap: 6 }}>
            {type === 'amt' && <span style={{ fontFamily: T.fontMono, fontSize: 22, color: T.mute }}>$</span>}
            <input
              autoFocus
              type="number"
              min={0}
              max={type === 'pct' ? 100 : undefined}
              value={rawValue}
              onChange={e => setRawValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
              placeholder="0"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: T.fontMono, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', color: T.ink,
              }}
            />
            <span style={{ fontSize: 13, color: T.mute, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {type === 'pct' ? '% off' : 'off'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {chips.map(c => {
              const cv = chipValue(c);
              const active = rawValue === cv;
              return (
                <button
                  key={c}
                  onClick={() => setRawValue(cv)}
                  style={{
                    flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600,
                    fontFamily: 'inherit', padding: '6px 0', borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${active ? T.ink : T.rule}`,
                    background: active ? T.ink : T.panel,
                    color: active ? '#fff' : T.ink2,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: T.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Reason</span>
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Optional"
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            style={{
              height: 38, padding: '0 12px', border: `1px solid ${T.rule}`, borderRadius: 8,
              background: T.panel, fontSize: 13, color: T.ink, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderTop: `1px solid ${T.rule2}`, background: T.bg }}>
        <Btn kind="ghost" style={{ color: T.mute, padding: '0 8px' }} onClick={onRemove}>Remove</Btn>
        <div style={{ flex: 1 }} />
        <Btn kind="primary" icon={<Icon.check s={14} />} onClick={handleApply}>Apply discount</Btn>
      </div>
    </div>
  );
}

/* ─── TotalsCard ─── */

interface TotalsCardProps {
  subtotal: number;
  unitCount: number;
  itemDiscountCount: number;
  itemDiscountSavings: number;
  saleDiscount: SaleDiscount | null;
  saleDiscAmt: number;
  totalSavings: number;
}

function TotalsCard({ subtotal, unitCount, itemDiscountCount, itemDiscountSavings, saleDiscount, saleDiscAmt, totalSavings }: TotalsCardProps) {
  return (
    <Panel style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      {/* Subtotal */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 13, color: T.ink2 }}>
        <span>Subtotal · {unitCount} unit{unitCount !== 1 ? 's' : ''}</span>
        <span style={{ fontFamily: T.fontMono, fontWeight: 500 }}>{money(subtotal)}</span>
      </div>

      {/* Item discounts */}
      {itemDiscountSavings > 0 && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 13, color: T.ink2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <DTagIcon s={13} />
            Item discount{itemDiscountCount !== 1 ? 's' : ''} ({itemDiscountCount})
          </span>
          <span style={{ fontFamily: T.fontMono, fontWeight: 500 }}>−{money(itemDiscountSavings)}</span>
        </div>
      )}

      {/* Sale discount */}
      {saleDiscount && saleDiscAmt > 0 && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 13, color: T.ink2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <DTagIcon s={13} />
            {formatSaleDiscLabel(saleDiscount)}
          </span>
          <span style={{ fontFamily: T.fontMono, fontWeight: 500 }}>−{money(saleDiscAmt)}</span>
        </div>
      )}

      {totalSavings > 0 && (
        <div style={{ fontSize: 11.5, color: T.mute, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <DTagIcon s={12} /> Customer saves {money(totalSavings)}
        </div>
      )}
    </Panel>
  );
}

/* ─── Stepper ─── */

function Stepper({ sign, onClick, disabled }: { sign: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: 22, height: 22, borderRadius: 5,
        border: `1px solid ${disabled ? T.rule2 : T.rule}`,
        background: T.panel,
        color: disabled ? T.faint : T.ink2,
        display: 'grid', placeItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0, opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.bg; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.panel; }}
    >
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {sign === '+' ? <path d="M8 3v10M3 8h10" /> : <path d="M3 8h10" />}
      </svg>
    </button>
  );
}

/* ─── SalesTopbar ─── */

const SALES_TABS = [
  { id: 'register' as const, label: 'Register', Icon: Icon.cart },
  { id: 'history'  as const, label: 'History',  Icon: Icon.clock },
];

function SalesTopbar({ subTab, onTabChange }: { subTab: 'register' | 'history'; onTabChange: (t: 'register' | 'history') => void }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 5, background: T.panel,
      display: 'flex', alignItems: 'stretch', gap: 16,
      height: 56, flexShrink: 0,
      padding: '0 24px', borderBottom: `1px solid ${T.rule}`,
    }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
        {SALES_TABS.map(tab => {
          const active = tab.id === subTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                color: active ? T.ink : T.mute,
                padding: '0 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${active ? T.ink : 'transparent'}`,
                marginBottom: -1, fontFamily: 'inherit',
              }}
            >
              <tab.Icon s={14} />{tab.label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <button
        title="Notifications"
        style={{
          alignSelf: 'center',
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

/* ─── HeldDropdown ─── */

interface HeldDropdownProps {
  tickets: HeldTicket[];
  onResume: (idx: number) => void;
  onClose: () => void;
}

function HeldDropdown({ tickets, onResume, onClose }: HeldDropdownProps) {
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-held-dropdown]')) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  return (
    <div
      data-held-dropdown
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
        background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 240, overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '10px 14px', fontSize: 12, fontWeight: 600, color: T.mute,
        borderBottom: `1px solid ${T.rule2}`, textTransform: 'uppercase', letterSpacing: '.04em',
      }}>
        Held tickets
      </div>
      {tickets.map((t, i) => {
        const total = t.lines.reduce((s, l) => s + l.price * l.qty, 0);
        const count = t.lines.reduce((s, l) => s + l.qty, 0);
        return (
          <button
            key={t.id}
            onClick={() => onResume(i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', background: 'transparent', border: 'none',
              borderBottom: `1px solid ${T.rule2}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>
                {t.lines[0]?.name ?? 'Empty'}{t.lines.length > 1 ? ` +${t.lines.length - 1} more` : ''}
              </div>
              <div style={{ fontSize: 11, color: T.mute, marginTop: 2 }}>
                {count} unit{count !== 1 ? 's' : ''}{t.customer ? ` · ${t.customer}` : ''}
              </div>
            </div>
            <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: T.ink }}>{money(total)}</span>
          </button>
        );
      })}
    </div>
  );
}
