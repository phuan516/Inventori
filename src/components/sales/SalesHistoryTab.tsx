'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';

export interface SaleLineDetail {
  sku: string; name: string; qty: number; unitPrice: number;
  discount: string; effectivePrice: number; lineTotal: number;
}

export interface SaleRecord {
  id: string; date: string; time: string; customer: string;
  lines: SaleLineDetail[]; saleDiscount: string; total: number;
  status: 'recorded' | 'undone';
}

interface SalesHistoryTabProps {
  salesSheetId: string | null; sheetName: string;
  onStockUpdate: (sku: string, delta: number) => void;
  onToast: (msg: string, tone: 'ok' | 'warn') => void;
}

type SortKey = 'date' | 'total' | 'customer';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'recorded' | 'undone';

const PAGE_SIZE = 20;
const COL_GRID = '80px 140px 1fr 120px 52px 96px';

function formatDateCell(dateStr: string, time: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return time;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Today · ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`;
  const m = d.toLocaleDateString('en-US', { month: 'short' });
  const yr = d.getFullYear() !== today.getFullYear() ? `, ${d.getFullYear()}` : '';
  return `${m} ${d.getDate()}${yr} · ${time}`;
}

function money(n: number) { return '$' + n.toFixed(2); }

function skuHue(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) % 360;
  return h;
}

function formatSaleId(id: string): string {
  return '#' + id.replace('SALE-', '').slice(-6);
}

export default function SalesHistoryTab({ salesSheetId, sheetName, onStockUpdate, onToast }: SalesHistoryTabProps) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [undoConfirmId, setUndoConfirmId] = useState<string | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(q: string) {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { setDebouncedQuery(q); setPage(0); }, 250);
  }

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col);
      setSortDir(col === 'customer' ? 'asc' : 'desc');
    }
    setPage(0);
  }

  const loadSales = useCallback(async () => {
    if (!salesSheetId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sales?salesSheetId=${encodeURIComponent(salesSheetId)}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales ?? []);
      } else {
        onToast('Failed to load sales history', 'warn');
      }
    } catch {
      onToast('Failed to load sales history', 'warn');
    } finally {
      setLoading(false);
    }
  }, [salesSheetId, onToast]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const filteredSales = useMemo(() => {
    let list = sales;
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        formatSaleId(s.id).toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.lines.some(l => l.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [sales, debouncedQuery, statusFilter]);

  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') {
        const ta = new Date(`${a.date} ${a.time}`).getTime();
        const tb = new Date(`${b.date} ${b.time}`).getTime();
        cmp = isNaN(ta) || isNaN(tb) ? 0 : ta - tb;
      } else if (sortKey === 'total') {
        cmp = a.total - b.total;
      } else {
        cmp = (a.customer || '').localeCompare(b.customer || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredSales, sortKey, sortDir]);

  const totalCount = sortedSales.length;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const pagedSales = useMemo(
    () => sortedSales.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [sortedSales, page]
  );

  const selectedSale = useMemo(() => sales.find(s => s.id === selectedId) ?? null, [sales, selectedId]);

  async function handleUndo() {
    if (!undoConfirmId || !salesSheetId || isUndoing) return;
    const sale = sales.find(s => s.id === undoConfirmId);
    if (!sale) return;
    setIsUndoing(true);
    try {
      const res = await fetch(`/api/sales/${encodeURIComponent(undoConfirmId)}/undo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesSheetId }),
      });
      if (!res.ok) throw new Error('Server error');
      sale.lines.forEach(l => onStockUpdate(l.sku, l.qty));
      setSales(prev => prev.map(s => s.id === undoConfirmId ? { ...s, status: 'undone' } : s));
      const units = sale.lines.reduce((sum, l) => sum + l.qty, 0);
      onToast(`${formatSaleId(sale.id)} undone · ${units} unit${units !== 1 ? 's' : ''} restored`, 'ok');
      setUndoConfirmId(null);
      setSelectedId(null);
    } catch {
      onToast('Undo failed — try again', 'warn');
    } finally {
      setIsUndoing(false);
    }
  }

  function exportSingleSale(sale: SaleRecord) {
    const rows: string[][] = [
      ['Sale ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Line Total', 'Sale Discount', 'Sale Total'],
    ];
    for (const l of sale.lines) {
      rows.push([sale.id, sale.date, sale.time, sale.customer, l.sku, l.name, String(l.qty), String(l.unitPrice), String(l.lineTotal), sale.saleDiscount, String(sale.total)]);
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sale-${sale.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflow: 'hidden' }}>

        {/* Page head */}
        <div style={{ flexShrink: 0 }}>
          {sheetName && <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>{sheetName} · Sales</div>}
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-.02em' }}>Sales history</h1>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.mute, pointerEvents: 'none' }}>
              <Icon.search s={14} />
            </span>
            <input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search sale #, item, or customer…"
              style={{
                width: '100%', height: 34, paddingLeft: 32, paddingRight: 12,
                background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 8,
                fontSize: 13.5, color: T.ink, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 8, padding: 3, gap: 2, flexShrink: 0 }}>
            {(['all', 'recorded', 'undone'] as StatusFilter[]).map(s => {
              const active = statusFilter === s;
              const label = s === 'all' ? 'All' : s === 'recorded' ? 'Recorded' : 'Undone';
              return (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} style={{
                  fontSize: 12.5, padding: '5px 12px', borderRadius: 5,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: active ? 600 : 500,
                  background: active ? T.panel : 'transparent',
                  color: active ? T.ink : T.mute,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .1s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />
        </div>

        {/* Main grid */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: selectedSale ? '1fr 348px' : '1fr',
          gap: 16, minHeight: 0,
        }}>
          <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: COL_GRID, gap: 12,
              padding: '9px 18px', borderBottom: `1px solid ${T.rule2}`,
              background: T.bg, flexShrink: 0,
            }}>
              <ColHeader label="Sale" />
              <ColHeader label="Date" col="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <ColHeader label="Items" />
              <ColHeader label="Customer" col="customer" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <ColHeader label="Disc." />
              <ColHeader label="Total" col="total" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
            </div>

            {/* Rows */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loading ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>Loading sales…</div>
              ) : !salesSheetId ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>No sales sheet found. Record a sale first.</div>
              ) : pagedSales.length === 0 ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>No sales found</div>
              ) : (
                pagedSales.map(sale => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    isSelected={sale.id === selectedId}
                    isUndone={sale.status === 'undone'}
                    colGrid={COL_GRID}
                    onClick={() => setSelectedId(sale.id === selectedId ? null : sale.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 18px', borderTop: `1px solid ${T.rule2}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, color: T.mute, flexShrink: 0,
            }}>
              <span>Showing {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} sales</span>
              <span style={{ display: 'inline-flex', gap: 6 }}>
                <Btn kind="ghost" style={{ height: 26, padding: '0 10px', fontSize: 12 }}
                  disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Btn>
                <Btn kind="ghost" style={{ height: 26, padding: '0 10px', fontSize: 12 }}
                  disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next</Btn>
              </span>
            </div>
          </Panel>

          {selectedSale && (
            <DetailPanel
              sale={selectedSale}
              onClose={() => setSelectedId(null)}
              onUndoRequest={() => setUndoConfirmId(selectedSale.id)}
              onExport={() => exportSingleSale(selectedSale)}
            />
          )}
        </div>
      </div>

      {undoConfirmId && (() => {
        const sale = sales.find(s => s.id === undoConfirmId);
        if (!sale) return null;
        const units = sale.lines.reduce((sum, l) => sum + l.qty, 0);
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.35)', display: 'grid', placeItems: 'center',
          }} onClick={() => !isUndoing && setUndoConfirmId(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: T.panel, borderRadius: 12, width: 360,
              boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Undo {formatSaleId(sale.id)}?</div>
                <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5 }}>
                  This will restore <strong>{units} unit{units !== 1 ? 's' : ''}</strong> to stock.
                  The sale will be marked as undone in your records.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 20px 20px', justifyContent: 'flex-end' }}>
                <Btn kind="ghost" onClick={() => setUndoConfirmId(null)} disabled={isUndoing}>Cancel</Btn>
                <Btn kind="danger" onClick={handleUndo} disabled={isUndoing}>{isUndoing ? 'Undoing…' : 'Undo sale'}</Btn>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── ColHeader ─── */

function ColHeader({ label, col, sortKey, sortDir, onSort, align }: {
  label: string; col?: SortKey; sortKey?: SortKey; sortDir?: SortDir;
  onSort?: (c: SortKey) => void; align?: 'right';
}) {
  const active = !!col && sortKey === col;
  const baseStyle = {
    fontSize: 10.5, fontWeight: 700 as const, letterSpacing: '.05em' as const,
    textTransform: 'uppercase' as const, color: active ? T.ink : T.mute,
    display: 'inline-flex' as const, alignItems: 'center' as const, gap: 3,
  };
  const inner = (
    <>
      {label}
      {col && <span style={{ fontSize: 8, opacity: active ? 1 : 0.3 }}>{active && sortDir === 'asc' ? '▲' : '▼'}</span>}
    </>
  );
  if (col && onSort) {
    return (
      <button onClick={() => onSort(col)} style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: 'inherit', display: 'flex', alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}>
        <span style={baseStyle}>{inner}</span>
      </button>
    );
  }
  return <span style={{ ...baseStyle, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>{inner}</span>;
}

/* ─── SaleRow ─── */

interface SaleRowProps {
  sale: SaleRecord; isSelected: boolean; isUndone: boolean;
  colGrid: string; onClick: () => void;
}

function SaleRow({ sale, isSelected, isUndone, colGrid, onClick }: SaleRowProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: colGrid, gap: 12,
        alignItems: 'center', padding: '11px 18px',
        borderBottom: `1px solid ${T.rule2}`, cursor: 'pointer',
        background: isSelected ? T.rule2 : hovered ? T.bg : T.panel,
        boxShadow: isSelected ? `inset 2.5px 0 0 ${T.ink}` : 'none',
        opacity: isUndone ? 0.55 : 1, transition: 'background .1s',
      }}
    >
      <span style={{
        fontFamily: T.fontMono, fontSize: 12.5, fontWeight: 600,
        textDecoration: isUndone ? 'line-through' : 'none', color: T.ink,
      }}>
        {formatSaleId(sale.id)}
      </span>
      <span style={{ fontSize: 12, color: T.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {formatDateCell(sale.date, sale.time)}
      </span>
      <span style={{ fontSize: 12.5, color: T.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <strong style={{ color: T.ink, fontWeight: 600 }}>{sale.lines[0]?.name ?? '—'}</strong>
        {sale.lines.length > 1 && <span style={{ color: T.mute }}> +{sale.lines.length - 1} more</span>}
      </span>
      <span style={{ fontSize: 12.5, color: sale.customer ? T.ink2 : T.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {sale.customer || 'Walk-in'}
      </span>
      <span>
        {sale.saleDiscount && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 4,
            background: T.bg, border: `1px solid ${T.rule}`,
            fontSize: 10, fontWeight: 700, color: T.ink2,
          }}>%</span>
        )}
      </span>
      <span style={{ textAlign: 'right', fontFamily: T.fontMono, fontSize: 13, fontWeight: 600 }}>
        {isUndone
          ? <span style={{ color: T.mute, fontSize: 11, fontWeight: 500, fontFamily: 'inherit' }}>Undone</span>
          : money(sale.total)
        }
      </span>
    </div>
  );
}

/* ─── DetailPanel ─── */

interface DetailPanelProps {
  sale: SaleRecord; onClose: () => void; onUndoRequest: () => void; onExport: () => void;
}

function DetailPanel({ sale, onClose, onUndoRequest, onExport }: DetailPanelProps) {
  const isUndone = sale.status === 'undone';
  const subtotal = sale.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const saleDiscAmt = Math.max(0, subtotal - sale.total);
  const units = sale.lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.rule2}`, display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: T.fontMono }}>
            Sale {formatSaleId(sale.id)}
            {isUndone && (
              <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 600, fontFamily: 'inherit', color: T.mute, background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 4, padding: '1px 6px' }}>Undone</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: T.mute, marginTop: 3 }}>{sale.date} · {sale.time}</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.faint, padding: 2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon.x s={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {sale.lines.map((line, i) => (
          <div key={`${line.sku}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px', borderBottom: `1px solid ${T.rule2}` }}>
            <ImgPlaceholder w={36} h={36} hue={skuHue(line.sku)} radius={6} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.name}</div>
              <div style={{ fontSize: 10.5, color: T.mute, fontFamily: T.fontMono, marginTop: 2 }}>{line.sku}</div>
            </div>
            <span style={{ fontSize: 12, color: T.mute, fontFamily: T.fontMono, flexShrink: 0 }}>×{line.qty}</span>
            <span style={{ width: 60, textAlign: 'right', fontFamily: T.fontMono, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{money(line.lineTotal)}</span>
          </div>
        ))}

        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <TotalLine label="Subtotal" value={money(subtotal)} />
          {saleDiscAmt > 0 && <TotalLine label={sale.saleDiscount || 'Sale discount'} value={'−' + money(saleDiscAmt)} muted />}
          <div style={{ height: 1, background: T.rule2, margin: '2px 0' }} />
          <TotalLine label="Sale total" value={money(sale.total)} big />
        </div>

        {sale.customer && (
          <div style={{ margin: '4px 18px 12px', padding: '10px 12px', border: `1px solid ${T.rule}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon.user s={15} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{sale.customer}</div>
              <div style={{ fontSize: 11, color: T.mute }}>Attached customer</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${T.rule}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0 }}>
        {!isUndone && (
          <div style={{ fontSize: 11, color: T.mute, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.box s={13} />
            Undoing restores {units} unit{units !== 1 ? 's' : ''} to stock
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn kind="ghost" style={{ flex: 1 }} icon={<UndoIcon s={13} />} onClick={onUndoRequest} disabled={isUndone}>Undo sale</Btn>
          <Btn kind="ghost" style={{ flex: 1 }} icon={<Icon.receipt s={13} />} onClick={onExport}>Export</Btn>
        </div>
      </div>
    </Panel>
  );
}

function TotalLine({ label, value, big, muted }: { label: string; value: string; big?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: big ? 14.5 : 12.5, fontWeight: big ? 600 : 400, color: big ? T.ink : T.ink2 }}>{label}</span>
      <span style={{ fontFamily: T.fontMono, fontSize: big ? 17 : 12.5, fontWeight: big ? 700 : 500, color: muted ? T.mute : T.ink }}>{value}</span>
    </div>
  );
}

function UndoIcon({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6H9.5a3.5 3.5 0 0 1 0 7H6" />
      <path d="M4 3 1 6l3 3" />
    </svg>
  );
}
