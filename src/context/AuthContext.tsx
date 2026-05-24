'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import T from '@/lib/theme';

interface AuthContextType {
  user: User | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user — replace with real Google OAuth user once auth is wired up
export const MOCK_USER: User = {
  name: 'Kenji Saito',
  email: 'kenji@saitohobby.com',
  initials: 'KS',
  tone: T.brand,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = () => setUser(MOCK_USER);
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
