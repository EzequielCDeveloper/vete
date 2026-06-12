import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserSession, UserRole } from '../shared/types';
import { authApi, setToken, getStoredToken } from '../data/services/apiService';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      // Decode JWT payload to restore user session without an extra request
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          nombre: `${payload.name} ${payload.last_name}`.trim(),
          rol: payload.rol,
        });
      } catch {
        // Token invalid or expired — clear it
        setToken(null);
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      setToken(res.token);
      setUser({
        id: res.user.id,
        username: res.user.username,
        nombre: res.user.nombre,
        rol: res.user.rol as UserRole,
      });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Credenciales inválidas';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'administrador',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
