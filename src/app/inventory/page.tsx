'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import T from '@/lib/theme';
import type { Product, StatusFilter, SortOption } from '@/lib/types';
import { statusOf } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import Sidebar, { type AppTab } from '@/components/inventory/Sidebar';
import Topbar from '@/components/inventory/Topbar';
import FilterBar from '@/components/inventory/FilterBar';
import { TableHeader, Row, EmptyState, SkeletonRows, TABLE_MIN_WIDTH } from '@/components/inventory/InventoryTable';
import ProductDrawer from '@/components/inventory/ProductDrawer';
import AddProductModal from '@/components/inventory/AddProductModal';
import IntakeTab from '@/components/intake/IntakeTab';
import SettingsTab from '@/components/settings/SettingsTab';
import Panel from '@/components/ui/Panel';
import Btn from '@/components/ui/Btn';
import Toast from '@/components/ui/Toast';
import { Icon } from '@/components/ui/Icon';

// Survives client-side navigations (module stays loaded). 5-minute TTL.
const productCache = new Map<string, { products: Product[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export default function AppPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<AppTab>('inventory');

  // Redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string>('');
  const [items, setItems] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('updated');
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'warn'; id: number } | null>(null);

  const itemsRef = useRef<Product[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const pendingUpdates = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const id = localStorage.getItem('inventori_sheet_id');
    if (!id) { router.replace('/sheets'); return; }
    setSheetId(id);
    setSheetName(localStorage.getItem('inventori_sheet_name') ?? '');
  }, [router]);

  useEffect(() => {
    if (!user || !sheetId) return;

    const cached = productCache.get(sheetId);
    const isFresh = cached && Date.now() - cached.ts < CACHE_TTL;

    if (isFresh) {
      setItems(cached.products);
      setProductsLoading(false);
    } else {
      setProductsLoading(true);
    }

    const controller = new AbortController();
    fetch(`/api/sheets/${sheetId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const products: Product[] = data.products ?? [];
        productCache.set(sheetId, { products, ts: Date.now() });
        setItems(products);
        setProductsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!isFresh) {
          showToast('Failed to load products', 'warn');
          setProductsLoading(false);
        }
      });
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sheetId]);

  useEffect(() => {
    if (sheetId && !productsLoading && items.length > 0) {
      productCache.set(sheetId, { products: items, ts: Date.now() });
    }
  }, [items, productsLoading, sheetId]);

  useEffect(() => {
    if (!productsLoading) {
      localStorage.setItem('inventori_item_count', String(items.length));
    }
  }, [items.length, productsLoading]);

  function showToast(msg: string, tone: 'ok' | 'warn' = 'ok') {
    const id = Date.now();
    setToast({ msg, tone, id });
    setTimeout(() => setToast(t => (t?.id === id ? null : t)), 2400);
  }

  function scheduleSave(productId: string) {
    const existing = pendingUpdates.current.get(productId);
    if (existing) clearTimeout(existing);
    pendingUpdates.current.set(productId, setTimeout(() => {
      const product = itemsRef.current.find(p => p.id === productId);
      if (!product || !sheetId) return;
      fetch(`/api/sheets/${sheetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }).catch(() => showToast('Save failed', 'warn'));
      pendingUpdates.current.delete(productId);
    }, 700));
  }

  function updateStock(id: string, delta: number) {
    setItems(prev => prev.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    ));
    scheduleSave(id);
  }

  function updateItem(id: string, patch: Partial<Product>) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    scheduleSave(id);
  }

  async function addItem(data: Omit<Product, 'id'>) {
    setAdding(false);
    if (!sheetId) return;
    const res = await fetch(`/api/sheets/${sheetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { showToast('Failed to add product', 'warn'); return; }
    const { product } = await res.json();
    setItems(prev => [product, ...prev]);
    showToast(`Added "${product.name}" to inventory`);
  }

  function deleteItem(id: string) {
    const name = items.find(p => p.id === id)?.name;
    setItems(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    showToast(`Removed "${name}"`, 'warn');
    if (!sheetId) return;
    fetch(`/api/sheets/${sheetId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id }),
    }).catch(() => showToast('Delete sync failed', 'warn'));
  }

  const filtered = useMemo(() => {
    let list = items;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.mfr.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
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
    router.push('/login');
  }

  if (authLoading || !user) return null;

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: T.bg, color: T.ink,
      display: 'grid', gridTemplateColumns: '232px 1fr',
    }}>
      <Sidebar
        user={user}
        onSignOut={handleSignOut}
        onChangeSheet={() => router.push('/sheets')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        itemCount={items.length}
        sheetName={sheetName}
      />

      {activeTab === 'inventory' && (
        <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Topbar query={query} setQuery={setQuery} />

          <div style={{ padding: '20px 28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <div>
                {sheetName && <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>{sheetName}</div>}
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Inventory</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn kind="primary" icon={<Icon.plus s={13} />} onClick={() => setAdding(true)}>Add product</Btn>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <KpiCard label="Products"       value={kpis.skus}  sub="unique SKUs" />
              <KpiCard label="Units on hand"  value={kpis.total} sub="across all categories" />
              <KpiCard label="Low stock"      value={kpis.low}   sub={`${kpis.out} out of stock`}
                tone="warn" onClick={() => setStatusFilter('low')} />
              <KpiCard label="Inventory value"
                value={'$' + kpis.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                sub="at cost" />
            </div>

            <FilterBar
              cat={cat} setCat={setCat}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sort={sort} setSort={setSort}
              count={filtered.length} total={items.length}
              anyFilter={anyFilter} onClear={clearFilters}
              categories={settings.categories}
            />

            <Panel style={{ overflow: 'hidden' }}>
              {productsLoading ? (
                <div style={{ minWidth: TABLE_MIN_WIDTH }}>
                  <TableHeader />
                  <SkeletonRows />
                </div>
              ) : (
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
              )}
            </Panel>
          </div>

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

          {adding && <AddProductModal onClose={() => setAdding(false)} onAdd={addItem} />}
        </main>
      )}

      {activeTab === 'intake' && (
        <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
          <IntakeTab />
        </div>
      )}

      {activeTab === 'settings' && <SettingsTab />}

      {toast && <Toast {...toast} />}
    </div>
  );
}

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
