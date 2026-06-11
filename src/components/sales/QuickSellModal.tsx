'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';
import Btn from '@/components/ui/Btn';
import type { Product, TicketLine } from '@/lib/types';

const money = (n: number) => '$' + n.toFixed(2);

function skuHue(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) % 360;
  return h;
}

interface QuickSellModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onStockUpdate: (sku: string, delta: number) => void;
  onToast: (msg: string, tone: 'ok' | 'warn') => void;
  onOpenRegister: (ticket: TicketLine[]) => void;
}

export default function QuickSellModal({
  open, onClose, products, onStockUpdate, onToast, onOpenRegister,
}: QuickSellModalProps) {
  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [scanValue, setScanValue] = useState('');
  const [noMatch, setNoMatch] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setScanValue('');
      setNoMatch(false);
      requestAnimationFrame(() => scanRef.current?.focus());
    } else {
      setTicket([]);
      setScanValue('');
      setNoMatch(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const refocusScan = useCallback(() => {
    requestAnimationFrame(() => scanRef.current?.focus());
  }, []);

  const saleTotal = ticket.reduce((s, l) => s + l.price * l.qty, 0);
  const unitCount = ticket.reduce((s, l) => s + l.qty, 0);

  function addToTicket(product: Product) {
    setTicket(prev => {
      const existing = prev.find(l => l.sku === product.sku);
      if (existing) {
        return prev.map(l => l.sku === product.sku ? { ...l, qty: l.qty + 1 } : l);
      }
      return [
        { sku: product.sku, name: product.name, price: product.price, qty: 1 },
        ...prev,
      ];
    });
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
    if (product) {
      addToTicket(product);
    } else {
      setNoMatch(true);
    }
  }

  function updateQty(sku: string, delta: number) {
    setTicket(prev => {
      const line = prev.find(l => l.sku === sku);
      if (!line) return prev;
      const next = line.qty + delta;
      if (next <= 0) return prev.filter(l => l.sku !== sku);
      return prev.map(l => l.sku === sku ? { ...l, qty: next } : l);
    });
  }

  function handleRecordSale() {
    if (!ticket.length) return;
    ticket.forEach(l => onStockUpdate(l.sku, -l.qty));
    const n = unitCount;
    onToast(`Sale recorded · ${n} unit${n !== 1 ? 's' : ''} out`, 'ok');
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(20,22,26,.32)',
        }}
      />

      {/* Modal */}
      <div
        className="inv-pop"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 101, width: 460, background: T.panel,
          borderRadius: 14, boxShadow: '0 30px 80px rgba(0,0,0,.3)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: 760,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '15px 18px', borderBottom: `1px solid ${T.rule}`,
        }}>
          <span style={{ color: T.ink2 }}><Icon.cart s={17} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Quick sell</div>
            <div style={{ fontSize: 11.5, color: T.mute }}>Ring up without leaving Inventory</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T.mute, padding: 6, borderRadius: 6,
              display: 'grid', placeItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.mute; }}
          >
            <Icon.x s={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto', flex: 1,
        }}>
          {/* Scan input */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: T.mute, pointerEvents: 'none',
            }}>
              <Icon.scan s={15} />
            </span>
            <input
              ref={scanRef}
              value={scanValue}
              onChange={e => { setScanValue(e.target.value); setNoMatch(false); }}
              onKeyDown={handleScan}
              placeholder="Scan or search to add…"
              style={{
                width: '100%', height: 40, paddingLeft: 34, paddingRight: 12,
                background: T.bg,
                border: `1px solid ${noMatch ? T.danger : T.rule}`,
                borderRadius: 8, fontSize: 13.5, color: T.ink,
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color .12s',
              }}
            />
          </div>
          {noMatch && (
            <div style={{ fontSize: 12, color: T.danger, marginTop: -6 }}>
              No match found
            </div>
          )}

          {/* Line items */}
          {ticket.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: T.faint, fontSize: 13 }}>
              Scan or type a SKU to add items
            </div>
          ) : (
            ticket.map(line => (
              <div key={line.sku} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <ImgPlaceholder w={38} h={38} hue={skuHue(line.sku)} radius={6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{line.name}</div>
                  <div style={{ fontSize: 11, color: T.mute }}>{money(line.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ModalStepper sign="−" onClick={() => updateQty(line.sku, -1)} />
                  <span style={{
                    minWidth: 16, textAlign: 'center',
                    fontFamily: T.fontMono, fontWeight: 600, fontSize: 13,
                  }}>{line.qty}</span>
                  <ModalStepper sign="+" onClick={() => updateQty(line.sku, +1)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${T.rule}`, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.ink2 }}>Sale total</span>
            <span style={{
              fontFamily: T.fontMono, fontSize: 19, fontWeight: 700, color: T.ink,
            }}>{money(saleTotal)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              kind="ghost"
              style={{ flex: 1 }}
              onClick={() => onOpenRegister(ticket)}
            >
              Open full register
            </Btn>
            <Btn
              kind="primary"
              style={{ flex: 1, height: 42 }}
              icon={<Icon.check s={14} />}
              onClick={handleRecordSale}
              disabled={ticket.length === 0}
            >
              Record sale
            </Btn>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalStepper({ sign, onClick }: { sign: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: 5,
        border: `1px solid ${T.rule}`, background: T.panel,
        color: T.ink2, display: 'grid', placeItems: 'center',
        cursor: 'pointer', padding: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.panel; }}
    >
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {sign === '+' ? <path d="M8 3v10M3 8h10" /> : <path d="M3 8h10" />}
      </svg>
    </button>
  );
}
