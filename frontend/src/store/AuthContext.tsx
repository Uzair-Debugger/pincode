'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { tokenStore } from '@/lib/tokenStore';
import type { User } from '@/types/domain';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  // Silent refresh on mount — restores session from httpOnly cookie
  useEffect(() => {
    authService.refresh()
      .then((token) => {
        tokenStore.set(token);
        // Decode user from token payload (base64 middle segment)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setState({ user: { id: payload.sub, email: payload.email, role: payload.role }, isLoading: false });
      })
      .catch(() => setState({ user: null, isLoading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authService.login(email, password);
    tokenStore.set(accessToken);
    setState({ user, isLoading: false });
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    await authService.signup(email, password, name);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    tokenStore.clear();
    setState({ user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
