'use client';

import { useState, useMemo, useCallback } from 'react';
import { matchedLineFromProduct, pendingLine, type IntakeLine } from '@/lib/intakeData';
import type { Product } from '@/lib/types';

export interface IntakeSummary {
  skus: number;
  units: number;
  value: number;
  pending: number;
  matched: number;
}

export function useIntake(initialLines: IntakeLine[] = [], catalog: Product[] = []) {
  const [lines, setLines] = useState<IntakeLine[]>(initialLines);
  const [flash, setFlash] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const doFlash = useCallback((id: string) => {
    setFlash(id);
    setTimeout(() => setFlash(f => f === id ? null : f), 1100);
  }, []);

  const scan = useCallback((raw: string) => {
    const code = (raw || '').trim().toUpperCase();
    if (!code) return;
    setLines(prev => {
      const known = catalog.find(p =>
        p.sku.toUpperCase() === code || (p.upc && p.upc.toUpperCase() === code)
      );
      const matchKey = known ? known.sku.toUpperCase() : code;
      const i = prev.findIndex(l => l.sku.toUpperCase() === matchKey);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        doFlash(next[i].id);
        const [touched] = next.splice(i, 1);
        return [touched, ...next];
      }
      const line = known ? matchedLineFromProduct(known, 1, code) : pendingLine(code, 1);
      doFlash(line.id);
      return [line, ...prev];
    });
  }, [doFlash, catalog]);

  const setQty = useCallback((id: string, q: number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(0, q) } : l));
  }, []);

  const bump = useCallback((id: string, d: number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(0, l.qty + d) } : l));
  }, []);

  const setCost = useCallback((id: string, c: number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, cost: c } : l));
  }, []);

  const remove = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  const resolve = useCallback((id: string, patch: Partial<IntakeLine>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch, matched: true } : l));
    doFlash(id);
  }, [doFlash]);

  const summary = useMemo<IntakeSummary>(() => {
    const units = lines.reduce((s, l) => s + l.qty, 0);
    const value = lines.reduce((s, l) => s + l.qty * (l.cost || 0), 0);
    const pending = lines.filter(l => !l.matched).length;
    return { skus: lines.length, units, value, pending, matched: lines.length - pending };
  }, [lines]);

  return { lines, flash, committed, setCommitted, scan, setQty, bump, setCost, remove, resolve, summary };
}
