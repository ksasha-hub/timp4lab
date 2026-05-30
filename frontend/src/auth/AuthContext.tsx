import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '../api/client';
import type { Role } from '../types';

type User = { id: number; username: string; email: string; role: Role };

type AuthContextValue = {
  user: User | null;
  login: (login: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const restore = async () => {
    try {
      const refresh = await api.post('/auth/refresh');
      setAccessToken(refresh.data.accessToken as string);
      const me = await api.get('/auth/me');
      setUser(me.data as User);
    } catch {
      setUser(null);
      setAccessToken('');
    }
  };

  useEffect(() => {
    void restore();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: async (login, password) => {
      const res = await api.post('/auth/login', { login, password });
      setAccessToken(res.data.accessToken as string);
      setUser(res.data.user as User);
    },
    register: async (username, email, password) => {
      const res = await api.post('/auth/register', { username, email, password });
      setAccessToken(res.data.accessToken as string);
      setUser(res.data.user as User);
    },
    logout: async () => {
      await api.post('/auth/logout');
      setAccessToken('');
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used in AuthProvider');
  }
  return ctx;
}
