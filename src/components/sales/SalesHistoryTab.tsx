'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import T from '@/lib/theme';
import { Icon } from '@/components/ui/Icon';
import ImgPlaceholder from '@/components/ui/ImgPlaceholder';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';

type DateRangeId = 'today' | '7d' | '30d';

export interface SaleLineDetail {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
  discount: string;
  effectivePrice: number;
  lineTotal: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  time: string;
  customer: string;
  lines: SaleLineDetail[];
  saleDiscount: string;
  total: number;
  status: 'recorded' | 'undone';
}

interface SalesHistoryTabProps {
  salesSheetId: string | null;
  sheetName: string;
  onStockUpdate: (sku: string, delta: number) => void;
  onToast: (msg: string, tone: 'ok' | 'warn') => void;
}

const PAGE_SIZE = 20;

function getDateRange(range: DateRangeId): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  if (range === 'today') {
    from.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
  } else {
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
  }
  return { from, to };
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const formatted = `${weekday}, ${month} ${day}`;
  if (sameDay(date, today)) return `Today · ${formatted}`;
  if (sameDay(date, yesterday)) return `Yesterday · ${formatted}`;
  return formatted;
}

function money(n: number) { return '$' + n.toFixed(2); }

function skuHue(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) % 360;
  return h;
}

function formatSaleId(id: string): string {
  // SALE-1748902835432 → #835432 (last 6 digits of timestamp)
  const digits = id.replace('SALE-', '');
  return '#' + digits.slice(-6);
}

const COL_GRID = '80px 64px 1fr 120px 52px 96px';

export default function SalesHistoryTab({ salesSheetId, sheetName, onStockUpdate, onToast }: SalesHistoryTabProps) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeId>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
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

  const loadSales = useCallback(async () => {
    if (!salesSheetId) return;
    setLoading(true);
    const { from, to } = getDateRange(dateRange);
    const params = new URLSearchParams({
      salesSheetId,
      from: from.toISOString(),
      to: to.toISOString(),
    });
    try {
      const res = await fetch(`/api/sales?${params}`);
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
  }, [salesSheetId, dateRange, onToast]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const filteredSales = useMemo(() => {
    if (!debouncedQuery) return sales;
    const q = debouncedQuery.toLowerCase();
    return sales.filter(s =>
      s.id.toLowerCase().includes(q) ||
      formatSaleId(s.id).toLowerCase().includes(q) ||
      s.customer.toLowerCase().includes(q) ||
      s.lines.some(l => l.name.toLowerCase().includes(q))
    );
  }, [sales, debouncedQuery]);

  // Group by date, newest first
  const dayGroups = useMemo(() => {
    const map = new Map<string, SaleRecord[]>();
    for (const s of filteredSales) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    const entries = Array.from(map.entries()).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
    return entries.map(([date, daySales]) => ({
      date,
      label: formatDayLabel(date),
      sales: [...daySales].sort((a, b) => {
        const ta = new Date(`${date} ${a.time}`).getTime();
        const tb = new Date(`${date} ${b.time}`).getTime();
        return isNaN(ta) || isNaN(tb) ? 0 : tb - ta;
      }),
      count: daySales.length,
      recordedTotal: daySales.filter(s => s.status !== 'undone').reduce((sum, s) => sum + s.total, 0),
    }));
  }, [filteredSales]);

  const allSalesSorted = useMemo(() => dayGroups.flatMap(g => g.sales), [dayGroups]);
  const totalCount = allSalesSorted.length;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const pagedSaleIds = useMemo(() => {
    const slice = allSalesSorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return new Set(slice.map(s => s.id));
  }, [allSalesSorted, page]);

  const pagedDayGroups = useMemo(() =>
    dayGroups
      .map(g => ({ ...g, sales: g.sales.filter(s => pagedSaleIds.has(s.id)) }))
      .filter(g => g.sales.length > 0),
    [dayGroups, pagedSaleIds]
  );

  const selectedSale = useMemo(() => sales.find(s => s.id === selectedId) ?? null, [sales, selectedId]);

  async function handleUndo() {
    if (!undoConfirmId || !salesSheetId || isUndoing) return;
    const sale = sales.find(s => s.id === undoConfirmId);
    if (!sale) return;
    setIsUndoing(true);
    try {
      const res = await fetch(`/api/sales/${encodeURIComponent(undoConfirmId)}/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  function exportCSV() {
    const rows: string[][] = [
      ['Sale ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Line Total', 'Sale Discount', 'Sale Total', 'Status'],
    ];
    for (const s of filteredSales) {
      for (const l of s.lines) {
        rows.push([s.id, s.date, s.time, s.customer, l.sku, l.name, String(l.qty), String(l.unitPrice), String(l.lineTotal), s.saleDiscount, String(s.total), s.status]);
      }
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
    a.href = url;
    a.download = `sale-${sale.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflow: 'hidden' }}>

        {/* Page head */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            {sheetName && <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>{sheetName} · Sales</div>}
            <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-.02em' }}>Sales history</h1>
          </div>
          <Btn kind="ghost" icon={<Icon.receipt s={13} />} onClick={exportCSV}>Export CSV</Btn>
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
            {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']] as [DateRangeId, string][]).map(([id, label]) => {
              const active = dateRange === id;
              return (
                <button
                  key={id}
                  onClick={() => { setDateRange(id); setPage(0); setSelectedId(null); }}
                  style={{
                    fontSize: 12.5, padding: '5px 12px', borderRadius: 5,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: active ? 600 : 500,
                    background: active ? T.panel : 'transparent',
                    color: active ? T.ink : T.mute,
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                    transition: 'all .1s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
              background: T.panel, color: T.ink2, border: `1px solid ${T.rule}`,
              cursor: 'default', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            All staff <Icon.chevDown s={13} />
          </button>
        </div>

        {/* Main grid */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: selectedSale ? '1fr 348px' : '1fr',
          gap: 16, minHeight: 0,
        }}>
          {/* Transaction table */}
          <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: COL_GRID, gap: 12,
              padding: '9px 18px', borderBottom: `1px solid ${T.rule2}`,
              background: T.bg, fontSize: 10.5, fontWeight: 700, color: T.mute,
              letterSpacing: '.05em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              <span>Sale</span><span>Time</span><span>Items</span>
              <span>Customer</span><span>Disc.</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {/* Rows */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loading ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>
                  Loading sales…
                </div>
              ) : !salesSheetId ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>
                  No sales sheet found. Record a sale first.
                </div>
              ) : pagedDayGroups.length === 0 ? (
                <div style={{ padding: '40px 18px', textAlign: 'center', color: T.mute, fontSize: 13.5 }}>
                  No sales in this range
                </div>
              ) : (
                pagedDayGroups.map(group => (
                  <div key={group.date}>
                    <div style={{
                      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                      padding: '9px 18px', background: T.rule2,
                      borderBottom: `1px solid ${T.rule}`,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{group.label}</span>
                      <span style={{ fontSize: 11.5, color: T.mute, whiteSpace: 'nowrap', fontFamily: T.fontMono }}>
                        {group.count} sale{group.count !== 1 ? 's' : ''} · {money(group.recordedTotal)}
                      </span>
                    </div>

                    {group.sales.map(sale => {
                      const isSelected = sale.id === selectedId;
                      const isUndone = sale.status === 'undone';
                      return (
                        <SaleRow
                          key={sale.id}
                          sale={sale}
                          isSelected={isSelected}
                          isUndone={isUndone}
                          colGrid={COL_GRID}
                          onClick={() => setSelectedId(isSelected ? null : sale.id)}
                        />
                      );
                    })}
                  </div>
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
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}>Prev</Btn>
                <Btn kind="ghost" style={{ height: 26, padding: '0 10px', fontSize: 12 }}
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage(p => p + 1)}>Next</Btn>
              </span>
            </div>
          </Panel>

          {/* Sale detail panel */}
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

      {/* Undo confirmation dialog */}
      {undoConfirmId && (() => {
        const sale = sales.find(s => s.id === undoConfirmId);
        if (!sale) return null;
        const units = sale.lines.reduce((sum, l) => sum + l.qty, 0);
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.35)', display: 'grid', placeItems: 'center',
          }} onClick={() => !isUndoing && setUndoConfirmId(null)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: T.panel, borderRadius: 12, width: 360,
                boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Undo {formatSaleId(sale.id)}?</div>
                <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5 }}>
                  This will restore <strong>{units} unit{units !== 1 ? 's' : ''}</strong> to stock.
                  The sale will be marked as undone in your records.
                </div>
              </div>
              <div style={{
                display: 'flex', gap: 8, padding: '12px 20px 20px', justifyContent: 'flex-end',
              }}>
                <Btn kind="ghost" onClick={() => setUndoConfirmId(null)} disabled={isUndoing}>Cancel</Btn>
                <Btn kind="danger" onClick={handleUndo} disabled={isUndoing}>
                  {isUndoing ? 'Undoing…' : 'Undo sale'}
                </Btn>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── SaleRow ─── */

interface SaleRowProps {
  sale: SaleRecord;
  isSelected: boolean;
  isUndone: boolean;
  colGrid: string;
  onClick: () => void;
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
        opacity: isUndone ? 0.55 : 1,
        transition: 'background .1s',
      }}
    >
      <span style={{
        fontFamily: T.fontMono, fontSize: 12.5, fontWeight: 600,
        textDecoration: isUndone ? 'line-through' : 'none', color: T.ink,
      }}>
        {formatSaleId(sale.id)}
      </span>
      <span style={{ fontSize: 12, color: T.ink2 }}>{sale.time}</span>
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
  sale: SaleRecord;
  onClose: () => void;
  onUndoRequest: () => void;
  onExport: () => void;
}

function DetailPanel({ sale, onClose, onUndoRequest, onExport }: DetailPanelProps) {
  const isUndone = sale.status === 'undone';
  const subtotal = sale.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const saleDiscAmt = Math.max(0, subtotal - sale.total);
  const units = sale.lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${T.rule2}`,
        display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: T.fontMono }}>
            Sale {formatSaleId(sale.id)}
            {isUndone && (
              <span style={{
                marginLeft: 8, fontSize: 10.5, fontWeight: 600, fontFamily: 'inherit',
                color: T.mute, background: T.bg, border: `1px solid ${T.rule}`,
                borderRadius: 4, padding: '1px 6px',
              }}>Undone</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: T.mute, marginTop: 3 }}>
            {sale.date} · {sale.time}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: T.faint, padding: 2, display: 'grid', placeItems: 'center', flexShrink: 0,
          }}
        >
          <Icon.x s={15} />
        </button>
      </div>

      {/* Line items */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {sale.lines.map((line, i) => (
          <div
            key={`${line.sku}-${i}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px',
              borderBottom: `1px solid ${T.rule2}`,
            }}
          >
            <ImgPlaceholder w={36} h={36} hue={skuHue(line.sku)} radius={6} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {line.name}
              </div>
              <div style={{ fontSize: 10.5, color: T.mute, fontFamily: T.fontMono, marginTop: 2 }}>
                {line.sku}
              </div>
            </div>
            <span style={{ fontSize: 12, color: T.mute, fontFamily: T.fontMono, flexShrink: 0 }}>×{line.qty}</span>
            <span style={{ width: 60, textAlign: 'right', fontFamily: T.fontMono, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>
              {money(line.lineTotal)}
            </span>
          </div>
        ))}

        {/* Totals block */}
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <TotalLine label="Subtotal" value={money(subtotal)} />
          {saleDiscAmt > 0 && (
            <TotalLine
              label={sale.saleDiscount || 'Sale discount'}
              value={'−' + money(saleDiscAmt)}
              muted
            />
          )}
          <div style={{ height: 1, background: T.rule2, margin: '2px 0' }} />
          <TotalLine label="Sale total" value={money(sale.total)} big />
        </div>

        {/* Customer card */}
        {sale.customer && (
          <div style={{
            margin: '4px 18px 12px', padding: '10px 12px',
            border: `1px solid ${T.rule}`, borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 9,
          }}>
            <Icon.user s={15} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{sale.customer}</div>
              <div style={{ fontSize: 11, color: T.mute }}>Attached customer</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.rule}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0 }}>
        {!isUndone && (
          <div style={{ fontSize: 11, color: T.mute, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.box s={13} />
            Undoing restores {units} unit{units !== 1 ? 's' : ''} to stock
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            kind="ghost"
            style={{ flex: 1 }}
            icon={<UndoIcon s={13} />}
            onClick={onUndoRequest}
            disabled={isUndone}
          >
            Undo sale
          </Btn>
          <Btn kind="ghost" style={{ flex: 1 }} icon={<Icon.receipt s={13} />} onClick={onExport}>
            Export
          </Btn>
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
