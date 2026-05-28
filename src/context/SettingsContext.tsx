'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/settings';

interface SettingsCtx {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  return <Ctx.Provider value={{ settings, updateSettings }}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be inside <SettingsProvider>');
  return ctx;
}
