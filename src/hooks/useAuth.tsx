'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await auth.getUser();
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await auth.login({ email, password });
    setUser(response.data.user);
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => {
    const response = await auth.register(data);
    setUser(response.data.user);
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  // Автоматическая проверка токена при загрузке
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };

    // Слушаем событие изменения аутентификации
    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener('authChange', handleAuthChange);
    initAuth();

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}