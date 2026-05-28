import T from '@/lib/theme';
import type { StatusFilter, SortOption } from '@/lib/types';
import Select from '@/components/ui/Select';

interface FilterBarProps {
  cat: string;
  setCat: (c: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  count: number;
  total: number;
  anyFilter: boolean;
  onClear: () => void;
  categories: string[];
}

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ok',  label: 'In stock' },
  { id: 'low', label: 'Low' },
  { id: 'out', label: 'Out of stock' },
];

export default function FilterBar({
  cat, setCat, statusFilter, setStatusFilter,
  sort, setSort, count, total, anyFilter, onClear, categories,
}: FilterBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {/* Status segmented control */}
      <div style={{ display: 'flex', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 7, padding: 3, gap: 2 }}>
        {STATUS_TABS.map(s => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            style={{
              fontFamily: 'inherit', fontSize: 12.5,
              fontWeight: statusFilter === s.id ? 600 : 400,
              padding: '5px 11px', borderRadius: 5, cursor: 'pointer',
              background: statusFilter === s.id ? T.bg : 'transparent',
              color: statusFilter === s.id ? T.ink : T.ink2,
              border: 'none',
              boxShadow: statusFilter === s.id ? `inset 0 0 0 1px ${T.rule}` : 'none',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Select value={cat} onChange={(e) => setCat(e.target.value)}>
        <option value="all">All categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
        <option value="updated">Recently updated</option>
        <option value="name">Name · A→Z</option>
        <option value="stockAsc">Stock · low → high</option>
        <option value="stockDesc">Stock · high → low</option>
        <option value="priceDesc">Price · high → low</option>
      </Select>

      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 12, color: T.mute }}>
        Showing <strong style={{ color: T.ink, fontWeight: 600 }}>{count}</strong> of {total}
      </div>
      {anyFilter && (
        <a className="inv-link" style={{ fontSize: 12 }} onClick={onClear}>Clear filters</a>
      )}
    </div>
  );
}
