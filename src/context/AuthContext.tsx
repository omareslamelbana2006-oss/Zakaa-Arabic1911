import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Profile } from '@/lib/supabase';
import { getStoredUser, setStoredUser } from '@/lib/auth';

interface AuthContextValue {
  user: Profile | null;
  login: (user: Profile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => getStoredUser());

  const login = (u: Profile) => {
    setStoredUser(u);
    setUser(u);
  };

  const logout = () => {
    setStoredUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
