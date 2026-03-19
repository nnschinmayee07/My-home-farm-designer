import { createContext, useContext, useState, ReactNode } from 'react';

interface User { id: number; email: string }

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('hf_user') ?? 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hf_token'));

  const persist = (u: User, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem('hf_user', JSON.stringify(u));
    localStorage.setItem('hf_token', t);
  };

  const login = async (email: string, _password: string) => {
    const user = { id: 1, email };
    const token = 'local-token';
    persist(user, token);
  };

  const signup = async (email: string, _password: string) => {
    const user = { id: 1, email };
    const token = 'local-token';
    persist(user, token);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('hf_user');
    localStorage.removeItem('hf_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
