'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/settings';

interface SettingsCtx {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [sheetId, setSheetId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('inventori_sheet_id') ?? null;
    setSheetId(id);
    // Seed from localStorage immediately, then overwrite from sheet if available
    setSettings(loadSettings());
    if (id) {
      fetch(`/api/sheets/${id}/settings`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.settings) {
            setSettings(data.settings);
            saveSettings(data.settings);
          }
        })
        .catch(() => {/* keep localStorage values */});
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      const id = sheetId ?? localStorage.getItem('inventori_sheet_id');
      if (id) {
        fetch(`/api/sheets/${id}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        }).catch(() => {/* localStorage already updated */});
      }
      return next;
    });
  }, [sheetId]);

  return <Ctx.Provider value={{ settings, updateSettings }}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be inside <SettingsProvider>');
  return ctx;
}
