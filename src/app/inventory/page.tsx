'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import T from '@/lib/theme';
import type { Product, StatusFilter, SortOption } from '@/lib/types';
import { SEED, statusOf, CATEGORIES } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/inventory/Sidebar';
import Topbar from '@/components/inventory/Topbar';
import FilterBar from '@/components/inventory/FilterBar';
import { TableHeader, Row, EmptyState, TABLE_MIN_WIDTH } from '@/components/inventory/InventoryTable';
import ProductDrawer from '@/components/inventory/ProductDrawer';
import AddProductModal from '@/components/inventory/AddProductModal';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';
import Toast from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icon';

export default function InventoryPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  // Redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const [items, setItems] = useState<Product[]>(() => SEED.map(p => ({ ...p })));
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('updated');
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'warn'; id: number } | null>(null);

  function showToast(msg: string, tone: 'ok' | 'warn' = 'ok') {
    const id = Date.now();
    setToast({ msg, tone, id });
    setTimeout(() => setToast(t => (t?.id === id ? null : t)), 2400);
  }

  function updateStock(id: string, delta: number) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  }

  function updateItem(id: string, patch: Partial<Product>) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  function addItem(data: Omit<Product, 'id'>) {
    const id = 'p' + String(items.length + 1).padStart(2, '0');
    setItems(prev => [{ ...data, id }, ...prev]);
    setAdding(false);
    showToast(`Added "${data.name}" to inventory`);
  }

  function deleteItem(id: string) {
    const name = items.find(p => p.id === id)?.name;
    setItems(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    showToast(`Removed "${name}"`, 'warn');
  }

  const filtered = useMemo(() => {
    let list = items;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.mfr.toLowerCase().includes(q)
      );
    }
    if (cat !== 'all') list = list.filter(p => p.cat === cat);
    if (statusFilter !== 'all') list = list.filter(p => statusOf(p) === statusFilter);
    const sorters: Record<SortOption, (a: Product, b: Product) => number> = {
      updated:   () => 0,
      name:      (a, b) => a.name.localeCompare(b.name),
      stockAsc:  (a, b) => a.stock - b.stock,
      stockDesc: (a, b) => b.stock - a.stock,
      priceDesc: (a, b) => b.price - a.price,
    };
    return [...list].sort(sorters[sort]);
  }, [items, query, cat, statusFilter, sort]);

  const kpis = useMemo(() => ({
    skus:  items.length,
    total: items.reduce((s, p) => s + p.stock, 0),
    value: items.reduce((s, p) => s + p.stock * p.cost, 0),
    low:   items.filter(p => statusOf(p) === 'low').length,
    out:   items.filter(p => statusOf(p) === 'out').length,
  }), [items]);

  const selectedItem = selected ? items.find(p => p.id === selected) ?? null : null;
  const anyFilter = cat !== 'all' || statusFilter !== 'all' || query !== '';

  function clearFilters() { setCat('all'); setStatusFilter('all'); setQuery(''); }

  function handleSignOut() {
    signOut();
    router.push('/');
  }

  if (authLoading || !user) return null;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: T.bg, color: T.ink, display: 'grid', gridTemplateColumns: '232px 1fr' }}>
      <Sidebar user={user} onSignOut={handleSignOut} itemCount={items.length} />

      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar query={query} setQuery={setQuery} />

        <div style={{ padding: '20px 28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Page heading */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>Saito Hobby · Berkeley</div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Inventory</h1>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn kind="ghost" icon={<Icon.scan s={14} />}>Scan barcode</Btn>
              <Btn kind="ghost">Export CSV</Btn>
              <Btn kind="primary" icon={<Icon.plus s={13} />} onClick={() => setAdding(true)}>Add product</Btn>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <KpiCard label="Products"       value={kpis.skus}  sub="unique SKUs" />
            <KpiCard label="Units on hand"  value={kpis.total} sub="across all categories" />
            <KpiCard label="Low stock"      value={kpis.low}   sub={`${kpis.out} out of stock`}
              tone="warn" onClick={() => setStatusFilter('low')} />
            <KpiCard label="Inventory value"
              value={'$' + kpis.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              sub="at cost" />
          </div>

          {/* Filters */}
          <FilterBar
            cat={cat} setCat={setCat}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            sort={sort} setSort={setSort}
            count={filtered.length} total={items.length}
            anyFilter={anyFilter} onClear={clearFilters}
          />

          {/* Table */}
          <Panel style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: TABLE_MIN_WIDTH }}>
                <TableHeader />
                {filtered.length === 0
                  ? <EmptyState query={query} onClear={clearFilters} />
                  : filtered.map(p => (
                    <Row
                      key={p.id} p={p}
                      onSelect={() => setSelected(p.id)}
                      onInc={() => updateStock(p.id, +1)}
                      onDec={() => updateStock(p.id, -1)}
                    />
                  ))
                }
              </div>
            </div>
          </Panel>
        </div>
      </main>

      {selectedItem && (
        <ProductDrawer
          item={selectedItem}
          onClose={() => setSelected(null)}
          onChange={(patch) => updateItem(selectedItem.id, patch)}
          onDelete={() => deleteItem(selectedItem.id)}
          onInc={() => updateStock(selectedItem.id, +1)}
          onDec={() => updateStock(selectedItem.id, -1)}
        />
      )}

      {adding && (
        <AddProductModal onClose={() => setAdding(false)} onAdd={addItem} />
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}

/* ── KPI card ── */

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  tone?: 'warn';
  onClick?: () => void;
}

function KpiCard({ label, value, sub, tone, onClick }: KpiCardProps) {
  return (
    <Panel style={{ padding: '14px 16px', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: 12, color: T.mute, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', color: tone === 'warn' ? T.warn : T.ink }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: T.mute, marginTop: 4 }}>{sub}</div>
    </Panel>
  );
}
