'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  SessionProvider,
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from 'next-auth/react';
import type { User } from '@/lib/types';
import T from '@/lib/theme';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (callbackUrl?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function sessionToUser(session: ReturnType<typeof useSession>['data']): User | null {
  if (!session?.user) return null;
  const name = session.user.name ?? session.user.email ?? 'User';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return {
    name,
    email: session.user.email ?? '',
    initials,
    tone: T.brand,
  };
}

function AuthContextInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = sessionToUser(session);

  // If the refresh token has expired, force re-auth so the user doesn't get stuck
  // with silent 401s from Google APIs.
  if (session?.error === 'RefreshAccessTokenError') {
    nextSignIn('google', { callbackUrl: '/sheets' }, { prompt: 'consent' });
  }

  function signIn(callbackUrl = '/sheets') {
    nextSignIn('google', { callbackUrl }, { prompt: 'select_account' });
  }

  function signOut() {
    nextSignOut({ callbackUrl: '/' });
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
