import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SessionUser } from '../types';

interface AuthContextType {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
  updateUser: (data: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem('banking-session-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: SessionUser) => {
    const enriched: SessionUser = {
      ...userData,
      phone: userData.phone || '+1 (809) 555-0123',
      documentId: userData.documentId || '001-1234567-8',
      joinDate: userData.joinDate || '2024-06-15',
    };
    setUser(enriched);
    localStorage.setItem('banking-session-user', JSON.stringify(enriched));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('banking-session-user');
  };

  const updateUser = (data: Partial<SessionUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('banking-session-user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
