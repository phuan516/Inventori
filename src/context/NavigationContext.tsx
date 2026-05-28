'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import T from '@/lib/theme';

interface NavCtx {
  startLoading: () => void;
}

const Ctx = createContext<NavCtx>({ startLoading: () => {} });

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'completing'>('idle');
  const waiting = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!waiting.current) return;
    waiting.current = false;
    setPhase('completing');
    const t = setTimeout(() => setPhase('idle'), 380);
    return () => clearTimeout(t);
  }, [pathname]);

  function startLoading() {
    waiting.current = true;
    setPhase('loading');
  }

  return (
    <Ctx.Provider value={{ startLoading }}>
      {phase !== 'idle' && (
        <div
          className={phase === 'loading' ? 'nav-bar-fill' : 'nav-bar-done'}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 2,
            zIndex: 9999, background: T.brand, transformOrigin: 'left',
          }}
        />
      )}
      {children}
    </Ctx.Provider>
  );
}

export function useNavigation() {
  return useContext(Ctx);
}
