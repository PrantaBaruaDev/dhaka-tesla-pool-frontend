'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { api, ApiClientError } from './api';

export type Role = 'PASSENGER' | 'DRIVER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (data: SignupInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ user: AuthUser }>('/api/v1/auth/me');
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setUser(null);                 // normal: not logged in
      } else {
        setError(err instanceof Error ? err.message : 'Auth check failed');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: AuthUser }>('/api/v1/auth/login', { email, password });
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (data: SignupInput) => {
    const res = await api.post<{ user: AuthUser }>('/api/v1/auth/signup', data);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/api/v1/auth/logout');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}